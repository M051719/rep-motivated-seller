# 🔐 DOTENVX ENCRYPTED ENVIRONMENT SETUP

**Date:** January 8, 2026  
**For:** RepMotivatedSeller Platform  
**Purpose:** Replace plaintext .env files with encrypted, version-controlled environment management

---

## 🎯 WHY DOTENVX?

Given your recent API key exposure in git history, dotenvx provides:

1. **Encrypted .env files** - Safe to commit to version control
2. **Multiple environments** - dev, staging, production
3. **AES-256 + Secp256k1 encryption** - Same crypto as Bitcoin
4. **No more secrets in git history** - Ever again
5. **Team collaboration** - Encrypted values, shareable keys

---

## 📦 INSTALLATION

### Option 1: Global Installation (Recommended)

```powershell
# Install dotenvx globally
npm install -g @dotenvx/dotenvx

# Verify installation
dotenvx --version
```

### Option 2: Project Installation

```powershell
# Navigate to project
cd "c:\Users\monte\Documents\cert api token keys ids\supabase project deployment\rep-motivated-seller"

# Install as dev dependency
npm install --save-dev @dotenvx/dotenvx

# Verify installation
npx dotenvx --version
```

### Option 3: Use Shell Script (Linux/Mac)

```bash
# Install using official script
curl -sfS https://dotenvx.sh | sh

# Verify
dotenvx --version
```

---

## 🚀 QUICKSTART (2 MINUTES)

### Step 1: Create Environment Files

```powershell
# Navigate to project
cd "c:\Users\monte\Documents\cert api token keys ids\supabase project deployment\rep-motivated-seller"

# Create development environment (copy from .env.example)
Copy-Item .env.example .env

# Create production environment
Copy-Item .env.example .env.production

# Create staging environment (optional)
Copy-Item .env.example .env.staging
```

### Step 2: Add Your Real Secrets

```powershell
# Edit .env for development
notepad .env

# Edit .env.production for production
notepad .env.production
```

**Add your REAL API keys** (don't worry, we'll encrypt them next):

```bash
# .env (development)
VITE_SUPABASE_URL=https://ltxqodqlexvojqqxquew.supabase.co
VITE_SUPABASE_ANON_KEY=your_real_dev_anon_key
STACKHAWK_API_KEY=hawk.your_dev_api_key

# .env.production
VITE_SUPABASE_URL=https://ltxqodqlexvojqqxquew.supabase.co
VITE_SUPABASE_ANON_KEY=your_real_prod_anon_key
STACKHAWK_API_KEY=hawk.your_prod_api_key
```

### Step 3: Encrypt Your Environment Files

```powershell
# Encrypt .env (development)
dotenvx encrypt

# Encrypt .env.production
dotenvx encrypt -f .env.production

# Encrypt .env.staging (if you created it)
dotenvx encrypt -f .env.staging
```

**What happens:**
- ✅ `.env` is encrypted in place
- ✅ `.env.production` is encrypted in place
- ✅ `.env.keys` file created with decryption keys
- ✅ `DOTENV_PUBLIC_KEY` and `DOTENV_PRIVATE_KEY` generated

### Step 4: Secure Your Keys

```powershell
# The .env.keys file contains your decryption keys
# Add it to .gitignore (already done in .gitignore)

# IMPORTANT: Store keys in your secrets manager
# - Azure Key Vault
# - AWS Secrets Manager
# - 1Password
# - GitHub Secrets
```

### Step 5: Commit Encrypted Files

```powershell
# Now it's SAFE to commit encrypted .env files
git add .env .env.production .env.staging
git commit -m "feat: add encrypted environment files with dotenvx"
git push origin main
```

---

## 🔧 USAGE

### Running in Development

```powershell
# Run with development environment (.env)
dotenvx run -- npm run dev

# Or use package.json script
npm run dev:secure
```

### Running in Production

```powershell
# Run with production environment
dotenvx run -f .env.production -- npm run build

# Start production server
dotenvx run -f .env.production -- npm run preview
```

### Running with Multiple Environments

```powershell
# Combine .env and .env.local
dotenvx run -f .env -f .env.local -- npm run dev

# Production with overrides
dotenvx run -f .env.production -f .env.local -- npm start
```

---

