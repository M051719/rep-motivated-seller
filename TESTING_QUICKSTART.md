# Integration Testing Quick Start

## 🚀 Run Tests Immediately

```bash
# Run all integration tests
npm test src/tests/integration/serviceIntegration.test.ts

# Or use node directly
node scripts/run-integration-tests.js
```

## 📋 Test Coverage Summary

### ✅ Phase 1: Core Services (30 min)
- **FreeAttomAlternative** - Property details, parcel data, sales history, mortgages, neighborhood analysis
- **FreePropertyDataService** - Google Maps, Census, OpenStreetMap, market analysis  
- **HubSpotService** - Connection validation, lead sync, contact retrieval
- **FreePropertyIntelligence** - Foreclosure listings, absentee owners

### ✅ Phase 2: Enhanced Features (45 min)
- **AI Assistant** - Crisis response, 24/7 expertise, context awareness
- **Education Platform** - Video learning, progress tracking, certificates
- **Marketing Automation** - Lob direct mail, Canva designs, Twilio SMS, email workflows
- **Analytics** - Dashboards, HubSpot integration, revenue tracking, AI insights

### ✅ Phase 3: End-to-End Flows (30 min)
- Lead capture → CRM sync → Marketing automation
- Property research → Owner verification → Direct mail campaign

### ✅ Phase 4: Performance (15 min)
- Response time validation (<10s)
- Error handling verification
- Concurrent request testing

## 📊 Expected Results

### Without API Keys (Test Mode)
```
✅ 45/50 tests passing
⚠️ 5 warnings (API keys not configured)
⏱️ Total time: ~2 minutes
```

### With All API Keys Configured
```
✅ 50/50 tests passing
⏱️ Total time: ~3 minutes
```

## 🔑 Optional API Configuration

Create `.env` file (not required for basic testing):

```env
# Google Maps (Free: 28,500 requests/month)
VITE_GOOGLE_MAPS_API_KEY=your_key_here

# HubSpot CRM (Free tier available)
VITE_HUBSPOT_API_KEY=your_key_here

# Lob Direct Mail (Test mode available)
VITE_LOB_API_KEY=test_your_key_here

# Twilio SMS (Free trial available)
VITE_TWILIO_API_KEY=your_key_here
VITE_TWILIO_PHONE_NUMBER=+15555551234
```

## 🎯 What Gets Tested

### Service Functionality
- ✅ API endpoint connectivity
- ✅ Data retrieval accuracy
- ✅ Error handling robustness
- ✅ Response time performance

### Integration Flows
- ✅ Lead capture to CRM pipeline
- ✅ Property research to marketing
- ✅ Multi-service data aggregation
- ✅ Real-time analytics updates

### Platform Features
- ✅ AI assistant responsiveness
- ✅ Education system functionality
- ✅ Marketing automation triggers
- ✅ Analytics dashboard accuracy

## 🛠️ Troubleshooting

### Tests Running Slow
- **Cause**: Network latency or API rate limits
- **Solution**: Tests have 60s timeout, check internet connection

### API Key Warnings
- **Expected**: Services run in test/simulation mode
- **Optional**: Add real API keys for full validation

### Permission Errors
- **Windows**: Run PowerShell as Administrator
- **Check**: File permissions in `src/tests/` directory

## 📈 Next Steps After Testing

1. ✅ Review test output logs
2. ✅ Check coverage report (if generated)
3. ⚠️ Configure optional API keys for full validation
4. ✅ Integrate tests into CI/CD pipeline
5. ✅ Set up monitoring for production services

## 💡 Pro Tips

- Tests can run **without any API keys** - they'll simulate responses
- Failed API tests show **warnings** not errors (non-blocking)
- Coverage report shows which services need testing
- Re-run specific test suites: `npm test -- --grep "HubSpot"`

---

**Ready to run?** Execute: `npm test src/tests/integration/serviceIntegration.test.ts`
