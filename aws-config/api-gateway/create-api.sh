#!/bin/bash

# Configuration
API_NAME="tts-processor-api"
LAMBDA_FUNCTION_NAME="tts-processor"
AWS_ACCOUNT_ID="your-account-id"
AWS_REGION="us-east-1"
STAGE_NAME="prod"

echo "Creating REST API..."
API_ID=$(aws apigateway create-rest-api \
    --name $API_NAME \
    --description "TTS Processing API for Real Estate Platform" \
    --endpoint-configuration types=REGIONAL \
    --query 'id' \
    --output text \
    --region $AWS_REGION)

echo "API ID: $API_ID"

# Get root resource ID
ROOT_RESOURCE_ID=$(aws apigateway get-resources \
    --rest-api-id $API_ID \
    --query 'items[0].id' \
    --output text \
    --region $AWS_REGION)

echo "Root Resource ID: $ROOT_RESOURCE_ID"

# Create /synthesize resource
SYNTHESIZE_RESOURCE_ID=$(aws apigateway create-resource \
    --rest-api-id $API_ID \
    --parent-id $ROOT_RESOURCE_ID \
    --path-part "synthesize" \
    --query 'id' \
    --output text \
    --region $AWS_REGION)

echo "Synthesize Resource ID: $SYNTHESIZE_RESOURCE_ID"

# Create POST method
aws apigateway put-method \
    --rest-api-id $API_ID \
    --resource-id $SYNTHESIZE_RESOURCE_ID \
    --http-method POST \
    --authorization-type AWS_IAM \
    --region $AWS_REGION

# Create OPTIONS method for CORS
aws apigateway put-method \
    --rest-api-id $API_ID \
    --resource-id $SYNTHESIZE_RESOURCE_ID \
    --http-method OPTIONS \
    --authorization-type NONE \
    --region $AWS_REGION

# Configure Lambda integration
LAMBDA_ARN="arn:aws:lambda:$AWS_REGION:$AWS_ACCOUNT_ID:function:$LAMBDA_FUNCTION_NAME"

aws apigateway put-integration \
    --rest-api-id $API_ID \
    --resource-id $SYNTHESIZE_RESOURCE_ID \
    --http-method POST \
    --type AWS_PROXY \
    --integration-http-method POST \
    --uri "arn:aws:apigateway:$AWS_REGION:lambda:path/2015-03-31/functions/$LAMBDA_ARN/invocations" \
    --region $AWS_REGION

# Configure CORS OPTIONS integration
aws apigateway put-integration \
    --rest-api-id $API_ID \
    --resource-id $SYNTHESIZE_RESOURCE_ID \
    --http-method OPTIONS \
    --type MOCK \
    --integration-http-method OPTIONS \
    --request-templates '{"application/json": "{\"statusCode\": 200}"}' \
    --region $AWS_REGION

# Configure OPTIONS method response
aws apigateway put-method-response \
    --rest-api-id $API_ID \
    --resource-id $SYNTHESIZE_RESOURCE_ID \
    --http-method OPTIONS \
    --status-code 200 \
    --response-parameters method.response.header.Access-Control-Allow-Headers=false,method.response.header.Access-Control-Allow-Methods=false,method.response.header.Access-Control-Allow-Origin=false \
    --region $AWS_REGION

# Configure OPTIONS integration response
aws apigateway put-integration-response \
    --rest-api-id $API_ID \
    --resource-id $SYNTHESIZE_RESOURCE_ID \
    --http-method OPTIONS \
    --status-code 200 \
    --response-parameters '{"method.response.header.Access-Control-Allow-Headers": "'"'"'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"'"'","method.response.header.Access-Control-Allow-Methods": "'"'"'GET,POST,OPTIONS'"'"'","method.response.header.Access-Control-Allow-Origin": "'"'"'*'"'"'"}' \
    --region $AWS_REGION

# Grant API Gateway permission to invoke Lambda
aws lambda add-permission \
    --function-name $LAMBDA_FUNCTION_NAME \
    --statement-id "apigateway-invoke-$API_ID" \
    --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:$AWS_REGION:$AWS_ACCOUNT_ID:$API_ID/*/*" \
    --region $AWS_REGION

# Deploy API
DEPLOYMENT_ID=$(aws apigateway create-deployment \
    --rest-api-id $API_ID \
    --stage-name $STAGE_NAME \
    --stage-description "Production stage for TTS API" \
    --description "Initial deployment" \
    --query 'id' \
    --output text \
    --region $AWS_REGION)

echo "Deployment ID: $DEPLOYMENT_ID"
echo "API Endpoint: https://$API_ID.execute-api.$AWS_REGION.amazonaws.com/$STAGE_NAME"

# Save configuration
cat > api-config.json << EOF
{
  "api_id": "$API_ID",
  "root_resource_id": "$ROOT_RESOURCE_ID",
  "synthesize_resource_id": "$SYNTHESIZE_RESOURCE_ID",
  "deployment_id": "$DEPLOYMENT_ID",
  "endpoint": "https://$API_ID.execute-api.$AWS_REGION.amazonaws.com/$STAGE_NAME",
  "stage_name": "$STAGE_NAME",
  "region": "$AWS_REGION"
}
EOF

echo "Configuration saved to api-config.json"