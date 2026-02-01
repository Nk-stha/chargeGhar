# ChargeGhar Dashboard - Codebase Architecture Analysis

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Folder Structure](#folder-structure)
4. [Design Patterns](#design-patterns)
5. [API Integration Architecture](#api-integration-architecture)
6. [Authentication Flow](#authentication-flow)
7. [Data Flow](#data-flow)
8. [Key Components](#key-components)
9. [Best Practices](#best-practices)
10. [Recommendations](#recommendations)

---

## 🎯 Project Overview

**Project Name:** ChargeGhar Dashboard  
**Type:** Admin Dashboard for Power Bank Rental Management System  
**Framework:** Next.js 16.0.7 (App Router with Turbopack)  
**Language:** TypeScript  
**Styling:** Tailwind CSS + CSS Modules  

### Purpose
Admin dashboard for managing:
- Charging stations and power banks
- User management and KYC verification
- Partner management (Vendors & Franchises)
- Rental transactions and analytics
- Payment methods and packages
- Content management (FAQs, Banners, Contact)
- System monitoring and logs

---

## 🛠 Technology Stack

### Core Technologies
```json
{
  "framework": "Next.js 16.0.7",
  "runtime": "Node.js 20",
  "language": "TypeScript 5",
  "styling": "Tailwind CSS 4.1.16 + CSS Modules",
  "state": "React Context API",
  "http": "Axios 1.13.1",
  "maps": "React Leaflet + Google Maps API",
  "charts": "Recharts 3.2.1",
  "icons": "React Icons 5.5.0 + Lucide React"
}
```

### Development Tools
- **Build Tool:** Turbopack (Next.js built-in)
- **Package Manager:** pnpm
- **Linting:** ESLint 9
- **Type Checking:** TypeScript strict mode
- **Observability:** Uptrace (OpenTelemetry)

---

## 📁 Folder Structure

```
chargeghar-dashboard/
├── .env.local                    # Environment variables
├── .git/                         # Git repository
├── .next/                        # Next.js build output
├── .orchids/                     # Custom config
├── docs/                         # Documentation (40+ files)
├── node_modules/                 # Dependencies
├── public/                       # Static assets
│   ├── ChargeGharLogo.png
│   └── profile.png
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API Routes (Proxy Layer)
│   │   │   ├── admin/            # Admin endpoints
│   │   │   │   ├── achievements/
│   │   │   │   ├── action-logs/
│   │   │   │   ├── amenities/
│   │   │   │   ├── analytics/
│   │   │   │   ├── config/
│   │   │   │   ├── content/
│   │   │   │   ├── coupons/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── kyc/
│   │   │   │   ├── late-fee-configs/
│   │   │   │   ├── me/
│   │   │   │   ├── media/
│   │   │   │   ├── partners/
│   │   │   │   ├── points/
│   │   │   │   ├── powerbanks/
│   │   │   │   ├── profiles/
│   │   │   │   ├── referrals/
│   │   │   │   ├── refunds/
│   │   │   │   ├── rentals/
│   │   │   │   ├── stations/
│   │   │   │   ├── system-health/
│   │   │   │   ├── system-logs/
│   │   │   │   ├── transactions/
│   │   │   │   ├── users/
│   │   │   │   └── withdrawals/
│   │   │   ├── ads/              # Advertisement management
│   │   │   ├── dashboard-data/   # Aggregated dashboard data
│   │   │   ├── login/            # Authentication
│   │   │   ├── logout/
│   │   │   ├── payment-methods/
│   │   │   ├── payments/
│   │   │   ├── refresh/          # Token refresh
│   │   │   └── rental-packages/
│   │   ├── dashboard/            # Dashboard Pages
│   │   │   ├── achievements/
│   │   │   ├── admin-logs/
│   │   │   ├── ads/
│   │   │   ├── coupons/
│   │   │   ├── issues/
│   │   │   ├── kyc/
│   │   │   ├── leaderboard/
│   │   │   ├── packages/
│   │   │   ├── partners/
│   │   │   ├── payment-methods/
│   │   │   ├── points/
│   │   │   ├── powerbanks/
│   │   │   ├── profile/
│   │   │   ├── referrals/
│   │   │   ├── refund/
│   │   │   ├── rentals/
│   │   │   ├── settings/
│   │   │   ├── stations/
│   │   │   ├── system-logs/
│   │   │   ├── transactions/
│   │   │   ├── users/
│   │   │   ├── layout.tsx        # Dashboard layout wrapper
│   │   │   └── page.tsx          # Dashboard home
│   │   ├── login/                # Login page
│   │   ├── globals.css           # Global styles
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Home redirect
│   ├── components/               # Reusable Components
│   │   ├── AdminProfileModal/
│   │   ├── DashboardSidebar/
│   │   ├── DashboardStatsCard/
│   │   ├── DataTable/
│   │   ├── ErrorBoundary/
│   │   ├── Header/
│   │   ├── MonitorRentalsCard/
│   │   ├── Navbar/
│   │   ├── PartnerManagement/
│   │   ├── PaymentAnalytics/
│   │   ├── PopularPackageCard/
│   │   ├── PowerBankRentalAnalytics/
│   │   ├── RecentTransactionsCard/
│   │   ├── RecentUpdates/
│   │   ├── RentalDetailModal/
│   │   ├── RentalOverTimeCard/
│   │   ├── StationAnalytics/
│   │   ├── StationManagement/
│   │   ├── SystemHealth/
│   │   ├── UserAnalytics/
│   │   ├── ValidatedInput/
│   │   ├── common/
│   │   ├── modal/
│   │   └── ui/
│   ├── contexts/                 # React Context
│   │   └── DashboardDataContext.tsx
│   ├── hooks/                    # Custom Hooks
│   │   ├── useFormValidation.ts
│   │   ├── usePaymentAnalytics.ts
│   │   ├── usePowerBankRentalAnalytics.ts
│   │   ├── useRecentTransactions.ts
│   │   ├── useRevenueData.ts
│   │   ├── useStationPerformance.ts
│   │   ├── useStations.ts
│   │   └── useUserAnalytics.ts
│   ├── lib/                      # Utilities & Services
│   │   ├── api/                  # API Service Layer
│   │   │   ├── adminMe.service.ts
│   │   │   ├── adminProfiles.service.ts
│   │   │   ├── ads.service.ts
│   │   │   ├── amenities.service.ts
│   │   │   ├── analytics.service.ts
│   │   │   ├── banner.service.ts
│   │   │   ├── config.service.ts
│   │   │   ├── contact.service.ts
│   │   │   ├── faq.service.ts
│   │   │   ├── index.ts
│   │   │   ├── media.service.ts
│   │   │   ├── partners.ts
│   │   │   ├── powerbank.service.ts
│   │   │   ├── rental-issues.service.ts
│   │   │   ├── rentals.service.ts
│   │   │   ├── rewards.service.ts
│   │   │   ├── station-issues.service.ts
│   │   │   ├── stations.service.ts
│   │   │   └── user.service.ts
│   │   ├── axios.ts              # Axios instance with interceptors
│   │   └── validation.ts         # Form validation utilities
│   └── types/                    # TypeScript Definitions
│       ├── ads.types.ts
│       ├── analytics.types.ts
│       ├── banner.types.ts
│       ├── dashboard.types.ts
│       ├── lateFeeConfig.ts
│       ├── partner.ts
│       ├── powerbank.types.ts
│       ├── rental-issues.types.ts
│       ├── rentals.types.ts
│       ├── rewards.types.ts
│       ├── station-issues.types.ts
│       └── station.types.ts
├── Dockerfile                    # Docker configuration
├── docker-compose.yml            # Docker Compose
├── next.config.ts                # Next.js configuration
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
└── tailwind.config.js            # Tailwind config
```

---

## 🎨 Design Patterns

### 1. **Proxy Pattern (API Routes)**
All API calls go through Next.js API routes that act as a proxy to the backend.

**Why?**
- Hide backend URL from client
- Add server-side authentication
- Handle CORS issues
- Transform requests/responses
- Add logging and monitoring

**Example:**
```typescript
// src/app/api/admin/partners/route.ts
export async function GET(request: NextRequest) {
  const authorization = request.headers.get("Authorization");
  
  const response = await fetch(
    `${process.env.BASE_URL}/admin/partners`,
    {
      headers: { Authorization: authorization }
    }
  );
  
  return NextResponse.json(await response.json());
}
```

### 2. **Service Layer Pattern**
Business logic separated into service classes.

**Structure:**
```
Client Component → Service Layer → Axios Instance → API Route → Backend
```

**Example:**
```typescript
// src/lib/api/user.service.ts
class UserService {
  private baseUrl = "/api/admin/users";
  
  async getUsers(params?: UserFilters): Promise<UserListResponse> {
    const response = await instance.get(this.baseUrl, { params });
    return { success: true, data: response.data };
  }
}

export const userService = new UserService();
```

### 3. **Repository Pattern**
Each entity has its own service file acting as a repository.

**Services:**
- `user.service.ts` - User management
- `stations.service.ts` - Station management
- `partners.ts` - Partner management
- `analytics.service.ts` - Analytics data
- `rewards.service.ts` - Points, achievements, referrals
- etc.

### 4. **Context API for State Management**
Global state managed through React Context.

**Example:**
```typescript
// src/contexts/DashboardDataContext.tsx
export const DashboardDataProvider = ({ children }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Fetch and provide data to all children
  return (
    <DashboardDataContext.Provider value={{ dashboardData, loading }}>
      {children}
    </DashboardDataContext.Provider>
  );
};
```

### 5. **Custom Hooks Pattern**
Reusable logic extracted into custom hooks.

**Examples:**
- `useFormValidation` - Form validation logic
- `usePaymentAnalytics` - Payment analytics data
- `useStations` - Station data fetching
- `useUserAnalytics` - User analytics

### 6. **Component Composition**
Complex UIs built from smaller, reusable components.

**Example:**
```
PartnersPage
├── PartnerStats (Statistics cards)
└── PartnerList (Data table)
    ├── DataTable (Reusable table)
    └── PartnerRow (Individual row)
```

### 7. **CSS Modules + Tailwind Hybrid**
- **Tailwind:** Utility classes for layout and spacing
- **CSS Modules:** Component-specific styles

**Example:**
```tsx
// Component
<div className="flex gap-4">
  <button className={styles.submitButton}>Submit</button>
</div>

// styles.module.css
.submitButton {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 12px 24px;
  border-radius: 8px;
}
```

### 8. **Error Boundary Pattern**
Graceful error handling with error boundaries.

```typescript
// src/components/ErrorBoundary/ApiErrorDisplay.tsx
export const ApiErrorDisplay = ({ error, retry }) => {
  return (
    <div className={styles.errorContainer}>
      <p>{error.message}</p>
      <button onClick={retry}>Retry</button>
    </div>
  );
};
```

---

## 🔌 API Integration Architecture

### Architecture Overview

```
┌─────────────────┐
│  React Client   │
│  (Browser)      │
└────────┬────────┘
         │ 1. HTTP Request with Bearer Token
         │    (Authorization: Bearer <token>)
         ▼
┌─────────────────┐
│  Axios Instance │ ← Interceptors (Add token, Handle 401/403)
│  (src/lib/      │
│   axios.ts)     │
└────────┬────────┘
         │ 2. Request to Next.js API Route
         │    (e.g., /api/admin/users)
         ▼
┌─────────────────┐
│  Next.js API    │ ← Proxy Layer (Server-side)
│  Route          │   - Validates Authorization header
│  (src/app/api/) │   - Forwards to backend
└────────┬────────┘
         │ 3. Forward to Backend API
         │    (BASE_URL + endpoint)
         │    Authorization: Bearer <token>
         ▼
┌─────────────────┐
│  Backend API    │
│  (Django/       │
│   FastAPI)      │
└─────────────────┘
```

### Request Flow Example

**1. Client makes request:**
```typescript
// Component
const users = await userService.getUsers({ page: 1, page_size: 10 });
```

**2. Service layer:**
```typescript
// src/lib/api/user.service.ts
async getUsers(params) {
  const response = await instance.get("/api/admin/users", { params });
  return response.data;
}
```

**3. Axios interceptor adds token:**
```typescript
// src/lib/axios.ts
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**4. Next.js API route proxies:**
```typescript
// src/app/api/admin/users/route.ts
export async function GET(request: NextRequest) {
  const authorization = request.headers.get("Authorization");
  
  const response = await fetch(
    `${process.env.BASE_URL}/admin/users`,
    { headers: { Authorization: authorization } }
  );
  
  return NextResponse.json(await response.json());
}
```

**5. Backend processes and responds**

### Authentication Flow

```
┌──────────┐
│  Login   │
│  Page    │
└────┬─────┘
     │ 1. POST /api/login
     │    { email, password }
     ▼
┌──────────────────┐
│ Login API Route  │
│ /api/login       │
└────┬─────────────┘
     │ 2. POST BASE_URL/admin/login
     │    FormData: email, password
     ▼
┌──────────────────┐
│  Backend API     │
│  Returns tokens  │
└────┬─────────────┘
     │ 3. Response:
     │    { access_token, refresh_token }
     ▼
┌──────────────────┐
│  Client stores   │
│  in localStorage │
│  - accessToken   │
│  - refreshToken  │
└──────────────────┘
```

### Token Refresh Flow

```
┌──────────────────┐
│  API Request     │
│  Returns 401     │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Axios Interceptor│
│ Catches 401      │
└────┬─────────────┘
     │ 1. POST /api/refresh
     │    { refresh: refreshToken }
     ▼
┌──────────────────┐
│ Refresh API      │
│ Route            │
└────┬─────────────┘
     │ 2. POST BASE_URL/auth/refresh
     ▼
┌──────────────────┐
│ Backend returns  │
│ new access_token │
└────┬─────────────┘
     │ 3. Store new token
     │ 4. Retry original request
     ▼
┌──────────────────┐
│ Original request │
│ succeeds         │
└──────────────────┘
```

### Environment Configuration

**Local Development (.env.local):**
```bash
BASE_URL=https://main.chargeghar.com/api
API_BASE_URL=https://main.chargeghar.com/api
NEXT_PUBLIC_API_BASE_URL=https://main.chargeghar.com/api
```

**Docker (Dockerfile):**
```dockerfile
ENV BASE_URL=https://main.chargeghar.com/api
```

### API Endpoints Structure

**Pattern:** `/api/admin/{resource}/{id?}/{action?}`

**Examples:**
```
GET    /api/admin/users                    # List users
GET    /api/admin/users/123                # Get user detail
POST   /api/admin/users/123/add-balance   # Add balance
POST   /api/admin/users/123/status        # Update status

GET    /api/admin/stations                 # List stations
GET    /api/admin/stations/SN123           # Get station detail
PATCH  /api/admin/stations/SN123           # Update station
DELETE /api/admin/stations/SN123           # Delete station

GET    /api/admin/partners                 # List partners
GET    /api/admin/partners/uuid            # Get partner detail
POST   /api/admin/partners/vendor          # Create vendor
POST   /api/admin/partners/franchise       # Create franchise
```

---

## 🔐 Authentication Flow

### Token Storage
```typescript
// Stored in localStorage
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Protected Routes
All dashboard routes are protected by checking for token:

```typescript
// Middleware or layout check
useEffect(() => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    router.push("/login");
  }
}, []);
```

### Automatic Token Refresh
Axios interceptor handles 401 responses:

```typescript
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Attempt token refresh
      const refreshToken = localStorage.getItem("refreshToken");
      const { data } = await axios.post("/api/refresh", { refresh: refreshToken });
      
      // Store new token and retry
      localStorage.setItem("accessToken", data.accessToken);
      return instance(originalRequest);
    }
    return Promise.reject(error);
  }
);
```

---

## 📊 Data Flow

### Component → Service → API → Backend

**Example: Fetching Partners**

```typescript
// 1. Component
const PartnersPage = () => {
  const [partners, setPartners] = useState([]);
  
  useEffect(() => {
    loadPartners();
  }, []);
  
  const loadPartners = async () => {
    const data = await getPartners({ page: 1, page_size: 10 });
    setPartners(data.results);
  };
};

// 2. Service (src/lib/api/partners.ts)
export const getPartners = async (params) => {
  const response = await instance.get("/api/admin/partners", { params });
  return response.data;
};

// 3. Axios Instance (src/lib/axios.ts)
// Adds Authorization header automatically

// 4. API Route (src/app/api/admin/partners/route.ts)
export async function GET(request) {
  const response = await fetch(
    `${process.env.BASE_URL}/admin/partners`,
    { headers: { Authorization: request.headers.get("Authorization") } }
  );
  return NextResponse.json(await response.json());
}

// 5. Backend API processes request
```

### Form Submission Flow

```typescript
// 1. Form Component
const handleSubmit = async (e) => {
  e.preventDefault();
  await createVendor(formData);
  router.push("/dashboard/partners");
};

// 2. Service
export const createVendor = async (data) => {
  const formData = new FormData();
  formData.append("user_id", data.user_id);
  // ... append other fields
  
  const response = await instance.post(
    "/api/admin/partners/vendor",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
};

// 3. API Route forwards to backend
// 4. Backend creates vendor and returns response
```

---

## 🧩 Key Components

### 1. DashboardSidebar
- Navigation menu
- Active route highlighting
- Collapsible sections
- Role-based menu items

### 2. DataTable
- Reusable table component
- Pagination
- Sorting
- Search/filtering
- Row actions

### 3. StationManagement
- Location picker (Google Maps/Leaflet)
- Amenity selector
- Image upload
- Powerbank assignment
- Form validation

### 4. PartnerManagement
- Partner stats dashboard
- Partner list with filters
- Add partner form (Vendor/Franchise)
- Partner detail view
- Revenue tracking

### 5. Analytics Components
- PaymentAnalytics
- PowerBankRentalAnalytics
- UserAnalytics
- StationAnalytics
- Charts using Recharts

---

## ✅ Best Practices

### 1. **Type Safety**
- All API responses typed with TypeScript interfaces
- Strict mode enabled
- No `any` types (except for error handling)

### 2. **Error Handling**
```typescript
try {
  const data = await service.getData();
  setData(data);
} catch (error: any) {
  console.error("Error:", error);
  setError(error.response?.data?.message || "Failed to load data");
}
```

### 3. **Loading States**
```typescript
const [loading, setLoading] = useState(false);

const loadData = async () => {
  setLoading(true);
  try {
    const data = await service.getData();
    setData(data);
  } finally {
    setLoading(false);
  }
};
```

### 4. **Responsive Design**
- Mobile-first approach
- Tailwind responsive classes
- CSS Grid and Flexbox
- Breakpoints: sm, md, lg, xl, 2xl

### 5. **Code Organization**
- One component per file
- Co-located styles (CSS Modules)
- Barrel exports (index.ts)
- Clear naming conventions

### 6. **Performance**
- Lazy loading with dynamic imports
- Memoization with useMemo/useCallback
- Pagination for large lists
- Image optimization with Next.js Image

---

## 💡 Recommendations

### 1. **Consolidate API Services**
Currently some services use class-based pattern, others use function exports. Standardize to one approach.

**Recommended:**
```typescript
// Class-based (better for complex services)
class UserService {
  private baseUrl = "/api/admin/users";
  async getUsers() { }
  async getUserById() { }
}
export const userService = new UserService();
```

### 2. **Add Request/Response Logging**
```typescript
// src/lib/axios.ts
instance.interceptors.request.use((config) => {
  console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});
```

### 3. **Implement React Query**
Replace manual state management with React Query for:
- Automatic caching
- Background refetching
- Optimistic updates
- Better loading/error states

### 4. **Add API Response Validation**
Use Zod or Yup to validate API responses:
```typescript
import { z } from 'zod';

const UserSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
});

const response = await api.getUser();
const user = UserSchema.parse(response.data);
```

### 5. **Centralize Error Messages**
```typescript
// src/lib/errors.ts
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  UNAUTHORIZED: "Session expired. Please login again.",
  FORBIDDEN: "You don't have permission to perform this action.",
};
```

### 6. **Add Unit Tests**
```typescript
// __tests__/services/user.service.test.ts
describe('UserService', () => {
  it('should fetch users', async () => {
    const users = await userService.getUsers();
    expect(users).toBeDefined();
    expect(Array.isArray(users.data.results)).toBe(true);
  });
});
```

### 7. **Implement Proper Logging**
Use structured logging instead of console.log:
```typescript
import { logger } from '@/lib/logger';

logger.info('User logged in', { userId: user.id });
logger.error('API error', { error, endpoint });
```

### 8. **Add API Rate Limiting**
Implement rate limiting on API routes to prevent abuse.

### 9. **Use Environment-Specific Configs**
```typescript
// src/config/index.ts
export const config = {
  apiUrl: process.env.BASE_URL,
  environment: process.env.NODE_ENV,
  features: {
    analytics: process.env.ENABLE_ANALYTICS === 'true',
  }
};
```

### 10. **Implement Proper CSRF Protection**
Currently CSRF token is optional. Make it required for state-changing operations.

---

## 📈 Summary

### Strengths
✅ Clean separation of concerns (Service Layer Pattern)  
✅ Type-safe with TypeScript  
✅ Proxy pattern for API security  
✅ Automatic token refresh  
✅ Reusable components  
✅ Responsive design  
✅ Comprehensive documentation  

### Areas for Improvement
⚠️ Inconsistent service patterns (class vs functions)  
⚠️ Manual state management (could use React Query)  
⚠️ Limited error handling in some components  
⚠️ No unit tests  
⚠️ Console.log statements in production code  
⚠️ Missing API response validation  

### Architecture Score: 8/10
The codebase follows solid architectural patterns with clear separation of concerns. The proxy pattern for API routes is well-implemented, and the service layer provides good abstraction. Main improvements would be standardizing patterns and adding testing.

---

**Generated:** February 1, 2026  
**Version:** 1.0  
**Maintainer:** ChargeGhar Development Team
