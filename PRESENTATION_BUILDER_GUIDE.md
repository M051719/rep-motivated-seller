# Property Presentation Builder - Implementation Guide

**Created:** December 11, 2025  
**Status:** ✅ Core System Deployed  
**Route:** `/presentation-builder`

---

## 🎯 Overview

A comprehensive tiered direct mail marketing system that creates professional property presentations with:
- **Property comparables** with market analysis
- **Interactive maps** showing property location and comps
- **AI-assisted content** generation for descriptions and marketing letters
- **Calculator integration** using existing tools (mortgage, ROI, deal analyzer)
- **Multi-channel delivery** - PDF download, email, and direct mail via Lob

---

## 💎 Tier Structure

### Basic (Free)
- **Price:** $0/month
- **Limit:** 1 presentation per month
- **Features:**
  - Basic property data entry
  - 3 comparable properties
  - PDF download only
  - Email delivery
  - Standard templates
  - No AI content generation
  - No direct mail sending

### Professional
- **Price:** $29/month
- **Limit:** 50 presentations per month
- **Features:**
  - Advanced property data
  - 10 comparable properties
  - PDF + PowerPoint export
  - Email + Direct mail via Lob
  - **AI-assisted content writing**
  - Interactive maps
  - Custom branding
  - Analytics tracking

### Premium
- **Price:** $99/month
- **Limit:** ✨ **Unlimited** presentations
- **Features:**
  - Full property analytics
  - All export formats
  - **Unlimited comparables**
  - **Advanced AI content generation**
  - Custom map styling
  - **Bulk direct mail campaigns**
  - White-label branding
  - Priority support
  - API access
  - Team collaboration

---

## 📊 Database Schema

### Tables Created

#### `presentation_exports`
Tracks all generated presentations:
```sql
- id: UUID (primary key)
- user_id: UUID (references auth.users)
- subscription_id: UUID (nullable)
- property_address, property_city, property_state, property_zip
- property_data: JSONB (full property details)
- export_format: TEXT (pdf|pptx|email|directmail)
- include_comparables, include_map, include_ai_content, include_calculations: BOOLEAN
- comparables_data: JSONB (array of comps)
- ai_content: JSONB (AI-generated content)
- calculator_results: JSONB (imported calculator data)
- status: TEXT (generating|completed|failed|sent)
- file_url: TEXT (S3/Storage URL)
- lob_letter_id: TEXT (if sent via direct mail)
- email_sent_at, directmail_sent_at: TIMESTAMPTZ
- tier_at_creation: TEXT (for analytics)
- created_at, updated_at: TIMESTAMPTZ
```

#### `subscriptions` (extended)
Added column:
```sql
- presentations_used: INTEGER (tracks monthly usage)
```

### Functions Created

#### `increment_presentation_count(p_user_id UUID)`
- Increments user's presentation count after successful export
- Called automatically after each presentation creation
- Resets monthly (handled by existing subscription system)

#### `can_create_presentation(p_user_id UUID)`
Returns:
```sql
- allowed: BOOLEAN (can create presentation?)
- tier: TEXT (basic|pro|premium)
- used: INTEGER (presentations used this month)
- monthly_limit: INTEGER (NULL for unlimited)
- reason: TEXT (explanation/error message)
```

Logic:
- **No subscription:** Basic tier - 1 free per month
- **Basic tier:** 1 presentation/month
- **Pro tier:** 50 presentations/month
- **Premium tier:** Unlimited presentations

---

## 🏗️ Implementation Status

### ✅ Completed

1. **Core Page Component** (`PresentationBuilderPage.tsx`)
   - 5-step wizard: Property → Comparables → AI Content → Preview → Export
   - Tier display and upgrade prompts
   - Usage tracking UI
   - Property data entry form
   - Mock comparables generation
   - AI content placeholders
   - Export options (PDF, PPTX, Email, Direct Mail)

