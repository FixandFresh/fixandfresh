revoke all on function private.enforce_job_financials() from public, anon, authenticated;
revoke all on function private.enforce_job_mutation() from public, anon, authenticated;
revoke all on function private.prevent_profile_role_change() from public, anon, authenticated;
revoke all on function private.prevent_provider_protected_changes() from public, anon, authenticated;
revoke all on function private.sync_provider_completed_jobs() from public, anon, authenticated;
revoke all on function private.sync_provider_rating() from public, anon, authenticated;

revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;

revoke all on function private.is_approved_provider() from public, anon;
grant execute on function private.is_approved_provider() to authenticated;
