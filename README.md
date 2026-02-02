# RepMotivatedSeller Documentation

This repository contains comprehensive documentation for the RepMotivatedSeller foreclosure assistance platform.

## Available Documentation

### Core Guides
- [Project History and Walkthrough](PROJECT_HISTORY_AND_WALKTHROUGH.md)
- [Task Checklists](TASK_CHECKLISTS.md)
- [Visual Deployment Guide](VISUAL_DEPLOYMENT_GUIDE.md)
- [Quick Start Guide](QUICK_START_GUIDE.md)

### Detailed Guides
- [Detailed Deployment Guide](DETAILED_DEPLOYMENT_GUIDE.md)
- [Supabase Edge Functions Guide](SUPABASE_EDGE_FUNCTIONS_GUIDE.md)
- [Nginx Setup Guide](NGINX_SETUP_GUIDE.md)
- [Windows Deployment Guide](WINDOWS_DEPLOYMENT_GUIDE.md)
- [MailerLite Integration Guide](MAILERLITE_INTEGRATION_GUIDE.md)
- [Edge Functions Security Guide](EDGE_FUNCTIONS_SECURITY.md)
- [Troubleshooting Guide](TROUBLESHOOTING_GUIDE.md)
- [Production Readiness Checklist](PRODUCTION_READINESS_CHECKLIST.md)

## Accessing Documentation

### HTML Interface
Open the [DOCUMENTATION.html](DOCUMENTATION.html) file in your browser to access all documentation with download links.

### Download Documentation Package
Run the download script to create a downloadable package:

```batch
cd scripts
download-docs.bat
```

This will create:
- A `docs` directory with all documentation files
- A ZIP archive `RepMotivatedSeller-Documentation.zip`

### Convert to PDF
If you have Pandoc installed, you can convert all documentation to PDF:

```batch
cd scripts
convert-docs-to-pdf.bat
```

This will create:
- Individual PDF files for each document in the `pdf` directory
- A combined PDF with all documentation
- A ZIP archive of all PDF files

## Documentation Overview

### Project History and Walkthrough
A complete history of the project and detailed step-by-step instructions for all major processes.

### Task Checklists
Actionable checklists for all project tasks, including setup, deployment, and maintenance.

### Visual Deployment Guide
Visual representations of the deployment process, including architecture diagrams and configuration examples.

### Detailed Deployment Guide
A comprehensive guide covering all aspects of deploying the project.

### Supabase Edge Functions Guide
Detailed documentation for all Supabase Edge Functions used in the project.

### Nginx Setup Guide
Step-by-step instructions for setting up Nginx to host the application.

### Windows Deployment Guide
Windows-specific deployment instructions for the project.

### MailerLite Integration Guide
Comprehensive guide for MailerLite integration with the correct API endpoint.

### Edge Functions Security Guide
Security configuration for Supabase Edge Functions, including JWT verification.

### Troubleshooting Guide
Solutions for common issues you might encounter when working with the platform.

### Quick Start Guide
A concise guide for getting started quickly with the essential setup steps.

### Production Readiness Checklist
A comprehensive checklist of items to verify before going live.

## GitHub Tokens & Secrets (Quick Reference)

- **Create a GitHub token (PAT):** Navigate to GitHub **Settings** → **Developer settings** → **Personal access tokens** → choose **Fine-grained** or **Classic** → **Generate new token** → select scopes (for CI, `repo` is usually sufficient) → copy the token value.
- **Use the token with GitHub API:** Include headers `Authorization: Bearer <your_token>` (fine-grained) or `Authorization: token <your_token>` (classic PAT) and `Accept: application/vnd.github+json` when calling `https://api.github.com/...`. Replace `<your_token>` with the actual token string and keep it secret.
- **Store tokens as repo secrets for CI:** Go to repository **Settings** → **Secrets and variables** → **Actions** → **New repository secret**. Name it (e.g., `SNYK_TOKEN`, `GITHUB_TOKEN_CUSTOM`) and paste the PAT. Workflows can access it via `${{ secrets.SECRET_NAME }}`.
