-- Create a function that allows executing dynamic SQL securely
-- This function is used to bypass RLS policies for specific API operations
-- WARNING: This function should be used with caution as it can potentially allow SQL injection if misused
CREATE OR REPLACE FUNCTION public.exec_sql(query_text text, params jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  query_params text[];
  i integer;
BEGIN
  -- Extract parameters from JSONB array to text array
  IF jsonb_typeof(params) = 'array' THEN
    query_params := array_fill(NULL::text, ARRAY[jsonb_array_length(params)]);
    FOR i IN 0..jsonb_array_length(params)-1 LOOP
      query_params[i+1] := params->i;
    END LOOP;
  END IF;
  
  -- Execute the query and capture results as JSONB
  EXECUTE query_text INTO result USING VARIADIC query_params;
  
  -- Return results as JSONB
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  -- Return error information
  RETURN jsonb_build_object(
    'error', SQLERRM,
    'code', SQLSTATE,
    'query', query_text
  );
END;
$$;

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.exec_sql TO authenticated;

-- Add a comment explaining the function's purpose and security implications
COMMENT ON FUNCTION public.exec_sql IS 
'Executes dynamic SQL with parameters. This function runs with SECURITY DEFINER, 
bypassing RLS policies. Use with caution and only in controlled API endpoints.'; 