-- RLS policies invoke these SECURITY DEFINER helper functions.
-- Keep them unavailable to anonymous/public callers, but allow signed-in users
-- to execute them during policy evaluation.

grant execute on function private.is_admin() to authenticated;
grant execute on function private.is_approved_provider() to authenticated;
