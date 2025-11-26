-- Foreclosure Property Database with MCP Integration
-- Comprehensive property records for 9 priority states
-- States: WA, MT, WY, CO, NM, TX, OK, KS, CA

-- ============================================
-- 1. PROPERTY RECORDS TABLE
-- ============================================
DROP TABLE IF EXISTS public.property_records CASCADE;

CREATE TABLE public.property_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Property Identification
  apn TEXT, -- Assessor's Parcel Number
  property_id TEXT UNIQUE, -- Internal unique ID

  -- Owner 1 Information
  owner1_label_name TEXT,
  owner1_last_name TEXT,
  owner1_first_name TEXT,
  owner1_middle_name TEXT,
  owner1_suffix TEXT,

  -- Owner 2 Information (co-owner, spouse, etc.)
  owner2_label_name TEXT,
  owner2_last_name TEXT,
  owner2_first_name TEXT,
  owner2_middle_name TEXT,
  owner2_suffix TEXT,

  -- Care Of
  owner_care_of_name TEXT,

  -- Mailing Address
  mail_address TEXT,
  mail_city TEXT,
  mail_state CHAR(2),
  mail_zip_code CHAR(5),
  mail_zip_plus4 CHAR(4),
  mail_zip_full TEXT GENERATED ALWAYS AS (
    CASE
      WHEN mail_zip_plus4 IS NOT NULL THEN mail_zip_code || '-' || mail_zip_plus4
      ELSE mail_zip_code
    END
  ) STORED,
  mail_carrier_route TEXT,
  mail_county TEXT,

  -- Property Address
  property_address TEXT, -- Full formatted address
  property_house_number TEXT,
  property_house_number_prefix TEXT,
  property_house_number_suffix TEXT,
  property_house_number2 TEXT,
  property_pre_direction TEXT, -- N, S, E, W, NE, etc.
  property_street_name TEXT,
  property_street_suffix TEXT, -- St, Ave, Blvd, etc.
  property_post_direction TEXT,
  property_unit_number TEXT,
  property_city TEXT,
  property_state CHAR(2),
  property_zip_code CHAR(5),
  property_zip_plus4 CHAR(4),
  property_zip_full TEXT GENERATED ALWAYS AS (
    CASE
      WHEN property_zip_plus4 IS NOT NULL THEN property_zip_code || '-' || property_zip_plus4
      ELSE property_zip_code
    END
  ) STORED,
  property_carrier_route TEXT,
  county TEXT NOT NULL,

  -- Financial Information
  foreclosure_amount_owed NUMERIC(12,2),
  original_loan_amount NUMERIC(12,2),
  current_mortgage_balance NUMERIC(12,2),
  purchase_price NUMERIC(12,2), -- Cost of home
  county_assessed_value NUMERIC(12,2),
  market_value NUMERIC(12,2),
  land_value NUMERIC(12,2),
  improvement_value NUMERIC(12,2),

  -- Property Details
  property_type TEXT, -- Single Family, Condo, Multi-Family, etc.
  bedrooms INTEGER,
  bathrooms NUMERIC(3,1),
  square_feet INTEGER,
  lot_size_sqft INTEGER,
  lot_size_acres NUMERIC(10,4),
  year_built INTEGER,

  -- Foreclosure Status
  foreclosure_status TEXT, -- 'pre-foreclosure', 'notice-of-default', 'auction-scheduled', 'foreclosed', 'redeemed', 'normal'
  foreclosure_filing_date DATE,
  foreclosure_sale_date DATE,
  notice_of_default_date DATE,
  notice_of_sale_date DATE,

  -- Legal Information
  lender_name TEXT,
  loan_number TEXT,
  trustee_name TEXT,
  trustee_phone TEXT,
  case_number TEXT,
  docket_number TEXT,

  -- Tax Information
  tax_year INTEGER,
  annual_tax_amount NUMERIC(10,2),
  tax_delinquent BOOLEAN DEFAULT FALSE,
  tax_delinquent_amount NUMERIC(10,2),

  -- Equity Calculation
  estimated_equity NUMERIC(12,2) GENERATED ALWAYS AS (
    COALESCE(county_assessed_value, market_value, 0) - COALESCE(current_mortgage_balance, foreclosure_amount_owed, 0)
  ) STORED,

  -- Metadata
  data_source TEXT, -- 'county_assessor', 'foreclosure_listing', 'public_records', 'manual_entry'
  data_source_date DATE,
  last_verified TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CHECK (property_state IN ('WA', 'MT', 'WY', 'CO', 'NM', 'TX', 'OK', 'KS', 'CA'))
);

