-- Supabase Performance Helper Functions
-- This migration adds functions to identify and fix common performance issues.

-- 1. Function to check for missing foreign key indexes.
CREATE OR REPLACE FUNCTION public.check_missing_foreign_key_indexes()
RETURNS SETOF public.security_audit_result
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    WITH fk_columns AS (
        SELECT
            tc.table_schema, tc.table_name, tc.constraint_name,
            string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) AS column_names
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
        GROUP BY tc.table_schema, tc.table_name, tc.constraint_name
    ),
    fk_indexes AS (
        SELECT fk.*,
            EXISTS (
                SELECT 1 FROM pg_indexes pi
                WHERE pi.schemaname = fk.table_schema AND pi.tablename = fk.table_name
                AND (pi.indexdef LIKE '%(' || fk.column_names || '%' OR 
                     (SELECT bool_and(pi.indexdef LIKE '%' || col || '%') 
                      FROM unnest(string_to_array(fk.column_names, ', ')) AS col))
            ) AS has_index
        FROM fk_columns fk
    )
    SELECT
        'Foreign Key Indexing' AS check_name,
        'WARN' AS status,
        'Table "' || fki.table_name || '" has an un-indexed foreign key on column(s): ' || fki.column_names || '.' AS details,
        'Add an index to improve performance on joins and prevent table locking issues. Recommendation: CREATE INDEX ON ' || fki.table_schema || '.' || fki.table_name || ' (' || fki.column_names || ');' AS recommendation
    FROM fk_indexes fki
    WHERE NOT fki.has_index;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT 'Foreign Key Indexing'::TEXT, 'PASS'::TEXT, 'All foreign keys appear to be indexed.'::TEXT, ''::TEXT;
    END IF;
END;
$$;

-- 2. Function to automatically create indexes for unindexed foreign keys

CREATE OR REPLACE FUNCTION public.create_missing_fk_indexes()
RETURNS TABLE (
    table_name text,
    index_created_command text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    rec record;
    index_name text;
    command text;
    commands_executed text[] := '{}';
BEGIN
    FOR rec IN
        SELECT
            fki.table_schema,
            fki.table_name,
            fki.column_names
        FROM (
            WITH fk_columns AS (
                SELECT
                    tc.table_schema, tc.table_name, tc.constraint_name,
                    string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) AS column_names
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu
                    ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
                WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
                GROUP BY tc.table_schema, tc.table_name, tc.constraint_name
            )
            SELECT fk.*,
                EXISTS (                    SELECT 1 FROM pg_indexes pi
                    WHERE pi.schemaname = fk.table_schema AND pi.tablename = fk.table_name
                    AND pi.indexdef LIKE '%(' || fk.column_names || '%'
                ) AS has_index
            FROM fk_columns fk
        ) AS fki        WHERE NOT fki.has_index
    LOOP
        index_name := 'idx_' || rec.table_name || '_' || replace(rec.column_names, ', ', '_');
        command := format('CREATE INDEX IF NOT EXISTS %I ON %I.%I (%s)',
                           index_name,
                           rec.table_schema,
                           rec.table_name,
                           rec.column_names);
        EXECUTE command;
        
        commands_executed := array_append(commands_executed, command);
        RETURN QUERY SELECT rec.table_name::text, command;
    END LOOP;

    -- Log the operation if any commands were executed
    IF array_length(commands_executed, 1) > 0 THEN
        INSERT INTO public.admin_operation_logs (user_id, operation_type, details)
        VALUES (
            auth.uid(),            'create_missing_fk_indexes',
            jsonb_build_object('commands_executed', commands_executed)
        );
    END IF;
END;
$$;

-- 3. Function to identify and suggest consolidation of multiple permissive policies
CREATE OR REPLACE FUNCTION public.check_multiple_permissive_policies()
RETURNS TABLE (
    table_name text,
    role_name text,
    command text,
    policy_count bigint,
    policy_names text[],
    consolidation_suggestion text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    WITH policy_groups AS (
        SELECT 
            schemaname,
            tablename,
            roles,
            cmd,
            COUNT(*) AS policy_count,
            ARRAY_AGG(policyname) AS policy_names
        FROM 
            pg_policies
        WHERE             schemaname = 'public'
        GROUP BY 
            schemaname, tablename, roles, cmd        HAVING 
            COUNT(*) > 1
    )
    SELECT 
        pg.tablename::text,        pg.roles::text,
        pg.cmd::text,
        pg.policy_count,
        pg.policy_names,
        'Consider consolidating these ' || pg.policy_count || ' policies into a single policy using OR conditions in the USING/WITH CHECK clause.' AS consolidation_suggestion
    FROM 
        policy_groups pg
    ORDER BY 
        pg.tablename, pg.cmd;
END;
$$;

COMMENT ON FUNCTION public.check_missing_foreign_key_indexes() IS 'Identifies foreign keys without corresponding indexes.';
COMMENT ON FUNCTION public.create_missing_fk_indexes() IS 'Automatically creates indexes for foreign key columns that do not have them.';
COMMENT ON FUNCTION public.check_multiple_permissive_policies() IS 'Identifies tables with multiple permissive policies for the same role and command, which can be consolidated for better performance.';