2. **Database Schema** (Migration `20251211000001`)
   - `presentation_exports` table with RLS policies
   - Usage tracking functions
   - Tier limit validation
   - Indexes for performance

3. **Routing**
   - Added to `App.tsx` at `/presentation-builder`
   - Accessible to all users (tier gating handled in component)

4. **Direct Mail Integration**
   - Connected to existing Lob API (`send-direct-mail` function)
   - Sends full presentation data as letter content
   - Tracked in `presentation_exports` table

### 🚧 Next Steps (Priority Order)

#### 1. **Real Estate Comparables API** (High Priority)
**Recommended APIs:**
- **Attom Data** - Comprehensive property data
  - Endpoint: `https://api.gateway.attomdata.com/propertyapi/v1.0.0/salescomparables`
  - Cost: ~$0.10 per request
  - Data: Sales history, property details, AVM
  
- **Zillow API** (via RapidAPI)
  - Endpoint: Zillow property data
  - Data: Zestimates, comps, photos
  
- **CoreLogic API**
  - Enterprise-grade property data
  - More expensive but comprehensive

**Implementation:**
```typescript
// src/services/comparablesService.ts
export async function fetchComparables(address: string, city: string, state: string, zip: string) {
  const response = await fetch('https://api.attomdata.com/propertyapi/v1.0.0/salescomparables', {
    headers: {
      'APIKey': process.env.ATTOM_API_KEY,
      'Accept': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({
      address1: address,
      address2: `${city}, ${state} ${zip}`,
      radius: 1, // mile
      limit: 10
    })
  });
  
  return await response.json();
}
```

#### 2. **AI Content Generation** (High Priority)
**Recommended:** OpenAI GPT-4 or Anthropic Claude

**Implementation:**
```typescript
// src/services/aiContentService.ts
export async function generatePropertyContent(propertyData: PropertyData, comparables: Comparable[]) {
  const prompt = `Generate professional property marketing content for:
  
Address: ${propertyData.address}, ${propertyData.city}, ${propertyData.state}
Type: ${propertyData.propertyType}
Beds/Baths: ${propertyData.bedrooms}/${propertyData.bathrooms}
Size: ${propertyData.sqft} sq ft
Year Built: ${propertyData.yearBuilt}
Estimated Value: $${propertyData.estimatedValue.toLocaleString()}

Comparable Properties:
${comparables.map(c => `- ${c.address}: $${c.price.toLocaleString()}`).join('\n')}

Generate:
1. Property description (2-3 paragraphs)
2. Marketing letter to homeowner
3. Investment analysis summary`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    })
  });
  
  return await response.json();
}
```

#### 3. **PDF/PPTX Export Generation** (Medium Priority)
**Recommended Libraries:**
- **jsPDF** + **html2canvas** (client-side PDF)
- **PptxGenJS** (client-side PowerPoint)
- **Puppeteer** (server-side, high quality)

**Implementation:**
```typescript
// src/services/exportService.ts
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function generatePDF(presentationData: any) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  // Title page
  pdf.setFontSize(24);
  pdf.text('Property Marketing Presentation', 20, 30);
  pdf.setFontSize(16);
  pdf.text(presentationData.property.address, 20, 45);
  pdf.text(`${presentationData.property.city}, ${presentationData.property.state}`, 20, 55);
  
  // Property details
  pdf.addPage();
  pdf.setFontSize(18);
  pdf.text('Property Overview', 20, 30);
  pdf.setFontSize(12);
  pdf.text(`Type: ${presentationData.property.propertyType}`, 20, 45);
  pdf.text(`Bedrooms: ${presentationData.property.bedrooms}`, 20, 55);
  pdf.text(`Bathrooms: ${presentationData.property.bathrooms}`, 20, 65);
  pdf.text(`Square Feet: ${presentationData.property.sqft}`, 20, 75);
  pdf.text(`Estimated Value: $${presentationData.property.estimatedValue.toLocaleString()}`, 20, 85);
  
  // Comparables
  if (presentationData.comparables) {
    pdf.addPage();
    pdf.setFontSize(18);
    pdf.text('Market Comparables', 20, 30);
    pdf.setFontSize(10);
    presentationData.comparables.forEach((comp: any, idx: number) => {
      const y = 45 + (idx * 30);
      pdf.text(`${idx + 1}. ${comp.address}`, 20, y);
      pdf.text(`Price: $${comp.price.toLocaleString()} | ${comp.bedrooms}BR/${comp.bathrooms}BA | ${comp.sqft} sq ft`, 20, y + 7);
      pdf.text(`Sold: ${comp.soldDate} | ${comp.distance} mi away | $${comp.pricePerSqft.toFixed(2)}/sq ft`, 20, y + 14);
    });
  }
  
  // AI Content
  if (presentationData.aiContent) {
    pdf.addPage();
    pdf.setFontSize(18);
    pdf.text('Property Description', 20, 30);
    pdf.setFontSize(10);
    const lines = pdf.splitTextToSize(presentationData.aiContent.propertyDescription, 170);
    pdf.text(lines, 20, 45);
  }
  
  return pdf.output('blob');
}
```