-- ============================================
-- 2. INDEXES FOR PERFORMANCE
-- ============================================

-- Primary lookups
CREATE INDEX idx_property_records_apn ON public.property_records(apn);
CREATE INDEX idx_property_records_property_address ON public.property_records(property_address);
CREATE INDEX idx_property_records_county_state ON public.property_records(county, property_state);

-- Owner lookups
CREATE INDEX idx_property_records_owner1_name ON public.property_records(owner1_last_name, owner1_first_name);
CREATE INDEX idx_property_records_owner2_name ON public.property_records(owner2_last_name, owner2_first_name);

-- Mailing address lookups
CREATE INDEX idx_property_records_mail_address ON public.property_records(mail_address);
CREATE INDEX idx_property_records_mail_zip ON public.property_records(mail_zip_code);

-- Property address components (for fuzzy matching)
CREATE INDEX idx_property_records_street ON public.property_records(property_street_name);
CREATE INDEX idx_property_records_city_state ON public.property_records(property_city, property_state);
CREATE INDEX idx_property_records_zip ON public.property_records(property_zip_code);

-- Foreclosure status
CREATE INDEX idx_property_records_foreclosure_status ON public.property_records(foreclosure_status) WHERE foreclosure_status IN ('pre-foreclosure', 'notice-of-default', 'auction-scheduled');
CREATE INDEX idx_property_records_sale_date ON public.property_records(foreclosure_sale_date) WHERE foreclosure_sale_date IS NOT NULL;

-- Financial filters
CREATE INDEX idx_property_records_equity ON public.property_records(estimated_equity);
CREATE INDEX idx_property_records_assessed_value ON public.property_records(county_assessed_value);

-- Full-text search on addresses and owner names
CREATE INDEX idx_property_records_fts ON public.property_records
  USING GIN(to_tsvector('english',
    COALESCE(property_address, '') || ' ' ||
    COALESCE(owner1_last_name, '') || ' ' ||
    COALESCE(owner1_first_name, '') || ' ' ||
    COALESCE(owner2_last_name, '') || ' ' ||
    COALESCE(county, '')
  ));

-- ============================================
-- 3. FORECLOSURE TIMELINE TABLE
-- ============================================
DROP TABLE IF EXISTS public.property_foreclosure_timeline CASCADE;

CREATE TABLE public.property_foreclosure_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.property_records(id) ON DELETE CASCADE,

  -- Event details
  event_type TEXT NOT NULL, -- 'notice_of_default', 'notice_of_sale', 'auction', 'postponement', 'redemption', 'eviction'
  event_date DATE NOT NULL,
  event_description TEXT,

  -- Documents
  document_type TEXT,
  document_number TEXT,
  filing_date DATE,
  recording_date DATE,

  -- Party information
  filed_by TEXT,
  filed_against TEXT,

  -- Next steps
  next_deadline DATE,
  next_deadline_type TEXT,

  -- Metadata
  data_source TEXT,
  verified BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_foreclosure_timeline_property_id ON public.property_foreclosure_timeline(property_id);
CREATE INDEX idx_foreclosure_timeline_event_date ON public.property_foreclosure_timeline(event_date DESC);
CREATE INDEX idx_foreclosure_timeline_next_deadline ON public.property_foreclosure_timeline(next_deadline) WHERE next_deadline IS NOT NULL;

-- ============================================
-- 4. LENDER/SERVICER TABLE
-- ============================================
DROP TABLE IF EXISTS public.lenders CASCADE;

CREATE TABLE public.lenders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  lender_name TEXT NOT NULL,
  servicer_name TEXT,

  -- Contact information
  phone_number TEXT,
  fax_number TEXT,
  email TEXT,
  website TEXT,

  -- Mailing address
  address TEXT,
  city TEXT,
  state CHAR(2),
  zip_code CHAR(5),

  -- Loss mitigation contacts
  loss_mitigation_phone TEXT,
  loss_mitigation_email TEXT,
  loss_mitigation_fax TEXT,

  -- Special programs
  has_modification_program BOOLEAN DEFAULT FALSE,
  has_hardship_program BOOLEAN DEFAULT FALSE,
  forbearance_available BOOLEAN DEFAULT FALSE,

  -- Notes
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lenders_name ON public.lenders(lender_name);

