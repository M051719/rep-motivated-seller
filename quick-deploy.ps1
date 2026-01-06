# ⚡ QUICK DEPLOY - Run These Commands
# Copy and paste into PowerShell to deploy RepMotivatedSeller

Write-Host "🚀 RepMotivatedSeller - Quick Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to project
cd "c:\Users\monte\Documents\cert api token keys ids\supabase project deployment\rep-motivated-seller"

Write-Host "📍 Current directory:" -ForegroundColor Green
Get-Location

Write-Host ""
Write-Host "Step 1: Link to Supabase Production" -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Yellow
supabase link --project-ref ltxqodqlexvojqqxquew

Write-Host ""
Write-Host "Step 2: Deploy Database Migrations" -ForegroundColor Yellow
Write-Host "----------------------------------" -ForegroundColor Yellow
supabase db push --linked

Write-Host ""
Write-Host "Step 3: Deploy Edge Functions" -ForegroundColor Yellow
Write-Host "-----------------------------" -ForegroundColor Yellow
supabase functions deploy --linked

Write-Host ""
Write-Host "✅ Backend Deployed!" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Frontend build is ready at:" -ForegroundColor Cyan
Write-Host "   $PWD\dist" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Upload dist/ folder to Cloudflare Pages / Vercel / Netlify"
Write-Host "2. Configure webhooks:"
Write-Host "   Twilio Voice: https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/ai-voice-handler"
Write-Host "   Twilio SMS:   https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/sms-handler"
Write-Host "   Stripe:       https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/stripe-webhook"
Write-Host ""
Write-Host "📖 Full deployment guide: DEPLOYMENT_SUCCESS.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 You're almost there!" -ForegroundColor Green