#### 4. **Interactive Maps** (Medium Priority)
**Recommended:** Mapbox GL JS

**Implementation:**
```typescript
// src/components/PropertyMap.tsx
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export function PropertyMap({ property, comparables }) {
  useEffect(() => {
    mapboxgl.accessToken = process.env.VITE_MAPBOX_TOKEN;
    
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [property.lng, property.lat],
      zoom: 13
    });
    
    // Add subject property marker
    new mapboxgl.Marker({ color: '#FF0000' })
      .setLngLat([property.lng, property.lat])
      .setPopup(new mapboxgl.Popup().setHTML(`
        <h3>${property.address}</h3>
        <p>$${property.estimatedValue.toLocaleString()}</p>
      `))
      .addTo(map);
    
    // Add comparable markers
    comparables.forEach(comp => {
      new mapboxgl.Marker({ color: '#0000FF' })
        .setLngLat([comp.lng, comp.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`
          <h3>${comp.address}</h3>
          <p>$${comp.price.toLocaleString()}</p>
          <p>${comp.distance} mi away</p>
        `))
        .addTo(map);
    });
    
    return () => map.remove();
  }, [property, comparables]);
  
  return <div id="map" style={{ width: '100%', height: '400px' }} />;
}
```

#### 5. **Calculator Integration** (Low Priority)
Connect existing calculator results to presentation builder:

```typescript
// src/services/calculatorImportService.ts
export async function importCalculatorResults(userId: string) {
  // Fetch saved calculator results from localStorage or database
  const savedCalculations = localStorage.getItem('calculator_results');
  
  if (savedCalculations) {
    return JSON.parse(savedCalculations);
  }
  
  return null;
}

// In PresentationBuilderPage
const importCalculatorData = async () => {
  const results = await importCalculatorResults(user.id);
  
  if (results) {
    setCalculatorResults(results);
    
    // Pre-fill property data if available
    if (results.propertyValue) {
      setPropertyData(prev => ({
        ...prev,
        estimatedValue: results.propertyValue,
        loanAmount: results.loanAmount,
        equity: results.equity,
        monthlyPayment: results.monthlyPayment
      }));
    }
    
    toast.success('Calculator data imported!');
  } else {
    toast.error('No saved calculator results found');
  }
};
```

---

## 🔧 Environment Variables Needed

Add to `.env.local`:
```env
# Real Estate Comparables
VITE_ATTOM_API_KEY=your_attom_api_key_here
# or
VITE_ZILLOW_API_KEY=your_zillow_api_key_here

# AI Content Generation
VITE_OPENAI_API_KEY=your_openai_api_key_here
# or
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Maps
VITE_MAPBOX_TOKEN=your_mapbox_token_here
# or
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key_here

# PDF Generation (if using server-side)
PDF_GENERATION_ENDPOINT=https://your-pdf-service.com/generate
```