-- ============================================
-- 5. STATE FORECLOSURE LAWS (from MCP proposal)
-- ============================================
DROP TABLE IF EXISTS public.foreclosure_states CASCADE;

CREATE TABLE public.foreclosure_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_code CHAR(2) NOT NULL UNIQUE,
  state_name TEXT NOT NULL,

  -- Foreclosure type
  foreclosure_type TEXT NOT NULL, -- 'judicial', 'non-judicial', 'both'
  typical_timeline_days INTEGER,

  -- Redemption
  redemption_period_days INTEGER,
  redemption_period_notes TEXT,
  redemption_allowed BOOLEAN DEFAULT TRUE,

  -- Deficiency
  deficiency_allowed BOOLEAN DEFAULT TRUE,
  deficiency_notes TEXT,

  -- Homestead exemption
  homestead_exemption_amount NUMERIC(12,2),
  homestead_notes TEXT,

  -- Mediation
  mediation_required BOOLEAN DEFAULT FALSE,
  mediation_voluntary BOOLEAN DEFAULT FALSE,
  mediation_notes TEXT,

  -- Statutory references
  primary_statute TEXT,
  statutory_references TEXT[],

  -- Resources
  legal_aid_url TEXT,
  state_housing_authority_url TEXT,

  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. COUNTY FORECLOSURE PROCEDURES
-- ============================================
DROP TABLE IF EXISTS public.foreclosure_counties CASCADE;

CREATE TABLE public.foreclosure_counties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_code CHAR(2) REFERENCES public.foreclosure_states(state_code),
  county_name TEXT NOT NULL,
  county_code TEXT,

  -- Court information
  court_name TEXT,
  court_address TEXT,
  court_phone TEXT,
  court_website TEXT,
  filing_fee NUMERIC(10,2),

  -- Recording information
  recorder_office_name TEXT,
  recorder_address TEXT,
  recorder_phone TEXT,
  recorder_website TEXT,
  recording_fee NUMERIC(10,2),

  -- Procedures
  notice_requirements TEXT,
  publication_requirements TEXT,
  publication_newspaper TEXT,

  -- Mediation
  mediation_program BOOLEAN DEFAULT FALSE,
  mediation_contact TEXT,
  mediation_phone TEXT,

  -- Timelines
  notice_period_days INTEGER,
  sale_publication_period_days INTEGER,

  -- Resources
  legal_aid_organizations TEXT[],
  hud_counseling_agencies TEXT[],

  -- Assessor information
  assessor_website TEXT,
  assessor_phone TEXT,

  last_updated TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(state_code, county_name)
);

CREATE INDEX idx_foreclosure_counties_state ON public.foreclosure_counties(state_code);

-- ============================================
-- 7. PROPERTY CONTACTS/NOTES
-- ============================================
DROP TABLE IF EXISTS public.property_contacts CASCADE;

CREATE TABLE public.property_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.property_records(id) ON DELETE CASCADE,

  -- Contact details
  contact_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  contact_type TEXT, -- 'phone', 'email', 'mail', 'in-person', 'sms'
  contacted_by UUID REFERENCES auth.users(id),

  -- Contact info
  phone_number TEXT,
  email TEXT,

  -- Notes
  subject TEXT,
  notes TEXT,
  outcome TEXT,

  -- Follow-up
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_date DATE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_property_contacts_property_id ON public.property_contacts(property_id);
CREATE INDEX idx_property_contacts_follow_up ON public.property_contacts(follow_up_date) WHERE follow_up_required = TRUE;

-- ============================================
-- 8. RLS POLICIES
-- ============================================

ALTER TABLE public.property_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_foreclosure_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foreclosure_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foreclosure_counties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_contacts ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admins full access to property_records"
  ON public.property_records FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Service role full access
CREATE POLICY "Service role full access to property_records"
  ON public.property_records FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Similar policies for other tables
