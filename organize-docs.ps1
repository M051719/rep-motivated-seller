#!/usr/bin/env pwsh
# Documentation Organization & Project Cleanup Script

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     📚 Documentation Organization & Project Cleanup Tool      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

# Create organized directory structure
$docStructure = @{
    "docs/guides" = @(
        "AI_CHAT_IMPLEMENTATION_GUIDE.md"
        "AI_CHAT_QUICKSTART.md"
        "AI_VOICE_ENHANCEMENTS_GUIDE.md"
        "MCP_IMPLEMENTATION_GUIDE.md"
        "MCP_INTEGRATION_ACTION_PLAN.md"
        "COMPLETE_MCP_IMPLEMENTATION_SUMMARY.md"
        "MCP_EDUCATION_SYSTEM_PROPOSAL.md"
        "DAPPIER_MCP_INTEGRATION.md"
        "DAPPIER_LIVE_GUIDE.md"
        "HARDSHIP_LETTER_IMPLEMENTATION.md"
        "PRESENTATION_BUILDER_GUIDE.md"
        "PRESENTATION_BUILDER_QUICKSTART.md"
        "SMS_MONITORING_SYSTEM_GUIDE.md"
        "SMS_COMPLIANCE_GUIDE.md"
        "TWILIO_TOLL_FREE_VERIFICATION.md"
        "CREDIT_REPAIR_INTEGRATION.md"
        "CREDIT_REPAIR_SUCCESS.md"
        "MAILERLITE_COMPLETE_INTEGRATION.md"
        "DEAL_ANALYSIS_INTEGRATION.md"
        "BLOG_ENHANCEMENTS_COMPLETE.md"
        "YOUTUBE_INTEGRATION_GUIDE.md"
        "LEGAL_PROTECTION_AND_DIRECT_MAIL_GUIDE.md"
    )
    
    "docs/deployment" = @(
        "GITHUB_ACTIONS_SETUP.md"
        "DETAILED_DEPLOYMENT_GUIDE.md"
        "VISUAL_DEPLOYMENT_GUIDE.md"
        "WINDOWS_DEPLOYMENT_GUIDE.md"
        "COMPLETE_WINDOWS_SETUP.md"
        "PRODUCTION_DEPLOYMENT_CHECKLIST.md"
        "QUICK_START_GUIDE.md"
        "deploy-instructions.md"
    )
    
    "docs/database" = @(
        "DATABASE_SYNC_GUIDE.md"
        "ESTABLISH_CONNECTION.md"
        "SUPABASE_CONNECTION_STRINGS.md"
        "FDW_VERIFICATION_REPORT.md"
        "POSTGRES_UPGRADE_CHECKLIST.md"
        "APPLY_SMS_MIGRATION.md"
    )
    
    "docs/security" = @(
        "EDGE_FUNCTIONS_SECURITY.md"
        "ENV_CONFIGURATION_GUIDE.md"
        "GITHUB_SSH_SETUP.md"
    )
    
    "docs/features" = @(
        "FEATURE_ROADMAP.md"
        "PLATFORM_FEATURES_STATUS.md"
        "RESOURCES_AVAILABLE.md"
        "ADMIN_DASHBOARD.md"
    )
    
    "docs/reference" = @(
        "README.md"
        "SESSION_NOTES.md"
        "CLAUDE.md"
        "PROJECT_HISTORY_AND_WALKTHROUGH.md"
        "TASK_CHECKLISTS.md"
        "TROUBLESHOOTING_GUIDE.md"
    )
    
    "docs/archive/old-deployment" = @(
        "CLOUDFLARE_CACHE_REDIRECT_FIX.md"
        "CLOUDFLARE_REDIRECT_FIX.md"
        "CLOUDFLARE_SUBDOMAIN_CONFIG.md"
        "CLOUDFLARE_SUCCESS_REPORT.md"
        "cloudflare-csp-setup.md"
        "CSP_FIX_GUIDE.md"
        "DEPLOYMENT_SUCCESS_REPORT.md"
        "DEPLOYMENT-STATUS-REPORT.md"
        "FINAL_DEPLOYMENT_STATUS.md"
        "REDIRECT_TROUBLESHOOTING.md"
    )
    
    "docs/archive/old-sms" = @(
        "SMS_DEPLOYMENT_SUCCESS.md"
        "SMS_MIGRATION_FINAL_FIX.md"
        "SMS_MIGRATION_FIX_SUMMARY.md"
        "SMS_MONITORING_DEPLOYMENT_COMPLETE.md"
        "MIGRATION_FIX_SUMMARY.md"
    )
    
    "docs/archive/old-integrations" = @(
        "MAILERLITE_IMPLEMENTATION_SUMMARY.md"
        "MAILERLITE_INTEGRATION_GUIDE.md"
        "BLOG_ENHANCEMENTS_INSTALL.md"
        "SMS_COMPLIANCE_QUICK_REFERENCE.md"
        "SMS_MONITORING_QUICK_START.md"
        "SMS_OPT_IN_IMPLEMENTATION_SUMMARY.md"
    )
}

