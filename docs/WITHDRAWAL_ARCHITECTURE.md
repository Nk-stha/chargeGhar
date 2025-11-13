# Withdrawal Management Architecture

## System Architecture Overview

This document describes the technical architecture of the Withdrawal Management system in the ChargeGhar Admin Dashboard.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                    (React Components)                           │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Analytics  │  │  Withdrawal  │  │   Process    │        │
│  │    Cards     │  │    Table     │  │    Modals    │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     AXIOS INTERCEPTOR                           │
│              (Authentication & Error Handling)                  │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      NEXT.JS API ROUTES                         │
│                    (/api/admin/withdrawals)                     │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │   GET    │  │  GET     │  │  POST    │  │   GET    │      │
│  │   /      │  │  /[id]   │  │/[id]/    │  │/analytics│      │
│  │          │  │          │  │ process  │  │          │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DJANGO BACKEND API                           │
│              (https://main.chargeghar.com/api)                  │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                         DATABASE                                │
│              (Withdrawal Records & User Data)                   │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. Frontend Components

```
WithdrawalsPage (Main Component)
├── State Management
│   ├── withdrawals: Withdrawal[]
│   ├── analytics: Analytics | null
│   ├── pagination: Pagination | null
│   ├── selectedWithdrawal: Withdrawal | null
│   ├── loading: boolean
│   ├── error: string | null
│   └── successMessage: string | null
│
├── UI Components
│   ├── Header Section
│   │   ├── Title & Subtitle
│   │   └── Refresh Button
│   │
│   ├── Analytics Cards
│   │   ├── Total Withdrawals Card
│   │   ├── Pending Withdrawals Card
│   │   ├── Completed Withdrawals Card
│   │   └── Rejected Withdrawals Card
│   │
│   ├── Filter Buttons
│   │   ├── All Filter
│   │   ├── Requested Filter
│   │   ├── Completed Filter
│   │   └── Rejected Filter
│   │
│   ├── Withdrawals Table
│   │   ├── Table Header
│   │   ├── Table Body (rows)
│   │   └── Action Buttons (view)
│   │
│   ├── Detail Modal
│   │   ├── Basic Information
│   │   ├── Financial Details
│   │   ├── Account Details
│   │   ├── Timeline
│   │   ├── Admin Notes Display
│   │   └── Action Buttons (approve/reject)
│   │
│   └── Process Modal
│       ├── Action Confirmation
│       ├── Admin Notes Input
│       └── Confirm/Cancel Buttons
│
└── Functions
    ├── fetchWithdrawals()
    ├── fetchAnalytics()
    ├── fetchWithdrawalDetail(id)
    ├── handleProcessWithdrawal()
    ├── openProcessModal(action)
    └── closeModals()
```

### 2. API Layer Structure

```
/api/admin/withdrawals/
│
├── route.ts (GET)
│   └── Fetches list of all withdrawals
│       ├── Input: Authorization header
│       ├── Backend: /admin/withdrawals
│       └── Output: { results, pagination }
│
├── [id]/
│   ├── route.ts (GET)
│   │   └── Fetches single withdrawal details
│   │       ├── Input: id, Authorization header
│   │       ├── Backend: /admin/withdrawals/{id}
│   │       └── Output: { withdrawal }
│   │
│   └── process/
│       └── route.ts (POST)
│           └── Processes withdrawal (approve/reject)
│               ├── Input: id, action, admin_notes, Authorization
│               ├── Backend: /admin/withdrawals/{id}/process
│               └── Output: { status, message }
│
└── analytics/
    └── route.ts (GET)
        └── Fetches withdrawal analytics
            ├── Input: Authorization header
            ├── Backend: /admin/withdrawals/analytics
            └── Output: { analytics }
```

## Data Flow Diagrams

### Viewing Withdrawals Flow

```
User Action: Navigate to Withdrawals Page
    │
    ▼
Component Mounts (useEffect)
    │
    ├──────────────────┐
    │                  │
    ▼                  ▼
fetchWithdrawals()   fetchAnalytics()
    │                  │
    ▼                  ▼
GET /api/admin/      GET /api/admin/
withdrawals          withdrawals/analytics
    │                  │
    ▼                  ▼
Axios Interceptor    Axios Interceptor
(Add Auth Token)     (Add Auth Token)
    │                  │
    ▼                  ▼
Next.js API Route    Next.js API Route
    │                  │
    ▼                  ▼
Django Backend       Django Backend
    │                  │
    ▼                  ▼
Database Query       Database Query
    │                  │
    ▼                  ▼
Response Data        Response Data
    │                  │
    ▼                  ▼
setWithdrawals()     setAnalytics()
    │                  │
    └────────┬─────────┘
             │
             ▼
       UI Re-renders
             │
             ▼
    Display Data to User
```

### Processing Withdrawal Flow

```
User Action: Click Eye Icon
    │
    ▼
fetchWithdrawalDetail(id)
    │
    ▼
GET /api/admin/withdrawals/[id]
    │
    ▼
setSelectedWithdrawal()
    │
    ▼
setShowDetailModal(true)
    │
    ▼
User Views Details
    │
    ▼
User Clicks Approve/Reject
    │
    ▼
openProcessModal(action)
    │
    ▼
User Enters Admin Notes
    │
    ▼
User Clicks Confirm
    │
    ▼
handleProcessWithdrawal()
    │
    ▼
Create FormData
    │
    ├── action: "APPROVE" | "REJECT"
    └── admin_notes: string
    │
    ▼
POST /api/admin/withdrawals/[id]/process
    │
    ▼
Axios Interceptor (Add Auth Token + CSRF)
    │
    ▼
Next.js API Route
    │
    ├── Validate action
    ├── Append to FormData
    └── Forward to Backend
    │
    ▼
Django Backend
    │
    ├── Validate request
    ├── Check permissions
    ├── Update withdrawal status
    └── Log admin action
    │
    ▼
Database Update
    │
    ▼
Response with Success
    │
    ▼
setSuccessMessage()
    │
    ▼
Close Modals
    │
    ▼
fetchWithdrawals() + fetchAnalytics()
    │
    ▼
UI Refreshes with Updated Data
```

## Authentication Flow

```
User Login
    │
    ▼
POST /api/login
    │
    ▼
Receive Access Token + Refresh Token
    │
    ▼
Store in localStorage
    │
    ├── accessToken
    └── refreshToken
    │
    ▼
Every API Request
    │
    ▼
Axios Request Interceptor
    │
    ├── Get token from localStorage
    └── Add to Authorization header
    │
    ▼
API Request Sent
    │
    ▼
Backend Validates Token
    │
    ├─── Valid ────────► Process Request
    │
    └─── Invalid (401) ─► Axios Response Interceptor
                            │
                            ▼
                        POST /api/refresh
                            │
                            ├── refreshToken
                            │
                            ▼
                        New Access Token
                            │
                            ▼
                        Update localStorage
                            │
                            ▼
                        Retry Original Request
```

## State Management

### Component State

```typescript
// Data States
withdrawals: Withdrawal[]           // List of withdrawal records
analytics: Analytics | null         // Dashboard analytics data
pagination: Pagination | null       // Pagination information
selectedWithdrawal: Withdrawal | null  // Currently selected withdrawal

// UI States
loading: boolean                    // Main data loading
analyticsLoading: boolean          // Analytics loading
processLoading: boolean            // Processing action loading
showDetailModal: boolean           // Detail modal visibility
showProcessModal: boolean          // Process modal visibility

// Filter & Action States
filter: "ALL" | "REQUESTED" | "COMPLETED" | "REJECTED"
processingAction: "APPROVE" | "REJECT" | null
adminNotes: string                 // Admin notes input

// Message States
error: string | null               // Error messages
successMessage: string | null      // Success messages
```

## Error Handling Strategy

```
API Call
    │
    ▼
try {
    Execute Request
        │
        ├── Success ──► Process Response
        │                   │
        │                   ▼
        │               Update State
        │                   │
        │                   ▼
        │               Render UI
        │
        └── Error ──► catch block
                         │
                         ▼
                    Log to Console
                         │
                         ▼
                    Extract Error Message
                         │
                         ▼
                    setError(message)
                         │
                         ▼
                    Display Error to User
                         │
                         ▼
                    Provide Retry Option
}
```

## Security Architecture

### Token-Based Authentication

```
┌─────────────────────────────────────────┐
│         User Authentication             │
├─────────────────────────────────────────┤
│ 1. User logs in with credentials        │
│ 2. Backend validates credentials        │
│ 3. Backend generates JWT tokens         │
│    ├── Access Token (short-lived)       │
│    └── Refresh Token (long-lived)       │
│ 4. Tokens stored in localStorage        │
└─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│         Request Authorization           │
├─────────────────────────────────────────┤
│ 1. Interceptor retrieves access token   │
│ 2. Adds to Authorization header         │
│    Bearer {accessToken}                 │
│ 3. Backend validates token              │
│ 4. Checks user permissions (Staff only) │
│ 5. Processes request if authorized      │
└─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│         Token Refresh Mechanism         │
├─────────────────────────────────────────┤
│ If 401 Unauthorized:                    │
│ 1. Intercept response                   │
│ 2. Attempt token refresh                │
│ 3. Retry original request               │
│ 4. If refresh fails, logout user        │
└─────────────────────────────────────────┘
```

### CSRF Protection

```
POST Request (Process Withdrawal)
    │
    ▼
Next.js API Route
    │
    ├── Get CSRF token from cookies
    ├── Add X-CSRFTOKEN header
    └── Forward to backend
    │
    ▼
Backend validates CSRF token
    │
    ├── Valid ──► Process request
    └── Invalid ──► 403 Forbidden
```

## Performance Optimizations

### Frontend Optimizations

```
Component Level:
├── Conditional Rendering
│   └── Only render visible elements
│
├── Memoization (if needed in future)
│   ├── useMemo for expensive calculations
│   └── useCallback for function references
│
├── Lazy Loading
│   └── Modals rendered only when opened
│
└── Efficient Re-renders
    └── Proper state management
```

### API Optimizations

```
Request Level:
├── Pagination
│   └── Limit data transfer per request
│
├── Selective Data
│   └── Only fetch required fields
│
├── Caching Strategy
│   └── Client-side state management
│
└── Error Recovery
    └── Automatic retry with exponential backoff
```

## Responsive Design Strategy

```
Mobile First Approach
    │
    ├── Base Styles (Mobile: < 480px)
    │   ├── Single column layout
    │   ├── Stacked cards
    │   ├── Full-width modals
    │   └── Touch-optimized buttons
    │
    ├── Tablet Styles (480px - 768px)
    │   ├── Two-column grid
    │   ├── Adjusted spacing
    │   └── Horizontal scrolling tables
    │
    ├── Desktop Styles (768px - 1024px)
    │   ├── Multi-column layout
    │   ├── Optimized table view
    │   └── Side-by-side elements
    │
    └── Large Desktop (> 1024px)
        ├── Full-width utilization
        ├── All columns visible
        └── Hover interactions
```

## Technology Stack

```
Frontend:
├── React 19.2.0
├── Next.js 16.0.1
├── TypeScript 5.x
├── CSS Modules
└── React Icons 5.5.0

HTTP Client:
└── Axios 1.13.1

Backend (External):
├── Django REST Framework
└── PostgreSQL Database

Build Tools:
├── Turbopack (Next.js)
├── ESLint
└── PostCSS
```

## Module Dependencies

```
withdrawals/page.tsx
├── React (useState, useEffect)
├── @/lib/axios (axiosInstance)
├── react-icons/fi (Icons)
└── ./withdrawals.module.css (Styles)

API Routes
├── next/server (NextRequest, NextResponse)
├── axios (HTTP client)
└── form-data (FormData handling)

Navbar.tsx (Updated)
├── React
├── next/link
├── next/navigation
└── react-icons/fi
```

## File Size Considerations

```
Component Size:
├── page.tsx: ~15KB
├── withdrawals.module.css: ~20KB
└── Total Bundle Impact: Minimal

Optimization:
├── Tree-shaking: Unused code removed
├── Code splitting: Route-based splitting
└── CSS purging: Unused styles removed
```

## Testing Strategy

```
Unit Tests (Recommended):
├── API route handlers
├── Data transformation functions
└── Error handling logic

Integration Tests (Recommended):
├── API to Backend communication
├── Modal interactions
└── State updates

E2E Tests (Recommended):
├── Complete approval workflow
├── Complete rejection workflow
└── Filter functionality

Manual Testing:
├── UI/UX verification
├── Responsive design testing
└── Cross-browser compatibility
```

## Deployment Architecture

```
Development:
└── npm run dev
    └── localhost:3000

Production:
└── npm run build
    ├── Static optimization
    ├── Code minification
    ├── Image optimization
    └── Route generation
    │
    └── npm run start
        └── Production server
```

## Monitoring & Logging

```
Frontend Logging:
├── console.error() for errors
├── console.log() for debugging
└── (Consider adding error tracking service)

Backend Logging:
├── Request/Response logs
├── Error logs
├── Admin action audit logs
└── Performance metrics
```

## Scalability Considerations

```
Current Implementation:
├── Handles 100s of withdrawals efficiently
├── Pagination ready for larger datasets
└── Optimized rendering for performance

Future Scaling Options:
├── Virtual scrolling for large lists
├── Server-side pagination
├── Caching layer (Redis)
├── WebSocket for real-time updates
└── CDN for static assets
```

---

**Document Version**: 1.0  
**Last Updated**: November 2025  
**Status**: Production Ready

This architecture supports the current implementation and is designed to scale with future requirements.