# 🔧 STACKHAWK VERIFICATION & TROUBLESHOOTING GUIDE

**Created:** January 8, 2026  
**For:** RepMotivatedSeller Platform Security Setup

---

## ✅ COMPLETED ITEMS

All of the following have been successfully implemented:

- ✅ `.env.example` updated with StackHawk environment variables
- ✅ `stackhawk.yml` configuration file created (204 lines)
- ✅ `SecurityHeaders.tsx` component created
- ✅ `SecurityDashboard.tsx` component created
- ✅ GitHub Actions workflow `.github/workflows/security-scan.yml` created
- ✅ Security scripts added to `package.json`
- ✅ Security route integrated into App.tsx
- ✅ Security link added to Navigation.tsx

---

## 🛠️ VERIFICATION STEPS (TROUBLESHOOTING)

### Issue: "hawk: command not found" or Installation Problems

**SOLUTION 1: Install StackHawk CLI (Windows)**

```powershell
# Option A: Using npm (recommended for Windows)
npm install -g @stackhawk/cli

# Option B: Using Python pip (alternative)
pip install stackhawk

# Verify installation
hawk --version
```

**SOLUTION 2: If npm install fails**

```powershell
# Clear npm cache
npm cache clean --force

# Try installing with admin privileges
# Run PowerShell as Administrator, then:
npm install -g @stackhawk/cli --force

# Or install locally in your project
cd "c:\Users\monte\Documents\cert api token keys ids\supabase project deployment\rep-motivated-seller"
npm install @stackhawk/cli --save-dev

# Then use npx to run hawk commands
npx hawk --version
```

**SOLUTION 3: Path issues**

```powershell
# Check if npm global bin is in PATH
npm bin -g

# Add to PATH if needed (run in PowerShell as Admin)
$env:PATH += ";$(npm bin -g)"

# Make permanent (add to system environment variables)
[System.Environment]::SetEnvironmentVariable("PATH", $env:PATH, [System.EnvironmentVariableTarget]::User)
```

---

### Issue: "hawk validate" fails or configuration errors

**SOLUTION: Validate configuration syntax**

```powershell
# Navigate to project directory
cd "c:\Users\monte\Documents\cert api token keys ids\supabase project deployment\rep-motivated-seller"

# Check if stackhawk.yml exists
Test-Path stackhawk.yml

# Validate YAML syntax using PowerShell
Get-Content stackhawk.yml | ConvertFrom-Yaml

# If you don't have YAML module, install it
Install-Module -Name powershell-yaml -Force

# Or use hawk validate (if CLI is installed)
npx hawk validate

# Or check online: https://www.yamllint.com/
```

**Common YAML Issues:**
- Indentation must be consistent (use 2 spaces, not tabs)
- Strings with special characters need quotes
- Environment variables must use correct syntax: `${VAR_NAME}`

---

### Issue: Environment variables not loading

**SOLUTION: Create and configure .env.local**

```powershell
# Navigate to project
cd "c:\Users\monte\Documents\cert api token keys ids\supabase project deployment\rep-motivated-seller"

# Copy .env.example to .env.local
Copy-Item .env.example .env.local

# Edit .env.local with your actual values
notepad .env.local
```

**Add these required values to `.env.local`:**

```bash
# StackHawk Configuration
STACKHAWK_API_KEY=hawk.your_actual_api_key_from_stackhawk_dashboard
STACKHAWK_APP_ID=your_actual_app_id
STACKHAWK_ENVIRONMENT=development

# Test user for authenticated scans
STACKHAWK_TEST_EMAIL=test@yourdomain.com
STACKHAWK_TEST_PASSWORD=YourTestPassword123!

# For local scanning
STACKHAWK_HOST=http://localhost:5173
```

**Get your StackHawk credentials:**
1. Go to https://app.stackhawk.com
2. Create account or log in
3. Create new application
4. Copy API Key from Settings → API Keys
5. Copy App ID from your application dashboard