---

## 📱 User Flow

1. **Land on Presentation Builder**
   - View current tier and usage
   - See tier comparison cards
   - Click "Upgrade Plan" if needed

2. **Step 1: Property Information**
   - Enter property address, details
   - Option to import from calculator
   - Proceed to comparables

3. **Step 2: Market Comparables**
   - Click "Fetch Comparables"
   - View comparable properties
   - See interactive map (Pro+)

4. **Step 3: AI Content** (Pro+ only)
   - Click "Generate AI Content"
   - Review/edit AI-generated descriptions
   - Review marketing letter
   - Review investment analysis
   - Add custom notes

5. **Step 4: Preview**
   - Toggle what to include
   - Preview final presentation
   - Adjust if needed

6. **Step 5: Export & Delivery**
   - Choose export format:
     - **PDF** (all tiers)
     - **PowerPoint** (Pro+)
     - **Email** (all tiers)
     - **Direct Mail** (Pro+)
   - Presentation created
   - Usage count incremented

---

## 🎨 Branding & Customization

### For Premium Tier
Allow white-label branding:
- Upload company logo
- Custom color scheme
- Custom footer text
- Remove RepMotivatedSeller branding

```typescript
interface BrandSettings {
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  companyName: string;
  footerText: string;
  phoneNumber: string;
  email: string;
  website: string;
}
```

---

## 📊 Analytics to Track

Create admin dashboard to view:
- Total presentations created (by tier)
- Most popular export format
- Average presentations per user
- Tier conversion rates
- Direct mail send rates
- User engagement by feature

---

## 🚀 Deployment Checklist

- [x] Create PresentationBuilderPage component
- [x] Deploy database schema
- [x] Add route to App.tsx
- [x] Connect to existing Lob direct mail
- [ ] Integrate comparables API
- [ ] Add AI content generation
- [ ] Implement PDF/PPTX export
- [ ] Add interactive maps
- [ ] Connect calculator import
- [ ] Add Stripe payment for Pro/Premium
- [ ] Create admin analytics dashboard
- [ ] Set up usage limit reset cron job
- [ ] Test all export formats
- [ ] Load testing for concurrent users
- [ ] Mobile responsive testing

---

## 💰 Revenue Potential

**Monthly Projections:**
- 100 users × $29 Pro = $2,900
- 20 users × $99 Premium = $1,980
- **Total: $4,880/month**

**Additional Revenue:**
- Direct mail markups (charge $2-3 per letter, Lob costs $0.80-1.50)
- API overage charges
- Custom branding setup fees
- Enterprise team plans

---

## 🛡️ Security Considerations

1. **Rate Limiting:** Prevent abuse of AI generation and comparables fetching
2. **Data Privacy:** Encrypt property data at rest
3. **RLS Policies:** Ensure users only access own presentations
4. **API Key Security:** Store all API keys in Supabase secrets
5. **File Storage:** Use secure S3 buckets with signed URLs
6. **Input Validation:** Sanitize all property data inputs

---

## 📞 Support & Documentation

**User Documentation Needed:**
1. How to create a presentation (video tutorial)
2. Tier comparison guide
3. Exporting and sharing presentations
4. Direct mail best practices
5. AI content editing tips

**Developer Documentation:**
- API integration guides
- Export generation service
- Database schema documentation
- Tier limit enforcement logic

---

## ✨ Future Enhancements

- **Bulk Upload:** CSV import of multiple properties
- **Templates:** Pre-designed presentation themes
- **Collaboration:** Share presentations with team members
- **CRM Integration:** Sync with HubSpot/Salesforce
- **Mobile App:** iOS/Android presentation builder
- **Video Presentations:** AI-generated video tours
- **Automated Follow-up:** Schedule automatic email sequences
- **Lead Tracking:** Track when recipients view presentations

---

**Status:** Core system deployed and ready for API integrations
**Next Action:** Integrate real estate comparables API (Attom Data recommended)
