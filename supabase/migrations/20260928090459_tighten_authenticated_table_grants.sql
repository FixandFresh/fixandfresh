revoke all on table public.profiles,
                    public.providers,
                    public.services,
                    public.jobs,
                    public.job_status_history,
                    public.reviews,
                    public.messages
from anon, authenticated;

grant select, update on table public.profiles to authenticated;
grant select, insert, update on table public.providers to authenticated;
grant select, insert, update, delete on table public.services to authenticated;
grant select, insert, update on table public.jobs to authenticated;
grant select on table public.job_status_history to authenticated;
grant select, insert on table public.reviews to authenticated;
grant select, insert, update on table public.messages to authenticated;
