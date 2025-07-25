# 🧪 QUICK TEST GUIDE
## Verify Your Live RepMotivatedSeller Platform

### ⚡ **IMMEDIATE TESTING STEPS**

#### 1. **Test Edge Functions** (2 minutes)

```bash
# Test authentication function
curl -X POST "https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/auth-test" \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Test email notification
curl -X POST "https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/send-notification-email" \
  -H "Content-Type: application/json" \
  -d '{"type":"test","submission":{"email":"test@example.com","name":"Test User"}}'
```

#### 2. **Test Admin Dashboard API** (1 minute)

```bash
# Test dashboard stats (requires JWT token)
curl -X GET "https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/admin-dashboard/stats" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 3. **Test Frontend** (1 minute)

1. Deploy frontend: `scripts\windows-deploy.bat`
2. Visit: `https://repmotivatedseller.shoprealestatespace.org`
3. Test form submission
4. Check admin dashboard: `https://repmotivatedseller.shoprealestatespace.org/admin-dashboard.html`

### 🎯 **EXPECTED RESULTS**

#### **Edge Functions**
- ✅ All functions return HTTP 200 responses
- ✅ No CORS errors
- ✅ Proper JSON responses

#### **Email System**
- ✅ Test emails sent successfully
- ✅ MailerLite integration working
- ✅ Admin notifications received

#### **Admin Dashboard**
- ✅ Authentication working
- ✅ Data loading correctly
- ✅ All features functional

### 🚨 **IF ISSUES OCCUR**

#### **Function Errors**
- Check Supabase logs: https://supabase.com/dashboard/project/ltxqodqlexvojqqxquew/functions
- Verify secrets are set correctly
- Ensure JWT tokens are valid

#### **Email Issues**
- Verify MailerLite API key
- Check sender email verification
- Monitor MailerLite dashboard

#### **Frontend Issues**
- Check Nginx configuration
- Verify SSL certificate
- Test with static HTML version

### ✅ **SUCCESS CONFIRMATION**

Your platform is working correctly when:
- All Edge Functions respond without errors
- Email notifications are sent and received
- Admin dashboard loads and functions properly
- Form submissions create database records
- No console errors in browser

**🎉 Congratulations! Your RepMotivatedSeller platform is live and ready to help homeowners! 🏠**