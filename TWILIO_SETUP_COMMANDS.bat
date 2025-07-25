@echo off
echo ========================================
echo Twilio Configuration for RepMotivatedSeller
echo ========================================
echo.

echo Setting Twilio secrets in Supabase...
echo.

REM Set Twilio test credentials
supabase secrets set TWILIO_ACCOUNT_SID="ACc3e11adc363709f0252ae8d2cf26ae29" --project-ref ltxqodqlexvojqqxquew
supabase secrets set TWILIO_AUTH_TOKEN="6790cfda5da60398e750734f5b788c6c" --project-ref ltxqodqlexvojqqxquew

REM Set phone numbers (using test number for now)
supabase secrets set TWILIO_PHONE_NUMBER="+15005550006" --project-ref ltxqodqlexvojqqxquew
supabase secrets set AGENT_PHONE_NUMBER="+18778064677" --project-ref ltxqodqlexvojqqxquew
supabase secrets set SCHEDULING_PHONE_NUMBER="+18778064677" --project-ref ltxqodqlexvojqqxquew

REM Set OpenAI configuration
supabase secrets set OPENAI_API_KEY="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" --project-ref ltxqodqlexvojqqxquew
supabase secrets set OPENAI_MODEL="gpt-3.5-turbo" --project-ref ltxqodqlexvojqqxquew

echo.
echo ========================================
echo Twilio secrets configured successfully!
echo ========================================
echo.
echo Test credentials set:
echo Account SID: ACc3e11adc363709f0252ae8d2cf26ae29
echo Auth Token: 6790cfda5da60398e750734f5b788c6c
echo.
echo Correct webhook URL:
echo https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/ai-voice-handler
echo.
echo Next steps:
echo 1. Purchase a Twilio phone number
echo 2. Configure webhook URL in Twilio Console
echo 3. Test the AI voice handler
echo.
pause