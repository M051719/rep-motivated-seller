-- Update foreclosure_responses table to match current form fields
-- The table exists from initial schema but needs additional columns

-- Add missing columns for Step 3: Financial Situation
DO $$
BEGIN
  -- employment_status
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'foreclosure_responses' AND column_name = 'employment_status') THEN
    ALTER TABLE public.foreclosure_responses ADD COLUMN employment_status TEXT;
  END IF;

  -- monthly_income
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'foreclosure_responses' AND column_name = 'monthly_income') THEN
    ALTER TABLE public.foreclosure_responses ADD COLUMN monthly_income NUMERIC;
  END IF;

  -- other_debts
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'foreclosure_responses' AND column_name = 'other_debts') THEN
    ALTER TABLE public.foreclosure_responses ADD COLUMN other_debts NUMERIC;
  END IF;

  -- bankruptcy_filed
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'foreclosure_responses' AND column_name = 'bankruptcy_filed') THEN
    ALTER TABLE public.foreclosure_responses ADD COLUMN bankruptcy_filed BOOLEAN DEFAULT FALSE;
  END IF;

  -- primary_goal
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'foreclosure_responses' AND column_name = 'primary_goal') THEN
    ALTER TABLE public.foreclosure_responses ADD COLUMN primary_goal TEXT;
  END IF;

  -- timeline
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'foreclosure_responses' AND column_name = 'timeline') THEN
    ALTER TABLE public.foreclosure_responses ADD COLUMN timeline TEXT;
  END IF;

  -- monthly_payment
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'foreclosure_responses' AND column_name = 'monthly_payment') THEN
    ALTER TABLE public.foreclosure_responses ADD COLUMN monthly_payment NUMERIC;
  END IF;

  -- user_id (for tracking authenticated submissions)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'foreclosure_responses' AND column_name = 'user_id') THEN
    ALTER TABLE public.foreclosure_responses ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Rename property_value to current_property_value for clarity
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'foreclosure_responses' AND column_name = 'property_value') THEN
    ALTER TABLE public.foreclosure_responses RENAME COLUMN property_value TO current_property_value;
  END IF;
END $$;

-- Create additional_notes column (alias for notes if notes exists, or new column)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'foreclosure_responses' AND column_name = 'additional_notes') THEN
    -- If notes column exists, we can use it as is, otherwise create additional_notes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'foreclosure_responses' AND column_name = 'notes') THEN
      ALTER TABLE public.foreclosure_responses ADD COLUMN additional_notes TEXT;
    END IF;
  END IF;
END $$;

-- Grant permissions (ensure anon can insert for public form submissions)
GRANT SELECT, INSERT ON public.foreclosure_responses TO anon;
GRANT ALL ON public.foreclosure_responses TO authenticated;
GRANT ALL ON public.foreclosure_responses TO service_role;

-- Add comment
COMMENT ON TABLE public.foreclosure_responses IS 'Stores foreclosure assistance form submissions from website. Updated to match current form structure.';
