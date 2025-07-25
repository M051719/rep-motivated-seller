# Nginx Setup Guide for RepMotivatedSeller

This guide provides detailed instructions for setting up Nginx to host the RepMotivatedSeller application in both development and production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration Files](#configuration-files)
4. [SSL Setup](#ssl-setup)
5. [Windows-Specific Setup](#windows-specific-setup)
6. [Testing and Verification](#testing-and-verification)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

- A server with root/administrator access
- Domain name pointing to your server (for production)
- SSL certificate (for production)

## Installation

### Linux (Ubuntu/Debian)

```bash
# Update package lists
sudo apt update

# Install Nginx
sudo apt install nginx

# Start Nginx service
sudo systemctl start nginx

# Enable Nginx to start on boot
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

### Windows

1. Download Nginx for Windows from [nginx.org](http://nginx.org/en/download.html)
2. Extract to a location like `C:\nginx`
3. Run the installation script:

```batch
scripts\install-nginx-windows.bat
```

## Configuration Files

### Production Configuration

Create or edit `/etc/nginx/conf.d/repmotivatedseller.conf`:

```nginx
server {
    listen 443 ssl http2;
    server_name repmotivatedseller.shoprealestatespace.org;

    # SSL modern config
    include /etc/nginx/conf.d/ssl-modern.conf;

    root /var/www/repmotivatedseller/dist;

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

### SSL Configuration

Create or edit `/etc/nginx/conf.d/ssl-modern.conf`:

```nginx
# Modern SSL/TLS Configuration for Cloudflare Compatibility

ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
ssl_session_tickets off;
ssl_stapling on;
ssl_stapling_verify on;
resolver 8.8.8.8 8.8.4.4 1.1.1.1 1.0.0.1 valid=300s;
resolver_timeout 5s;
ssl_dhparam /etc/nginx/ssl/dhparam.pem;
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header X-Frame-Options DENY always;
add_header X-Content-Type-Options nosniff always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
ssl_buffer_size 8k;
ssl_early_data on;
```

### Windows Development Configuration

Create or edit `C:\nginx\conf\conf.d\repmotivatedseller-windows.conf`:

```nginx
server {
    listen 80;
    server_name localhost;

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
```

## SSL Setup

### Generate DH Parameters

```bash
# Create directory for SSL files
sudo mkdir -p /etc/nginx/ssl

# Generate DH parameters (this may take some time)
sudo openssl dhparam -out /etc/nginx/ssl/dhparam.pem 2048
```

### Install SSL Certificate

#### Option 1: Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain and install certificate
sudo certbot --nginx -d repmotivatedseller.shoprealestatespace.org

# Test automatic renewal
sudo certbot renew --dry-run
```

#### Option 2: Manual Certificate Installation

If you have your own SSL certificate:

```bash
# Copy certificate files
sudo cp your-cert.crt /etc/nginx/ssl/repmotivatedseller.crt
sudo cp your-key.key /etc/nginx/ssl/repmotivatedseller.key

# Update Nginx configuration
sudo nano /etc/nginx/conf.d/repmotivatedseller.conf
```

Add these lines inside the server block:

```nginx
ssl_certificate /etc/nginx/ssl/repmotivatedseller.crt;
ssl_certificate_key /etc/nginx/ssl/repmotivatedseller.key;
```

### Automated SSL Setup

For convenience, use the provided script:

```bash
# Make script executable
chmod +x scripts/install-nginx-ssl.sh

# Run the script
sudo ./scripts/install-nginx-ssl.sh
```

## Windows-Specific Setup

### Start Nginx on Windows

```batch
# Start Nginx
C:\nginx\nginx.exe

# Reload configuration
C:\nginx\nginx.exe -s reload

# Stop Nginx
C:\nginx\nginx.exe -s stop
```

### Create Windows Service (Optional)

1. Download [NSSM (Non-Sucking Service Manager)](https://nssm.cc/download)
2. Install Nginx as a service:

```batch
nssm install nginx C:\nginx\nginx.exe
nssm set nginx AppDirectory C:\nginx
nssm start nginx
```

## Testing and Verification

### Test Nginx Configuration

```bash
# Linux
sudo nginx -t

# Windows
C:\nginx\nginx.exe -t
```

### Verify Site Accessibility

1. Open a web browser
2. Navigate to your domain (production) or localhost (development)
3. Verify the site loads correctly
4. Check for HTTPS padlock (production)

### Test SSL Configuration (Production)

Use [SSL Labs](https://www.ssllabs.com/ssltest/) to test your SSL configuration:

1. Go to https://www.ssllabs.com/ssltest/
2. Enter your domain name
3. Wait for the test to complete
4. Aim for an A+ rating

## Troubleshooting

### Common Issues

#### 1. 502 Bad Gateway

**Possible causes:**
- Application server not running
- Incorrect proxy configuration

**Solutions:**
- Check if your application server is running
- Verify proxy_pass settings in Nginx config
- Check Nginx error logs

#### 2. 404 Not Found

**Possible causes:**
- Incorrect root directory path
- Missing index.html file

**Solutions:**
- Verify the path in the `root` directive
- Check if index.html exists in the specified directory
- Ensure the Nginx user has read permissions

#### 3. SSL Certificate Issues

**Possible causes:**
- Certificate expired
- Incorrect certificate path
- Missing intermediate certificates

**Solutions:**
- Renew certificate if expired
- Verify certificate paths in configuration
- Ensure complete certificate chain is installed

### Viewing Logs

```bash
# Linux
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Windows
tail -f C:\nginx\logs\error.log
tail -f C:\nginx\logs\access.log
```

### Restarting Nginx

```bash
# Linux
sudo systemctl restart nginx

# Windows
C:\nginx\nginx.exe -s stop
C:\nginx\nginx.exe
```

## Additional Resources

- [Nginx Documentation](https://nginx.org/en/docs/)
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

---

For additional assistance, refer to the project documentation or contact the development team.