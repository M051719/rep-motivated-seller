# 🚀 GitHub Actions CI/CD Setup Guide

## ✅ What's Been Created

1. **`.github/workflows/ci-cd.yml`** - Main CI/CD pipeline
2. **`.github/workflows/secret-scan.yml`** - Dedicated secret scanning
3. **`.git/hooks/pre-commit`** - Local pre-commit hook

## 📋 Required GitHub Secrets

Go to: **Repository → Settings → Secrets and variables → Actions**

### Required Secrets:

```bash
# Supabase
VITE_SUPABASE_URL              # Your Supabase project URL
VITE_SUPABASE_ANON_KEY         # Your Supabase anon/public key
SUPABASE_ACCESS_TOKEN          # Supabase CLI access token
SUPABASE_PROJECT_REF           # Your Supabase project reference ID

# Cloudflare
CLOUDFLARE_API_TOKEN           # Cloudflare API token with Pages permissions
CLOUDFLARE_ACCOUNT_ID          # Your Cloudflare account ID

# Optional but recommended
GITLEAKS_LICENSE               # Gitleaks Pro license (optional)
```

## 🔧 How to Get These Secrets

### Supabase Secrets:
```powershell
# 1. Get Supabase URL and Keys
# Go to: https://app.supabase.com/project/YOUR_PROJECT/settings/api
# Copy: URL, anon key

# 2. Get Supabase Access Token
supabase login
# Token will be saved, or generate at: https://app.supabase.com/account/tokens

# 3. Get Project Reference
# Go to: https://app.supabase.com/project/YOUR_PROJECT/settings/general
# Copy: Reference ID
```

### Cloudflare Secrets:
```powershell
# 1. Get API Token
# Go to: https://dash.cloudflare.com/profile/api-tokens
# Create token with "Cloudflare Pages - Edit" permissions

# 2. Get Account ID
# Go to: https://dash.cloudflare.com/
# Copy from URL or Account Overview
```

## 🎯 Workflow Triggers

### CI/CD Pipeline (`ci-cd.yml`):
- **Push** to `main` or `develop` → Full pipeline + deploy
- **Pull Request** to `main` or `develop` → Build and test only
- **Manual** → Run via GitHub Actions UI

### Secret Scanning (`secret-scan.yml`):
- **Every push** to any branch
- **Every pull request**
- **Daily** at 2 AM UTC (scheduled)

## 📊 Pipeline Stages

```
┌─────────────────┐
│ Secret Scanning │ ──┐
└─────────────────┘   │
                      ▼
┌─────────────────┐   ┌──────────┐
│  Lint & Types   │──▶│  Build   │
└─────────────────┘   └──────────┘
                           │
┌─────────────────┐        │
│     Tests       │────────┘
└─────────────────┘        │
                           ▼
                   ┌────────────────┐
                   │ Deploy to Env  │
                   └────────────────┘
```

## 🛡️ Security Features

✅ **Gitleaks** - Detect hardcoded secrets
✅ **TruffleHog** - Advanced secret detection
✅ **Trivy** - Vulnerability scanning
✅ **npm audit** - Dependency checks
✅ **Custom patterns** - Project-specific checks

## 🚀 Quick Start

### 1. Add GitHub Secrets
```powershell
# Add all required secrets to GitHub repository
```

### 2. Enable GitHub Secret Scanning
```
Repository → Settings → Security → Code security and analysis
Enable: "Secret scanning" and "Push protection"
```

### 3. Test Locally
```powershell
# Run secret scan
.\scan-secrets.ps1

# Test build
npm run build

# Test deployment (dry run)
npm run typecheck
npm run lint
```

### 4. Push to GitHub
```powershell
git add .github/workflows
git commit -m "Add CI/CD pipeline with secret scanning"
git push origin main
```

### 5. Monitor Pipeline
```
Go to: Repository → Actions
Watch the pipeline run
```

## 🔄 Branch Strategy

```
main (production)
  ↑
  │ PR + Review
  │
develop (staging)
  ↑
  │ PR
  │
feature/* (development)
```

### Deployment Flow:
- **feature/** branches → No auto-deploy (build & test only)
- **develop** branch → Auto-deploy to staging
- **main** branch → Auto-deploy to production (requires approval)

## 🎛️ Environment Configuration

### Production Environment:
- **Name**: production
- **URL**: https://repmotivatedseller.com
- **Protection**: Requires manual approval
- **Secrets**: Production credentials

### Staging Environment:
- **Name**: staging
- **URL**: https://staging.repmotivatedseller.com
- **Protection**: None (auto-deploy)
- **Secrets**: Staging credentials

## 📝 Local Development

### Install Pre-commit Hook:
```powershell
# Already created in .git/hooks/pre-commit
# Make it executable (Linux/Mac):
chmod +x .git/hooks/pre-commit

# Test it:
git commit -m "test"
```

### Run Checks Manually:
```powershell
# Secret scan
.\scan-secrets.ps1

# Lint
npm run lint

# Type check
npm run typecheck

# Build
npm run build

# Test
npm run test
```

## 🐛 Troubleshooting

### Pipeline Failing?

1. **Check secrets**: Ensure all required secrets are set
2. **Check syntax**: Validate YAML syntax
3. **Check logs**: View detailed logs in Actions tab
4. **Test locally**: Run commands locally first

### Secret Scanning False Positives?

Add to `.gitleaks.toml`:
```toml
[allowlist]
paths = [
  "node_modules",
  "*.example",
  "*.sample"
]
```

### Build Failing?

```powershell
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📚 Additional Resources

- [GitHub Actions Docs](https://docs.github.com/actions)
- [Gitleaks](https://github.com/gitleaks/gitleaks)
- [TruffleHog](https://github.com/trufflesecurity/trufflehog)
- [Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Supabase CLI](https://supabase.com/docs/guides/cli)

## 🎉 Success Criteria

✅ All secrets configured in GitHub
✅ Secret scanning workflow passing
✅ CI/CD pipeline green
✅ Deployments successful
✅ Pre-commit hook working locally

---

**Need help?** Check the workflow logs in the Actions tab or run locally to debug.
