#!/bin/bash

# Azure deployment script for AfvalAlert
# Usage: ./deployment/azure-deploy.sh <resource-group> <app-name> <gemini-key>

RESOURCE_GROUP=${1:-"afvalalert-rg"}
APP_NAME=${2:-"afvalalert-api"}
GEMINI_KEY=${3:-""}

# Create resource group if not exists
echo "Creating resource group $RESOURCE_GROUP..."
az group create --name $RESOURCE_GROUP --location "West Europe"

# Create App Service Plan (Basic tier for cost optimization)
echo "Creating App Service Plan..."
az appservice plan create \
    --name "${APP_NAME}-plan" \
    --resource-group $RESOURCE_GROUP \
    --sku B1 \
    --is-linux

# Create Web App
echo "Creating Web App..."
az webapp create \
    --resource-group $RESOURCE_GROUP \
    --plan "${APP_NAME}-plan" \
    --name $APP_NAME \
    --deployment-container-image-name "python:3.12-alpine"

# Configure environment variables
echo "Configuring environment variables..."
az webapp config appsettings set \
    --resource-group $RESOURCE_GROUP \
    --name $APP_NAME \
    --settings \
    GEMINI_API_KEY=$GEMINI_KEY \
    TF_CPP_MIN_LOG_LEVEL=3 \
    WEBSITES_PORT=8000

# Configure Docker container
echo "Setting container image..."
az webapp config container set \
    --resource-group $RESOURCE_GROUP \
    --name $APP_NAME \
    --docker-custom-image-name "python:3.12-alpine" \
    --docker-registry-server-url ""

# Enable logging
echo "Enabling logging..."
az webapp log config \
    --resource-group $RESOURCE_GROUP \
    --name $APP_NAME \
    --application-logging true \
    --detailed-error-messages true \
    --failed-request-tracing true \
    --web-server-logging filesystem

echo "Deployment completed!"
echo "App URL: https://$APP_NAME.azurewebsites.net"