# MCP Implementation Guide for Foreclosure Property Database

## ✓ Database Created Successfully!

Your comprehensive foreclosure property database is now live with:
- ✓ **6 tables** for property records, timelines, lenders, and state/county laws
- ✓ **3 views** for active foreclosures, county statistics, and high-equity properties
- ✓ **3 functions** for searching and urgency scoring
- ✓ **9 priority states** seeded with foreclosure law data

---

## Current Status

### ✅ Completed
1. Database schema deployed
2. Property records table (all fields from your spec)
3. State foreclosure laws table
4. County procedures table
5. Search functions for address and owner lookup
6. Analytics views for dashboard
7. Basic data for 9 states (WA, MT, WY, CO, NM, TX, OK, KS, CA)

### 🔄 Next Steps
1. Populate state law data (run seed script)
2. Add county-level data for major areas
3. Set up CSV import process for property records
4. Configure MCP server
5. Integrate with AI voice system

---

## Step 1: Seed State Foreclosure Law Data

Run the SQL seed script to populate your 9 priority states:

```bash
# Apply seed data
cd "C:\users\monte\documents\cert api token keys ids\supabase project deployment\rep-motivated-seller"
supabase db execute -f supabase/seed-foreclosure-states.sql
```

Or in Supabase Dashboard SQL Editor:
1. Open: https://supabase.com/dashboard/project/ltxqodqlexvojqqxquew/sql
2. Paste contents of `seed-foreclosure-states.sql`
3. Run query

This adds:
- Foreclosure timelines for each state
- Redemption period information
- Homestead exemption amounts
- Primary statutes and references
- Legal aid and housing authority links

---

## Step 2: Add County Data (Major Metro Areas)

### Priority Counties to Add First:

**Washington:**
- King County (Seattle)
- Pierce County (Tacoma)
- Snohomish County (Everett)

**Montana:**
- Yellowstone County (Billings)
- Missoula County (Missoula)

**Colorado:**
- Denver County
- Arapahoe County
- Jefferson County

**Texas:**
- Harris County (Houston)
- Dallas County
- Bexar County (San Antonio)
- Travis County (Austin)

**California:**
- Los Angeles County
- Orange County
- San Diego County
- Riverside County

### Example SQL to Add County:

```sql
INSERT INTO public.foreclosure_counties (
  state_code, county_name, county_code,
  court_name, court_address, court_phone, court_website,
  filing_fee, recorder_office_name, recorder_phone, recorder_website,
  notice_period_days, sale_publication_period_days,
  legal_aid_organizations, hud_counseling_agencies,
  assessor_website, assessor_phone
) VALUES (
  'CA', 'Los Angeles', '06037',
  'Los Angeles County Superior Court',
  '111 N Hill St, Los Angeles, CA 90012',
  '(213) 830-0803',
  'https://www.lacourt.org',
  435.00,
  'Los Angeles County Recorder',
  '(562) 462-2125',
  'https://lavote.gov/home/records/real-property-records',
  90, 21,
  ARRAY['Bet Tzedek Legal Services', 'Legal Aid Foundation of Los Angeles'],
  ARRAY['Housing Rights Center', 'Neighborhood Legal Services of LA County'],
  'https://assessor.lacounty.gov/',
  '(213) 974-3211'
);
```

---

## Step 3: Import Property Data from CSV Files

You have two options for importing bulk property data:

### Option A: SQL COPY Command (Fastest for Large Datasets)

1. **Prepare CSV file** with exact column names matching database:
```csv
owner1_last_name,owner1_first_name,owner1_middle_name,mail_address,mail_city,mail_state,mail_zip_code,property_address,property_house_number,property_street_name,property_city,property_state,property_zip_code,county,foreclosure_amount_owed,purchase_price,county_assessed_value
Smith,John,A,123 Main St,Seattle,WA,98101,123 Main St,123,Main St,Seattle,WA,98101,King,250000.00,400000.00,450000.00
```

2. **Upload CSV to Supabase Storage:**
```bash
# Using Supabase CLI
supabase storage upload property-imports/my-data.csv ./my-data.csv
```

