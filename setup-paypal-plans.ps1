# Setup PayPal Subscription Plans for RepMotivatedSeller
# PowerShell script for creating PayPal billing plans via API

param(
    [string]$Mode = "sandbox"  # sandbox or live
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PayPal Subscription Setup - RepMotivatedSeller" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Load environment variables
$envFile = if (Test-Path .env.development) { ".env.development" } else { ".env" }
Write-Host "Loading credentials from: $envFile" -ForegroundColor Yellow

$clientId = (Get-Content $envFile | Select-String "PAYPAL_API_CLIENT_ID").ToString().Split("=")[1].Trim()
$secret = (Get-Content $envFile | Select-String "PAYPAL_API_SECRET").ToString().Split("=")[1].Trim()

if (-not $clientId -or -not $secret) {
    Write-Host "Error: PayPal credentials not found in $envFile" -ForegroundColor Red
    exit 1
}

Write-Host "Client ID found: $($clientId.Substring(0, 20))..." -ForegroundColor Green
Write-Host ""

# Set API endpoint based on mode
$baseUrl = if ($Mode -eq "live") { "https://api-m.paypal.com" } else { "https://api-m.sandbox.paypal.com" }
Write-Host "Using $Mode mode: $baseUrl" -ForegroundColor Cyan
Write-Host ""

# Get OAuth token
Write-Host "Getting OAuth access token..." -ForegroundColor Yellow

$authHeader = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${clientId}:${secret}"))
$tokenResponse = Invoke-RestMethod -Uri "$baseUrl/v1/oauth2/token" -Method Post -Headers @{
    "Authorization" = "Basic $authHeader"
    "Content-Type"  = "application/x-www-form-urlencoded"
} -Body "grant_type=client_credentials"

$accessToken = $tokenResponse.access_token
Write-Host "Access token obtained!" -ForegroundColor Green
Write-Host ""

# Function to create product
function Create-PayPalProduct {
    param($name, $description, $accessToken, $baseUrl)

    $productBody = @{
        name        = $name
        description = $description
        type        = "SERVICE"
        category    = "SOFTWARE"
    } | ConvertTo-Json

    $product = Invoke-RestMethod -Uri "$baseUrl/v1/catalogs/products" -Method Post -Headers @{
        "Authorization" = "Bearer $accessToken"
        "Content-Type"  = "application/json"
    } -Body $productBody

    return $product.id
}

# Function to create billing plan
function Create-PayPalPlan {
    param($productId, $planName, $price, $accessToken, $baseUrl)

    $planBody = @{
        product_id          = $productId
        name                = $planName
        description         = $planName
        billing_cycles      = @(
            @{
                frequency      = @{
                    interval_unit  = "MONTH"
                    interval_count = 1
                }
                tenure_type    = "REGULAR"
                sequence       = 1
                total_cycles   = 0
                pricing_scheme = @{
                    fixed_price = @{
                        value         = $price.ToString()
                        currency_code = "USD"
                    }
                }
            }
        )
        payment_preferences = @{
            auto_bill_outstanding     = $true
            setup_fee_failure_action  = "CONTINUE"
            payment_failure_threshold = 3
        }
    } | ConvertTo-Json -Depth 10

    $plan = Invoke-RestMethod -Uri "$baseUrl/v1/billing/plans" -Method Post -Headers @{
        "Authorization" = "Bearer $accessToken"
        "Content-Type"  = "application/json"
        "Prefer"        = "return=representation"
    } -Body $planBody

    return $plan.id
}

Write-Host "Creating PayPal Products and Plans..." -ForegroundColor Yellow
Write-Host ""

# =============================================================================
# BASIC MEMBERSHIP
# =============================================================================
Write-Host "1. Creating Basic Membership..." -ForegroundColor Cyan

$basicProductId = Create-PayPalProduct -name "Basic Membership - RepMotivatedSeller" `
    -description "Access to educational content and community" `
    -accessToken $accessToken -baseUrl $baseUrl

Write-Host "   Product ID: $basicProductId" -ForegroundColor Green

$basicPlanId = Create-PayPalPlan -productId $basicProductId -planName "Basic Monthly Plan" `
    -price 29 -accessToken $accessToken -baseUrl $baseUrl

Write-Host "   Plan ID: $basicPlanId" -ForegroundColor Green
Write-Host ""

# =============================================================================
# PREMIUM MEMBERSHIP
# =============================================================================
Write-Host "2. Creating Premium Membership..." -ForegroundColor Cyan

$premiumProductId = Create-PayPalProduct -name "Premium Membership - RepMotivatedSeller" `
    -description "Premium features with consultations" `
    -accessToken $accessToken -baseUrl $baseUrl

Write-Host "   Product ID: $premiumProductId" -ForegroundColor Green

$premiumPlanId = Create-PayPalPlan -productId $premiumProductId -planName "Premium Monthly Plan" `
    -price 49 -accessToken $accessToken -baseUrl $baseUrl

Write-Host "   Plan ID: $premiumPlanId" -ForegroundColor Green
Write-Host ""

# =============================================================================
# VIP MEMBERSHIP
# =============================================================================
Write-Host "3. Creating VIP Membership..." -ForegroundColor Cyan

$vipProductId = Create-PayPalProduct -name "VIP Membership - RepMotivatedSeller" `
    -description "All features with white-glove service" `
    -accessToken $accessToken -baseUrl $baseUrl

Write-Host "   Product ID: $vipProductId" -ForegroundColor Green

$vipPlanId = Create-PayPalPlan -productId $vipProductId -planName "VIP Monthly Plan" `
    -price 97 -accessToken $accessToken -baseUrl $baseUrl

Write-Host "   Plan ID: $vipPlanId" -ForegroundColor Green
Write-Host ""

# =============================================================================
# SUMMARY
# =============================================================================
Write-Host "========================================" -ForegroundColor Green
Write-Host "All PayPal Plans Created Successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Add these to your .env file:" -ForegroundColor Yellow
Write-Host ""
Write-Host "# PayPal Configuration" -ForegroundColor Gray
Write-Host "VITE_PAYPAL_CLIENT_ID=$clientId" -ForegroundColor Cyan
Write-Host "PAYPAL_MODE=$Mode" -ForegroundColor Cyan
Write-Host ""
Write-Host "# PayPal Plan IDs" -ForegroundColor Gray
Write-Host "PAYPAL_BASIC_PLAN_ID=$basicPlanId" -ForegroundColor Cyan
Write-Host "PAYPAL_PREMIUM_PLAN_ID=$premiumPlanId" -ForegroundColor Cyan
Write-Host "PAYPAL_VIP_PLAN_ID=$vipPlanId" -ForegroundColor Cyan
Write-Host ""

# Save to file
$output = @"
# PayPal Product and Plan IDs for RepMotivatedSeller
# Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# Mode: $Mode

# Configuration
VITE_PAYPAL_CLIENT_ID=$clientId
PAYPAL_MODE=$Mode

# Basic Membership - `$29/month
PAYPAL_BASIC_PRODUCT_ID=$basicProductId
PAYPAL_BASIC_PLAN_ID=$basicPlanId

# Premium Membership - `$49/month
PAYPAL_PREMIUM_PRODUCT_ID=$premiumProductId
PAYPAL_PREMIUM_PLAN_ID=$premiumPlanId

# VIP Membership - `$97/month
PAYPAL_VIP_PRODUCT_ID=$vipProductId
PAYPAL_VIP_PLAN_ID=$vipPlanId
"@

$output | Out-File -FilePath "paypal-ids.txt" -Encoding UTF8
Write-Host "Saved to paypal-ids.txt" -ForegroundColor Green
Write-Host ""

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Copy these IDs to your .env files" -ForegroundColor White
Write-Host "2. Implement PayPal buttons in your frontend" -ForegroundColor White
Write-Host "3. Test subscription flow" -ForegroundColor White
Write-Host "4. Set up webhooks (see docs/paypal-integration-guide.md)" -ForegroundColor White
Write-Host ""
Write-Host "Done!" -ForegroundColor Green