## 📋 PACKAGE.JSON SCRIPTS

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "dev:secure": "dotenvx run -- vite",
    "dev:encrypted": "dotenvx run -f .env -- vite",
    
    "build": "tsc && vite build",
    "build:production": "dotenvx run -f .env.production -- npm run build",
    "build:staging": "dotenvx run -f .env.staging -- npm run build",
    
    "preview": "vite preview",
    "preview:production": "dotenvx run -f .env.production -- vite preview",
    
    "env:encrypt": "dotenvx encrypt",
    "env:encrypt:production": "dotenvx encrypt -f .env.production",
    "env:encrypt:staging": "dotenvx encrypt -f .env.staging",
    "env:encrypt:all": "dotenvx encrypt && dotenvx encrypt -f .env.production && dotenvx encrypt -f .env.staging",
    
    "env:decrypt": "dotenvx decrypt",
    "env:decrypt:production": "dotenvx decrypt -f .env.production",
    
    "env:get": "dotenvx get",
    "env:set": "dotenvx set",
    
    "env:keypair": "dotenvx keypair",
    "env:rotate": "dotenvx rotate",
    
    "env:ls": "dotenvx ls"
  }
}
```

---

## 🔑 KEY MANAGEMENT

### View Your Keys

```powershell
# Show public/private keypair
dotenvx keypair

# Show keys for production
dotenvx keypair -f .env.production

# Export keys in shell format
dotenvx keypair --format shell
```

### Rotate Keys (After Compromise)

```powershell
# Rotate development keys
dotenvx rotate

# Rotate production keys
dotenvx rotate -f .env.production

# Rotate all environments
dotenvx rotate && dotenvx rotate -f .env.production
```

---

## 🌍 CI/CD INTEGRATION

### GitHub Actions

```yaml
name: Deploy with Encrypted Env

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build with encrypted production env
        env:
          DOTENV_PRIVATE_KEY_PRODUCTION: ${{ secrets.DOTENV_PRIVATE_KEY_PRODUCTION }}
        run: |
          npm install -g @dotenvx/dotenvx
          dotenvx run -f .env.production -- npm run build
      
      - name: Deploy
        run: npm run deploy
```

**Add to GitHub Secrets:**
1. Go to: https://github.com/M051719/rep-motivated-seller/settings/secrets/actions
2. Add: `DOTENV_PRIVATE_KEY_PRODUCTION` = `your_private_key_from_dotenvx_keypair`

### Azure Static Web Apps

```yaml
# .github/workflows/azure-static-web-apps.yml
- name: Build with encrypted env
  env:
    DOTENV_PRIVATE_KEY_PRODUCTION: ${{ secrets.DOTENV_PRIVATE_KEY_PRODUCTION }}
  run: |
    npm install -g @dotenvx/dotenvx
    dotenvx run -f .env.production -- npm run build
```

### Netlify

```toml
# netlify.toml
[build]
  command = "npm install -g @dotenvx/dotenvx && dotenvx run -f .env.production -- npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"
```

Add `DOTENV_PRIVATE_KEY_PRODUCTION` to Netlify environment variables.

---

## 🔍 ADVANCED FEATURES

### Variable Expansion

```bash
# .env
DATABASE_URL=postgresql://localhost:5432/mydb
DATABASE_POOL_URL=${DATABASE_URL}?pool_timeout=10
```

### Default Values

```bash
# Use default if variable not set
LOG_LEVEL=${LOG_LEVEL:-info}
PORT=${PORT:-3000}
```

### Command Substitution

```bash
# Run command to get value
CURRENT_TIME=$(date +%Y-%m-%d)
GIT_COMMIT=$(git rev-parse HEAD)
```

### Get Single Variable

```powershell
# Get value of specific variable
dotenvx get VITE_SUPABASE_URL

# Get from production env
dotenvx get VITE_SUPABASE_URL -f .env.production

# Get as JSON
dotenvx get --all
```

### Set Single Variable

```powershell
# Set value (automatically encrypts if file is encrypted)
dotenvx set API_KEY "new_value"

# Set in production
dotenvx set API_KEY "prod_value" -f .env.production

# Set value with spaces
dotenvx set MESSAGE "Hello World"
```

---

## ⚠️ MIGRATION FROM PLAIN .ENV FILES

### Step 1: Backup Current .env Files

```powershell
# Create backup directory
New-Item -ItemType Directory -Force backup-env-files

# Backup existing files
Copy-Item .env backup-env-files\.env.backup
Copy-Item .env.local backup-env-files\.env.local.backup
Copy-Item .env.production backup-env-files\.env.production.backup
```

### Step 2: Encrypt Existing Files

```powershell
# If you have .env.vault (old dotenv-vault format)
dotenvx ext vault migrate

# Or encrypt directly
dotenvx encrypt
dotenvx encrypt -f .env.production
```

### Step 3: Update Scripts

```powershell
# Old way
npm run dev

# New way
dotenvx run -- npm run dev
```

### Step 4: Update .gitignore

Ensure `.env.keys` is in `.gitignore`:

```gitignore
# Dotenvx
.env.keys
.env*.local