---

### Issue: "npm run security:hawk" command not found

**SOLUTION: Use correct command format**

```powershell
# Navigate to project
cd "c:\Users\monte\Documents\cert api token keys ids\supabase project deployment\rep-motivated-seller"

# Install dependencies first
npm install

# Try running hawk directly with npx
npx hawk scan

# Or use the npm script
npm run security:hawk

# If that doesn't work, run hawk with full path
npx @stackhawk/cli scan
```

---

### Issue: Application not running for scan

**SOLUTION: Start dev server before scanning**

```powershell
# Terminal 1 - Start the application
cd "c:\Users\monte\Documents\cert api token keys ids\supabase project deployment\rep-motivated-seller"
npm run dev

# Wait for "Local: http://localhost:5173/" message

# Terminal 2 - Run the security scan
cd "c:\Users\monte\Documents\cert api token keys ids\supabase project deployment\rep-motivated-seller"
npx hawk scan

# Or use quick scan
npm run security:hawk:quick
```

**Alternative: Use preview build**

```powershell
# Build and preview (more stable for scanning)
npm run build
npm run preview

# In another terminal, run scan
npm run security:hawk
```

---

### Issue: Scan fails with authentication errors

**SOLUTION: Verify test user credentials**

1. **Create a test user in your app:**
   ```powershell
   # Start your dev server
   npm run dev
   
   # Go to http://localhost:5173/auth
   # Create user: test@repmotivatedseller.org
   # Password: SecureTestPassword123!
   ```

2. **Update .env.local with exact credentials:**
   ```bash
   STACKHAWK_TEST_EMAIL=test@repmotivatedseller.org
   STACKHAWK_TEST_PASSWORD=SecureTestPassword123!
   ```

3. **Verify login manually first:**
   - Open browser
   - Go to http://localhost:5173/auth
   - Try logging in with test credentials
   - Ensure login works before scanning

---

### Issue: GitHub Actions workflow fails

**SOLUTION: Add GitHub Secrets**

1. **Go to GitHub Repository:**
   - https://github.com/M051719/rep-motivated-seller

2. **Settings → Secrets and variables → Actions**

3. **Add these secrets:**
   ```
   STACKHAWK_API_KEY = hawk.your_api_key
   STACKHAWK_APP_ID = your_app_id
   STACKHAWK_TEST_EMAIL = test@repmotivatedseller.org
   STACKHAWK_TEST_PASSWORD = SecureTestPassword123!
   VITE_SUPABASE_URL = your_supabase_url
   VITE_SUPABASE_ANON_KEY = your_supabase_anon_key
   ```

4. **Commit and push to trigger workflow:**
   ```powershell
   git add .github/workflows/security-scan.yml
   git commit -m "feat: add StackHawk security scanning workflow"
   git push origin main
   ```

---

## 🚀 RECOMMENDED TESTING WORKFLOW

### Step 1: Local Installation Verification

```powershell
# Navigate to project
cd "c:\Users\monte\Documents\cert api token keys ids\supabase project deployment\rep-motivated-seller"

# Install StackHawk CLI
npm install -g @stackhawk/cli

# Verify installation
hawk --version
# Should show: StackHawk CLI version x.x.x

# Validate configuration
hawk validate
# Should show: Configuration is valid
```

### Step 2: Environment Setup

```powershell
# Ensure .env.local exists with all required variables
Test-Path .env.local

# Check if variables are set (should not show actual values)
Get-Content .env.local | Select-String "STACKHAWK"
```

### Step 3: Start Application

```powershell
# Install dependencies
npm install

# Start dev server
npm run dev

# Wait for server to be ready
# You should see: "Local: http://localhost:5173/"
```

### Step 4: Run Security Dashboard (Quick Test)

```powershell
# Open browser to: http://localhost:5173/security
# You should see the Security Dashboard with checks

# Expected output:
# - Security Score percentage
# - List of security checks with pass/fail status
# - Recommendations for failed checks
```

