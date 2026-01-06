# Setup Stripe Products and Prices for RepMotivatedSeller
# PowerShell script for creating Stripe subscription products

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Stripe Product Setup - RepMotivatedSeller" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Stripe CLI is installed
try {
    $stripeVersion = stripe --version
    Write-Host "✓ Stripe CLI installed: $stripeVersion" -ForegroundColor Green
}
catch {
    Write-Host "✗ Stripe CLI not found!" -ForegroundColor Red
    Write-Host "Install from: https://stripe.com/docs/stripe-cli" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Make sure you're logged in to Stripe CLI:" -ForegroundColor Yellow
Write-Host "  stripe login" -ForegroundColor Cyan
Write-Host ""

$continue = Read-Host "Continue with product creation? (y/n)"
if ($continue -ne 'y') {
    Write-Host "Cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Creating Stripe Products..." -ForegroundColor Yellow
Write-Host ""

# =============================================================================
# BASIC MEMBERSHIP
# =============================================================================
Write-Host "1. Creating Basic Membership Product..." -ForegroundColor Cyan

$basicProduct = stripe products create `
    --name "Basic Membership" `
    --description "Access to educational content and community" `
    --format json | ConvertFrom-Json

$basicProductId = $basicProduct.id
Write-Host "   ✓ Product created: $basicProductId" -ForegroundColor Green

# Create Basic Price
Write-Host "   Creating price ($29/month)..." -ForegroundColor Cyan

$basicPrice = stripe prices create `
    --product $basicProductId `
    --unit-amount 2900 `
    --currency usd `
    --recurring[interval]=month `
    --format json | ConvertFrom-Json

$basicPriceId = $basicPrice.id
Write-Host "   ✓ Price created: $basicPriceId" -ForegroundColor Green
Write-Host ""

# =============================================================================
# PREMIUM MEMBERSHIP
# =============================================================================
Write-Host "2. Creating Premium Membership Product..." -ForegroundColor Cyan

$premiumProduct = stripe products create `
    --name "Premium Membership" `
    --description "Premium features with consultations" `
    --format json | ConvertFrom-Json

$premiumProductId = $premiumProduct.id
Write-Host "   ✓ Product created: $premiumProductId" -ForegroundColor Green

# Create Premium Price
Write-Host "   Creating price ($49/month)..." -ForegroundColor Cyan

$premiumPrice = stripe prices create `
    --product $premiumProductId `
    --unit-amount 4900 `
    --currency usd `
    --recurring[interval]=month `
    --format json | ConvertFrom-Json

$premiumPriceId = $premiumPrice.id
Write-Host "   ✓ Price created: $premiumPriceId" -ForegroundColor Green
Write-Host ""

# =============================================================================
# VIP MEMBERSHIP
# =============================================================================
Write-Host "3. Creating VIP Membership Product..." -ForegroundColor Cyan

$vipProduct = stripe products create `
    --name "VIP Membership" `
    --description "All features with white-glove service" `
    --format json | ConvertFrom-Json

$vipProductId = $vipProduct.id
Write-Host "   ✓ Product created: $vipProductId" -ForegroundColor Green

# Create VIP Price
Write-Host "   Creating price ($97/month)..." -ForegroundColor Cyan

$vipPrice = stripe prices create `
    --product $vipProductId `
    --unit-amount 9700 `
    --currency usd `
    --recurring[interval]=month `
    --format json | ConvertFrom-Json

$vipPriceId = $vipPrice.id
Write-Host "   ✓ Price created: $vipPriceId" -ForegroundColor Green
Write-Host ""

# =============================================================================
# SUMMARY
# =============================================================================
Write-Host "========================================" -ForegroundColor Green
Write-Host "✓ All Products Created Successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Add these to your .env file:" -ForegroundColor Yellow
Write-Host ""
Write-Host "# Stripe Product IDs" -ForegroundColor Gray
Write-Host "STRIPE_BASIC_PRODUCT_ID=$basicProductId" -ForegroundColor Cyan
Write-Host "STRIPE_PREMIUM_PRODUCT_ID=$premiumProductId" -ForegroundColor Cyan
Write-Host "STRIPE_VIP_PRODUCT_ID=$vipProductId" -ForegroundColor Cyan
Write-Host ""
Write-Host "# Stripe Price IDs" -ForegroundColor Gray
Write-Host "STRIPE_BASIC_PRICE_ID=$basicPriceId" -ForegroundColor Cyan
Write-Host "STRIPE_PREMIUM_PRICE_ID=$premiumPriceId" -ForegroundColor Cyan
Write-Host "STRIPE_VIP_PRICE_ID=$vipPriceId" -ForegroundColor Cyan
Write-Host ""

# Optionally save to file
$saveToFile = Read-Host "Save these IDs to stripe-ids.txt? (y/n)"
if ($saveToFile -eq 'y') {
    $output = @"
# Stripe Product and Price IDs
# Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# Products
STRIPE_BASIC_PRODUCT_ID=$basicProductId
STRIPE_PREMIUM_PRODUCT_ID=$premiumProductId
STRIPE_VIP_PRODUCT_ID=$vipProductId

# Prices
STRIPE_BASIC_PRICE_ID=$basicPriceId
STRIPE_PREMIUM_PRICE_ID=$premiumPriceId
STRIPE_VIP_PRICE_ID=$vipPriceId
"@
    
    $output | Out-File -FilePath "stripe-ids.txt" -Encoding UTF8
    Write-Host "✓ Saved to stripe-ids.txt" -ForegroundColor Green
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Copy these IDs to your .env file" -ForegroundColor White
Write-Host "2. Update your frontend components with the price IDs" -ForegroundColor White
Write-Host "3. Test subscription flow in test mode" -ForegroundColor White
Write-Host "4. Set up webhooks (see docs/stripe-integration-guide.md)" -ForegroundColor White
Write-Host ""
Write-Host "Done! 🎉" -ForegroundColor Green
