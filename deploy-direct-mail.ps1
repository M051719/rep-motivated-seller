# Direct Mail System - Quick Deploy Script
# Run this in PowerShell from the project root directory

Write-Host "`n╔══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         📬 DIRECT MAIL SYSTEM - DEPLOYMENT WIZARD         ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$projectPath = "C:\Users\monte\Documents\cert api token keys ids\supabase project deployment\rep-motivated-seller"
$projectRef = "ltxqodqlexvojqqxquew"

Write-Host "🎯 Project: rep-motivated-seller" -ForegroundColor Green
Write-Host "📍 Location: $projectPath`n" -ForegroundColor Green

# Check if in correct directory
if (!(Test-Path "$projectPath\supabase")) {
    Write-Host "❌ Error: Not in project directory!" -ForegroundColor Red
    Write-Host "📂 Please run this script from: $projectPath" -ForegroundColor Yellow
    exit 1
}

Set-Location $projectPath

# Step 1: Check Supabase CLI
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "STEP 1: Checking Supabase CLI..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

try {
    $supabaseVersion = supabase --version 2>&1
    Write-Host "✅ Supabase CLI installed: $supabaseVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Supabase CLI not found!" -ForegroundColor Red
    Write-Host "📥 Install from: https://supabase.com/docs/guides/cli/getting-started" -ForegroundColor Yellow
    exit 1
}

# Step 2: Deploy Database Migration
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "STEP 2: Deploying Database Migration..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

$migrationFile = "supabase\migrations\20251210124144_create_direct_mail_and_legal_tables.sql"

if (Test-Path $migrationFile) {
    Write-Host "📄 Migration file found: $migrationFile" -ForegroundColor Green
    Write-Host "⚠️  This will create the following tables:" -ForegroundColor Yellow
    Write-Host "   • direct_mail_campaigns" -ForegroundColor White
    Write-Host "   • legal_notice_acceptances" -ForegroundColor White
    Write-Host ""
    
    $deploy = Read-Host "Deploy database migration? (Y/N)"
    if ($deploy -eq 'Y' -or $deploy -eq 'y') {
        Write-Host "🚀 Deploying migration..." -ForegroundColor Cyan
        
        # Show the SQL commands
        Write-Host "`n📋 SQL Preview:" -ForegroundColor Cyan
        Get-Content $migrationFile | Select-Object -First 10
        Write-Host "..." -ForegroundColor Gray
        
        Write-Host "`n⚡ Running: supabase db push --linked" -ForegroundColor Cyan
        supabase db push --linked
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Database migration deployed successfully!`n" -ForegroundColor Green
        }
        else {
            Write-Host "❌ Migration failed! Check error above.`n" -ForegroundColor Red
            Write-Host "💡 Alternative: Run SQL manually in Supabase Dashboard" -ForegroundColor Yellow
            Write-Host "   1. Open: https://supabase.com/dashboard/project/$projectRef/sql" -ForegroundColor Yellow
            Write-Host "   2. Copy contents of: $migrationFile" -ForegroundColor Yellow
            Write-Host "   3. Paste and click 'Run'`n" -ForegroundColor Yellow
        }
    }
    else {
        Write-Host "⏭️  Skipped database migration`n" -ForegroundColor Yellow
    }
}
else {
    Write-Host "❌ Migration file not found: $migrationFile`n" -ForegroundColor Red
}

# Step 3: Configure Lob API Key
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "STEP 3: Configure Lob API Key..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

Write-Host "📬 Lob.com provides direct mail API service" -ForegroundColor Cyan
Write-Host "💵 Free tier: 300 pieces/month, then `$0.50/postcard`n" -ForegroundColor Cyan

$hasLobKey = Read-Host "Do you have a Lob API key? (Y/N)"

