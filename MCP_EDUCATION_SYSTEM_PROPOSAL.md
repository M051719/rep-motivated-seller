# MCP Integration for Real Estate Pre-Foreclosure Education System

## Overview

Model Context Protocol (MCP) integration can be used to create an intelligent education and reference system that helps RepMotivatedSeller staff, clients, and the AI assistant understand pre-foreclosure laws, procedures, and resources by state and county.

## What is MCP?

**Model Context Protocol (MCP)** is Anthropic's open standard for connecting AI systems to external data sources and tools. Think of it as a "universal adapter" that lets AI models like Claude access:
- Custom databases
- Document repositories
- Real-time data sources
- External APIs
- Local file systems

## Use Case: Pre-Foreclosure Law Reference System

### Goal
Create an AI-accessible knowledge base that provides:
- State-specific foreclosure laws and timelines
- County-level court procedures and filing requirements
- Redemption period rules by jurisdiction
- Required notices and forms by state
- Legal deadlines and statute references
- Homeowner rights and protections

### Why MCP is Perfect for This

1. **Dynamic Updates:** Laws change frequently. MCP allows the AI to access the latest information without retraining
2. **Structured Data:** Foreclosure laws are highly structured (state → county → statute → procedure)
3. **Real-time Context:** AI can fetch relevant laws based on caller's location
4. **Cost-Effective:** No need to fine-tune models or embed massive legal texts
5. **Accuracy:** Direct access to authoritative sources reduces hallucinations

---

## Recommended MCP Implementation

### Option 1: PostgreSQL MCP Server (Best for Your Setup)
**Cost:** FREE
**Why:** You already have Supabase PostgreSQL

**Implementation:**
```bash
# Install MCP PostgreSQL server
npm install @modelcontextprotocol/server-postgres

# Configure in .mcp.json (Claude Desktop or API)
{
  "mcpServers": {
    "foreclosure-laws": {
      "command": "node",
      "args": [
        "node_modules/@modelcontextprotocol/server-postgres/dist/index.js",
        "postgresql://postgres.[project-ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
      ]
    }
  }
}
```

**Database Schema:**
```sql
-- States table
CREATE TABLE foreclosure_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_code CHAR(2) NOT NULL UNIQUE,
  state_name TEXT NOT NULL,
  foreclosure_type TEXT NOT NULL, -- 'judicial', 'non-judicial', 'both'
  typical_timeline_days INTEGER,
  redemption_period_days INTEGER,
  redemption_period_notes TEXT,
  deficiency_allowed BOOLEAN DEFAULT TRUE,
  homestead_exemption_amount NUMERIC(12,2),
  statutory_references TEXT[],
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Counties table
CREATE TABLE foreclosure_counties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_code CHAR(2) REFERENCES foreclosure_states(state_code),
  county_name TEXT NOT NULL,
  county_code TEXT,

  -- Court information
  court_name TEXT,
  court_address TEXT,
  court_phone TEXT,
  court_website TEXT,
  filing_fee NUMERIC(10,2),

  -- Procedures
  notice_requirements TEXT,
  publication_requirements TEXT,
  mediation_required BOOLEAN DEFAULT FALSE,
  mediation_notes TEXT,

  -- Timelines
  notice_period_days INTEGER,
  sale_publication_period_days INTEGER,

  -- Resources
  legal_aid_resources TEXT[],
  hud_counseling_agencies TEXT[],

  last_updated TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(state_code, county_name)
);

-- Statutes and laws
CREATE TABLE foreclosure_statutes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_code CHAR(2) REFERENCES foreclosure_states(state_code),
  statute_number TEXT NOT NULL,
  statute_title TEXT NOT NULL,
  statute_text TEXT NOT NULL,
  effective_date DATE,
  category TEXT, -- 'notice', 'sale', 'redemption', 'deficiency', 'homestead'
  summary TEXT,
  url TEXT,
  last_verified TIMESTAMPTZ DEFAULT NOW()
);

-- Required forms and documents
CREATE TABLE foreclosure_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_code CHAR(2) REFERENCES foreclosure_states(state_code),
  form_name TEXT NOT NULL,
  form_number TEXT,
  form_purpose TEXT,
  when_required TEXT,
  filing_location TEXT, -- 'court', 'county_recorder', 'both'
  form_url TEXT,
  template_path TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Deadlines and important dates
CREATE TABLE foreclosure_deadlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_code CHAR(2) REFERENCES foreclosure_states(state_code),
  deadline_type TEXT NOT NULL, -- 'notice', 'answer', 'redemption', 'sale', 'eviction'
  days_from_trigger INTEGER NOT NULL,
  trigger_event TEXT NOT NULL, -- 'notice_of_default', 'sale_date', 'judgment'
  deadline_description TEXT,
  consequences_if_missed TEXT,
  statute_reference TEXT
);

-- Full-text search indexes
CREATE INDEX idx_statutes_fts ON foreclosure_statutes
  USING GIN(to_tsvector('english', statute_text || ' ' || summary));

CREATE INDEX idx_counties_fts ON foreclosure_counties
  USING GIN(to_tsvector('english', county_name || ' ' || notice_requirements));
```