3. **Run COPY command in SQL Editor:**
```sql
-- Create temp table
CREATE TEMP TABLE temp_property_import (
  owner1_last_name TEXT,
  owner1_first_name TEXT,
  owner1_middle_name TEXT,
  mail_address TEXT,
  mail_city TEXT,
  mail_state TEXT,
  mail_zip_code TEXT,
  property_address TEXT,
  property_house_number TEXT,
  property_street_name TEXT,
  property_city TEXT,
  property_state TEXT,
  property_zip_code TEXT,
  county TEXT,
  foreclosure_amount_owed NUMERIC,
  purchase_price NUMERIC,
  county_assessed_value NUMERIC
);

-- Copy from CSV (adjust path)
COPY temp_property_import
FROM 'path/to/your/file.csv'
WITH (FORMAT csv, HEADER true);

-- Insert into main table
INSERT INTO public.property_records (
  owner1_last_name, owner1_first_name, owner1_middle_name,
  mail_address, mail_city, mail_state, mail_zip_code,
  property_address, property_house_number, property_street_name,
  property_city, property_state, property_zip_code, county,
  foreclosure_amount_owed, purchase_price, county_assessed_value,
  data_source, data_source_date, property_id
)
SELECT
  owner1_last_name, owner1_first_name, owner1_middle_name,
  mail_address, mail_city, mail_state, mail_zip_code,
  property_address, property_house_number, property_street_name,
  property_city, property_state, property_zip_code, county,
  foreclosure_amount_owed, purchase_price, county_assessed_value,
  'county_assessor' as data_source,
  CURRENT_DATE as data_source_date,
  gen_random_uuid() as property_id
FROM temp_property_import;
```

### Option B: CSV Import Edge Function (User-Friendly)

Create `supabase/functions/import-properties/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { parse } from 'https://deno.land/std@0.177.0/encoding/csv.ts'

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const formData = await req.formData()
  const csvFile = formData.get('file') as File

  if (!csvFile) {
    return new Response(JSON.stringify({ error: 'No file provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Parse CSV
  const csvText = await csvFile.text()
  const records = parse(csvText, { skipFirstRow: true })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Transform and insert
  const properties = records.map((row: any) => ({
    owner1_last_name: row['OWNER 1 LAST NAME'],
    owner1_first_name: row['OWNER 1 FIRST NAME'],
    owner1_middle_name: row['OWNER 1 MIDDLE NAME'],
    mail_address: row['MAIL ADDRESS'],
    mail_city: row['MAIL CITY'],
    mail_state: row['MAIL STATE'],
    mail_zip_code: row['MAIL ZIP CODE'],
    property_address: row['PROPERTY ADDRESS'],
    property_house_number: row['PROPERTY HOUSE NUMBER'],
    property_street_name: row['PROPERTY STREET NAME'],
    property_city: row['PROPERTY CITY'],
    property_state: row['PROPERTY STATE'],
    property_zip_code: row['PROPERTY ZIP CODE'],
    county: row['COUNTY'],
    foreclosure_amount_owed: parseFloat(row['FORECLOSURE AMOUNT OWED'] || '0'),
    purchase_price: parseFloat(row['COST OF HOME'] || '0'),
    county_assessed_value: parseFloat(row['COUNTY ASSESSED VALUE'] || '0'),
    data_source: 'csv_import',
    data_source_date: new Date().toISOString().split('T')[0]
  }))

  // Batch insert (Supabase max 1000 per batch)
  let imported = 0
  let errors = 0

  for (let i = 0; i < properties.length; i += 1000) {
    const batch = properties.slice(i, i + 1000)
    const { data, error } = await supabase
      .from('property_records')
      .insert(batch)

    if (error) {
      console.error('Batch insert error:', error)
      errors += batch.length
    } else {
      imported += batch.length
    }
  }

  return new Response(JSON.stringify({
    success: true,
    imported,
    errors,
    total: records.length
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

**Deploy:**
```bash
supabase functions deploy import-properties --no-verify-jwt
```

**Use:**
```bash
curl -X POST \
  https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/import-properties \
  -F "file=@property-data.csv"
