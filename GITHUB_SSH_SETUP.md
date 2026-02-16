# 🔑 GITHUB SSH KEY SETUP

## RepMotivatedSeller - Secure Git Access

### 🚀 **QUICK SETUP**

#### **Generate SSH Key**:

```bash
scripts\generate-github-ssh-key.bat
```

#### **Setup Repository**:

```bash
scripts\setup-github-repo.bat
```

### 📋 **MANUAL SETUP STEPS**

#### **1. Generate SSH Key**

```bash
ssh-keygen -t ed25519 -C "your-email@example.com"
```

#### **2. Add to SSH Agent**

```bash
ssh-add ~/.ssh/id_ed25519
```

#### **3. Copy Public Key**

```bash
cat ~/.ssh/id_ed25519.pub
```

#### **4. Add to GitHub**

1. Go to: https://github.com/settings/ssh/new
2. Paste your public key
3. Title: "RepMotivatedSeller-Deploy"
4. Click "Add SSH key"

#### **5. Test Connection**

```bash
ssh -T git@github.com
```

### 🔐 **EXISTING SSH KEY**

If you already have an SSH key:

#### **Check Existing Keys**:

```bash
ls -la ~/.ssh
```

#### **Use Existing Key**:

```bash
ssh-add ~/.ssh/id_rsa
# or
ssh-add ~/.ssh/id_ed25519
```

### 📁 **REPOSITORY SETUP**

#### **Initialize Git**:

```bash
git init
git add .
git commit -m "Initial commit: RepMotivatedSeller platform"
```

#### **Add Remote**:

```bash
git remote add origin git@github.com:YOUR_USERNAME/rep-motivated-seller.git
git branch -M main
git push -u origin main
```

### 🛡️ **SECURITY RECOMMENDATIONS**

#### **Repository Settings**:

- ✅ Make repository **private**
- ✅ Enable **branch protection** on main
- ✅ Require **pull request reviews**
- ✅ Enable **security alerts**

#### **Sensitive Files** (already in .gitignore):

- `.env` files
- `node_modules/`
- SSL certificates
- API keys
- Database credentials

### 🔧 **TROUBLESHOOTING**

#### **Permission Denied**:

```bash
ssh -T git@github.com
# Should return: Hi username! You've successfully authenticated
```

#### **Key Not Found**:

```bash
ssh-add -l
# Lists all added keys
```

#### **Wrong Remote URL**:

```bash
git remote -v
# Should show: git@github.com:username/repo.git
```

### 📊 **DEPLOYMENT WORKFLOW**

#### **Development**:

```bash
git add .
git commit -m "Feature: description"
git push origin main
```

#### **Production Deploy**:

```bash
git pull origin main
MASTER-PRODUCTION-DEPLOY.bat
```

### 🎯 **RECOMMENDED REPOSITORY STRUCTURE**

```
rep-motivated-seller/
├── .github/workflows/          # GitHub Actions
├── supabase/functions/         # Edge Functions
├── scripts/                    # Deployment scripts
├── troubleshooting/           # Diagnostic tools
├── legal-pages/               # Privacy, Terms, etc.
├── .env.example              # Environment template
├── .gitignore                # Git ignore rules
└── README.md                 # Project documentation
```

**🔑 Your SSH key provides secure, password-free access to your GitHub repository!**