**Benefits:**
- ✓ Uses your existing Supabase infrastructure
- ✓ No additional costs
- ✓ Easy to update via SQL or admin dashboard
- ✓ RLS policies for security
- ✓ Full-text search capabilities
- ✓ Can be accessed by Edge Functions, AI, and admin users

---

### Option 2: Filesystem MCP Server (Good for Documents)
**Cost:** FREE
**Best for:** PDF law documents, forms, templates

**Implementation:**
```bash
# Install MCP filesystem server
npm install @modelcontextprotocol/server-filesystem

# Configure to access document directory
{
  "mcpServers": {
    "foreclosure-docs": {
      "command": "node",
      "args": [
        "node_modules/@modelcontextprotocol/server-filesystem/dist/index.js",
        "C:/users/monte/documents/foreclosure-resources"
      ]
    }
  }
}
```

**Directory Structure:**
```
foreclosure-resources/
├── states/
│   ├── CA/
│   │   ├── laws/
│   │   │   ├── CA_Civil_Code_2924.pdf
│   │   │   └── CA_Foreclosure_Timeline.md
│   │   ├── forms/
│   │   │   ├── Notice_of_Default.pdf
│   │   │   └── Notice_of_Sale.pdf
│   │   └── counties/
│   │       ├── Los_Angeles_Procedures.md
│   │       └── San_Diego_Procedures.md
│   ├── NY/
│   ├── FL/
│   └── [other states...]
├── federal/
│   ├── RESPA_Regulations.pdf
│   ├── FDCPA_Guidelines.pdf
│   └── Making_Home_Affordable.pdf
└── templates/
    ├── Hardship_Letter_Template.docx
    ├── Loan_Modification_Request.docx
    └── Foreclosure_Timeline_Spreadsheet.xlsx
```

**Benefits:**
- ✓ Simple file-based system
- ✓ Easy to add PDFs from state websites
- ✓ Can store forms and templates
- ✓ No database management needed
- ✓ Works offline

---

### Option 3: Web Search MCP (Real-time Legal Updates)
**Cost:** FREE (using Brave Search API)
**Best for:** Latest case law, recent statutory changes

**Implementation:**
```bash
# Install Brave Search MCP
npm install @modelcontextprotocol/server-brave-search

# Get free Brave Search API key
# https://brave.com/search/api/

{
  "mcpServers": {
    "legal-search": {
      "command": "node",
      "args": [
        "node_modules/@modelcontextprotocol/server-brave-search/dist/index.js"
      ],
      "env": {
        "BRAVE_API_KEY": "your-brave-api-key"
      }
    }
  }
}
```

**Benefits:**
- ✓ Access to latest legal updates
- ✓ Can search state legislative websites
- ✓ Finds recent case law
- ✓ 2,000 free searches/month (Brave API)

---