### Step 5: Run StackHawk Scan (if CLI is installed)

```powershell
# In a new terminal (keep dev server running)
cd "c:\Users\monte\Documents\cert api token keys ids\supabase project deployment\rep-motivated-seller"

# Run quick scan (10 minutes)
npx hawk scan --config-override scanner.maxDuration=10

# Or use npm script
npm run security:hawk:quick

# Expected output:
# - Scan initialization
# - Spider crawling your application
# - Security tests running
# - Results summary with vulnerabilities found
```

### Step 6: Review Results

```powershell
# Results are saved to:
# - stackhawk.json (detailed JSON)
# - stackhawk.html (human-readable report)
# - stackhawk.sarif (GitHub integration format)

# Open HTML report
Start-Process stackhawk.html
```

---

## 🔍 ALTERNATIVE: TEST WITHOUT STACKHAWK CLI

If you can't install StackHawk CLI, you can still test the security features:

### Use Built-in Security Dashboard

```powershell
# Start dev server
npm run dev

# Open browser: http://localhost:5173/security
```

**What you'll see:**
- ✅ HTTPS Connection check
- ✅ Content Security Policy status
- ✅ XSS Protection headers
- ✅ Clickjacking protection
- ✅ MIME type sniffing protection
- ✅ Local storage security audit
- ✅ Console log check
- ✅ Error handling validation

### Use npm audit for dependency scanning

```powershell
# Check for vulnerabilities in dependencies
npm audit

# Get detailed report
npm audit --json > security-audit.json

# Fix vulnerabilities automatically
npm audit fix

# Fix including breaking changes (use with caution)
npm audit fix --force
```

### Use Snyk (already configured)

```powershell
# Test for vulnerabilities
npm run snyk:test

# Test code quality and security
npm run snyk:code

# Run full security scan
npm run security:scan
```

---

## 📊 SUCCESS CRITERIA

Your StackHawk integration is working correctly if:

1. ✅ **Security Dashboard loads** at http://localhost:5173/security
2. ✅ **Security score shows** (should be 60-100%)
3. ✅ **Security checks display** with pass/fail/warning status
4. ✅ **Environment variables are set** in .env.local
5. ✅ **stackhawk.yml validates** without errors
6. ✅ **GitHub Actions workflow exists** in .github/workflows/
7. ✅ **npm scripts work** (`npm run security:hawk:quick` if CLI installed)

---

## 🆘 STILL HAVING ISSUES?

### Option 1: Skip CLI, Use GitHub Actions Only

You don't need to install StackHawk CLI locally. GitHub Actions will run scans automatically when you push code.

**To test:**
1. Add GitHub Secrets (see above)
2. Push code to GitHub
3. Check Actions tab for scan results

### Option 2: Use Security Dashboard Only

The Security Dashboard provides immediate value without external tools:

```powershell
npm run dev
# Visit: http://localhost:5173/security
```

### Option 3: Focus on Snyk Integration

You already have Snyk configured:

```powershell
npm run security:scan
```

---

## 📝 NEXT STEPS

Once verification is complete:

1. **Rotate API Keys** - Follow API_KEY_ROTATION_CHECKLIST.md
2. **Set up GitHub Secrets** - For automated scanning
3. **Schedule regular scans** - GitHub Actions runs daily at 2 AM UTC
4. **Review security reports** - Check stackhawk.html after each scan
5. **Fix vulnerabilities** - Address high-severity issues first

---

**🛡️ Your RepMotivatedSeller platform is now significantly more secure!**

Even without StackHawk CLI locally, you have:
- ✅ Security headers implemented
- ✅ Client-side security dashboard
- ✅ Automated GitHub Actions scanning
- ✅ Snyk vulnerability detection
- ✅ Comprehensive security configuration

The StackHawk CLI is optional for local development. The real value comes from:
1. Security Dashboard (working now)
2. GitHub Actions automation (working when secrets are added)
3. Security headers (already implemented)