Write-Host "📊 Documentation Organization Plan:" -ForegroundColor Yellow
Write-Host "  • Active Guides → docs/guides/" -ForegroundColor White
Write-Host "  • Deployment Docs → docs/deployment/" -ForegroundColor White
Write-Host "  • Database Docs → docs/database/" -ForegroundColor White
Write-Host "  • Security Docs → docs/security/" -ForegroundColor White
Write-Host "  • Old/Superseded → docs/archive/`n" -ForegroundColor Gray

$response = Read-Host "Organize documentation files? (Y/N)"
if ($response -ne 'Y' -and $response -ne 'y') {
    Write-Host "`n❌ Organization cancelled" -ForegroundColor Yellow
    exit 0
}

Write-Host "`n📁 Creating directory structure..." -ForegroundColor Cyan
foreach ($dir in $docStructure.Keys) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    Write-Host "  ✓ $dir" -ForegroundColor Green
}

Write-Host "`n📄 Organizing files..." -ForegroundColor Cyan
$movedCount = 0
foreach ($targetDir in $docStructure.Keys) {
    foreach ($file in $docStructure[$targetDir]) {
        if (Test-Path $file) {
            $dest = Join-Path $targetDir $file
            Move-Item $file -Destination $dest -Force -ErrorAction SilentlyContinue
            Write-Host "  → $file → $targetDir" -ForegroundColor Gray
            $movedCount++
        }
    }
}

# Create main README with navigation
$mainReadme = @"
# RepMotivatedSeller Platform

> Pre-foreclosure assistance and real estate investment platform

## 🚀 Quick Start

