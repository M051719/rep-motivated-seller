# Manual Nginx Configuration Instructions

## Step 1: Open Command Prompt as Administrator
1. Press Windows key
2. Type "cmd"
3. Right-click on "Command Prompt" and select "Run as administrator"

## Step 2: Navigate to Nginx Directory
```
cd /d C:\nginx
```

## Step 3: Copy the Configuration File
```
copy "C:\Users\monte\Documents\cert api token keys ids\supabase project deployment\rep-motivated-seller\nginx.conf.txt" conf\nginx.conf
```

## Step 4: Reload Nginx
```
nginx -s reload
```

## Step 5: Test Your Configuration
Open a web browser and go to:
http://localhost/

You should see your RepMotivatedSeller project page.

## Troubleshooting
If you encounter any issues:
1. Check the Nginx error log: `C:\nginx\logs\error.log`
2. Make sure the project directory exists
3. Verify that the paths in the configuration file are correct
4. Try stopping and starting Nginx:
   ```
   nginx -s stop
   nginx
   ```