if ($hasLobKey -eq 'Y' -or $hasLobKey -eq 'y') {
    $lobApiKey = Read-Host "Enter your Lob API key (starts with live_ or test_)"
    
    if ($lobApiKey -match '^(live|test)_') {
        Write-Host "`n🔐 Setting Supabase secret..." -ForegroundColor Cyan
        supabase secrets set LOB_API_KEY=$lobApiKey
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Lob API key configured in Supabase!`n" -ForegroundColor Green
            
            # Add to .env.local
            $envFile = ".env.local"
            Write-Host "📝 Adding to $envFile..." -ForegroundColor Cyan
            
            if (Test-Path $envFile) {
                $content = Get-Content $envFile -Raw
                if ($content -notmatch 'VITE_LOB_API_KEY') {
                    Add-Content $envFile "`nVITE_LOB_API_KEY=$lobApiKey"
                    Write-Host "✅ Added VITE_LOB_API_KEY to $envFile`n" -ForegroundColor Green
                }
                else {
                    Write-Host "ℹ️  VITE_LOB_API_KEY already exists in $envFile`n" -ForegroundColor Yellow
                }
            }
            else {
                "VITE_LOB_API_KEY=$lobApiKey" | Out-File $envFile -Encoding UTF8
                Write-Host "✅ Created $envFile with VITE_LOB_API_KEY`n" -ForegroundColor Green
            }
        }
        else {
            Write-Host "❌ Failed to set Supabase secret`n" -ForegroundColor Red
        }
    }
    else {
        Write-Host "❌ Invalid API key format. Should start with 'live_' or 'test_'`n" -ForegroundColor Red
    }
}
else {
    Write-Host "`n📥 To get a Lob API key:" -ForegroundColor Yellow
    Write-Host "   1. Visit: https://dashboard.lob.com" -ForegroundColor White
    Write-Host "   2. Sign up (free 300 pieces/month)" -ForegroundColor White
    Write-Host "   3. Go to: Settings → API Keys" -ForegroundColor White
    Write-Host "   4. Copy 'Live Secret Key'" -ForegroundColor White
    Write-Host "   5. Re-run this script`n" -ForegroundColor White
    Write-Host "⏭️  Skipped Lob API configuration`n" -ForegroundColor Yellow
}

# Step 4: Deploy Edge Function
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "STEP 4: Deploy Edge Function..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

$functionPath = "supabase\functions\direct-mail-sender"

if (Test-Path $functionPath) {
    Write-Host "📁 Function found: $functionPath" -ForegroundColor Green
    $deployFunction = Read-Host "Deploy direct-mail-sender function? (Y/N)"
    
    if ($deployFunction -eq 'Y' -or $deployFunction -eq 'y') {
        Write-Host "`n🚀 Deploying function..." -ForegroundColor Cyan
        Write-Host "⚡ Running: supabase functions deploy direct-mail-sender`n" -ForegroundColor Cyan
        
        supabase functions deploy direct-mail-sender
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n✅ Edge function deployed successfully!" -ForegroundColor Green
            Write-Host "🌐 Function URL: https://$projectRef.supabase.co/functions/v1/direct-mail-sender`n" -ForegroundColor Cyan
        }
        else {
            Write-Host "`n❌ Function deployment failed! Check error above.`n" -ForegroundColor Red
        }
    }
    else {
        Write-Host "⏭️  Skipped function deployment`n" -ForegroundColor Yellow
    }
}
else {
    Write-Host "❌ Function directory not found: $functionPath`n" -ForegroundColor Red
}

# Step 5: Verification
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "STEP 5: System Verification..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

Write-Host "📋 Checking deployment status...`n" -ForegroundColor Cyan

# Check if components exist
$checks = @(
    @{Name = "DirectMailPage.tsx"; Path = "src\pages\DirectMailPage.tsx" },
    @{Name = "EnhancedDirectMail.tsx"; Path = "src\components\marketing\EnhancedDirectMail.tsx" },
    @{Name = "MailCampaignManager.tsx"; Path = "src\components\marketing\direct-mail\MailCampaignManager.tsx" },
    @{Name = "LobService.ts"; Path = "src\services\mail\LobService.ts" },
    @{Name = "direct-mail-sender"; Path = "supabase\functions\direct-mail-sender\index.ts" },
    @{Name = "CanvaUploader.tsx"; Path = "src\components\marketing\direct-mail\CanvaUploader.tsx" }
)

