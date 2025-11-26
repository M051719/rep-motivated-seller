#!/bin/bash

# Configuration
DOMAIN_NAME="api.yourdomain.com"  # Your custom domain
CERTIFICATE_ARN="arn:aws:acm:us-east-1:account:certificate/cert-id"  # Your SSL certificate
API_ID=$(cat api-config.json | grep -o '"api_id": "[^"]*' | cut -d'"' -f4)
AWS_REGION="us-east-1"

echo "Creating custom domain name..."

# Create custom domain
DOMAIN_NAME_CONFIG=$(aws apigateway create-domain-name \
    --domain-name $DOMAIN_NAME \
    --certificate-arn $CERTIFICATE_ARN \
    --endpoint-configuration types=REGIONAL \
    --security-policy TLS_1_2 \
    --region $AWS_REGION)

echo "Domain name created: $DOMAIN_NAME"

# Get the target domain name for DNS
TARGET_DOMAIN=$(echo $DOMAIN_NAME_CONFIG | grep -o '"domainNameStatus": "[^"]*' | cut -d'"' -f4)
echo "Target domain for DNS: $TARGET_DOMAIN"

# Create base path mapping
aws apigateway create-base-path-mapping \
    --domain-name $DOMAIN_NAME \
    --rest-api-id $API_ID \
    --stage prod \
    --base-path tts \
    --region $AWS_REGION

echo "Base path mapping created: $DOMAIN_NAME/tts"
echo "Your TTS API endpoint is now: https://$DOMAIN_NAME/tts/synthesize"
echo "Don't forget to create a CNAME record in your DNS pointing to: $TARGET_DOMAIN"

# Update configuration
cat >> api-config.json << EOF
{
  "custom_domain": "$DOMAIN_NAME",
  "custom_endpoint": "https://$DOMAIN_NAME/tts",
  "dns_target": "$TARGET_DOMAIN"
}