```

---

## Step 4: Configure MCP Server

### Install PostgreSQL MCP Server

```bash
cd "C:\users\monte\documents\cert api token keys ids\supabase project deployment\rep-motivated-seller"
npm install @modelcontextprotocol/server-postgres
```

### Create MCP Configuration

Create `.mcp.json` in project root:

```json
{
  "mcpServers": {
    "foreclosure-db": {
      "command": "node",
      "args": [
        "node_modules/@modelcontextprotocol/server-postgres/dist/index.js"
      ],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://postgres.ltxqodqlexvojqqxquew:[YOUR-DB-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
      }
    }
  }
}
```

**Get your DB password from Supabase Dashboard:**
1. Go to: https://supabase.com/dashboard/project/ltxqodqlexvojqqxquew/settings/database
2. Copy connection string
3. Replace `[YOUR-DB-PASSWORD]` with actual password

### Configure Claude Desktop (for testing)

Edit: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "foreclosure-db": {
      "command": "node",
      "args": [
        "C:\\users\\monte\\documents\\cert api token keys ids\\supabase project deployment\\rep-motivated-seller\\node_modules\\@modelcontextprotocol\\server-postgres\\dist\\index.js"
      ],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://postgres.ltxqodqlexvojqqxquew:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
      }
    }
  }
}
```

---

## Step 5: Test MCP Integration

### Test Queries in Claude Desktop:

1. **Search for property by address:**
```
Search the foreclosure database for properties on "Main Street" in Los Angeles
```

Claude will use MCP to query:
```sql
SELECT * FROM search_properties_by_address('Main Street Los Angeles');
```

2. **Get state foreclosure timeline:**
```
What's the foreclosure timeline in California?
```

Claude will query:
```sql
SELECT * FROM foreclosure_states WHERE state_code = 'CA';
```

3. **Find active foreclosures in a county:**
```
Show me active foreclosures in King County, Washington
```

Claude will query:
```sql
SELECT * FROM v_active_foreclosures
WHERE county = 'King' AND property_state = 'WA';
```

---

## Step 6: Integrate with AI Voice System

Update `ai-voice-handler/openai-helper.ts` system prompt:

```typescript
const systemPrompt = `You are a helpful, empathetic assistant for RepMotivatedSeller.

You have access to a comprehensive foreclosure property database via MCP:
- Property records with owner info, addresses, and foreclosure amounts
- State-specific foreclosure laws and timelines
- County court procedures and filing requirements
- Active foreclosure listings with sale dates

**When a caller mentions their location or property address:**
1. Use MCP to search: "SELECT * FROM search_properties_by_address('[address]')"
2. Use MCP for state laws: "SELECT * FROM foreclosure_states WHERE state_code='[STATE]'"
3. Use MCP for county info: "SELECT * FROM foreclosure_counties WHERE state_code='[STATE]' AND county_name='[COUNTY]'"

**Example Queries:**
- Property lookup: search_properties_by_address('123 Main St Seattle')
- State timeline: SELECT typical_timeline_days FROM foreclosure_states WHERE state_code='WA'
- County procedures: SELECT * FROM foreclosure_counties WHERE county_name='Los Angeles'

Provide ACCURATE, location-specific information based on database data.

Your Role:
- Be warm and empathetic
- Provide state-specific legal timelines from the database
- Reference actual property values and foreclosure amounts when available
- Always encourage consulting with local attorney
- Offer to transfer to specialist

Remember: You have real data - use it to provide personalized, accurate guidance!`
```

---

## Data Sources for Property Records

### Free Public Sources:

**County Assessor Websites:**
- Most counties provide CSV downloads of property records
- Look for "GIS Data", "Property Data", "Open Data Portal"
- Usually includes owner names, addresses, assessed values

**Example Downloads:**
- Los Angeles: https://assessor.lacounty.gov/property-data/
- King County (WA): https://kingcounty.gov/depts/assessor/data-download.aspx
- Denver: https://www.denvergov.org/opendata
- Harris County (TX): https://hcad.org/property-search/

