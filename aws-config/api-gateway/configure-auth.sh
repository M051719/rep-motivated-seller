#!/bin/bash

# Load configuration
API_ID=$(cat api-config.json | grep -o '"api_id": "[^"]*' | cut -d'"' -f4)
RESOURCE_ID=$(cat api-config.json | grep -o '"synthesize_resource_id": "[^"]*' | cut -d'"' -f4)
AWS_REGION="us-east-1"

echo "Configuring API Key authentication..."

# Create API Key
API_KEY=$(aws apigateway create-api-key \
    --name "tts-api-key" \
    --description "API Key for TTS Processing" \
    --enabled \
    --query 'id' \
    --output text \
    --region $AWS_REGION)

echo "API Key ID: $API_KEY"

# Create Usage Plan
USAGE_PLAN_ID=$(aws apigateway create-usage-plan \
    --name "tts-usage-plan" \
    --description "Usage plan for TTS API" \
    --throttle burstLimit=100,rateLimit=50 \
    --quota limit=10000,offset=0,period=MONTH \
    --api-stages apiId=$API_ID,stage=prod \
    --query 'id' \
    --output text \
    --region $AWS_REGION)

echo "Usage Plan ID: $USAGE_PLAN_ID"

# Associate API Key with Usage Plan
aws apigateway create-usage-plan-key \
    --usage-plan-id $USAGE_PLAN_ID \
    --key-id $API_KEY \
    --key-type API_KEY \
    --region $AWS_REGION

# Update method to require API Key
aws apigateway update-method \
    --rest-api-id $API_ID \
    --resource-id $RESOURCE_ID \
    --http-method POST \
    --patch-ops op=replace,path=/apiKeyRequired,value=true \
    --region $AWS_REGION

# Get the actual API Key value
API_KEY_VALUE=$(aws apigateway get-api-key \
    --api-key $API_KEY \
    --include-value \
    --query 'value' \
    --output text \
    --region $AWS_REGION)

echo "API Key Value: $API_KEY_VALUE"

# Update configuration file
cat > api-config.json << EOF
{
  "api_id": "$API_ID",
  "synthesize_resource_id": "$RESOURCE_ID",
  "endpoint": "https://$API_ID.execute-api.$AWS_REGION.amazonaws.com/prod",
  "api_key_id": "$API_KEY",
  "api_key_value": "$API_KEY_VALUE",
  "usage_plan_id": "$USAGE_PLAN_ID",
  "stage_name": "prod",
  "region": "$AWS_REGION"
}
EOF

echo "Updated configuration saved to api-config.json"