$allGood = $true
foreach ($check in $checks) {
    if (Test-Path $check.Path) {
        Write-Host "✅ $($check.Name)" -ForegroundColor Green
    }
    else {
        Write-Host "❌ $($check.Name) - NOT FOUND" -ForegroundColor Red
        $allGood = $false
    }
}

Write-Host ""

if ($allGood) {
    Write-Host "╔══════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║              🎉 DEPLOYMENT COMPLETE! 🎉                    ║" -ForegroundColor Green
    Write-Host "╚══════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green
    
    Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Start dev server: npm run dev" -ForegroundColor White
    Write-Host "   2. Navigate to: http://localhost:5173/direct-mail" -ForegroundColor White
    Write-Host "   3. Send a test postcard" -ForegroundColor White
    Write-Host "   4. Check Lob dashboard for delivery tracking`n" -ForegroundColor White
    
    Write-Host "📚 Documentation:" -ForegroundColor Cyan
    Write-Host "   • Full analysis: DIRECT_MAIL_SYSTEM_ANALYSIS.md" -ForegroundColor White
    Write-Host "   • Lob Dashboard: https://dashboard.lob.com" -ForegroundColor White
    Write-Host "   • Supabase Dashboard: https://supabase.com/dashboard/project/$projectRef`n" -ForegroundColor White
    
    Write-Host "💡 Tips:" -ForegroundColor Yellow
    Write-Host "   • Use test API key for development (starts with test_)" -ForegroundColor White
    Write-Host "   • Switch to live key (starts with live_) for production" -ForegroundColor White
    Write-Host "   • Monitor costs: Free tier = 300 pieces/month, then `$0.50/piece`n" -ForegroundColor White
}
else {
    Write-Host "⚠️  Some components are missing. Check errors above.`n" -ForegroundColor Yellow
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "For detailed documentation, see: DIRECT_MAIL_SYSTEM_ANALYSIS.md" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray
# Direct Mail System - Quick Deploy Script
# Run this in PowerShell from the project root directory

Write-Host "`n╔══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         📬 DIRECT MAIL SYSTEM - DEPLOYMENT WIZARD         ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$projectPath = "C:\Users\monte\Documents\cert api token keys ids\supabase project deployment\rep-motivated-seller"
$projectRef = "ltxqodqlexvojqqxquew"

Write-Host "🎯 Project: rep-motivated-seller" -ForegroundColor Green
Write-Host "📍 Location: $projectPath`n" -ForegroundColor Green

# Check if in correct directory
if (!(Test-Path "$projectPath\supabase")) {
    Write-Host "❌ Error: Not in project directory!" -ForegroundColor Red
    Write-Host "📂 Please run this script from: $projectPath" -ForegroundColor Yellow
    exit 1
}

Set-Location $projectPath

# Step 1: Check Supabase CLI
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "STEP 1: Checking Supabase CLI..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

try {
    $supabaseVersion = supabase --version 2>&1
    Write-Host "✅ Supabase CLI installed: $supabaseVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Supabase CLI not found!" -ForegroundColor Red
    Write-Host "📥 Install from: https://supabase.com/docs/guides/cli/getting-started" -ForegroundColor Yellow
    exit 1
}

# Step 2: Deploy Database Migration
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "STEP 2: Deploying Database Migration..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

$migrationFile = "supabase\migrations\20251210124144_create_direct_mail_and_legal_tables.sql"

if (Test-Path $migrationFile) {
    Write-Host "📄 Migration file found: $migrationFile" -ForegroundColor Green
    Write-Host "⚠️  This will create the following tables:" -ForegroundColor Yellow
    Write-Host "   • direct_mail_campaigns" -ForegroundColor White
    Write-Host "   • legal_notice_acceptances" -ForegroundColor White
    Write-Host ""
    
    $deploy = Read-Host "Deploy database migration? (Y/N)"
    if ($deploy -eq 'Y' -or $deploy -eq 'y') {
        Write-Host "🚀 Deploying migration..." -ForegroundColor Cyan
        
        # Show the SQL commands
        Write-Host "`n📋 SQL Preview:" -ForegroundColor Cyan
        Get-Content $migrationFile | Select-Object -First 10
        Write-Host "..." -ForegroundColor Gray
        
        Write-Host "`n⚡ Running: supabase db push --project-ref $projectRef" -ForegroundColor Cyan
        supabase db push --project-ref $projectRef
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Database migration deployed successfully!`n" -ForegroundColor Green
        }
        else {
            Write-Host "❌ Migration failed! Check error above.`n" -ForegroundColor Red
            Write-Host "💡 Alternative: Run SQL manually in Supabase Dashboard" -ForegroundColor Yellow
            Write-Host "   1. Open: https://supabase.com/dashboard/project/$projectRef/sql" -ForegroundColor Yellow
            Write-Host "   2. Copy contents of: $migrationFile" -ForegroundColor Yellow
            Write-Host "   3. Paste and click 'Run'`n" -ForegroundColor Yellow
        }
    }
    else {
        Write-Host "⏭️  Skipped database migration`n" -ForegroundColor Yellow
    }
}
else {
    Write-Host "❌ Migration file not found: $migrationFile`n" -ForegroundColor Red
}