\`\`\`powershell
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
\`\`\`

## 📚 Documentation

### 🎯 Implementation Guides
- [AI Chat System](docs/guides/AI_CHAT_IMPLEMENTATION_GUIDE.md)
- [MCP Integration](docs/guides/MCP_IMPLEMENTATION_GUIDE.md)
- [Dappier Real-Time Data](docs/guides/DAPPIER_MCP_INTEGRATION.md)
- [Credit Repair Service](docs/guides/CREDIT_REPAIR_INTEGRATION.md)
- [SMS System](docs/guides/SMS_MONITORING_SYSTEM_GUIDE.md)
- [Presentation Builder](docs/guides/PRESENTATION_BUILDER_GUIDE.md)

### 🚢 Deployment
- [GitHub Actions CI/CD](docs/deployment/GITHUB_ACTIONS_SETUP.md)
- [Production Deployment](docs/deployment/DETAILED_DEPLOYMENT_GUIDE.md)
- [Windows Setup](docs/deployment/WINDOWS_DEPLOYMENT_GUIDE.md)

### 🗄️ Database
- [Database Sync](docs/database/DATABASE_SYNC_GUIDE.md)
- [Connection Setup](docs/database/ESTABLISH_CONNECTION.md)

### 🔒 Security
- [Edge Functions Security](docs/security/EDGE_FUNCTIONS_SECURITY.md)
- [Environment Configuration](docs/security/ENV_CONFIGURATION_GUIDE.md)

### 📋 Project Status
- [Feature Roadmap](docs/features/FEATURE_ROADMAP.md)
- [Platform Features](docs/features/PLATFORM_FEATURES_STATUS.md)

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **AI**: OpenAI GPT-4 + Dappier MCP
- **Deployment**: Cloudflare Pages + GitHub Actions
- **SMS**: Twilio
- **Email**: MailerLite

## 📞 Support

- Platform: https://repmotivatedseller.com
- SMS: (833) 450-3080
- Email: support@repmotivatedseller.com

"@

Set-Content -Path "README.md" -Value $mainReadme

# Create docs README with full index
$docsIndex = @"
# Documentation Index

## 📁 Directory Structure

\`\`\`
docs/
├── guides/          # Implementation guides for features
├── deployment/      # Deployment and setup guides
├── database/        # Database configuration and migrations
├── security/        # Security and authentication
├── features/        # Feature documentation
├── reference/       # General reference docs
└── archive/         # Old/superseded documentation
\`\`\`

## 🎯 By Topic

### AI & Machine Learning
- [AI Chat Implementation](guides/AI_CHAT_IMPLEMENTATION_GUIDE.md)
- [AI Voice Enhancements](guides/AI_VOICE_ENHANCEMENTS_GUIDE.md)
- [MCP Integration](guides/MCP_IMPLEMENTATION_GUIDE.md)
- [Dappier Real-Time Data](guides/DAPPIER_MCP_INTEGRATION.md)

### Credit & Financial Services
- [Credit Repair Integration](guides/CREDIT_REPAIR_INTEGRATION.md)
- [Hardship Letter Generator](guides/HARDSHIP_LETTER_IMPLEMENTATION.md)
- [Deal Analysis](guides/DEAL_ANALYSIS_INTEGRATION.md)

### Communication
- [SMS Monitoring System](guides/SMS_MONITORING_SYSTEM_GUIDE.md)
- [SMS Compliance Guide](guides/SMS_COMPLIANCE_GUIDE.md)
- [Twilio Toll-Free Verification](guides/TWILIO_TOLL_FREE_VERIFICATION.md)
- [MailerLite Integration](guides/MAILERLITE_COMPLETE_INTEGRATION.md)

### Content & Presentations
- [Presentation Builder](guides/PRESENTATION_BUILDER_GUIDE.md)
- [Blog Enhancements](guides/BLOG_ENHANCEMENTS_COMPLETE.md)
- [YouTube Integration](guides/YOUTUBE_INTEGRATION_GUIDE.md)

### Deployment
- [GitHub Actions CI/CD](deployment/GITHUB_ACTIONS_SETUP.md)
- [Production Deployment](deployment/DETAILED_DEPLOYMENT_GUIDE.md)
- [Windows Deployment](deployment/WINDOWS_DEPLOYMENT_GUIDE.md)

### Database
- [Database Sync](database/DATABASE_SYNC_GUIDE.md)
- [Connection Setup](database/ESTABLISH_CONNECTION.md)
- [Postgres Upgrade](database/POSTGRES_UPGRADE_CHECKLIST.md)

## 🔍 Quick Reference

| Need to... | See... |
|------------|--------|
| Add AI chat | [AI Chat Guide](guides/AI_CHAT_IMPLEMENTATION_GUIDE.md) |
| Deploy to production | [Deployment Guide](deployment/DETAILED_DEPLOYMENT_GUIDE.md) |
| Set up CI/CD | [GitHub Actions](deployment/GITHUB_ACTIONS_SETUP.md) |
| Configure database | [Database Sync](database/DATABASE_SYNC_GUIDE.md) |
| Add credit repair | [Credit Repair](guides/CREDIT_REPAIR_INTEGRATION.md) |
| Set up SMS | [SMS System](guides/SMS_MONITORING_SYSTEM_GUIDE.md) |

"@

New-Item -ItemType Directory -Force -Path "docs" | Out-Null
Set-Content -Path "docs/README.md" -Value $docsIndex

Write-Host "`n✅ Documentation organized successfully!" -ForegroundColor Green
Write-Host "  📦 Moved $movedCount files" -ForegroundColor White
Write-Host "  📁 Created docs/ structure" -ForegroundColor White
Write-Host "  📖 Updated README.md with navigation" -ForegroundColor White
Write-Host "  📚 Created docs/README.md index`n" -ForegroundColor White

Write-Host "📋 Next: Run cleanup script for old files" -ForegroundColor Cyan
Write-Host "  .\cleanup-project.ps1`n" -ForegroundColor White
