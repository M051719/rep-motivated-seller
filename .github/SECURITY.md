# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Security Scanning

This project uses **Snyk** for automated security scanning:

- **Dependency Scanning**: Automated checks on every push and PR
- **Code Scanning (SAST)**: Static analysis for security vulnerabilities
- **Weekly Scans**: Scheduled every Monday at 9 AM UTC
- **Continuous Monitoring**: Dependencies monitored on main branch

## Reporting a Vulnerability

If you discover a security vulnerability, please follow these steps:

1. **Do NOT** open a public issue
2. Email: security@rep-motivated-seller.com (or your security contact)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if available)

We will respond within **48 hours** and provide updates every **5 business days** until resolved.

## Security Best Practices

This project follows these security practices:

- ✅ Automated dependency scanning with Snyk
- ✅ Code scanning for vulnerabilities (SAST)
- ✅ GitHub Code Scanning integration
- ✅ Regular security updates
- ✅ Secure environment variable handling
- ✅ HTTPS-only communication
- ✅ Input validation and sanitization
- ✅ SQL injection prevention via Supabase RLS
- ✅ CORS protection
- ✅ Rate limiting on APIs

## Vulnerability Response

- **Critical**: Patched within 24 hours
- **High**: Patched within 7 days
- **Medium**: Patched within 30 days
- **Low**: Patched in next release cycle

## Dependencies

We regularly update dependencies to patch security vulnerabilities. Automated PRs from Dependabot and Snyk are reviewed and merged promptly.

## Contact

For security concerns: security@rep-motivated-seller.com
