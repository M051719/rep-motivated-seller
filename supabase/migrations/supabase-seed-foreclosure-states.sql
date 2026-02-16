# Copy the file contents to clipboard
Get-Content "supabase\seed-foreclosure-states.sql" | Set-Clipboard

# Then open Supabase SQL Editor and paste:
# https://supabase.com/dashboard/project/ltxqodqlexvojqqxquew/sql



-- Seed Data for Priority States
-- States: WA, MT, WY, CO, NM, TX, OK, KS, CA
-- Data sourced from state foreclosure law resources

-- ============================================
-- WASHINGTON (WA)
-- ============================================
INSERT INTO public.foreclosure_states (
  state_code, state_name, foreclosure_type, typical_timeline_days,
  redemption_period_days, redemption_allowed, deficiency_allowed,
  homestead_exemption_amount, mediation_required, mediation_voluntary,
  primary_statute, statutory_references, legal_aid_url, state_housing_authority_url
) VALUES (
  'WA', 'Washington', 'non-judicial', 150,
  NULL, FALSE, TRUE,
  125000.00, FALSE, TRUE,
  'RCW 61.24',
  ARRAY['RCW 61.24.030', 'RCW 61.24.040', 'RCW 61.24.090'],
  'https://nwjustice.org/',
  'https://www.wshfc.org/'
) ON CONFLICT (state_code) DO UPDATE SET
  typical_timeline_days = EXCLUDED.typical_timeline_days,
  last_updated = NOW();

-- ============================================
-- MONTANA (MT)
-- ============================================
INSERT INTO public.foreclosure_states (
  state_code, state_name, foreclosure_type, typical_timeline_days,
  redemption_period_days, redemption_allowed, deficiency_allowed,
  homestead_exemption_amount, mediation_required,
  primary_statute, statutory_references, legal_aid_url, state_housing_authority_url
) VALUES (
  'MT', 'Montana', 'both', 150,
  365, TRUE, TRUE,
  250000.00, FALSE,
  'MCA 71-1-222',
  ARRAY['MCA 71-1-222', 'MCA 25-13-801'],
  'https://www.mtlsa.org/',
  'https://housing.mt.gov/'
) ON CONFLICT (state_code) DO UPDATE SET
  typical_timeline_days = EXCLUDED.typical_timeline_days,
  last_updated = NOW();

-- ============================================
-- WYOMING (WY)
-- ============================================
INSERT INTO public.foreclosure_states (
  state_code, state_name, foreclosure_type, typical_timeline_days,
  redemption_period_days, redemption_allowed, deficiency_allowed,
  homestead_exemption_amount, mediation_required,
  primary_statute, statutory_references, legal_aid_url, state_housing_authority_url
) VALUES (
  'WY', 'Wyoming', 'both', 180,
  90, TRUE, TRUE,
  100000.00, FALSE,
  'Wyo. Stat. Â§ 34-4-101',
  ARRAY['Wyo. Stat. Â§ 34-4-101', 'Wyo. Stat. Â§ 1-18-101'],
  'https://www.wyomingadvocacy.org/',
  'https://www.wyomingcda.com/'
) ON CONFLICT (state_code) DO UPDATE SET
  typical_timeline_days = EXCLUDED.typical_timeline_days,
  last_updated = NOW();

-- ============================================
-- COLORADO (CO)
-- ============================================
INSERT INTO public.foreclosure_states (
  state_code, state_name, foreclosure_type, typical_timeline_days,
  redemption_period_days, redemption_allowed, deficiency_allowed,
  homestead_exemption_amount, mediation_required, mediation_voluntary,
  primary_statute, statutory_references, legal_aid_url, state_housing_authority_url
) VALUES (
  'CO', 'Colorado', 'non-judicial', 125,
  75, TRUE, TRUE,
  250000.00, FALSE, TRUE,
  'C.R.S. Â§ 38-38-101',
  ARRAY['C.R.S. Â§ 38-38-101', 'C.R.S. Â§ 38-39-101'],
  'https://www.coloradolegalservices.org/',
  'https://cdola.colorado.gov/housing'
) ON CONFLICT (state_code) DO UPDATE SET
  typical_timeline_days = EXCLUDED.typical_timeline_days,
  last_updated = NOW();

