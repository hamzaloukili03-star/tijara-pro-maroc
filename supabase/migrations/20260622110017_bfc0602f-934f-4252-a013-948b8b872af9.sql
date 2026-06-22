CREATE OR REPLACE FUNCTION public.auth_user_company_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  select uc.company_id from public.user_companies uc where uc.user_id = auth.uid()
$function$;

COMMENT ON TABLE public.uom_conversions IS 'Global reference data: unit-of-measure conversion factors are shared across all companies. Read access is intentionally granted to all authenticated users.';