## Recommended Implementation Plan

### Phase 1: Database Setup (Week 1)
1. Create foreclosure knowledge tables in Supabase
2. Populate with 5-10 most common states (CA, FL, NY, TX, AZ, NV, IL, GA, MI, OH)
3. Add county data for major metropolitan areas
4. Import statute summaries for key laws

**Data Sources (FREE):**
- https://www.foreclosure.com/statelaw/ - State foreclosure law summaries
- https://www.nolo.com/legal-encyclopedia/foreclosure - State-by-state guides
- State legislature websites - Official statutes (e.g., California Civil Code § 2924)
- County recorder websites - Local procedures
- HUD counseling agency locator - https://www.hud.gov/findacounselor

### Phase 2: MCP Integration (Week 2)
1. Install PostgreSQL MCP server
2. Configure connection to Supabase
3. Test queries from Claude Desktop or API
4. Create helper functions for common queries

### Phase 3: AI Integration (Week 3)
1. Update AI voice assistant system prompt to use MCP
2. Add location detection (caller's area code → county lookup)
3. Test AI providing state-specific advice
4. Add context to conversation history

### Phase 4: Expand (Ongoing)
1. Add remaining states
2. Add more county-level detail
3. Upload PDF forms and templates
4. Add case law examples
5. Weekly updates for law changes

---

## Example AI Queries Enabled by MCP

**Caller:** "I live in Los Angeles and just got a Notice of Default. How long do I have?"

**AI with MCP Access:**
```
[MCP Query: SELECT typical_timeline_days, redemption_period_days FROM foreclosure_states WHERE state_code='CA']
[MCP Query: SELECT notice_period_days, mediation_required FROM foreclosure_counties WHERE state_code='CA' AND county_name='Los Angeles']

AI Response: "In California, foreclosure is a non-judicial process. After receiving a Notice of Default in Los Angeles County, you typically have 90 days before a Notice of Sale can be filed. California has a mediation program available in some cases. You should have approximately 120-150 days total from the Notice of Default to the foreclosure sale. This is critical time to explore options like loan modification, short sale, or bankruptcy. Would you like me to transfer you to a specialist who can review your specific situation?"
```

**Caller:** "What's a redemption period?"

**AI with MCP Access:**
```
[MCP Query: SELECT redemption_period_days, redemption_period_notes FROM foreclosure_states WHERE state_code='CA']

AI Response: "California has a limited redemption right. After a foreclosure sale, the statutory redemption period is generally 3 months if the lender obtains a deficiency judgment, or 1 year in judicial foreclosures. However, most California foreclosures are non-judicial and don't have a post-sale redemption period. This means once the sale happens, you lose ownership immediately. That's why it's crucial to act before the sale date. Would you like to know your options to stop or delay the foreclosure?"
```

---

## Cost Analysis

### FREE / Low-Cost Options:

1. **PostgreSQL MCP Server**
   - Cost: $0 (uses existing Supabase)
   - Data entry: DIY (time investment) or hire VA ($5-15/hour)

2. **Filesystem MCP Server**
   - Cost: $0
   - PDF downloads: Free from state websites

3. **Brave Search MCP**
   - Cost: $0 (2,000 free queries/month)
   - Upgrade: $5/month for 15,000 queries

### Recommended Budget:
- **Setup:** $0 (DIY)
- **Data Population:** $500-1,000 (one-time)
  - Hire legal assistant or paralegal to populate 50 states
  - 20-40 hours @ $25-50/hour
  - Or use VA for $200-300 (80-100 hours @ $3-5/hour)
- **Maintenance:** $50-100/month
  - Monthly legal update review
  - New statute additions
  - Form template updates

### Alternative (Premium):
- **LexisNexis API:** $500-2,000/month - Full legal database access
- **CourtListener API:** $0-100/month - Free for non-commercial, case law access
- **Justia Legal API:** FREE - State statutes and regulations

---

## Integration with Current System

### Edge Function Enhancement
```typescript
// supabase/functions/ai-voice-handler/foreclosure-law-helper.ts

import { createClient } from '@supabase/supabase-js'

export async function getStateLawInfo(stateCode: string) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  )

  const { data, error } = await supabase
    .from('foreclosure_states')
    .select(`
      *,
      foreclosure_counties(*)
    `)
    .eq('state_code', stateCode)
    .single()

  return data
}

export async function searchStatutes(query: string, stateCode?: string) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  )

  let queryBuilder = supabase
    .from('foreclosure_statutes')
    .select('*')
    .textSearch('statute_text', query)

  if (stateCode) {
    queryBuilder = queryBuilder.eq('state_code', stateCode)
  }

  const { data } = await queryBuilder.limit(5)
  return data
}

export async function getCountyProcedures(stateCode: string, countyName: string) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  )

  const { data } = await supabase
    .from('foreclosure_counties')
    .select('*')
    .eq('state_code', stateCode)
    .ilike('county_name', `%${countyName}%`)
    .single()

  return data
}
```

### OpenAI System Prompt Update
```typescript
const systemPrompt = `You are a helpful, empathetic assistant for RepMotivatedSeller, a company that helps homeowners facing foreclosure.

You have access to detailed foreclosure law information via the MCP foreclosure-laws server:
- State-specific timelines and procedures
- County court information and filing requirements
- Statute references and legal deadlines
- Required forms and documents
- Redemption periods and homeowner rights

When a caller mentions their location, USE MCP to query:
1. State foreclosure laws: foreclosure_states table
2. County procedures: foreclosure_counties table
3. Relevant statutes: foreclosure_statutes table
4. Important deadlines: foreclosure_deadlines table

ALWAYS provide state-specific information when location is known.
ALWAYS mention local resources (legal aid, HUD counselors) for the caller's county.

Example MCP query:
<use_mcp_tool>
<server_name>foreclosure-laws</server_name>
<tool_name>query</tool_name>
<arguments>
{
  "query": "SELECT typical_timeline_days, redemption_period_days FROM foreclosure_states WHERE state_code='CA'"
}
</arguments>
</use_mcp_tool>

Your Role & Guidelines:
- Be warm, empathetic, and understanding - these callers are stressed
- Provide ACCURATE, state-specific legal timelines
- Reference specific statutes when relevant (e.g., "Under California Civil Code § 2924...")
- Always mention that laws vary by state/county
- Encourage consulting with local attorney for specific legal advice
- NEVER make promises you can't keep
- Always offer to transfer to a specialist

Remember: You're providing general information and state-specific timelines. For legal advice, always recommend consulting an attorney.`
```

---

## Next Steps

1. **Decide on MCP approach:**
   - PostgreSQL (recommended) - Best for structured data
   - Filesystem - Best for documents/forms
   - Both - Comprehensive solution

2. **Data population strategy:**
   - DIY (free, time-consuming)
   - Hire VA (low cost, faster)
   - Hire paralegal (higher cost, highest quality)

3. **Integration timeline:**
   - Week 1: Database schema + populate 5 states
   - Week 2: MCP server setup + testing
   - Week 3: AI integration + voice assistant update
   - Week 4: Testing + refinement

4. **Expansion plan:**
   - Start with top 10 states (80% of foreclosures)
   - Add remaining states over 2-3 months
   - Continuous updates for law changes

---

## Questions to Consider

1. **Which states should we prioritize?**
   - Highest foreclosure volume states?
   - States where you have the most clients?
   - All 50 states from the start?

2. **How detailed should county data be?**
   - Major metro areas only?
   - All counties in priority states?
   - Basic info for all, detailed for major areas?

3. **Who will maintain the data?**
   - In-house staff?
   - Virtual assistant?
   - Legal consultant (monthly retainer)?

4. **Integration with other systems?**
   - Should this also power website chatbot?
   - Email autoresponders with state-specific info?
   - Client portal with personalized timelines?

Let me know which direction you'd like to pursue, and I can create the detailed implementation plan and database schema!