-- ============================================
-- NEW MEXICO (NM)
-- ============================================
INSERT INTO public.foreclosure_states (
  state_code, state_name, foreclosure_type, typical_timeline_days,
  redemption_period_days, redemption_allowed, deficiency_allowed,
  homestead_exemption_amount, mediation_required,
  primary_statute, statutory_references, legal_aid_url, state_housing_authority_url
) VALUES (
  'NM', 'New Mexico', 'judicial', 180,
  30, TRUE, TRUE,
  60000.00, FALSE,
  'NMSA 1978 Â§ 39-5-1',
  ARRAY['NMSA 1978 Â§ 39-5-1', 'NMSA 1978 Â§ 48-10-1'],
  'https://www.lawhelpnewmexico.org/',
  'https://www.housingnm.org/'
) ON CONFLICT (state_code) DO UPDATE SET
  typical_timeline_days = EXCLUDED.typical_timeline_days,
  last_updated = NOW();

-- ============================================
-- TEXAS (TX)
-- ============================================
INSERT INTO public.foreclosure_states (
  state_code, state_name, foreclosure_type, typical_timeline_days,
  redemption_period_days, redemption_allowed, deficiency_allowed,
  homestead_exemption_amount, mediation_required,
  primary_statute, statutory_references, legal_aid_url, state_housing_authority_url
) VALUES (
  'TX', 'Texas', 'non-judicial', 41,
  NULL, FALSE, TRUE,
  0.00, FALSE, -- No dollar limit, but area limit
  'Tex. Prop. Code Â§ 51.002',
  ARRAY['Tex. Prop. Code Â§ 51.002', 'Tex. Prop. Code Â§ 51.0075'],
  'https://texaslawhelp.org/',
  'https://www.tdhca.state.tx.us/'
) ON CONFLICT (state_code) DO UPDATE SET
  typical_timeline_days = EXCLUDED.typical_timeline_days,
  last_updated = NOW();

-- ============================================
-- OKLAHOMA (OK)
-- ============================================
INSERT INTO public.foreclosure_states (
  state_code, state_name, foreclosure_type, typical_timeline_days,
  redemption_period_days, redemption_allowed, deficiency_allowed,
  homestead_exemption_amount, mediation_required,
  primary_statute, statutory_references, legal_aid_url, state_housing_authority_url
) VALUES (
  'OK', 'Oklahoma', 'both', 186,
  NULL, FALSE, TRUE,
  0.00, FALSE, -- No dollar limit
  '46 Okla. Stat. Â§ 41',
  ARRAY['46 Okla. Stat. Â§ 41', '12 Okla. Stat. Â§ 686'],
  'https://www.oklaw.org/',
  'https://www.ok.gov/ohfa/'
) ON CONFLICT (state_code) DO UPDATE SET
  typical_timeline_days = EXCLUDED.typical_timeline_days,
  last_updated = NOW();

-- ============================================
-- KANSAS (KS)
-- ============================================
INSERT INTO public.foreclosure_states (
  state_code, state_name, foreclosure_type, typical_timeline_days,
  redemption_period_days, redemption_allowed, deficiency_allowed,
  homestead_exemption_amount, mediation_required,
  primary_statute, statutory_references, legal_aid_url, state_housing_authority_url
) VALUES (
  'KS', 'Kansas', 'judicial', 120,
  365, TRUE, TRUE,
  0.00, FALSE, -- No dollar limit
  'K.S.A. Â§ 60-2410',
  ARRAY['K.S.A. Â§ 60-2410', 'K.S.A. Â§ 60-2414'],
  'https://www.kansaslegalservices.org/',
  'https://kshousingcorp.org/'
) ON CONFLICT (state_code) DO UPDATE SET
  typical_timeline_days = EXCLUDED.typical_timeline_days,
  last_updated = NOW();

-- ============================================
-- CALIFORNIA (CA)
-- ============================================
INSERT INTO public.foreclosure_states (
  state_code, state_name, foreclosure_type, typical_timeline_days,
  redemption_period_days, redemption_allowed, deficiency_allowed,
  homestead_exemption_amount, mediation_required, mediation_voluntary,
  primary_statute, statutory_references, legal_aid_url, state_housing_authority_url
) VALUES (
  'CA', 'California', 'non-judicial', 117,
  NULL, FALSE, FALSE, -- Deficiency generally not allowed for non-judicial
  600000.00, FALSE, TRUE,
  'Cal. Civ. Code Â§ 2924',
  ARRAY['Cal. Civ. Code Â§ 2924', 'Cal. Civ. Code Â§ 2924b', 'Cal. Civ. Code Â§ 2924f'],
  'https://lawhelpca.org/',
  'https://www.hcd.ca.gov/'
) ON CONFLICT (state_code) DO UPDATE SET
  typical_timeline_days = EXCLUDED.typical_timeline_days,
  last_updated = NOW();

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'âœ“ Seeded foreclosure state data for 9 priority states';
  RAISE NOTICE 'States: WA, MT, WY, CO, NM, TX, OK, KS, CA';
END $$;
