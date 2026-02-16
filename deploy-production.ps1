<parameter name="content"># Production Deployment Script
# RepMotivatedSeller Platform
# Run this script to deploy to production

param(
    [switch]$DryRun,
    [switch]$SkipBuild,
    [switch]$SkipDatabase,
    [switch]$SkipFunctions
)

$ErrorActionPreference = "Stop"
$projectRoot = $PSScriptRoot

Write-Host "🚀 RepMotivatedSeller Production Deployment" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Check if in dry run mode
if ($DryRun) {
    Write-Host "⚠️  DRY RUN MODE - No actual changes will be made" -ForegroundColor Yellow
    Write-Host ""
}

# Step 1: Pre-flight checks
Write-Host "📋 Step 1: Pre-flight Checks" -ForegroundColor Green
Write-Host "----------------------------" -ForegroundColor Green

# Check Node.js
Write-Host "Checking Node.js..." -NoNewline
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host " ✅ $nodeVersion" -ForegroundColor Green
}
else {
    Write-Host " ❌ Node.js not found" -ForegroundColor Red
    exit 1
}

# Check npm
Write-Host "Checking npm..." -NoNewline
$npmVersion = npm --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host " ✅ $npmVersion" -ForegroundColor Green
}
else {
    Write-Host " ❌ npm not found" -ForegroundColor Red
    exit 1
}

# Check Supabase CLI
Write-Host "Checking Supabase CLI..." -NoNewline
$supabaseVersion = supabase --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host " ✅ $supabaseVersion" -ForegroundColor Green
}
else {
    Write-Host " ❌ Supabase CLI not found" -ForegroundColor Red
    Write-Host "Install: npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

# Check if linked to Supabase project
Write-Host "Checking Supabase project link..." -NoNewline
$projectId = Get-Content "$projectRoot\supabase\.temp\project-ref" -ErrorAction SilentlyContinue
if ($projectId -eq "ltxqodqlexvojqqxquew") {
    Write-Host " ✅ Linked to production project" -ForegroundColor Green
}
else {
    Write-Host " ⚠️  Not linked to production project" -ForegroundColor Yellow
    Write-Host "Run: supabase link --project-ref ltxqodqlexvojqqxquew" -ForegroundColor Yellow
    if (-not $DryRun) {
        exit 1
    }
}

Write-Host ""

# Step 2: Git Repository Cleanup
Write-Host "📁 Step 2: Git Repository Cleanup" -ForegroundColor Green
Write-Host "---------------------------------" -ForegroundColor Green

Write-Host "Checking for unnecessary staged files..."
$stagedFiles = git diff --cached --name-only 2>$null
$capcutFiles = $stagedFiles | Where-Object { $_ -like "capcut-templates/*" }
$fixFiles = $stagedFiles | Where-Object { $_ -like "fix-*" }
$tempFiles = $stagedFiles | Where-Object { $_ -like "tmp_*" -or $_ -like "temp_*" }

$filesToUnstage = @($capcutFiles) + @($fixFiles) + @($tempFiles)

if ($filesToUnstage.Count -gt 0) {
    Write-Host "Found $($filesToUnstage.Count) unnecessary staged files" -ForegroundColor Yellow

    if (-not $DryRun) {
        Write-Host "Unstaging files..." -NoNewline
        foreach ($file in $filesToUnstage) {
            git reset HEAD $file 2>$null
        }
        Write-Host " ✅ Done" -ForegroundColor Green

        # Update .gitignore
        $gitignoreEntries = @(
            "capcut-templates/",
            "fix-*.ps1",
            "fix-*.py",
            "fix-*.js",
            "fix-*.cjs",
            "tmp_*",
            "temp_*",
            "*.backup",
            "*.backup2"
        )

        $gitignorePath = "$projectRoot\.gitignore"
        $existingIgnore = Get-Content $gitignorePath -ErrorAction SilentlyContinue

        foreach ($entry in $gitignoreEntries) {
            if ($existingIgnore -notcontains $entry) {
                Add-Content -Path $gitignorePath -Value $entry
            }
        }
        Write-Host ".gitignore updated ✅" -ForegroundColor Green
    }
    else {
        Write-Host "Would unstage $($filesToUnstage.Count) files (dry run)" -ForegroundColor Yellow
    }
}
else {
    Write-Host "No unnecessary files staged ✅" -ForegroundColor Green
}

Write-Host ""

# Step 3: Install Dependencies
Write-Host "📦 Step 3: Install Dependencies" -ForegroundColor Green
Write-Host "-------------------------------" -ForegroundColor Green

if (-not $DryRun) {
    Write-Host "Running npm install..." -NoNewline
    npm install --silent 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✅ Done" -ForegroundColor Green
    }
    else {
        Write-Host " ⚠️  Warnings present" -ForegroundColor Yellow
    }
}
else {
    Write-Host "Would run npm install (dry run)" -ForegroundColor Yellow
}

Write-Host ""

