-- Production security hardening for Fix & Fresh.
-- Run after 20260926181500_production_baseline.sql on a fresh database.

alter type public.job_status add value if not exists 'en_route' after 'scheduled';

alter table public.services
  add column if not exists category text,
  add column if not exists service_type text,
  add column if not exists unit text,
  add column if not exists market_price numeric(12,2),
  add column if not exists is_add_on boolean not null default false,
  add column if not exists frequency text,
  add column if not exists bundle_services text[] not null default '{}';

alter table public.jobs
  add column if not exists completion_photos text[] not null default '{}';

alter table public.services drop constraint if exists services_category_check;
alter table public.services add constraint services_category_check
  check (category is null or category in ('residential','commercial','specialty','maintenance','bundle'));
alter table public.services drop constraint if exists services_type_check;
alter table public.services add constraint services_type_check
  check (service_type is null or service_type in ('cleaning','restocking','repair','maintenance'));
alter table public.services drop constraint if exists services_unit_check;
alter table public.services add constraint services_unit_check
  check (unit is null or unit in ('job','hour','room','load','sqft'));
alter table public.services drop constraint if exists services_frequency_check;
alter table public.services add constraint services_frequency_check
  check (frequency is null or frequency in ('one-time','weekly','monthly'));

create schema if not exists private;

create or replace function private.is_admin()
returns boolean language sql stable security definer set search_path=''
as $$ select exists (
  select 1 from public.profiles
  where id=(select auth.uid()) and role='admin'
); $$;

create or replace function private.is_approved_provider()
returns boolean language sql stable security definer set search_path=''
as $$ select exists (
  select 1 from public.providers
  where id=(select auth.uid()) and status='approved'
); $$;

create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path=''
as $$
begin
  insert into public.profiles(id,full_name,phone)
  values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''),new.phone)
  on conflict(id) do nothing;
  return new;
end;
$$;

create or replace function private.set_updated_at()
returns trigger language plpgsql security invoker set search_path=''
as $$ begin new.updated_at=now(); return new; end; $$;

create or replace function private.prevent_profile_role_change()
returns trigger language plpgsql security invoker set search_path=''
as $$
begin
  if new.role is distinct from old.role and not (select private.is_admin()) then
    raise exception 'Only administrators can change profile role';
  end if;
  return new;
end;
$$;

create or replace function private.prevent_provider_protected_changes()
returns trigger language plpgsql security invoker set search_path=''
as $$
begin
  if not (select private.is_admin()) then
    if new.status is distinct from old.status
       or new.rating is distinct from old.rating
       or new.completed_jobs is distinct from old.completed_jobs
       or new.verification_notes is distinct from old.verification_notes then
      raise exception 'Provider verification and performance fields are administrator-managed';
    end if;
  end if;
  return new;
end;
$$;

create or replace function private.enforce_job_mutation()
returns trigger language plpgsql security invoker set search_path=''
as $$
declare actor uuid := (select auth.uid());
begin
  if actor is null then raise exception 'authentication required'; end if;
  if (select private.is_admin()) then return new; end if;

  if old.provider_id is null
     and new.provider_id = actor
     and old.status in ('requested'::public.job_status,'matching'::public.job_status)
     and new.status = 'scheduled'::public.job_status
     and (select private.is_approved_provider()) then
    if new.customer_id <> old.customer_id
       or new.service_id is distinct from old.service_id
       or new.title is distinct from old.title
       or new.description is distinct from old.description
       or new.address is distinct from old.address
       or new.scheduled_at is distinct from old.scheduled_at
       or new.quoted_amount is distinct from old.quoted_amount
       or new.platform_fee is distinct from old.platform_fee
       or new.provider_amount is distinct from old.provider_amount
       or new.completion_photos is distinct from old.completion_photos then
      raise exception 'Providers may not change booking details or financial fields while claiming';
    end if;
    return new;
  end if;

  if old.customer_id=actor then
    if old.provider_id is not null and new.provider_id is distinct from old.provider_id then raise exception 'Customers may not reassign providers'; end if;
    if new.quoted_amount is distinct from old.quoted_amount or new.platform_fee is distinct from old.platform_fee or new.provider_amount is distinct from old.provider_amount then
      raise exception 'Customers may not change financial fields';
    end if;
    if old.status in ('requested'::public.job_status,'matching'::public.job_status) then
      if new.status not in ('requested'::public.job_status,'matching'::public.job_status,'cancelled'::public.job_status) then raise exception 'Invalid customer status transition'; end if;
    elsif new.status is distinct from old.status then
      raise exception 'Customers may only cancel requested or matching jobs';
    end if;
    return new;
  end if;

  if old.provider_id=actor then
    if new.customer_id <> old.customer_id or new.provider_id <> old.provider_id or new.service_id is distinct from old.service_id
       or new.title is distinct from old.title or new.description is distinct from old.description or new.address is distinct from old.address
       or new.scheduled_at is distinct from old.scheduled_at or new.quoted_amount is distinct from old.quoted_amount
       or new.platform_fee is distinct from old.platform_fee or new.provider_amount is distinct from old.provider_amount then
      raise exception 'Providers may not change ownership, booking details, or financial fields';
    end if;
    if not ((old.status='scheduled' and new.status in ('scheduled','en_route'))
         or (old.status='en_route' and new.status in ('en_route','in_progress'))
         or (old.status='in_progress' and new.status in ('in_progress','completed'))
         or new.status=old.status) then
      raise exception 'Invalid provider job status transition';
    end if;
    return new;
  end if;

  raise exception 'Only a job participant or administrator can update a job';
