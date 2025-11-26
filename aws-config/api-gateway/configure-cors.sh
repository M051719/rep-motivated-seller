#!/bin/bash

# Load configuration
API_ID=$(cat api-config.json | grep -o '"api_id": "[^"]*' | cut -d'"' -f4)
RESOURCE_ID=$(cat api-config.json | grep -o '"synthesize_resource_id": "[^"]*' | cut -d'"' -f4)
AWS_REGION="us-east-1"

echo "Configuring advanced CORS..."

# Configure POST method response headers
aws apigateway put-method-response \
    --rest-api-id $API_ID \
    --resource-id $RESOURCE_ID \
    --http-method POST \
    --status-code 200 \
    --response-parameters method.response.header.Access-Control-Allow-Origin=false \
    --region $AWS_REGION

aws apigateway put-method-response \
    --rest-api-id $API_ID \
    --resource-id $RESOURCE_ID \
    --http-method POST \
    --status-code 400 \
    --response-parameters method.response.header.Access-Control-Allow-Origin=false \
    --region $AWS_REGION

aws apigateway put-method-response \
    --rest-api-id $API_ID \
    --resource-id $RESOURCE_ID \
    --http-method POST \
    --status-code 500 \
    --response-parameters method.response.header.Access-Control-Allow-Origin=false \
    --region $AWS_REGION

# Since using AWS_PROXY integration, CORS headers should be handled in Lambda
echo "CORS configuration complete. Make sure your Lambda function returns proper CORS headers."

# Deploy changes
aws apigateway create-deployment \
    --rest-api-id $API_ID \
    --stage-name prod \
    --description "CORS configuration update" \
    --region $AWS_REGION

echo "API redeployed with CORS configuration"