# Keep encrypted files
!.env
!.env.production
!.env.staging
```

---

## 🛡️ SECURITY BEST PRACTICES

### 1. Never Commit .env.keys

```gitignore
# .gitignore
.env.keys
*.keys
```

### 2. Store Keys in Secrets Manager

- **Azure Key Vault** for Azure deployments
- **AWS Secrets Manager** for AWS deployments
- **GitHub Secrets** for CI/CD
- **1Password** / **Bitwarden** for team sharing

### 3. Rotate Keys Regularly

```powershell
# Rotate monthly
dotenvx rotate
dotenvx rotate -f .env.production
```

### 4. Use Different Keys Per Environment

```powershell
# Development uses DOTENV_PRIVATE_KEY
# Production uses DOTENV_PRIVATE_KEY_PRODUCTION
# Staging uses DOTENV_PRIVATE_KEY_STAGING
```

### 5. Audit Who Has Access

```powershell
# List all .env files
dotenvx ls

# Check what's encrypted
git log --follow .env
```

---

## ✅ VERIFICATION CHECKLIST

- [ ] dotenvx installed (`dotenvx --version` works)
- [ ] `.env` file created with real values
- [ ] `.env.production` file created with real values
- [ ] `.env` file encrypted (`dotenvx encrypt`)
- [ ] `.env.production` encrypted (`dotenvx encrypt -f .env.production`)
- [ ] `.env.keys` file exists (contains decryption keys)
- [ ] `.env.keys` added to `.gitignore`
- [ ] Decryption keys stored in secrets manager
- [ ] Package.json scripts updated
- [ ] Application runs with `dotenvx run -- npm run dev`
- [ ] Build works with `dotenvx run -f .env.production -- npm run build`
- [ ] Encrypted files committed to git
- [ ] GitHub Secrets configured for CI/CD

---

## 🆘 TROUBLESHOOTING

### "dotenvx: command not found"

```powershell
# Install globally
npm install -g @dotenvx/dotenvx

# Or use npx
npx @dotenvx/dotenvx --version
```

### "Decryption failed"

```powershell
# Ensure DOTENV_PRIVATE_KEY is set
$env:DOTENV_PRIVATE_KEY = "your_private_key"

# Or pass explicitly
$env:DOTENV_PRIVATE_KEY="key" dotenvx run -- npm run dev
```

### "File is already encrypted"

```powershell
# Decrypt first
dotenvx decrypt

# Make changes
notepad .env

# Re-encrypt
dotenvx encrypt
```

### View Encrypted vs Decrypted

```powershell
# View encrypted (what's in git)
Get-Content .env

# View decrypted (actual values)
dotenvx decrypt --stdout
```

---

## 📚 COMMANDS REFERENCE

```powershell
# Core commands
dotenvx run -- yourcommand          # Run with env injection
dotenvx encrypt                      # Encrypt .env file
dotenvx decrypt                      # Decrypt .env file
dotenvx get KEY                      # Get single variable
dotenvx set KEY value                # Set single variable
dotenvx keypair                      # Show public/private keys
dotenvx rotate                       # Rotate keys and re-encrypt
dotenvx ls                           # List all .env files

# Multiple files
dotenvx run -f .env -f .env.local -- npm start
dotenvx encrypt -f .env.production
dotenvx decrypt -f .env.staging

# Advanced
dotenvx get --all                    # Get all as JSON
dotenvx get --format shell           # Export format
dotenvx set KEY "value with spaces"  # Set with spaces
dotenvx encrypt --stdout             # Output to stdout
dotenvx decrypt -k YOUR_PRIVATE_KEY  # Decrypt with specific key
```

---

## 🎉 BENEFITS FOR REPMOTIVATEDSELLER

After implementing dotenvx, you'll have:

1. ✅ **Encrypted secrets** - Never expose API keys again
2. ✅ **Version controlled** - Track environment changes in git
3. ✅ **Multi-environment** - dev, staging, production
4. ✅ **Team collaboration** - Share encrypted values safely
5. ✅ **Audit trail** - See who changed what and when
6. ✅ **Auto-rotate keys** - Easy key rotation after compromise
7. ✅ **CI/CD ready** - Works with GitHub Actions, Azure, Netlify
8. ✅ **Zero trust** - Even with git access, secrets stay secret

---

**Next Steps:**
1. Install dotenvx
2. Encrypt your environment files
3. Commit encrypted files to git
4. Store decryption keys in secrets manager
5. Update your API keys (per API_KEY_ROTATION_CHECKLIST.md)
6. Configure CI/CD with new encrypted workflow

**🔒 Your secrets will finally be... secret! 🎉**