# Step 3: Configure Lob API Key
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "STEP 3: Configure Lob API Key..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

Write-Host "📬 Lob.com provides direct mail API service" -ForegroundColor Cyan
Write-Host "💵 Free tier: 300 pieces/month, then `$0.50/postcard`n" -ForegroundColor Cyan

$hasLobKey = Read-Host "Do you have a Lob API key? (Y/N)"

if ($hasLobKey -eq 'Y' -or $hasLobKey -eq 'y') {
    $lobApiKey = Read-Host "Enter your Lob API key (starts with live_ or test_)"
    
    if ($lobApiKey -match '^(live|test)_') {
        Write-Host "`n🔐 Setting Supabase secret..." -ForegroundColor Cyan
        supabase secrets set LOB_API_KEY=$lobApiKey --project-ref $projectRef
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Lob API key configured in Supabase!`n" -ForegroundColor Green
            
            # Add to .env.local
            $envFile = ".env.local"
            Write-Host "📝 Adding to $envFile..." -ForegroundColor Cyan
            
            if (Test-Path $envFile) {
                $content = Get-Content $envFile -Raw
                if ($content -notmatch 'VITE_LOB_API_KEY') {
                    Add-Content $envFile "`nVITE_LOB_API_KEY=$lobApiKey"
                    Write-Host "✅ Added VITE_LOB_API_KEY to $envFile`n" -ForegroundColor Green
                }
                else {
                    Write-Host "ℹ️  VITE_LOB_API_KEY already exists in $envFile`n" -ForegroundColor Yellow
                }
            }
            else {
                "VITE_LOB_API_KEY=$lobApiKey" | Out-File $envFile -Encoding UTF8
                Write-Host "✅ Created $envFile with VITE_LOB_API_KEY`n" -ForegroundColor Green
            }
        }
        else {
            Write-Host "❌ Failed to set Supabase secret`n" -ForegroundColor Red
        }
    }
    else {
        Write-Host "❌ Invalid API key format. Should start with 'live_' or 'test_'`n" -ForegroundColor Red
    }
}
else {
    Write-Host "`n📥 To get a Lob API key:" -ForegroundColor Yellow
    Write-Host "   1. Visit: https://dashboard.lob.com" -ForegroundColor White
    Write-Host "   2. Sign up (free 300 pieces/month)" -ForegroundColor White
    Write-Host "   3. Go to: Settings → API Keys" -ForegroundColor White
    Write-Host "   4. Copy 'Live Secret Key'" -ForegroundColor White
    Write-Host "   5. Re-run this script`n" -ForegroundColor White
    Write-Host "⏭️  Skipped Lob API configuration`n" -ForegroundColor Yellow
}

# Step 4: Deploy Edge Function
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "STEP 4: Deploy Edge Function..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

