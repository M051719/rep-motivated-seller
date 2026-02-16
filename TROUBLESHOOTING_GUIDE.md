# RepMotivatedSeller Troubleshooting Guide

This guide provides solutions for common issues you might encounter when working with the RepMotivatedSeller platform.

## Table of Contents

1. [Build and Dependency Issues](#build-and-dependency-issues)
2. [Supabase Edge Function Issues](#supabase-edge-function-issues)
3. [Authentication Problems](#authentication-problems)
4. [Nginx Configuration Issues](#nginx-configuration-issues)
5. [Database Connection Issues](#database-connection-issues)
6. [Email and SMS Notification Issues](#email-and-sms-notification-issues)
7. [Windows-Specific Issues](#windows-specific-issues)

## Build and Dependency Issues

### Issue: esbuild errors during npm install or build

**Symptoms:**

- Error messages related to esbuild
- Build process fails with dependency errors

**Solutions:**

1. Run the fix-install script:

   ```bash
   scripts\fix-install.bat
   ```

2. Try clearing npm cache:

   ```bash
   npm cache clean --force
   npm install
   ```

3. Use the static HTML version as a fallback:
   ```bash
   scripts\open-html.bat
   ```

### Issue: "Cannot find module" errors

**Symptoms:**

- Error messages indicating missing modules
- Build fails with import errors

**Solutions:**

1. Check package.json for the missing dependency and install it:

   ```bash
   npm install missing-package-name
   ```

2. Reinstall all dependencies:
   ```bash
   rm -rf node_modules
   npm install
   ```

## Supabase Edge Function Issues

### Issue: Function deployment fails

**Symptoms:**

- Error messages during function deployment
- Function doesn't appear in Supabase dashboard

**Solutions:**

1. Check for TypeScript errors in your function code
2. Try deploying via the Supabase dashboard instead of CLI
3. Use the skip-ts-errors script for temporary workarounds:
   ```bash
   scripts\skip-ts-errors.bat
   ```

### Issue: Function returns 500 Internal Server Error

**Symptoms:**

- Function calls return 500 error
- No useful error message in response

**Solutions:**

1. Check function logs in Supabase dashboard
2. Verify all required environment variables are set:
   ```bash
   supabase secrets list --project-ref ltxqodqlexvojqqxquew
   ```
3. Add more error handling and logging to your function code

### Issue: Function times out

**Symptoms:**

- Function calls take too long and eventually time out
- Inconsistent responses

**Solutions:**

1. Optimize database queries in your function
2. Break complex operations into smaller functions
3. Add timeouts to external API calls

## Authentication Problems

### Issue: JWT token authentication fails

**Symptoms:**

- "Unauthorized" or "Invalid JWT token" errors
- 401 status codes from Edge Functions

**Solutions:**

1. Verify the JWT token is valid and not expired
2. Check that the user has admin privileges in the `admin_profiles` table
3. Ensure correct Authorization header format: `Bearer YOUR_TOKEN`

### Issue: Service role key not working

**Symptoms:**

- Authentication fails even with service role key
- "Forbidden" errors

**Solutions:**

1. Verify you're using the correct service role key
2. Check if the key has expired (unlikely but possible)
3. Try generating a new service role key in the Supabase dashboard

## Nginx Configuration Issues

### Issue: 502 Bad Gateway

**Symptoms:**

- Browser shows 502 Bad Gateway error
- Site is unreachable

**Solutions:**

1. Check if your application server is running
2. Verify proxy_pass settings in Nginx config
3. Check Nginx error logs:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

### Issue: SSL certificate problems

**Symptoms:**

- Browser shows certificate warnings
- HTTPS doesn't work properly

**Solutions:**

1. Verify certificate paths in Nginx configuration
2. Check if certificate has expired
3. Renew certificate if needed:
   ```bash
   sudo certbot renew
   ```

## Database Connection Issues

### Issue: "Error connecting to database" messages

**Symptoms:**

- Functions fail with database connection errors
- Queries return errors instead of data

**Solutions:**

1. Verify Supabase URL and keys in environment variables
2. Check if Supabase service is operational
3. Ensure database permissions are set correctly

### Issue: Missing tables or columns

**Symptoms:**

- "Table does not exist" errors
- "Column does not exist" errors

**Solutions:**

1. Check if migrations have been applied correctly
2. Run the initial schema migration:
   ```sql
   -- Run this in the Supabase SQL editor
   \i 'supabase/migrations/20230101000000_initial_schema.sql'
   ```

## Email and SMS Notification Issues

### Issue: Emails not being sent

**Symptoms:**

- No emails received when expected
- No error messages in logs

**Solutions:**

1. Verify MailerLite API key is set correctly:
   ```bash
   supabase secrets get MAILERLITE_API_KEY --project-ref ltxqodqlexvojqqxquew
   ```
2. Check email addresses are valid
3. Look for rate limiting or API errors in function logs

### Issue: SMS notifications not working

**Symptoms:**

- SMS messages not being sent
- Twilio-related errors in logs

**Solutions:**

1. Verify Twilio credentials are set correctly:
   ```bash
   scripts\set-twilio-secrets.bat
   ```
2. Check if ENABLE_SMS_NOTIFICATIONS is set to "true"
3. Verify phone numbers are in correct format (E.164)

## Windows-Specific Issues

### Issue: Path-related errors

**Symptoms:**

- "Cannot find path" errors
- File operations fail

**Solutions:**

1. Use double backslashes in file paths
2. Wrap paths in quotes when they contain spaces
3. Use absolute paths instead of relative paths

### Issue: Nginx doesn't start on Windows

**Symptoms:**

- Nginx fails to start
- Error messages about ports or configuration

**Solutions:**

1. Check if port 80 is already in use:
   ```batch
   netstat -ano | findstr :80
   ```
2. Run Nginx as administrator
3. Verify configuration paths are correct for Windows:
   ```batch
   C:\nginx\nginx.exe -t
   ```

### Issue: Batch scripts fail to run

**Symptoms:**

- Scripts exit immediately
- Error messages about commands not found

**Solutions:**

1. Run Command Prompt as administrator
2. Check if paths in scripts are correct
3. Ensure required tools (curl, etc.) are installed and in PATH

---

## Getting Additional Help

If you're still experiencing issues after trying these solutions:

1. Check the Supabase documentation: https://supabase.com/docs
2. Review the project README and other documentation files
3. Look for similar issues in the project repository
4. Contact the development team for assistance

Remember to include detailed information about the issue when seeking help:

- Exact error messages
- Steps to reproduce the problem
- Environment details (OS, Node.js version, etc.)
- Logs from relevant components