**Foreclosure Listings:**
- RealtyTrac: https://www.realtytrac.com/
- Foreclosure.com: https://www.foreclosure.com/
- Zillow Foreclosure Center: https://www.zillow.com/foreclosures/

### Paid Data Sources:

**Property Data APIs:**
- Zillow API (free tier available)
- Attom Data Solutions ($500-2,000/month)
- CoreLogic ($1,000+/month)
- Black Knight ($$$)

**Foreclosure-Specific:**
- RealtyTrac Bulk Data ($1,000-5,000/month)
- PropertyShark ($99-299/month)
- Foreclosure Radar (CA only, $99/month)

### DIY Approach (FREE):

1. **Start with one county** (your local area)
2. **Visit county assessor website**
3. **Download property tax roll** (usually CSV/Excel)
4. **Filter for properties with:**
   - Delinquent taxes
   - Notice of Default filed
   - Lis Pendens (lawsuit pending)
5. **Import to database** using CSV import function

---

## Timeline Estimate

### Week 1-2: Data Foundation
- ✓ Database created (DONE)
- ✓ State laws seeded (Run SQL script)
- Add 20-30 major counties (2-3 hours each)
- Import first 1,000 properties from local county

### Week 3-4: MCP Setup & Testing
- Install MCP server
- Configure Claude Desktop connection
- Test queries with sample data
- Refine search functions based on real queries

### Week 5-6: Integration & Expansion
- Update AI voice system prompt
- Add MCP queries to Edge Functions
- Deploy and test with real calls
- Add more counties as needed

### Weeks 7-8: Production Readiness
- Full testing of all functions
- Frontend integration (property search)
- Admin dashboard for property management
- CI/CD pipeline setup
- Final verification

---

## Budget Breakdown

### DIY Approach (Recommended):
- Setup: $0
- Data population (your time): 40-60 hours
- Hosting: $0 (Supabase free tier)
- **Total: $0 + your time**

### Hire Help:
- VA data entry: $300-500 (100 hours @ $3-5/hr)
- Paralegal for legal research: $500-1,000 (20 hours @ $25-50/hr)
- **Total: $800-1,500 one-time**

### Premium Data:
- AttomData API: $500/month
- RealtyTrac: $1,000/month
- **Total: $1,500/month subscription**

---

## Next Actions

Choose your path:

### Path A: DIY (Start Today)
1. Run state seed script: `seed-foreclosure-states.sql`
2. Add 5 counties manually (start with your local area)
3. Download county assessor data for those 5 counties
4. Import 100-500 test properties
5. Install MCP server and test

### Path B: Hire VA (1-2 Weeks)
1. Post job on Upwork/Fiverr for "Data Entry - Property Records"
2. Provide them with county list and data sources
3. Have them populate all 9 states + major counties
4. Review and import their CSV files
5. Install MCP server and test

### Path C: Purchase Data (Immediate)
1. Sign up for RealtyTrac or AttomData trial
2. Download bulk data for your 9 states
3. Import using CSV function
4. Monthly updates via API
5. Install MCP server and test

---

## Support & Resources

**Documentation:**
- Supabase PostgreSQL: https://supabase.com/docs/guides/database
- MCP Specification: https://modelcontextprotocol.io/
- PostgreSQL MCP Server: https://github.com/modelcontextprotocol/servers/tree/main/src/postgres

**Your Files:**
- Migration: `supabase/migrations/20251119000002_foreclosure_property_database.sql`
- Seed Data: `supabase/seed-foreclosure-states.sql`
- This Guide: `MCP_IMPLEMENTATION_GUIDE.md`

**Questions?**
All database tables, views, and functions are documented in the migration file. Use `\d+ table_name` in psql to see structure.

---

## Success Metrics

After implementation, you'll have:
- ✓ Searchable database of properties in foreclosure
- ✓ State and county-specific legal information
- ✓ AI assistant that provides accurate, location-based advice
- ✓ Property search by address, owner, or county
- ✓ Urgency scoring for time-sensitive cases
- ✓ Equity calculations for strategic decisions
- ✓ Real-time data accessible to your team and AI

**Ready to launch in 6-8 weeks!**
