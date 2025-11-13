# 🔌 ChargeGhar Admin Dashboard

> Comprehensive admin dashboard for managing EV charging stations, rentals, users, and platform analytics.

[![Next.js](https://img.shields.io/badge/Next.js-16.0.1-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2.0-blue?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.1.16-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Environment Setup](#environment-setup)
- [Available Scripts](#available-scripts)
- [API Integration](#api-integration)
- [Authentication](#authentication)
- [Docker Deployment](#docker-deployment)
- [Development Guidelines](#development-guidelines)
- [Contributing](#contributing)
- [Documentation](#documentation)

---

## 🎯 Overview

ChargeGhar is a full-featured admin dashboard for the ChargeGhar EV charging platform. It provides comprehensive management capabilities for:

- **User Management** - Create, update, and manage user accounts
- **Station Management** - Add and configure charging stations with slots and powerbanks
- **Rental Management** - Monitor and manage all rental transactions
- **Analytics & Reporting** - Revenue trends, rental analytics, system health
- **Rewards System** - Achievements, points, referrals, and leaderboards
- **Payment & Transactions** - Transaction history, refunds, withdrawals
- **System Administration** - Audit logs, configuration, content management

---

## ✨ Features

### 📊 Dashboard

- Real-time KPI monitoring (total users, active rentals, revenue)
- System health status tracking
- Revenue and rental analytics with period-based filtering
- Popular packages display
- Recent transactions and updates
- Station utilization metrics

### 👥 User Management

- Complete user directory with pagination
- User profile management and KYC status
- Wallet balance management
- User point/rewards adjustment
- Transaction history and analytics
- User leaderboard/rankings

### 🏪 Station Management

- Create and manage charging stations
- Configure station slots and powerbanks
- Add station amenities
- Real-time station status monitoring
- Issue tracking and resolution
- Station utilization analytics

### 🚗 Rental Management

- View all rental transactions
- Advanced filtering (status, user, date range)
- Payment status tracking
- Late fee management
- Issue resolution
- Rental analytics and trends

### 🎁 Rewards System

- Achievement badge management
- Points history and analytics
- Referral program management
- User leaderboard rankings
- Points adjustment and distribution

### 💳 Payment & Transactions

- Transaction history with filters
- Payment method management
- Refund processing
- Withdrawal request management
- Financial analytics

### 📝 Content Management

- Promotional banner management
- FAQ creation and editing
- Contact information management
- Late fee configuration
- Platform configuration

### 🔐 Admin Features

- KYC verification workflows
- Admin action audit logs
- System operation logs
- Admin profile management
- Role-based access control

---

## 🛠️ Tech Stack

| Category            | Technology                |
| ------------------- | ------------------------- |
| **Framework**       | Next.js 16.0.1            |
| **Runtime**         | React 19.2.0              |
| **Language**        | TypeScript 5              |
| **Styling**         | Tailwind CSS 4.1.16       |
| **HTTP Client**     | Axios 1.13.1              |
| **Charts & Graphs** | Recharts 3.2.1            |
| **Icons**           | Lucide React, React Icons |
| **Maps**            | Leaflet, React Leaflet    |
| **Build Tool**      | Turbopack                 |
| **Package Manager** | npm                       |
| **Backend**         | Django REST API           |
| **Database**        | PostgreSQL                |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (optional)
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Nk-stha/chargeGhar.git
   cd chargeGhar
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and set:

   ```env
   BASE_URL=http://your-django-backend-url:8000
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
chargeGhar/
├── src/
│   ├── app/
│   │   ├── api/                 # Next.js API routes (Backend proxy)
│   │   │   ├── admin/           # Admin API endpoints
│   │   │   └── ...              # Other API routes
│   │   ├── login/               # Authentication page
│   │   └── dashboard/           # Main dashboard pages
│   ├── components/              # Reusable React components
│   ├── contexts/                # React Context providers
│   ├── hooks/                   # Custom React hooks
│   ├── lib/
│   │   ├── api/                 # API service layer
│   │   ├── axios.ts             # Axios configuration
│   │   └── validation.ts        # Form validation
│   ├── styles/                  # Global styles
│   └── types/                   # TypeScript type definitions
├── public/                      # Static assets
├── Dockerfile                   # Docker configuration
├── docker-compose.yml           # Docker Compose setup
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── next.config.ts               # Next.js config
└── README.md                    # This file
```

For detailed architecture documentation, see [ARCHITECTURE_ANALYSIS.md](./docs/ARCHITECTURE_ANALYSIS.md)

---

## ⚙️ Environment Setup

### Development Environment

Create `.env.local`:

```env
# Backend API URL
BASE_URL=http://localhost:8000

# Next.js environment
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NODE_ENV=development
```

### Production Environment

Create `.env.production.local`:

```env
# Production backend URL
BASE_URL=https://api.chargeghar.com

# Production settings
NEXT_PUBLIC_API_URL=https://admin.chargeghar.com/api
NODE_ENV=production
```

---

## 📜 Available Scripts

### Development

```bash
# Start development server with Turbopack
npm run dev

# Run ESLint for code quality
npm run lint

# Run build without starting
npm run build
```

### Production

```bash
# Build for production
npm run build

# Start production server
npm run start
```

---

## 📡 API Integration

### Authentication Flow

```
1. Admin enters credentials on login page
2. Frontend sends POST request to /api/login
3. Next.js API route forwards to Django backend
4. Django validates and returns JWT tokens
5. Frontend stores access_token and refresh_token in localStorage
6. All subsequent requests include Bearer token in Authorization header
7. Axios interceptor handles automatic token refresh on 401 errors
```

### API Route Pattern

All API routes follow this pattern:

- **Path:** `/src/app/api/admin/[resource]/route.ts`
- **Method:** GET, POST, PATCH, DELETE
- **Authentication:** Bearer token in Authorization header
- **Base URL:** Configured via `BASE_URL` environment variable

### Key API Endpoints

#### Dashboard

- `GET /api/admin/dashboard` - Dashboard KPIs
- `GET /api/admin/system-health` - System status

#### Users

- `GET /api/admin/users` - List users
- `GET /api/admin/users/[id]` - User details
- `PATCH /api/admin/users/[id]` - Update user

#### Stations

- `GET /api/admin/stations` - List stations
- `POST /api/admin/stations` - Create station
- `GET /api/admin/stations/[station_sn]` - Station details

#### Rentals

- `GET /api/admin/rentals` - List rentals
- `GET /api/admin/rentals/[rental_id]` - Rental details

#### Analytics

- `GET /api/admin/analytics/revenue-over-time` - Revenue trends
- `GET /api/admin/analytics/rentals-over-time` - Rental trends

For complete API documentation, see the backend repository.

---

## 🔐 Authentication

### JWT Token Management

- **Access Token:** Short-lived (typically 15-60 minutes)
- **Refresh Token:** Long-lived (typically 7-30 days)
- **Storage:** Browser localStorage
- **Transmission:** Authorization header with Bearer scheme

### Request Interceptor

Automatically adds token to all requests:

```typescript
Authorization: Bearer<access_token>;
```

### Response Interceptor

Handles token expiration:

1. If 401 received and refresh token available
2. Sends refresh request to `/api/refresh`
3. Gets new access token
4. Retries original request
5. If refresh fails, redirects to login page

---

## 🐳 Docker Deployment

### Build Docker Image

```bash
docker build -t chargeghar-dashboard:latest .
```

### Run with Docker Compose

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f frontend
```

### docker-compose.yml

```yaml
version: "3.8"
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - BASE_URL=http://backend:8000
    depends_on:
      - backend
```

---

## 👨‍💻 Development Guidelines

### Code Structure

- **Components:** One component per file, organized by feature
- **Types:** Centralized in `/src/types` directory
- **Services:** Business logic in `/src/lib/api` services
- **Styles:** CSS modules or Tailwind classes

### Component Example

```typescript
// src/components/Example/Example.tsx
"use client";

import React from "react";
import styles from "./Example.module.css";

interface ExampleProps {
  title: string;
}

const Example: React.FC<ExampleProps> = ({ title }) => {
  return <div className={styles.container}>{title}</div>;
};

export default Example;
```

### API Service Example

```typescript
// src/lib/api/example.service.ts
import instance from "../axios";

class ExampleService {
  async getAll() {
    const response = await instance.get("/api/admin/example");
    return response.data;
  }

  async getById(id: string) {
    const response = await instance.get(`/api/admin/example/${id}`);
    return response.data;
  }
}

export const exampleService = new ExampleService();
```

### TypeScript Types

```typescript
// src/types/example.types.ts
export interface Example {
  id: string;
  name: string;
  status: "active" | "inactive";
}

export interface ExampleResponse {
  success: boolean;
  data: Example[];
}
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- Use TypeScript for all new code
- Follow existing code style
- Write meaningful commit messages
- Test changes before submitting PR
- Update documentation as needed

---

## 📚 Documentation

Additional documentation files:

- **[ARCHITECTURE_ANALYSIS.md](./docs/ARCHITECTURE_ANALYSIS.md)** - Complete architecture overview
- **[API_INTEGRATION.md](./docs/API_INTEGRATION.md)** - API integration guide
- **[AUTHENTICATION.md](./docs/AUTHENTICATION.md)** - Authentication flow details
- **[DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Deployment guide
- **[KYC_IMPLEMENTATION_GUIDE.md](./docs/KYC_IMPLEMENTATION_GUIDE.md)** - KYC feature documentation
- **[PAYMENT_METHODS_GUIDE.md](./docs/PAYMENT_METHODS_GUIDE.md)** - Payment methods documentation
- **[STATION_MANAGEMENT_GUIDE.md](./docs/STATION_MANAGEMENT_GUIDE.md)** - Station management guide

---

## 🐛 Troubleshooting

### Common Issues

**Issue:** Build fails with TypeScript errors

- **Solution:** Run `npm run lint` to check for errors and `npm install` to ensure all dependencies are installed

**Issue:** Cannot connect to backend

- **Solution:** Verify `BASE_URL` in `.env.local` matches your Django backend URL

**Issue:** 401 Unauthorized on API calls

- **Solution:** Check that access token is stored in localStorage and hasn't expired

**Issue:** CORS errors

- **Solution:** Ensure backend CORS settings allow requests from the frontend URL

---

## 📊 Performance

- **Build:** ~6-7 seconds (with Turbopack)
- **Page Load:** Optimized with code splitting
- **API Calls:** Cached where appropriate
- **Images:** Optimized via Next.js Image component

---

## 📝 License

This project is private and owned by ChargeGhar.

---

## 📞 Support

For issues and support:

- **GitHub Issues:** [Create an issue](https://github.com/Nk-stha/chargeGhar/issues)
- **Email:** support@chargeghar.com
- **Documentation:** See [docs/](./docs/) folder

---

## 👥 Team

- **Project Lead:** Nk-stha
- **Contributors:** See [GitHub contributors](https://github.com/Nk-stha/chargeGhar/graphs/contributors)

---

**Last Updated:** November 2025
**Version:** 1.0.0
**Status:** Active Development ✨
