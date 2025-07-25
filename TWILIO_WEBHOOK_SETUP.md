# 📞 TWILIO WEBHOOK SETUP GUIDE
## Configure AI Voice Handler for RepMotivatedSeller

### ✅ **CORRECT WEBHOOK URL**
```
https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/ai-voice-handler
```

### 🔧 **SETUP STEPS**

#### 1. **Set Twilio Secrets** (1 minute)
```bash
# Run the setup script
TWILIO_SETUP_COMMANDS.bat
```

#### 2. **Configure Twilio Console** (2 minutes)

1. **Login to Twilio Console**
   - Go to: https://console.twilio.com
   - Login with your account

2. **Purchase Phone Number** (if not done)
   - Navigate to: Phone Numbers → Manage → Buy a number
   - Choose a number with Voice capabilities
   - Complete purchase

3. **Configure Webhook**
   - Go to: Phone Numbers → Manage → Active numbers
   - Click on your phone number
   - In the "Voice Configuration" section:
     - **Webhook URL**: `https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/ai-voice-handler`
     - **HTTP Method**: `POST`
     - **Fallback URL**: `https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/ai-voice-handler`
   - Click "Save Configuration"

### 🧪 **TEST CONFIGURATION**

#### **Test Credentials Set**
- **Account SID**: `ACc3e11adc363709f0252ae8d2cf26ae29`
- **Auth Token**: `6790cfda5da60398e750734f5b788c6c`
- **Test Phone**: `+15005550006` (Twilio test number)

#### **Test the Setup**
1. **Call your Twilio number**
2. **Expected behavior**:
   - AI greeting plays
   - Speech recognition active
   - Conversation flows naturally
   - Call data logged in admin dashboard

#### **Verify Function Response**
```bash
# Test the webhook endpoint
curl -X POST "https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/ai-voice-handler" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "From=%2B15551234567&To=%2B15005550006&CallSid=test123"
```

### 🔍 **TROUBLESHOOTING**

#### **Common Issues**

1. **Webhook URL Error**
   - ❌ Wrong: `https://ltxqodqlexvojqqxquew.functions.supabase.co/ai-voice-handler`
   - ✅ Correct: `https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/ai-voice-handler`

2. **Function Not Responding**
   - Check Supabase function logs
   - Verify secrets are set correctly
   - Ensure OpenAI API key is valid

3. **Audio Issues**
   - Check Twilio phone number configuration
   - Verify webhook HTTP method is POST
   - Test with different phone numbers

#### **Debug Commands**
```bash
# Check if secrets are set
supabase secrets list --project-ref ltxqodqlexvojqqxquew

# View function logs
supabase functions logs ai-voice-handler --project-ref ltxqodqlexvojqqxquew

# Test function directly
curl -X POST "https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/ai-voice-handler"
```

### 📊 **MONITORING**

#### **Check Call Analytics**
- **Admin Dashboard**: Monitor calls in real-time
- **Supabase Logs**: View function execution logs
- **Twilio Console**: Check call logs and recordings

#### **Performance Metrics**
- Call completion rate
- AI response accuracy
- Average call duration
- User satisfaction scores

### 🎯 **PRODUCTION READY**

Once configured, your AI voice handler will:
- ✅ Answer calls automatically
- ✅ Provide foreclosure assistance information
- ✅ Collect caller information
- ✅ Transfer to human agents when needed
- ✅ Log all interactions for follow-up

**🎉 Your AI-powered foreclosure assistance hotline is ready to help homeowners! 📞**