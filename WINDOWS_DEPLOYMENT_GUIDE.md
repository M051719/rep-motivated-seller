# Windows Deployment Guide for RepMotivatedSeller

This guide provides specific instructions for deploying the RepMotivatedSeller project on Windows environments.

## SSL Certificate Setup

### Certificate Files

Your SSL certificate files are located at:

- Certificate: `C:/nginx/conf/ssl/star_repmotivatedseller_shoprealestatespace_org.csr`
- Private Key: `C:/nginx/conf/ssl/star_repmotivatedseller_shoprealestatespace_org.key`

### Directory Structure

Ensure these directories exist:

```batch
mkdir C:\nginx\conf\ssl
```

## Nginx Configuration for Windows

### Basic Setup

1. Download Nginx for Windows from [nginx.org](http://nginx.org/en/download.html)
2. Extract to `C:\nginx`
3. Create SSL directory:
   ```batch
   mkdir C:\nginx\conf\ssl
   ```
4. Copy your SSL certificate files to this directory

### Generate DH Parameters

```batch
openssl dhparam -out C:/nginx/conf/dhparam.pem 2048
```

### Windows-Specific Nginx Configuration

Create `C:\nginx\conf\conf.d\repmotivatedseller-windows.conf`:

```nginx
server {
    listen 443 ssl;
    server_name repmotivatedseller.shoprealestatespace.org;

    ssl_certificate C:/nginx/conf/ssl/star_repmotivatedseller_shoprealestatespace_org.csr;
    ssl_certificate_key C:/nginx/conf/ssl/star_repmotivatedseller_shoprealestatespace_org.key;
    ssl_dhparam C:/nginx/conf/dhparam.pem;

    # Modern SSL/TLS Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets off;
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;

    # Security Headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Application root - adjust to your actual build output location
    root C:/Users/monte/Documents/cert api token keys ids/supabase project deployment/rep-motivated-seller/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        try_files $uri =404;
        access_log off;
        expires 30d;
        add_header Cache-Control "public";
    }
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name repmotivatedseller.shoprealestatespace.org;
    return 301 https://$host$request_uri;
}
```

### Update Main Nginx Configuration

Edit `C:\nginx\conf\nginx.conf` to include your configuration:

```nginx
# Add this line inside the http {} block
include conf.d/*.conf;
```

## Windows Batch Scripts

### Install Nginx as Windows Service

Create `scripts\install-nginx-windows.bat`:

```batch
@echo off
echo Installing Nginx as a Windows service...

REM Check if NSSM is available
where nssm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo NSSM (Non-Sucking Service Manager) is required but not found.
    echo Please download it from https://nssm.cc/download and add it to your PATH.
    exit /b 1
)

REM Install Nginx as a service
nssm install nginx C:\nginx\nginx.exe
nssm set nginx AppDirectory C:\nginx
nssm set nginx Description "Nginx Web Server for RepMotivatedSeller"
nssm set nginx Start SERVICE_AUTO_START

REM Start the service
nssm start nginx

if %ERRORLEVEL% EQU 0 (
    echo Nginx has been installed and started as a Windows service.
) else (
    echo Failed to install Nginx as a service. Please check the error message.
)

pause
```

### Deploy to Windows Server

Create `scripts\windows-deploy.bat`:

```batch
@echo off
echo ===================================================
echo RepMotivatedSeller Windows Deployment
echo ===================================================
echo.

REM Build the project
echo Building project...
cd ..
call npm run build
cd scripts

REM Create timestamp for backup
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "timestamp=%dt:~0,8%_%dt:~8,6%"

REM Backup existing deployment
echo Creating backup...
if exist "C:\nginx\html\repmotivatedseller" (
    mkdir "..\backups\%timestamp%\nginx-html"
    xcopy /E /I /Y "C:\nginx\html\repmotivatedseller" "..\backups\%timestamp%\nginx-html"
)

REM Deploy to Nginx
echo Deploying to Nginx...
mkdir "C:\nginx\html\repmotivatedseller" 2>nul
xcopy /E /I /Y "..\dist\*" "C:\nginx\html\repmotivatedseller"

REM Reload Nginx
echo Reloading Nginx...
C:\nginx\nginx.exe -s reload

echo.
echo ===================================================
echo Deployment complete!
echo ===================================================
echo.
echo Your site is now available at:
echo https://repmotivatedseller.shoprealestatespace.org
echo.
pause
```

## Environment Variables Setup

### Windows Environment Variables Script

Create `scripts\set-windows-env.bat`:

```batch
@echo off
echo ===================================================
echo Setting Windows Environment Variables
echo ===================================================
echo.

REM Supabase Configuration
setx VITE_SUPABASE_URL "https://ltxqodqlexvojqqxquew.supabase.co"
setx VITE_SUPABASE_ANON_KEY "sb_publishable_wQE2WLlEvqE1RqWtNPcxGw_tSpNMwmg"

REM MailerLite Configuration
setx MAILERLITE_API_KEY "your_mailerlite_api_key_here"
setx FROM_EMAIL "noreply@repmotivatedseller.org"

REM Email Recipients
setx ADMIN_EMAIL "admin@repmotivatedseller.org"
setx URGENT_EMAIL "urgent@repmotivatedseller.org"
setx MANAGER_EMAIL "manager@repmotivatedseller.org"

REM Site Configuration
setx SITE_URL "https://repmotivatedseller.shoprealestatespace.org"

REM CRM Configuration
setx CRM_TYPE "custom"
setx CUSTOM_CRM_URL "https://your-crm-api.com/webhook"
setx CUSTOM_CRM_API_KEY "your_custom_crm_api_key"

REM SMS Notifications (Twilio)
setx ENABLE_SMS_NOTIFICATIONS "true"
setx TWILIO_ACCOUNT_SID "ACe525412ae7e0751b4d9533d48b348066"
setx TWILIO_AUTH_TOKEN "4f1f31f680db649380efc82b041129a0"
setx TWILIO_PHONE_NUMBER "+18778064677"

echo.
echo Environment variables have been set.
echo You may need to restart your command prompt for changes to take effect.
echo.
pause
```

## Production Readiness Checklist for Windows

1. **SSL Certificate**
   - [ ] SSL certificate files are in `C:\nginx\conf\ssl`
   - [ ] DH parameters generated at `C:\nginx\conf\dhparam.pem`

2. **Nginx Configuration**
   - [ ] Nginx installed at `C:\nginx`
   - [ ] Configuration file created at `C:\nginx\conf\conf.d\repmotivatedseller-windows.conf`
   - [ ] Main nginx.conf updated to include conf.d directory
   - [ ] Nginx running as a Windows service (optional)

3. **Application Deployment**
   - [ ] Production build created with `npm run build`
   - [ ] Build files copied to `C:\nginx\html\repmotivatedseller`
   - [ ] Nginx reloaded to apply changes

4. **Environment Variables**
   - [ ] All required environment variables set using `set-windows-env.bat`
   - [ ] Command prompt restarted to apply environment variable changes

5. **DNS Configuration**
   - [ ] DNS A record for `repmotivatedseller.shoprealestatespace.org` points to your Windows server IP

6. **Firewall Configuration**
   - [ ] Windows Firewall allows incoming connections on ports 80 and 443

7. **Testing**
   - [ ] Site accessible at https://repmotivatedseller.shoprealestatespace.org
   - [ ] SSL certificate valid and trusted by browsers
   - [ ] All application features working correctly

## Troubleshooting Windows-Specific Issues

### Nginx Won't Start

1. Check if port 80/443 is already in use:

   ```batch
   netstat -ano | findstr :80
   netstat -ano | findstr :443
   ```

2. Verify paths in configuration files (Windows uses backslashes, but Nginx config uses forward slashes)

3. Check Nginx error log:
   ```batch
   type C:\nginx\logs\error.log
   ```

### SSL Certificate Issues

1. Verify certificate file paths in Nginx configuration
2. Ensure certificate files have correct permissions
3. Check if certificate is in the correct format (PEM)

### Application Not Loading

1. Verify the root path in Nginx configuration
2. Check for path case sensitivity issues
3. Ensure all application files are properly copied to the deployment directory

## Additional Windows Resources

- [Nginx for Windows Documentation](http://nginx.org/en/docs/windows.html)
- [NSSM - Non-Sucking Service Manager](https://nssm.cc/)
- [OpenSSL for Windows](https://slproweb.com/products/Win32OpenSSL.html)
