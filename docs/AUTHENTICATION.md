# Authentication Guide

JWT authentication implementation based on `/src/lib/axios.ts` and actual project setup.

---

## Overview

ChargeGhar uses JWT tokens for authentication. Tokens are managed via localStorage and automatically refreshed by axios interceptors when they expire.

---

## Token Structure

### Access Token

- **Type:** JWT
- **Storage:** localStorage key: `accessToken`
- **Lifetime:** 1 hour (backend configured)
- **Usage:** All API requests via Authorization header

### Refresh Token

- **Type:** JWT
- **Storage:** localStorage key: `refreshToken`
- **Lifetime:** 7 days (backend configured)
- **Usage:** Only for obtaining new access tokens

---

## Login Flow

### 1. User Submits Credentials

```
POST /api/login
{
  "email": "admin@example.com",
  "password": "password123"
}
```

### 2. Next.js Proxy Route

File: `/src/app/api/login/route.ts`

```typescript
// Forwards to Django backend
POST / admin / login;
Authorization: Bearer<credentials>;
```

### 3. Django Backend Response

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "email": "admin@example.com",
      "role": "admin"
    }
  }
}
```

### 4. Frontend Storage

```typescript
// From login component
localStorage.setItem("accessToken", response.data.data.access_token);
localStorage.setItem("refreshToken", response.data.data.refresh_token);

// Redirect to dashboard
router.push("/dashboard");
```

---

## Axios Configuration

### Interceptor Pattern (src/lib/axios.ts)

#### Request Interceptor

```typescript
instance.interceptors.request.use((config) => {
  // 1. Retrieve access token
  const token = localStorage.getItem("accessToken");

  // 2. If token exists, add to Authorization header
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // 3. Send request
  return config;
});
```

#### Response Interceptor

```typescript
instance.interceptors.response.use(
  (response) => response, // Success - pass through
  async (error) => {
    // Error handling
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Attempt token refresh
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const response = await axios.post("/api/refresh", {
          refresh: refreshToken,
        });

        // Store new token
        localStorage.setItem("accessToken", response.data.accessToken);

        // Retry original request
        return instance(originalRequest);
      } catch (err) {
        // Refresh failed - logout user
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error("Access forbidden - insufficient permissions");
    }

    return Promise.reject(error);
  }
);
```

---

## Token Refresh Mechanism

### Automatic Refresh

When a request receives **401 Unauthorized**:

```
API Request (with expired token)
    ↓
401 Response
    ↓
Response Interceptor triggers
    ↓
POST /api/refresh (with refresh token)
    ↓
Get new access_token
    ↓
Store in localStorage
    ↓
Retry original request (with new token)
    ↓
Success response
```

### Refresh Endpoint

```
POST /api/refresh
Content-Type: application/json

{
  "refresh": "refresh_token_string"
}

Response:
{
  "access_token": "new_jwt_token"
}
```

---

## Logout Flow

### 1. Clear Tokens

```typescript
async function logout() {
  try {
    // Call logout endpoint to invalidate token on backend
    await axios.post(
      "/api/logout",
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );
  } finally {
    // Clear local storage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    // Redirect to login
    window.location.href = "/login";
  }
}
```

### 2. Frontend Cleanup

```typescript
// Clear all sensitive data
localStorage.clear();

// Reset any global state
// Clear React Context
// Reset component state
```

### 3. Backend Invalidation

```
POST /api/logout
Authorization: Bearer <token>

Backend:
- Blacklist the refresh token
- Invalidate active sessions
- Clear cached data
```

---

## CSRF Protection

### CSRF Token Retrieval

```typescript
export const getCsrfToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  // Extract from cookie
  const csrfCookie = document.cookie
    .split(";")
    .find((cookie) => cookie.trim().startsWith("csrftoken="));

  return csrfCookie ? csrfCookie.split("=")[1] : null;
};
```

### CSRF Header in Requests

```typescript
// When refreshing token
const csrfToken = getCsrfToken();

axios.post(
  "/api/refresh",
  { refresh: refreshToken },
  {
    headers: {
      "X-CSRFTOKEN": csrfToken,
    },
  }
);
```

---

## Security Best Practices

### 1. Token Storage

✅ **Current Implementation:**

- Tokens stored in localStorage
- Accessible but persistent

⚠️ **Considerations:**

- localStorage is vulnerable to XSS attacks
- Use Content Security Policy (CSP)
- Sanitize all user inputs
- Consider HttpOnly cookies for production

### 2. Token Expiration

✅ **Current Implementation:**

- Short-lived access tokens (1 hour)
- Long-lived refresh tokens (7 days)
- Automatic refresh on 401

### 3. CSRF Protection

✅ **Current Implementation:**

- CSRF token extracted from cookies
- Added to X-CSRFTOKEN header
- Backend validates token

### 4. HTTPS Enforcement

- ✅ Required in production
- Set secure cookie flag
- Use HSTS headers

### 5. Permission Checking

```typescript
// On 403 Forbidden response
if (error.response?.status === 403) {
  // User doesn't have required permissions
  // Show error message
  // Prevent operation
}
```

---

## Implementation in Components

### Using Protected Endpoints

```typescript
import instance from "@/lib/axios";

export async function fetchUsers() {
  try {
    // Token automatically added by interceptor
    const response = await instance.get("/api/admin/users");
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      // Token refresh already attempted by interceptor
      // If we still get 401, user needs to login again
    }
    throw error;
  }
}
```

### Handling Auth Errors

```typescript
async function handleAPICall() {
  try {
    const data = await fetchProtectedResource();
  } catch (error) {
    if (error.response?.status === 401) {
      // Session expired - already redirected by interceptor
      console.log("Redirecting to login...");
    } else if (error.response?.status === 403) {
      // Permission denied
      showErrorMessage("You don't have permission to access this resource");
    } else {
      // Other error
      showErrorMessage("An error occurred");
    }
  }
}
```

---

## Environment Variables

```env
# Backend API URL
BASE_URL=http://localhost:8000

# Frontend API URL
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

---

## Troubleshooting

### Problem: Token Refresh Loop

**Symptom:** Browser keeps refreshing token infinitely

**Solution:**

- Check refresh token validity
- Verify backend refresh endpoint is working
- Check token expiration times
- Ensure `_retry` flag prevents infinite loops

### Problem: 401 After Login

**Symptom:** Still getting 401 even after login

**Solution:**

- Verify tokens are stored in localStorage
- Check Authorization header is added correctly
- Verify token format: `Bearer <token>`
- Check backend token validation logic

### Problem: Logout Not Working

**Symptom:** Can still access dashboard after logout

**Solution:**

- Verify tokens cleared from localStorage
- Check redirect to /login is working
- Verify logout endpoint called
- Clear browser cache/cookies

### Problem: CSRF Token Missing

**Symptom:** 403 Forbidden on POST requests

**Solution:**

- Verify getCsrfToken() returns valid token
- Check cookie parsing logic
- Verify backend expecting X-CSRFTOKEN header
- Check CSRF cookie is set

---

**Last Updated:** November 13, 2025
**Version:** 2.0.0 (Based on Actual axios.ts Implementation)
