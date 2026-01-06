# GLBA & PCI DSS Compliance Database Migrations

## Overview
This directory contains database migrations implementing GLBA (Gramm-Leach-Bliley Act) and PCI DSS (Payment Card Industry Data Security Standard) compliance requirements.

## Migration Files

### 1. 20251213000001_glba_compliance_tables.sql
**Purpose**: Implements GLBA Safeguards and Privacy Rules

**Tables Created**:
- `encryption_keys` - AES-256-GCM key storage with 90-day rotation
- `secure_documents` - Encrypted document storage with access control
- `npi_access_permissions` - Role-based access control for NPI (Nonpublic Personal Information)
- `glba_audit_log` - 7-year audit trail for all NPI access
- `document_audit_log` - Document operation tracking
- `key_audit_log` - Encryption key usage monitoring
- `compliance_metrics` - Real-time compliance monitoring

**Features**:
- Row Level Security (RLS) on all tables
- Comprehensive indexing for performance
- Automated functions for compliance reporting
- 7-year audit log retention
- 90-day key rotation policy

### 2. 20251213000002_pci_dss_audit_logging.sql
**Purpose**: Implements PCI DSS Requirement 10 (Track and monitor all access)

**Tables Created**:
- `pci_audit_logs` - Comprehensive payment and security event logging

**Features**:
- 1-year minimum audit log retention
- Payment attempt tracking
- Security violation logging
- Access denial tracking
- RLS policies for user/admin access

### 3. 20251213000003_fix_schema.sql
**Purpose**: Updates existing tables with missing columns

**Updates**:
- Adds missing columns to secure_documents table
- Creates necessary indexes
- Updates RLS policies

## How to Apply Migrations

### Option 1: Supabase CLI (Recommended)
```bash
cd "C:\Users\monte\Documents\cert api token keys ids\supabase project deployment\rep-motivated-seller"
supabase db push --linked
```

### Option 2: Manual Application
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of each migration file in order
3. Execute SQL in the editor

## Database Functions

### GLBA Functions
```sql
-- Cleanup expired logs (7-year retention)
SELECT cleanup_expired_glba_logs();

-- Check key rotation status
SELECT * FROM check_key_rotation_needed();

-- Get compliance statistics (last 30 days)
SELECT * FROM get_compliance_statistics(30);
```

### PCI DSS Functions
```sql
-- Cleanup old logs (1-year retention)
SELECT cleanup_old_pci_logs();

-- Get security statistics (last 30 days)
SELECT * FROM get_pci_security_statistics(30);

-- Log payment attempt
SELECT log_payment_attempt(
    'user_id_here',
    'payment_success',
    29.99,
    'USD',
    'stripe',
    true,
    NULL,
    '4242'
);
```

## Security Features

### GLBA Compliance
- ✅ AES-256-GCM encryption (FIPS 140-2 approved)
- ✅ 90-day key rotation with 7-day early warning
- ✅ 7-year audit log retention (2,555 days)
- ✅ Role-based access control (RBAC)
- ✅ Document expiration and revocation
- ✅ Comprehensive audit trails

### PCI DSS Compliance
- ✅ No card data storage (tokenization only)
- ✅ CVV never stored (PCI DSS 3.2)
- ✅ 1-year minimum audit logs
- ✅ Payment attempt tracking
- ✅ Access denial logging
- ✅ Security violation monitoring

## Maintenance

### Scheduled Tasks (Recommended)
Set up cron jobs or scheduled functions to:
- Run `cleanup_expired_glba_logs()` weekly
- Run `cleanup_old_pci_logs()` monthly
- Run `check_key_rotation_needed()` daily

### Monitoring
Monitor these metrics regularly:
- Key rotation status
- Failed access attempts
- Payment failures
- Security violations
- Audit log size

## Troubleshooting

### Migration Errors
If you encounter errors during migration:
1. Check existing table schemas
2. Verify user permissions
3. Review Supabase logs
4. Apply migrations manually if needed

### Common Issues
- **Column already exists**: Safe to ignore, using IF NOT EXISTS
- **Extension already exists**: Safe to ignore
- **Permission denied**: Ensure proper database permissions

## Compliance Verification

### GLBA Verification Checklist
- [ ] All 7 tables created successfully
- [ ] RLS policies active
- [ ] Audit logs capturing events
- [ ] Key rotation functioning
- [ ] Document encryption working

### PCI DSS Verification Checklist
- [ ] pci_audit_logs table created
- [ ] Payment events being logged
- [ ] No card data in database
- [ ] CVV never stored
- [ ] Audit logs accessible

## Support
For questions or issues:
- Review Supabase documentation
- Check compliance requirements
- Contact security team: security@repmotivatedseller.com
