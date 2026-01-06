# Service Integration Testing Guide

## Overview
Comprehensive testing suite for all platform services including property data, CRM integration, marketing automation, and analytics.

## Test Execution

### Run All Tests
```bash
npm run test
```

### Run Specific Test Suite
```bash
# Service integration tests only
npm run test src/tests/integration/serviceIntegration.test.ts

# With coverage report
npm run test:coverage
```

### Watch Mode (Development)
```bash
npm run test:watch
```

## Test Structure

### Phase 1: Core Service Integration (30 minutes)
- **1.1 Property Data Services** - FreeAttomAlternative comprehensive testing
- **1.2 Free Property Data Service** - Google Maps, Census, OpenStreetMap
- **1.3 HubSpot Service Integration** - CRM sync and lead management
- **1.4 Free Property Intelligence** - Foreclosure and absentee owner data

### Phase 2: Enhanced Features (45 minutes)
- **2.1 AI Assistant Verification** - Crisis response, 24/7 expertise
- **2.2 Education Platform** - Video learning, progress tracking, certificates
- **2.3 Marketing Automation** - Lob, Canva, Twilio, email workflows
- **2.4 Analytics System** - Dashboards, revenue tracking, AI insights

### Phase 3: End-to-End Flows (30 minutes)
- Lead capture to CRM flow
- Property research to direct mail flow

### Phase 4: Performance & Reliability (15 minutes)
- Response time verification
- Error handling validation
- Concurrent request handling

## Required Environment Variables

Create `.env` file with:
```env
# Supabase (Required)
VITE_SUPABASE_URL=https://ltxqodqlexvojqqxquew.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Google Maps (Optional - 28,500 free requests/month)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key

# HubSpot CRM (Optional)
VITE_HUBSPOT_API_KEY=your_hubspot_key

# Lob Direct Mail (Optional)
VITE_LOB_API_KEY=your_lob_key

# Twilio SMS (Optional)
VITE_TWILIO_API_KEY=your_twilio_key
VITE_TWILIO_PHONE_NUMBER=your_phone_number
```

## Test Results Interpretation

### ✅ Success Indicators
- All service calls complete without errors
- Data returned matches expected structure
- Integration flows work end-to-end
- Response times < 10 seconds

### ⚠️ Warnings (Non-Blocking)
- API keys not configured (services run in test mode)
- Free tier limits approached
- Optional features disabled

### ❌ Failures (Blocking)
- Service completely unavailable
- Data structure mismatches
- Critical errors in core flows
- Response times > 30 seconds

## CI/CD Integration

### GitHub Actions
```yaml
- name: Run Integration Tests
  run: npm run test:ci
  env:
    VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
    VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
```

## Coverage Goals
- **Services:** 80% coverage minimum
- **Components:** 70% coverage minimum
- **Integration Flows:** 90% coverage minimum

## Troubleshooting

### Tests Timeout
- Increase `testTimeout` in vitest.config.ts
- Check network connectivity
- Verify API rate limits

### API Errors
- Confirm environment variables loaded
- Check API key validity
- Verify service endpoints accessible

### False Positives
- Review test expectations
- Check for race conditions
- Verify mock data accuracy

## Next Steps
1. ✅ Run initial test suite
2. ✅ Review test results
3. ⚠️ Configure optional API keys
4. ✅ Integrate with CI/CD pipeline
5. ✅ Set up monitoring alerts
