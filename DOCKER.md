# Docker Deployment Guide

This guide explains how to deploy the Debt Control Frontend application using Docker.

## Prerequisites

- Docker installed and running
- Docker Compose (optional, for advanced deployments)
- Access to your API server

## Quick Start

### 1. Environment Setup

Copy the environment template and configure your API URL:

\`\`\`bash
cp .env.example .env
\`\`\`

Edit `.env` and set your API URL:
\`\`\`env
NEXT_PUBLIC_API_BASE_URL=http://your-api-host:port
\`\`\`

### 2. Simple Deployment

Use the deployment script for quick setup:

\`\`\`bash
# Set your API URL and deploy
export API_BASE_URL=http://your-api-host:port
chmod +x deploy.sh
./deploy.sh
\`\`\`

### 3. Manual Docker Build

If you prefer manual control:

\`\`\`bash
# Build the image
docker build -t debt-control-frontend .

# Run the container
docker run -d \
  --name debt-control-frontend \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_BASE_URL=http://your-api-host:port \
  --restart unless-stopped \
  debt-control-frontend
\`\`\`

## Docker Compose Deployment

For production deployments with additional services:

### Basic Deployment

\`\`\`bash
# Set environment variables
export API_BASE_URL=http://your-api-host:port

# Deploy
docker-compose up --build -d
\`\`\`

### Production Deployment with Nginx

\`\`\`bash
# Deploy with nginx reverse proxy
docker-compose --profile production up --build -d
\`\`\`

## Configuration Options

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | API server URL | `http://192.168.50.180:666` |
| `PORT` | Application port | `3000` |
| `NODE_ENV` | Environment mode | `production` |

### Docker Run Options

\`\`\`bash
docker run -d \
  --name debt-control-frontend \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_BASE_URL=http://api.example.com:8080 \
  -e NODE_ENV=production \
  --restart unless-stopped \
  --health-cmd="curl -f http://localhost:3000/api/health || exit 1" \
  --health-interval=30s \
  --health-timeout=10s \
  --health-retries=3 \
  debt-control-frontend
\`\`\`

## Health Monitoring

The application includes a health check endpoint:

\`\`\`bash
# Check application health
curl http://localhost:3000/api/health
\`\`\`

Response:
\`\`\`json
{
  "status": "ok",
  "timestamp": "2024-01-07T12:00:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "apiBaseUrl": "http://your-api-host:port"
}
\`\`\`

## Troubleshooting

### Container Logs

\`\`\`bash
# View container logs
docker logs debt-control-frontend

# Follow logs in real-time
docker logs -f debt-control-frontend
\`\`\`

### Common Issues

1. **API Connection Failed**
   - Verify API URL is correct and accessible
   - Check network connectivity between containers
   - Ensure API server is running

2. **Port Already in Use**
   \`\`\`bash
   # Use different port
   docker run -p 8080:3000 ...
   \`\`\`

3. **Container Won't Start**
   \`\`\`bash
   # Check container status
   docker ps -a
   
   # Inspect container
   docker inspect debt-control-frontend
   \`\`\`

### Performance Tuning

For production deployments:

\`\`\`bash
# Limit memory usage
docker run --memory=512m --cpus=1.0 ...

# Use specific restart policy
docker run --restart=on-failure:3 ...
\`\`\`

## Updating the Application

\`\`\`bash
# Pull latest changes
git pull origin main

# Rebuild and redeploy
./deploy.sh
\`\`\`

## Backup and Maintenance

### Container Backup

\`\`\`bash
# Export container
docker export debt-control-frontend > debt-control-backup.tar

# Import container
docker import debt-control-backup.tar debt-control-frontend:backup
\`\`\`

### Cleanup

\`\`\`bash
# Remove container
docker stop debt-control-frontend
docker rm debt-control-frontend

# Remove image
docker rmi debt-control-frontend

# Clean up unused resources
docker system prune -a
\`\`\`

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to version control
2. **Network Security**: Use HTTPS in production
3. **Container Security**: Run containers with non-root user (already configured)
4. **Resource Limits**: Set appropriate memory and CPU limits

## Production Checklist

- [ ] Environment variables configured
- [ ] HTTPS/SSL certificates installed
- [ ] Health checks configured
- [ ] Monitoring and logging set up
- [ ] Backup strategy implemented
- [ ] Resource limits configured
- [ ] Security policies applied

For additional support, check the application logs or contact the development team.
