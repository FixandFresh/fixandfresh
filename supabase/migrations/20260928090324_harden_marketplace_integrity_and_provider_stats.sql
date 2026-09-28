create or replace function private.enforce_job_financials()
returns trigger
language plpgsql
security invoker
set search_path to ''
as $function$
declare
  service_price numeric;
begin
  if new.service_id is not null then
    select base_price into service_price
    from public.services
    where id = new.service_id
      and active = true;

    if service_price is null then
      raise exception 'The selected service is no longer available';
    end if;

    new.quoted_amount := service_price;
  end if;

  if new.quoted_amount is null or new.quoted_amount < 0 then
    raise exception 'quoted_amount must be non-negative';
  end if;

  new.platform_fee := round(new.quoted_amount * 0.20, 2);
  new.provider_amount := new.quoted_amount - new.platform_fee;
  return new;
end;
$function$;

drop trigger if exists jobs_financial_enforcer on public.jobs;
create trigger jobs_financial_enforcer
before insert on public.jobs
for each row execute function private.enforce_job_financials();

create or replace function private.enforce_job_mutation()
returns trigger
language plpgsql
set search_path to ''
as $function$
declare
  actor uuid := (select auth.uid());
begin
  if actor is null then
    raise exception 'authentication required';
  end if;

  if private.is_admin() then
    return new;
  end if;

  if old.provider_id is null
     and new.provider_id = actor
     and old.status in ('requested'::public.job_status, 'matching'::public.job_status)
     and new.status = 'scheduled'::public.job_status
     and private.is_approved_provider() then
    if new.customer_id <> old.customer_id
       or new.service_id <> old.service_id
       or new.title <> old.title
       or new.description is distinct from old.description
       or new.address <> old.address
       or new.scheduled_at is distinct from old.scheduled_at
       or new.quoted_amount is distinct from old.quoted_amount
       or new.platform_fee is distinct from old.platform_fee
       or new.provider_amount is distinct from old.provider_amount then
      raise exception 'providers may not change booking details or financial fields while claiming';
    end if;
    return new;
  end if;

  if old.customer_id = actor then
    if old.provider_id is not null and new.provider_id is distinct from old.provider_id then
      raise exception 'customers may not reassign providers';
    end if;
    if new.service_id is distinct from old.service_id then
      raise exception 'customers may not change the service after a request is created';
    end if;
    if new.quoted_amount is distinct from old.quoted_amount
       or new.platform_fee is distinct from old.platform_fee
       or new.provider_amount is distinct from old.provider_amount then
      raise exception 'customers may not change financial fields';
    end if;

    if old.status not in ('requested'::public.job_status, 'matching'::public.job_status) then
      if new.status is distinct from old.status then
        raise exception 'customers may only cancel requested or matching jobs';
      end if;
    elsif new.status not in (
      'requested'::public.job_status,
      'matching'::public.job_status,
      'cancelled'::public.job_status
    ) then
      raise exception 'invalid customer status transition';
    end if;
    return new;
  end if;

  if old.provider_id = actor then
    if new.customer_id <> old.customer_id
       or new.provider_id <> old.provider_id
       or new.service_id <> old.service_id
       or new.title <> old.title
       or new.description is distinct from old.description
       or new.address <> old.address
       or new.scheduled_at is distinct from old.scheduled_at
       or new.quoted_amount is distinct from old.quoted_amount
       or new.platform_fee is distinct from old.platform_fee
       or new.provider_amount is distinct from old.provider_amount then
      raise exception 'providers may not change ownership, booking details, or financial fields';
    end if;

    if not (
      (old.status = 'scheduled'::public.job_status and new.status = 'en_route'::public.job_status) or
      (old.status = 'en_route'::public.job_status and new.status = 'in_progress'::public.job_status) or
      (old.status = 'in_progress'::public.job_status and new.status = 'completed'::public.job_status) or
      (new.status = old.status)
    ) then
      raise exception 'invalid provider status transition';
    end if;
    return new;
  end if;

  raise exception 'not authorized to modify this job';
end;
$function$;

create or replace function private.prevent_profile_role_change()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  if new.role is distinct from old.role and not (select private.is_admin()) then
    raise exception 'Only administrators can change profile role';
  end if;

  if old.role = 'admin'
     and new.role <> 'admin'
     and (select count(*) from public.profiles where role = 'admin') <= 1 then
    raise exception 'At least one administrator account must remain active';
  end if;

  return new;
end;
$function$;

alter table public.messages
  drop constraint if exists messages_body_length_check;

alter table public.messages
  add constraint messages_body_length_check
  check (length(body) <= 2000);

create or replace function private.prevent_provider_protected_changes()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  if pg_trigger_depth() > 1 then
    return new;
  end if;

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
$function$;

create or replace function private.sync_provider_completed_jobs()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  old_provider uuid;
  new_provider uuid;
begin
  old_provider := case when tg_op in ('UPDATE','DELETE') then old.provider_id else null end;
  new_provider := case when tg_op in ('INSERT','UPDATE') then new.provider_id else null end;

  if old_provider is not null and old_provider is distinct from new_provider then
    update public.providers
    set completed_jobs = (
      select count(*)::integer
      from public.jobs
      where provider_id = old_provider
        and status = 'completed'::public.job_status
    )
    where id = old_provider;
  end if;

  if new_provider is not null then
    update public.providers
    set completed_jobs = (
      select count(*)::integer
      from public.jobs
      where provider_id = new_provider
        and status = 'completed'::public.job_status
    )
    where id = new_provider;
  end if;

  return case when tg_op = 'DELETE' then old else new end;
end;
$function$;

drop trigger if exists jobs_provider_stats on public.jobs;
create trigger jobs_provider_stats
after insert or update or delete on public.jobs
for each row execute function private.sync_provider_completed_jobs();

create or replace function private.sync_provider_rating()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  old_provider uuid;
  new_provider uuid;
begin
  old_provider := case when tg_op in ('UPDATE','DELETE') then old.provider_id else null end;
  new_provider := case when tg_op in ('INSERT','UPDATE') then new.provider_id else null end;

  if old_provider is not null and old_provider is distinct from new_provider then
    update public.providers
    set rating = coalesce((
      select round(avg(r.rating)::numeric, 2)
      from public.reviews r
      where r.provider_id = old_provider
    ), 0)
    where id = old_provider;
  end if;

  if new_provider is not null then
    update public.providers
    set rating = coalesce((
      select round(avg(r.rating)::numeric, 2)
      from public.reviews r
      where r.provider_id = new_provider
    ), 0)
    where id = new_provider;
  end if;

  return case when tg_op = 'DELETE' then old else new end;
end;
$function$;

drop trigger if exists reviews_provider_stats on public.reviews;
create trigger reviews_provider_stats
after insert or update or delete on public.reviews
for each row execute function private.sync_provider_rating();

alter table public.jobs disable trigger jobs_mutation_guard;
update public.jobs
set
  platform_fee = round(quoted_amount * 0.20, 2),
  provider_amount = quoted_amount - round(quoted_amount * 0.20, 2);
alter table public.jobs enable trigger jobs_mutation_guard;

update public.providers p
set completed_jobs = (
  select count(*)::integer
  from public.jobs j
  where j.provider_id = p.id
    and j.status = 'completed'::public.job_status
);

update public.providers p
set rating = coalesce((
  select round(avg(r.rating)::numeric, 2)
  from public.reviews r
  where r.provider_id = p.id
), 0);