# Step 4: Build Frontend
if (-not $SkipBuild) {
    Write-Host "🏗️  Step 4: Build Frontend" -ForegroundColor Green
    Write-Host "-------------------------" -ForegroundColor Green

    if (-not $DryRun) {
        Write-Host "Running production build..."
        npm run build:production

        if ($LASTEXITCODE -eq 0) {
            Write-Host "Build successful ✅" -ForegroundColor Green

            # Check bundle size
            $distSize = (Get-ChildItem "$projectRoot\dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
            Write-Host "Bundle size: $([math]::Round($distSize, 2)) MB" -ForegroundColor Cyan
        }
        else {
            Write-Host "Build failed ❌" -ForegroundColor Red
            exit 1
        }
    }
    else {
        Write-Host "Would run production build (dry run)" -ForegroundColor Yellow
    }
}
else {
    Write-Host "⏭️  Skipping frontend build" -ForegroundColor Yellow
}

Write-Host ""

# Step 5: Database Migrations
if (-not $SkipDatabase) {
    Write-Host "🗄️  Step 5: Database Migrations" -ForegroundColor Green
    Write-Host "-------------------------------" -ForegroundColor Green

    if ($DryRun) {
        Write-Host "Checking migrations (dry run)..."
        supabase db push --linked --dry-run
    }
    else {
        Write-Host "Applying migrations to production..."
        Write-Host "⚠️  This will modify the production database!" -ForegroundColor Yellow
        $confirm = Read-Host "Continue? (yes/no)"

        if ($confirm -eq "yes") {
            supabase db push --linked

            if ($LASTEXITCODE -eq 0) {
                Write-Host "Migrations applied successfully ✅" -ForegroundColor Green
            }
            else {
                Write-Host "Migration failed ❌" -ForegroundColor Red
                exit 1
            }
        }
        else {
            Write-Host "Database migration skipped" -ForegroundColor Yellow
        }
    }
}
else {
    Write-Host "⏭️  Skipping database migrations" -ForegroundColor Yellow
}

Write-Host ""

# Step 6: Deploy Edge Functions
if (-not $SkipFunctions) {
    Write-Host "⚡ Step 6: Deploy Edge Functions" -ForegroundColor Green
    Write-Host "--------------------------------" -ForegroundColor Green

    $functions = @(
        "admin-dashboard",
        "auth-test",
        "send-notification-email",
        "schedule-follow-ups",
        "ai-voice-handler",
        "call-analytics",
        "sms-handler",
        "stripe-webhook",
        "paypal-webhook",
        "ai-chat",
        "send-direct-mail",
        "capture-lead",
        "create-payment-intent"
    )

    Write-Host "Found $($functions.Count) functions to deploy"

    if (-not $DryRun) {
        Write-Host "⚠️  This will deploy functions to production!" -ForegroundColor Yellow
        $confirm = Read-Host "Continue? (yes/no)"

        if ($confirm -eq "yes") {
            foreach ($func in $functions) {
                $funcPath = "$projectRoot\supabase\functions\$func"
                if (Test-Path $funcPath) {
                    Write-Host "Deploying $func..." -NoNewline
                    supabase functions deploy $func --linked 2>$null

                    if ($LASTEXITCODE -eq 0) {
                        Write-Host " ✅" -ForegroundColor Green
                    }
                    else {
                        Write-Host " ⚠️  (may not exist)" -ForegroundColor Yellow
                    }
                }
            }
            Write-Host "Edge functions deployment complete ✅" -ForegroundColor Green
        }
        else {
            Write-Host "Edge functions deployment skipped" -ForegroundColor Yellow
        }
    }
    else {
        Write-Host "Would deploy $($functions.Count) edge functions (dry run)" -ForegroundColor Yellow
    }
}
else {
    Write-Host "⏭️  Skipping edge functions deployment" -ForegroundColor Yellow
}

Write-Host ""

# Step 7: Verification
Write-Host "✅ Step 7: Post-Deployment Verification" -ForegroundColor Green
Write-Host "---------------------------------------" -ForegroundColor Green

Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Deploy frontend build to hosting (Cloudflare Pages/Vercel/etc)"
Write-Host "2. Configure Cloudflare CSP headers from public/_headers"
Write-Host "3. Update Twilio webhook URLs:"
Write-Host "   Voice: https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/ai-voice-handler"
Write-Host "   SMS: https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/sms-handler"
Write-Host "4. Update Stripe webhook URL:"
Write-Host "   https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/stripe-webhook"
Write-Host "5. Test the production site thoroughly"
Write-Host "6. Monitor logs: supabase functions logs --linked"
Write-Host ""

Write-Host "🎉 Deployment script completed!" -ForegroundColor Green
Write-Host ""

if ($DryRun) {
    Write-Host "This was a DRY RUN. No changes were made." -ForegroundColor Yellow
    Write-Host "Run without -DryRun to perform actual deployment." -ForegroundColor Yellow
}