CREATE POLICY "Admins full access to property_foreclosure_timeline"
  ON public.property_foreclosure_timeline FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Service role full access to property_foreclosure_timeline"
  ON public.property_foreclosure_timeline FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to lenders"
  ON public.lenders FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Public read access to state/county info
CREATE POLICY "Public read access to foreclosure_states"
  ON public.foreclosure_states FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Public read access to foreclosure_counties"
  ON public.foreclosure_counties FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Service role full access to foreclosure_states"
  ON public.foreclosure_states FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to foreclosure_counties"
  ON public.foreclosure_counties FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Admins full access to property_contacts"
  ON public.property_contacts FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Service role full access to property_contacts"
  ON public.property_contacts FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ============================================
-- 9. HELPER FUNCTIONS
-- ============================================

-- Function to search properties by address
CREATE OR REPLACE FUNCTION search_properties_by_address(search_term TEXT)
RETURNS TABLE (
  property_id UUID,
  property_address TEXT,
  owner_name TEXT,
  county TEXT,
  foreclosure_status TEXT,
  match_quality INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pr.id,
    pr.property_address,
    TRIM(CONCAT(pr.owner1_first_name, ' ', pr.owner1_last_name)),
    pr.county,
    pr.foreclosure_status,
    CASE
      WHEN LOWER(pr.property_address) = LOWER(search_term) THEN 100
      WHEN LOWER(pr.property_address) LIKE LOWER(search_term) || '%' THEN 90
      WHEN LOWER(pr.property_address) LIKE '%' || LOWER(search_term) || '%' THEN 70
      ELSE 50
    END as match_quality
  FROM public.property_records pr
  WHERE LOWER(pr.property_address) LIKE '%' || LOWER(search_term) || '%'
  ORDER BY match_quality DESC, pr.property_address
  LIMIT 20;
END;
$$;

-- Function to get property by owner name
CREATE OR REPLACE FUNCTION search_properties_by_owner(search_term TEXT)
RETURNS TABLE (
  property_id UUID,
  owner_name TEXT,
  property_address TEXT,
  county TEXT,
  foreclosure_status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pr.id,
    TRIM(CONCAT(pr.owner1_first_name, ' ', pr.owner1_last_name)),
    pr.property_address,
    pr.county,
    pr.foreclosure_status
  FROM public.property_records pr
  WHERE
    pr.owner1_last_name ILIKE '%' || search_term || '%'
    OR pr.owner1_first_name ILIKE '%' || search_term || '%'
    OR pr.owner2_last_name ILIKE '%' || search_term || '%'
    OR pr.owner2_first_name ILIKE '%' || search_term || '%'
  ORDER BY pr.owner1_last_name, pr.owner1_first_name
  LIMIT 20;
END;
$$;

-- Function to calculate foreclosure urgency score
CREATE OR REPLACE FUNCTION calculate_urgency_score(p_property_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  urgency_score INTEGER := 0;
  sale_date DATE;
  days_until_sale INTEGER;
BEGIN
  SELECT foreclosure_sale_date INTO sale_date
  FROM public.property_records
  WHERE id = p_property_id;

  IF sale_date IS NULL THEN
    RETURN 0;
  END IF;

  days_until_sale := sale_date - CURRENT_DATE;

  -- Critical: 0-7 days
  IF days_until_sale <= 7 AND days_until_sale >= 0 THEN
    urgency_score := 100;
  -- Urgent: 8-30 days
  ELSIF days_until_sale <= 30 AND days_until_sale > 7 THEN
    urgency_score := 75;
  -- High: 31-60 days
  ELSIF days_until_sale <= 60 AND days_until_sale > 30 THEN
    urgency_score := 50;
  -- Medium: 61-90 days
  ELSIF days_until_sale <= 90 AND days_until_sale > 60 THEN
    urgency_score := 25;
  -- Past sale date
  ELSIF days_until_sale < 0 THEN
    urgency_score := 0;
  END IF;

  RETURN urgency_score;
END;
$$;

-- ============================================
-- 10. VIEWS
-- ============================================

-- Active foreclosures view
CREATE OR REPLACE VIEW v_active_foreclosures AS
SELECT
  pr.id,
  pr.property_address,
  pr.county,
  pr.property_state,
  TRIM(CONCAT(pr.owner1_first_name, ' ', pr.owner1_last_name)) as owner_name,
  pr.foreclosure_status,
  pr.foreclosure_sale_date,
  (pr.foreclosure_sale_date - CURRENT_DATE) as days_until_sale,
  pr.foreclosure_amount_owed,
  pr.county_assessed_value,
  pr.estimated_equity,
  calculate_urgency_score(pr.id) as urgency_score,
  pr.lender_name,
  pr.created_at
FROM public.property_records pr
WHERE pr.foreclosure_status IN ('pre-foreclosure', 'notice-of-default', 'auction-scheduled')
  AND (pr.foreclosure_sale_date IS NULL OR pr.foreclosure_sale_date >= CURRENT_DATE)
ORDER BY urgency_score DESC, pr.foreclosure_sale_date ASC;

-- Properties by county
CREATE OR REPLACE VIEW v_properties_by_county AS
SELECT
  pr.county,
  pr.property_state,
  COUNT(*) as total_properties,
  COUNT(*) FILTER (WHERE pr.foreclosure_status IN ('pre-foreclosure', 'notice-of-default', 'auction-scheduled')) as active_foreclosures,
  AVG(pr.county_assessed_value) as avg_assessed_value,
  SUM(pr.foreclosure_amount_owed) as total_debt
FROM public.property_records pr
GROUP BY pr.county, pr.property_state
ORDER BY active_foreclosures DESC;

-- High equity opportunities
CREATE OR REPLACE VIEW v_high_equity_properties AS
SELECT
  pr.id,
  pr.property_address,
  pr.county,
  pr.property_state,
  TRIM(CONCAT(pr.owner1_first_name, ' ', pr.owner1_last_name)) as owner_name,
  pr.county_assessed_value,
  pr.current_mortgage_balance,
  pr.estimated_equity,
  ROUND((pr.estimated_equity / NULLIF(pr.county_assessed_value, 0)) * 100, 2) as equity_percentage,
  pr.foreclosure_status,
  pr.foreclosure_sale_date
FROM public.property_records pr
WHERE pr.estimated_equity > 50000
  AND pr.foreclosure_status IN ('pre-foreclosure', 'notice-of-default', 'auction-scheduled')
ORDER BY pr.estimated_equity DESC;

-- Grant access
GRANT SELECT ON v_active_foreclosures TO authenticated;
GRANT SELECT ON v_properties_by_county TO authenticated;
GRANT SELECT ON v_high_equity_properties TO authenticated;

-- ============================================
-- 11. ENABLE EXTENSIONS (Optional for enhanced search)
-- ============================================

-- Note: pg_trgm extension may need to be enabled by Supabase admin
-- For now, we'll use standard text search which is still very effective

-- Additional text search indexes
CREATE INDEX IF NOT EXISTS idx_property_records_address_lower ON public.property_records(LOWER(property_address));
CREATE INDEX IF NOT EXISTS idx_property_records_owner1_lower ON public.property_records(LOWER(owner1_last_name));

-- ============================================
-- 12. COMMENTS
-- ============================================

COMMENT ON TABLE public.property_records IS 'Comprehensive property records with owner, address, and foreclosure information';
COMMENT ON TABLE public.property_foreclosure_timeline IS 'Timeline of foreclosure events for each property';
COMMENT ON TABLE public.lenders IS 'Lender and servicer contact information';
COMMENT ON TABLE public.foreclosure_states IS 'State-level foreclosure laws and procedures';
COMMENT ON TABLE public.foreclosure_counties IS 'County-level court and filing information';
COMMENT ON FUNCTION search_properties_by_address IS 'Fuzzy search for properties by address';
COMMENT ON FUNCTION search_properties_by_owner IS 'Search properties by owner name';
COMMENT ON FUNCTION calculate_urgency_score IS 'Calculate urgency score (0-100) based on days until sale';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✓ Foreclosure Property Database created successfully!';
  RAISE NOTICE 'Tables: property_records, property_foreclosure_timeline, lenders, foreclosure_states, foreclosure_counties, property_contacts';
  RAISE NOTICE 'Views: v_active_foreclosures, v_properties_by_county, v_high_equity_properties';
  RAISE NOTICE 'Functions: search_properties_by_address, search_properties_by_owner, calculate_urgency_score';
  RAISE NOTICE 'Priority States: WA, MT, WY, CO, NM, TX, OK, KS, CA';
END $$;
