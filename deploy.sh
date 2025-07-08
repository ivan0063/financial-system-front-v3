#!/bin/bash

# Debt Control Frontend Deployment Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL:-"http://192.168.50.180:666"}
CONTAINER_NAME="debt-control-frontend"
IMAGE_NAME="debt-control-frontend"
PORT=${PORT:-3000}

echo -e "${GREEN}🚀 Debt Control Frontend Deployment${NC}"
echo "=================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
  exit 1
fi

echo -e "${YELLOW}📋 Configuration:${NC}"
echo "  API Base URL: $API_BASE_URL"
echo "  Container Name: $CONTAINER_NAME"
echo "  Port: $PORT"
echo ""

# Stop and remove existing container if it exists
if docker ps -a --format 'table {{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo -e "${YELLOW}🛑 Stopping existing container...${NC}"
  docker stop $CONTAINER_NAME
  docker rm $CONTAINER_NAME
fi

# Remove existing image if it exists
if docker images --format 'table {{.Repository}}' | grep -q "^${IMAGE_NAME}$"; then
  echo -e "${YELLOW}🗑️  Removing existing image...${NC}"
  docker rmi $IMAGE_NAME
fi

# Build the Docker image
echo -e "${YELLOW}🔨 Building Docker image...${NC}"
docker build -t $IMAGE_NAME .

# Run the container
echo -e "${YELLOW}🚀 Starting container...${NC}"
docker run -d \
  --name $CONTAINER_NAME \
  -p $PORT:3000 \
  -e NEXT_PUBLIC_API_BASE_URL=$API_BASE_URL \
  --restart unless-stopped \
  $IMAGE_NAME

# Wait for container to be ready
echo -e "${YELLOW}⏳ Waiting for application to start...${NC}"
sleep 10

# Health check
if curl -f http://localhost:$PORT/api/health > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Deployment successful!${NC}"
  echo -e "${GREEN}🌐 Application is running at: http://localhost:$PORT${NC}"
  echo -e "${GREEN}🏥 Health check: http://localhost:$PORT/api/health${NC}"
  echo -e "${GREEN}🔗 API Base URL: $API_BASE_URL${NC}"
else
  echo -e "${RED}❌ Health check failed. Check container logs:${NC}"
  echo "docker logs $CONTAINER_NAME"
  exit 1
fi

echo ""
echo -e "${GREEN}📊 Container Status:${NC}"
docker ps --filter name=$CONTAINER_NAME

echo ""
echo -e "${YELLOW}💡 Useful commands:${NC}"
echo "  View logs: docker logs $CONTAINER_NAME"
echo "  Stop app:  docker stop $CONTAINER_NAME"
echo "  Start app: docker start $CONTAINER_NAME"
echo "  Remove:    docker rm $CONTAINER_NAME"