$functionPath = "supabase\functions\direct-mail-sender"

if (Test-Path $functionPath) {
    Write-Host "📁 Function found: $functionPath" -ForegroundColor Green
    $deployFunction = Read-Host "Deploy direct-mail-sender function? (Y/N)"
    
    if ($deployFunction -eq 'Y' -or $deployFunction -eq 'y') {
        Write-Host "`n🚀 Deploying function..." -ForegroundColor Cyan
        Write-Host "⚡ Running: supabase functions deploy direct-mail-sender --project-ref $projectRef`n" -ForegroundColor Cyan
        
        supabase functions deploy direct-mail-sender --project-ref $projectRef
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n✅ Edge function deployed successfully!" -ForegroundColor Green
            Write-Host "🌐 Function URL: https://$projectRef.supabase.co/functions/v1/direct-mail-sender`n" -ForegroundColor Cyan
        }
        else {
            Write-Host "`n❌ Function deployment failed! Check error above.`n" -ForegroundColor Red
        }
    }
    else {
        Write-Host "⏭️  Skipped function deployment`n" -ForegroundColor Yellow
    }
}
else {
    Write-Host "❌ Function directory not found: $functionPath`n" -ForegroundColor Red
}

# Step 5: Verification
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "STEP 5: System Verification..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

Write-Host "📋 Checking deployment status...`n" -ForegroundColor Cyan

# Check if components exist
$checks = @(
    @{Name = "DirectMailPage.tsx"; Path = "src\pages\DirectMailPage.tsx" },
    @{Name = "EnhancedDirectMail.tsx"; Path = "src\components\marketing\EnhancedDirectMail.tsx" },
    @{Name = "MailCampaignManager.tsx"; Path = "src\components\marketing\direct-mail\MailCampaignManager.tsx" },
    @{Name = "LobService.ts"; Path = "src\services\mail\LobService.ts" },
    @{Name = "direct-mail-sender"; Path = "supabase\functions\direct-mail-sender\index.ts" },
    @{Name = "CanvaUploader.tsx"; Path = "src\components\marketing\direct-mail\CanvaUploader.tsx" }
)

$allGood = $true
foreach ($check in $checks) {
    if (Test-Path $check.Path) {
        Write-Host "✅ $($check.Name)" -ForegroundColor Green
    }
    else {
        Write-Host "❌ $($check.Name) - NOT FOUND" -ForegroundColor Red
        $allGood = $false
    }
}

Write-Host ""

if ($allGood) {
    Write-Host "╔══════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║              🎉 DEPLOYMENT COMPLETE! 🎉                    ║" -ForegroundColor Green
    Write-Host "╚══════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green
    
    Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Start dev server: npm run dev" -ForegroundColor White
    Write-Host "   2. Navigate to: http://localhost:5173/direct-mail" -ForegroundColor White
    Write-Host "   3. Send a test postcard" -ForegroundColor White
    Write-Host "   4. Check Lob dashboard for delivery tracking`n" -ForegroundColor White
    
    Write-Host "📚 Documentation:" -ForegroundColor Cyan
    Write-Host "   • Full analysis: DIRECT_MAIL_SYSTEM_ANALYSIS.md" -ForegroundColor White
    Write-Host "   • Lob Dashboard: https://dashboard.lob.com" -ForegroundColor White
    Write-Host "   • Supabase Dashboard: https://supabase.com/dashboard/project/$projectRef`n" -ForegroundColor White
    
    Write-Host "💡 Tips:" -ForegroundColor Yellow
    Write-Host "   • Use test API key for development (starts with test_)" -ForegroundColor White
    Write-Host "   • Switch to live key (starts with live_) for production" -ForegroundColor White
    Write-Host "   • Monitor costs: Free tier = 300 pieces/month, then `$0.50/piece`n" -ForegroundColor White
    
}
else {
    Write-Host "⚠️  Some components are missing. Check errors above.`n" -ForegroundColor Yellow
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "For detailed documentation, see: DIRECT_MAIL_SYSTEM_ANALYSIS.md" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray
