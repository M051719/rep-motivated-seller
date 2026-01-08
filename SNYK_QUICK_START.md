# 🔒 Snyk Security Quick Reference

## Quick Commands

### Run Security Scan
```bash
npm run security:scan
```

### Test Dependencies Only
```bash
npm run snyk:test
```

### Code Analysis (SAST)
```bash
npm run snyk:code
```

### Monitor Project
```bash
npm run snyk:monitor
```

---

## Setup Checklist

- [x] Snyk CLI installed (v1.1301.2)
- [x] `.snyk` policy file configured
- [x] GitHub Actions workflow active
- [x] NPM scripts added
- [ ] **REQUIRED**: `SNYK_TOKEN` GitHub secret

---

## Next Steps

### 1. Configure GitHub Secret ⚠️

**This is REQUIRED for GitHub Actions to work!**

1. Get token: https://snyk.io/account
2. Go to: Repository → Settings → Secrets → Actions
3. Add new secret:
   - Name: `SNYK_TOKEN`
   - Value: [your token]

### 2. Run Initial Scan

```bash
cd "c:\Users\monte\Documents\cert api token keys ids\supabase project deployment\rep-motivated-seller"
npm run security:scan
```

### 3. Review Results

Check for:
- Critical/High severity vulnerabilities
- Outdated dependencies with known issues
- License compliance issues

---

## Files & Locations

| File | Location | Purpose |
|------|----------|---------|
| `.snyk` | Project root | Snyk policy configuration |
| `snyk.yml` | `.github/workflows/` | GitHub Actions workflow |
| `package.json` | Project root | Snyk scripts & dependency |
| Implementation Guide | `docs/security/` | Detailed documentation |

---

## Current Status

### Installed ✅
- Snyk CLI (v1.1301.2)
- GitHub workflow
- Policy file
- NPM scripts

### Configuration Needed ⚠️
- [ ] GitHub Secret: `SNYK_TOKEN`
- [ ] Run initial security scan
- [ ] Review and address findings

### Known Issues
- **@modelcontextprotocol/sdk**: DNS rebinding (High) - requires SDK update

---

## Support

**Documentation**: See [SNYK_IMPLEMENTATION_GUIDE.md](./SNYK_IMPLEMENTATION_GUIDE.md)  
**Snyk Docs**: https://docs.snyk.io/  
**GitHub Actions**: Check `.github/workflows/snyk.yml`

---

**Last Updated**: January 6, 2026