end;
$$;
create or replace function private.enforce_message_update()
returns trigger language plpgsql security invoker set search_path=''
as $$
begin
  if (select private.is_admin()) then return new; end if;
  if old.recipient_id<>(select auth.uid()) then
    raise exception 'Only the message recipient can update a message';
  end if;
  if new.id is distinct from old.id
     or new.job_id is distinct from old.job_id
     or new.sender_id is distinct from old.sender_id
     or new.recipient_id is distinct from old.recipient_id
     or new.body is distinct from old.body
     or new.created_at is distinct from old.created_at then
    raise exception 'Recipients may only update read status';
  end if;
  return new;
end;
$$;

create or replace function private.record_job_status()
returns trigger language plpgsql security definer set search_path=''
as $$
declare actor uuid := (select auth.uid());
begin
  insert into public.job_status_history(job_id,status,changed_by)
  values(new.id,new.status,actor);
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public,anon,authenticated;
revoke all on function public.is_admin() from public,anon,authenticated;
revoke all on function public.is_provider() from public,anon,authenticated;
revoke all on function public.set_updated_at() from public,anon,authenticated;
revoke all on function private.is_admin() from public,anon;
revoke all on function private.is_approved_provider() from public,anon;
revoke all on function private.handle_new_user() from public,anon,authenticated;
revoke all on function private.set_updated_at() from public,anon,authenticated;
revoke all on function private.enforce_job_mutation() from public,anon,authenticated;
revoke all on function private.enforce_message_update() from public,anon,authenticated;
revoke all on function private.record_job_status() from public,anon,authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function private.handle_new_user();

drop trigger if exists profiles_updated_at on public.profiles;
drop trigger if exists providers_updated_at on public.providers;
drop trigger if exists jobs_updated_at on public.jobs;
create trigger profiles_updated_at before update on public.profiles
for each row execute function private.set_updated_at();
create trigger providers_updated_at before update on public.providers
for each row execute function private.set_updated_at();
create trigger jobs_updated_at before update on public.jobs
for each row execute function private.set_updated_at();

drop trigger if exists profiles_role_guard on public.profiles;
create trigger profiles_role_guard before update on public.profiles
for each row execute function private.prevent_profile_role_change();
drop trigger if exists providers_protected_fields_guard on public.providers;
create trigger providers_protected_fields_guard before update on public.providers
for each row execute function private.prevent_provider_protected_changes();
drop trigger if exists jobs_mutation_guard on public.jobs;
create trigger jobs_mutation_guard before update on public.jobs
for each row execute function private.enforce_job_mutation();
drop trigger if exists job_status_history_recorder on public.jobs;
create trigger job_status_history_recorder after insert or update of status on public.jobs
for each row execute function private.record_job_status();
drop trigger if exists messages_update_guard on public.messages;
create trigger messages_update_guard before update on public.messages
for each row execute function private.enforce_message_update();

drop policy if exists profiles_select_self_or_admin on public.profiles;
drop policy if exists profiles_update_self_or_admin on public.profiles;
drop policy if exists providers_select_authenticated on public.providers;
drop policy if exists providers_insert_self on public.providers;
drop policy if exists providers_update_self_or_admin on public.providers;
drop policy if exists jobs_select on public.jobs;
drop policy if exists jobs_customer_select on public.jobs;
drop policy if exists jobs_provider_browse on public.jobs;
drop policy if exists jobs_customer_insert on public.jobs;
drop policy if exists jobs_update on public.jobs;
drop policy if exists jobs_customer_update on public.jobs;
drop policy if exists jobs_provider_claim on public.jobs;
drop policy if exists jobs_provider_update on public.jobs;
drop policy if exists jobs_admin_update on public.jobs;
drop policy if exists history_participant_select on public.job_status_history;
drop policy if exists history_insert_authenticated on public.job_status_history;
drop policy if exists reviews_participant_select on public.reviews;
drop policy if exists reviews_customer_insert on public.reviews;
drop policy if exists messages_participant_select on public.messages;
drop policy if exists messages_sender_insert on public.messages;
drop policy if exists messages_recipient_update on public.messages;
drop policy if exists services_select_authenticated on public.services;
drop policy if exists services_admin_write on public.services;
drop policy if exists services_admin_insert on public.services;
drop policy if exists services_admin_update on public.services;
drop policy if exists services_admin_delete on public.services;

