# Architecture Analysis

Complete architectural overview of ChargeGhar admin dashboard based on actual project structure and implementation.

---

## 📐 Project Structure

```
chargeGhar/
├── src/
│   ├── app/
│   │   ├── globals.css                  # Global styles
│   │   ├── layout.tsx                   # Root layout
│   │   ├── page.tsx                     # Home page redirect
│   │   ├── login/
│   │   │   └── page.tsx                 # Login page
│   │   ├── dashboard/
│   │   │   ├── layout.tsx               # Dashboard layout
│   │   │   ├── page.tsx                 # Dashboard home
│   │   │   ├── stations/                # Station management pages
│   │   │   ├── users/                   # User management pages
│   │   │   ├── kyc/                     # KYC management pages
│   │   │   ├── rentals/                 # Rental management pages
│   │   │   ├── coupons/                 # Coupon management pages
│   │   │   ├── points/                  # Points management pages
│   │   │   ├── achievements/            # Achievements management pages
│   │   │   ├── issues/                  # Issues (rentals & stations)
│   │   │   ├── packages/                # Rental packages pages
│   │   │   ├── content/                 # Content management (FAQs, banners, contact)
│   │   │   └── ...
│   │   └── api/
│   │       ├── login/route.ts           # Authentication
│   │       ├── logout/route.ts
│   │       ├── refresh/route.ts
│   │       ├── dashboard-data/route.ts  # Aggregate dashboard data
│   │       ├── admin/
│   │       │   ├── me/route.ts                      # Current admin profile
│   │       │   ├── users/route.ts                   # User CRUD
│   │       │   ├── users/[id]/route.ts
│   │       │   ├── users/[id]/status/route.ts
│   │       │   ├── users/[id]/add-balance/route.ts
│   │       │   ├── users/leaderboard/route.ts
│   │       │   ├── stations/route.ts                # Station CRUD
│   │       │   ├── stations/[station_sn]/route.ts
│   │       │   ├── stations/issues/route.ts        # Station issue tracking
│   │       │   ├── rentals/route.ts                # Rental management
│   │       │   ├── rentals/[rental_id]/route.ts
│   │       │   ├── rentals/issues/route.ts         # Rental issue tracking
│   │       │   ├── kyc/route.ts                    # KYC submissions
│   │       │   ├── kyc/[id]/route.ts
│   │       │   ├── payment-methods/route.ts        # Payment gateway config
│   │       │   ├── refunds/route.ts                # Refund processing
│   │       │   ├── refunds/[id]/process/route.ts
│   │       │   ├── withdrawals/route.ts            # Withdrawal processing
│   │       │   ├── withdrawals/[id]/process/route.ts
│   │       │   ├── transactions/route.ts           # Transaction history
│   │       │   ├── coupons/route.ts                # Coupon management
│   │       │   ├── points/
│   │       │   │   ├── history/route.ts
│   │       │   │   ├── adjust/route.ts
│   │       │   │   ├── analytics/route.ts
│   │       │   │   └── users/[user_id]/history/route.ts
│   │       │   ├── achievements/route.ts           # Achievement management
│   │       │   ├── achievements/analytics/route.ts
│   │       │   ├── analytics/
│   │       │   │   ├── revenue-over-time/route.ts
│   │       │   │   └── rentals-over-time/route.ts
│   │       │   ├── amenities/route.ts              # Station amenities
│   │       │   ├── content/
│   │       │   │   ├── faqs/route.ts               # FAQ management
│   │       │   │   ├── banners/route.ts            # Banner management
│   │       │   │   └── contact/route.ts            # Contact info management
│   │       │   ├── profiles/route.ts               # Admin profiles
│   │       │   ├── system-logs/route.ts            # System audit logs
│   │       │   ├── system-health/route.ts          # System health status
│   │       │   ├── action-logs/route.ts            # Action audit trail
│   │       │   ├── config/route.ts                 # System configuration
│   │       │   ├── media/uploads/route.ts          # Media upload handling
│   │       │   ├── late-fee-configs/route.ts       # Late fee settings
│   │       │   └── ...
│   │       ├── payment-methods/route.ts
│   │       └── rental-packages/route.ts
│   │
│   ├── components/
│   │   ├── Navbar/                      # Sidebar navigation component
│   │   ├── Header/                      # Top header component
│   │   ├── DashboardStats/              # Statistics cards
│   │   ├── DashboardStatsCard/          # Individual stat card
│   │   ├── RevenueChart.tsx             # Revenue visualization
│   │   ├── RentalOverTimeCard/          # Rental trends
│   │   ├── StationUtilizationChart.tsx  # Station utilization
│   │   ├── MonitorRentalsCard/          # Rental monitoring
│   │   ├── RentalDetailModal/           # Modal for rental details
│   │   ├── AdminProfileModal/           # Admin profile modal
│   │   ├── RecentTransactionsCard/      # Recent transactions display
│   │   ├── RecentUpdates/               # Recent activity feed
│   │   ├── PopularPackageCard/          # Package showcase
│   │   ├── SystemHealth/                # System health status
│   │   ├── StationManagement/           # Station CRUD component
│   │   ├── ValidatedInput/              # Form input with validation
│   │   ├── ErrorBoundary/               # Error handling boundary
│   │   ├── dataTable.tsx                # Reusable data table
│   │   ├── modal/                       # Modal components
│   │   └── ui/                          # Generic UI components
│   │
│   ├── contexts/
│   │   └── DashboardDataContext.tsx    # Global dashboard data context
│   │
│   ├── hooks/
│   │   └── useFormValidation.ts        # Form validation hook
│   │
│   ├── lib/
│   │   ├── axios.ts                     # Axios instance with interceptors
│   │   ├── api/                         # API service layer
│   │   │   ├── stations.service.ts
│   │   │   ├── amenities.service.ts
│   │   │   ├── media.service.ts
│   │   │   ├── analytics.service.ts
│   │   │   ├── rewards.service.ts
│   │   │   └── index.ts                 # Service exports
│   │   └── validation.ts
│   │
│   ├── styles/                          # Component-specific styles
│   │   └── *.module.css
│   │
│   └── types/
│       ├── analytics.types.ts
│       ├── rentals.types.ts
│       ├── stations.types.ts
│       ├── users.types.ts
│       ├── kyc.types.ts
│       └── ...
│
├── public/                              # Static assets
├── Dockerfile                           # Docker image configuration
├── docker-compose.yml                   # Local development stack
├── package.json                         # Dependencies and scripts
├── tsconfig.json                        # TypeScript configuration
├── next.config.ts                       # Next.js configuration
├── eslint.config.mjs                    # ESLint configuration
├── postcss.config.mjs                   # PostCSS configuration
└── docs/                                # Documentation
    ├── ARCHITECTURE_ANALYSIS.md
    ├── API_INTEGRATION.md
    ├── AUTHENTICATION.md
    ├── DEPLOYMENT.md
    └── ...
```

