# Deployment Guide

Setup and deployment instructions based on actual project Dockerfile and docker-compose.yml.

---

## Local Development

### Prerequisites

- Node.js 20 or higher
- npm or yarn
- Docker (optional, for containerized development)
- Django backend running on localhost:8000

### Environment Setup

Create `.env.local`:

```env
BASE_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NODE_ENV=development
```

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Access dashboard at: `http://localhost:3000`

The development server includes hot-reload for code changes.

---

## Docker Development

### Build Docker Image

```bash
docker build -t chargeghar-dashboard:latest .
```

### Run with Docker

```bash
docker run -p 3000:3000 \
  -e BASE_URL=http://host.docker.internal:8000 \
  -e NODE_ENV=development \
  chargeghar-dashboard:latest
```

**Note:** Use `host.docker.internal` to access host machine services from container.

---

## Docker Compose Setup

### Start Full Stack

```bash
docker-compose up -d
```

This starts:

- Next.js dashboard on port 3000
- Django backend on port 8000 (if configured)
- PostgreSQL database (if configured)

### Stop Services

```bash
docker-compose down
```

### View Logs

```bash
docker-compose logs -f chargeghar-dashboard
```

---

## Build for Production

### Create Optimized Build

```bash
npm run build
```

This generates:

- Optimized bundles in `.next/`
- Compiled TypeScript
- Static site generation where applicable

### Verify Build Success

```bash
npm run build

# Output should show:
# ✓ Compiled successfully
# ✓ Finished TypeScript in X.Xs
# ✓ Generating static pages (N/N)
# ✓ Route optimization completed
```

### Run Production Server

```bash
npm start
```

Starts server on port 3000 in production mode.

---

## Production Environment

### Environment Variables

```env
BASE_URL=https://api.yourdomain.com
NEXT_PUBLIC_API_URL=https://admin.yourdomain.com/api
NODE_ENV=production
```

### Production Checklist

- [ ] Set NODE_ENV=production
- [ ] Update BASE_URL to production Django API
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS in backend
- [ ] Setup security headers
- [ ] Configure logging/monitoring
- [ ] Setup CDN for static assets
- [ ] Configure database backups
- [ ] Setup email notifications
- [ ] Test all features before deployment

---

## Dockerfile Analysis

### Current Dockerfile

```dockerfile
FROM node:20-slim              # Use Node.js 20 slim image
WORKDIR /app                   # Set working directory
COPY package*.json ./          # Copy dependencies
RUN npm install                # Install npm packages
COPY . .                        # Copy source code
EXPOSE 3000                     # Expose port 3000
CMD ["npm", "run", "dev"]     # Run development server
```

### Production Dockerfile (Recommended)

For production, use multi-stage build:

```dockerfile
# Build stage
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Runtime stage
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY --from=builder /app/.next ./.next
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Docker Compose Configuration

### Basic Setup

```yaml
version: "3.8"

services:
  chargeghar-dashboard:
    build: .
    ports:
      - "3000:3000"
    environment:
      - BASE_URL=http://localhost:8000
      - NODE_ENV=development
    volumes:
      - .:/app
      - /app/node_modules
```

### With Backend Integration

```yaml
version: "3.8"

services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - BASE_URL=http://backend:8000
      - NODE_ENV=development
    depends_on:
      - backend

  backend:
    build: ../chargeGhar-backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/chargeghar
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=chargeghar
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=admin
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## Performance Optimization

### Build Optimization

The project uses **Turbopack** for fast builds:

```bash
npm run build --turbopack

# Typical build time: 5-10 seconds
```

### Static File Caching

```nginx
# Configure in reverse proxy (Nginx/Apache)
location /_next/static {
  expires 365d;
  add_header Cache-Control "public, immutable";
}
```

### Image Optimization

Next.js automatically optimizes images using `/api/images`:

```tsx
import Image from "next/image";

<Image
  src="/assets/chart.png"
  alt="Chart"
  width={800}
  height={600}
  priority={true} // Load above-the-fold
/>;
```

---

## Deployment to Cloud

### Vercel (Recommended for Next.js)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy

```bash
npm install -g vercel
vercel
```

### Heroku

```bash
heroku create chargeghar-dashboard
heroku config:set BASE_URL=https://api.yourdomain.com
git push heroku main
```

### AWS/DigitalOcean/VPS

```bash
# Build
npm run build

# Transfer to server
scp -r .next/ server:/app/

# Run on server
npm start
```

---

## Monitoring & Logging

### Health Check Endpoint

```bash
GET /api/admin/system-health
Authorization: Bearer <token>

Response: {
  "status": "healthy",
  "database": "connected",
  "uptime": 3600000
}
```

### View System Logs

```bash
GET /api/admin/system-logs
Authorization: Bearer <token>
```

---

## Troubleshooting

### Build Fails with TypeScript Errors

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Cannot Connect to Backend

- Verify `BASE_URL` in `.env.local` or `.env.production`
- Ensure backend is running
- Check CORS configuration in backend
- Verify firewall rules

### High Memory Usage

```bash
# Check Node process
ps aux | grep node

# Increase memory limit
NODE_OPTIONS="--max-old-space-size=2048" npm start
```

### Port 3000 Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm start
```

---

## Scaling Considerations

- Use **load balancer** for multiple instances
- Configure **database connection pooling**
- Setup **Redis caching** for sessions
- Use **CDN** for static assets
- Monitor **CPU and memory** usage
- Setup **alerting** for failures

---

**Last Updated:** November 13, 2025
**Version:** 2.0.0 (Based on Actual Project Dockerfile)