create policy profiles_select_self_or_admin on public.profiles for select to authenticated
using (id=(select auth.uid()) or (select private.is_admin()));
create policy profiles_update_self_or_admin on public.profiles for update to authenticated
using (id=(select auth.uid()) or (select private.is_admin()))
with check (id=(select auth.uid()) or (select private.is_admin()));

create policy providers_select_authenticated on public.providers for select to authenticated
using (status='approved' or id=(select auth.uid()) or (select private.is_admin()));
create policy providers_insert_self on public.providers for insert to authenticated
with check (id=(select auth.uid()) and status='pending');
create policy providers_update_self_or_admin on public.providers for update to authenticated
using (id=(select auth.uid()) or (select private.is_admin()))
with check (id=(select auth.uid()) or (select private.is_admin()));

create policy jobs_select on public.jobs for select to authenticated using (
  customer_id=(select auth.uid())
  or provider_id=(select auth.uid())
  or (provider_id is null and status in ('requested','matching') and (select private.is_approved_provider()))
  or (select private.is_admin())
);
create policy jobs_customer_insert on public.jobs for insert to authenticated
with check (customer_id=(select auth.uid()));
create policy jobs_update on public.jobs for update to authenticated
using (
  customer_id=(select auth.uid())
  or provider_id=(select auth.uid())
  or (provider_id is null and status in ('requested','matching') and (select private.is_approved_provider()))
  or (select private.is_admin())
)
with check (
  customer_id=(select auth.uid())
  or provider_id=(select auth.uid())
  or (select private.is_admin())
);

create policy history_participant_select on public.job_status_history for select to authenticated using (
  exists (
    select 1 from public.jobs j
    where j.id=job_status_history.job_id
      and (j.customer_id=(select auth.uid()) or j.provider_id=(select auth.uid()))
  )
  or (select private.is_admin())
);
create policy history_insert_authenticated on public.job_status_history for insert to authenticated
with check (
  changed_by=(select auth.uid())
  and exists (
    select 1 from public.jobs j
    where j.id=job_status_history.job_id
      and (j.customer_id=(select auth.uid()) or j.provider_id=(select auth.uid()))
  )
);

create policy reviews_participant_select on public.reviews for select to authenticated
using (customer_id=(select auth.uid()) or provider_id=(select auth.uid()) or (select private.is_admin()));
create policy reviews_customer_insert on public.reviews for insert to authenticated
with check (
  customer_id=(select auth.uid())
  and exists (
    select 1 from public.jobs j
    where j.id=job_id
      and j.customer_id=(select auth.uid())
      and j.provider_id=reviews.provider_id
      and j.status='completed'
  )
);

create policy messages_participant_select on public.messages for select to authenticated
using (sender_id=(select auth.uid()) or recipient_id=(select auth.uid()) or (select private.is_admin()));
create policy messages_sender_insert on public.messages for insert to authenticated
with check (
  sender_id=(select auth.uid())
  and (
    (select private.is_admin())
    or exists (
      select 1 from public.jobs j
      where j.id=messages.job_id
        and (
          (j.customer_id=(select auth.uid()) and j.provider_id=messages.recipient_id)
          or (j.provider_id=(select auth.uid()) and j.customer_id=messages.recipient_id)
        )
    )
  )
);
create policy messages_recipient_update on public.messages for update to authenticated
using (recipient_id=(select auth.uid()) or (select private.is_admin()))
with check (recipient_id=(select auth.uid()) or (select private.is_admin()));

create policy services_select_authenticated on public.services for select to authenticated
using (active=true or (select private.is_admin()));
create policy services_admin_insert on public.services for insert to authenticated
with check ((select private.is_admin()));
create policy services_admin_update on public.services for update to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));
create policy services_admin_delete on public.services for delete to authenticated
using ((select private.is_admin()));

revoke all on table public.profiles,public.providers,public.services,public.jobs,public.job_status_history,public.reviews,public.messages from anon;
grant select,insert,update on public.profiles,public.providers,public.jobs to authenticated;
grant select on public.services,public.job_status_history to authenticated;
grant select,insert on public.reviews to authenticated;
grant select,insert,update on public.messages to authenticated;

create index if not exists jobs_customer_provider_status_idx on public.jobs(customer_id,provider_id,status);
create index if not exists jobs_service_id_idx on public.jobs(service_id);
create index if not exists messages_job_id_idx on public.messages(job_id);
create index if not exists messages_sender_id_idx on public.messages(sender_id);
create index if not exists job_status_history_changed_by_idx on public.job_status_history(changed_by);
create index if not exists reviews_customer_id_idx on public.reviews(customer_id);
create index if not exists reviews_provider_id_idx on public.reviews(provider_id);