---

## 🔄 Data Flow Architecture

### Authentication Flow

```
User Login Form
    ↓
POST /api/login
    ↓
Axios instance: /api/login route
    ↓
Django Backend: /admin/login
    ↓
Returns: { access_token, refresh_token }
    ↓
Store in localStorage
    ↓
All subsequent requests include Authorization header
```

### Request Flow with Token Refresh

```
GET /api/admin/users
    ↓
axios.interceptor.request
    ├─ Add Authorization: Bearer <token>
    └─ Send request
    ↓
API Route: /api/admin/users/route.ts
    ├─ Extract Authorization header
    ├─ Forward to Django: /admin/users
    └─ Return response
    ↓
Response 401 Unauthorized
    ↓
axios.interceptor.response
    ├─ Detect 401 status
    ├─ POST /api/refresh
    ├─ Get new access_token
    ├─ Retry original request
    └─ Return data
```

### Dashboard Data Loading

```
GET /api/dashboard-data
    ↓
Parallel requests:
├─ /admin/dashboard
├─ /admin/profiles
└─ /admin/stations
    ↓
Aggregate data
    ↓
Return combined response
```

---

## 🎨 Component Architecture

### Component Hierarchy

```
Root Layout
├─ Header
│  └─ Admin Profile Modal
├─ Navbar (Sidebar)
│  ├─ Dashboard Link
│  ├─ Users Link
│  ├─ Stations Link
│  ├─ KYC Link
│  ├─ Rentals Link
│  ├─ Issues (expandable)
│  ├─ Promotion (expandable)
│  │  ├─ Packages
│  │  ├─ Coupons
│  │  └─ Points
│  ├─ Analytics
│  ├─ Content
│  ├─ Refunds
│  └─ Withdrawals
│
└─ Dashboard Pages
   ├─ Dashboard Home
   │  ├─ DashboardStats
   │  │  └─ DashboardStatsCard (x4)
   │  ├─ RevenueChart
   │  ├─ RentalOverTimeCard
   │  ├─ StationUtilizationChart
   │  ├─ MonitorRentalsCard
   │  ├─ RecentTransactionsCard
   │  ├─ RecentUpdates
   │  ├─ PopularPackageCard
   │  └─ SystemHealth
   │
   ├─ Users Page
   │  ├─ dataTable (User list)
   │  └─ User modals
   │
   ├─ Stations Page
   │  ├─ StationManagement
   │  └─ dataTable
   │
   ├─ KYC Page
   │  ├─ KYC submissions table
   │  └─ KYC detail modals
   │
   ├─ Rentals Page
   │  ├─ RentalDetailModal
   │  └─ dataTable
   │
   └─ ...Other pages
```

---

## 🔐 Authentication & Authorization

### JWT Implementation

**Token Storage:**

- `accessToken` - localStorage (1 hour expiry)
- `refreshToken` - localStorage (7 days expiry)

**Axios Interceptors (src/lib/axios.ts):**

1. **Request Interceptor**

   - Extracts accessToken from localStorage
   - Adds `Authorization: Bearer <token>` header
   - Sends request through

2. **Response Interceptor**
   - On 401: Attempts token refresh
   - On 403: Logs unauthorized error
   - On success: Returns response

**Token Refresh Mechanism:**

```
401 Error Detected
    ↓
Try refresh (POST /api/refresh with refreshToken)
    ↓
Success: Store new accessToken, retry original request
    ↓
Failure: Clear tokens, redirect to /login
```

---

## 📡 API Route Pattern

### Standard API Route Structure

All routes in `/src/app/api/admin/[resource]/route.ts` follow this pattern:

```typescript
// 1. Get Authorization header
const authorization = req.headers.get("Authorization");

// 2. Validate auth header
if (!authorization) {
  return NextResponse.json(
    { message: "Authorization header is required" },
    { status: 401 }
  );
}

// 3. Forward to Django backend
const response = await axios.get(
  `${process.env.BASE_URL}/admin/[resource]`,
  { headers: { Authorization: authorization } }
);

// 4. Return response
return NextResponse.json(response.data);

// 5. Handle errors
catch (error) {
  return NextResponse.json(
    axiosError.response?.data || { message: "Internal server error" },
    { status: axiosError.response?.status || 500 }
  );
}
```

### HTTP Methods Used

- **GET** - Retrieve data
- **POST** - Create new resource
- **PATCH** - Update existing resource
- **DELETE** - Remove resource (some endpoints)

---

## 🗄️ API Service Layer (src/lib/api)

### Service Pattern

Each service exports:

- **Service class** - Methods for API operations
- **Singleton instance** - Exported for use in components
- **TypeScript types** - For request/response data

### Services Available

1. **stationsService** - Station CRUD and management
2. **amenitiesService** - Amenities management
3. **mediaService** - Media upload handling
4. **analyticsService** - Analytics data
5. **rewardsService** - Rewards and achievements
6. **... more services**

### Usage Pattern

```typescript
// In components
import { stationsService } from "@/lib/api";

const stations = await stationsService.getAll();
const station = await stationsService.getById(id);
await stationsService.create(data);
await stationsService.update(id, data);
```

---

## 🎯 Key Features Architecture

### Users Management

- List all users with pagination/search
- View user details and wallet balance
- Update user status (active/inactive/suspended)
- Add balance to user account
- View user leaderboard

### Station Management

- CRUD operations for stations
- Manage station amenities
- Track station issues
- View utilization metrics
- Monitor station health

### Rental Management

- List and filter rentals
- View rental details
- Track rental issues
- Monitor rental trends over time

### KYC (Know Your Customer)

- Manage KYC submissions
- Update verification status
- Track submission history

### Payment & Transactions

- Manage payment methods
- Process refunds
- Handle withdrawals
- View transaction history
- Track late fees

### Analytics

- Revenue trends over time
- Rental trends over time
- System health monitoring
- User engagement metrics

### Content Management

- Manage FAQs
- Create and edit banners
- Manage contact information
- Store system configuration

---

## 🛠️ Technology Stack

### Frontend

- **Next.js 16** - React framework with Turbopack
- **React 19** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Utility-first CSS
- **Axios 1.13** - HTTP client
- **React Icons** - Icon library
- **Recharts 3** - Data visualization
- **Leaflet** - Map integration

### Development

- **Node.js 18+** - JavaScript runtime
- **npm** - Package manager
- **ESLint** - Code linting
- **PostCSS** - CSS processing

### Backend Integration

- **Django REST Framework** - Backend API (separate)
- **PostgreSQL** - Database (backend)

### Deployment

- **Docker** - Containerization
- **Docker Compose** - Local development

---

## 📊 State Management

### Global Context (DashboardDataContext)

- Stores aggregated dashboard data
- Provides data to multiple components
- Updates on interval or user action

### Local Component State

- Individual page state using React hooks
- Modal open/close states
- Form input validation states

---

## 🔌 Environment Configuration

### Environment Variables

```env
# Backend API URL
BASE_URL=http://localhost:8000

# Frontend API URL
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Node environment
NODE_ENV=development
```

---

**Last Updated:** November 13, 2025
**Version:** 2.0.0 (Based on Actual Project Analysis)
