# Problems Faced and Solutions

This document summarizes the key problems encountered and their respective solutions during the recent development session.

## 1. Token from `localStorage` in `proxy.ts`

*   **Problem:** The user initially wanted to retrieve an authentication token from `localStorage` within `src/proxy.ts` for authentication purposes.
*   **Solution:** It was clarified that `localStorage` is a client-side browser API, while `proxy.ts` functions as server-side (or edge) middleware in Next.js. `localStorage` is not accessible in this server-side environment. The existing `proxy.ts` was already correctly reading the token from HTTP cookies, which is the appropriate method for server-side authentication in this context.

## 2. Client-side `axios` authentication

*   **Problem:** Client-side API calls made using `axios` were not including the authentication token, leading to unauthenticated requests.
*   **Solution:** An `axios` request interceptor was implemented in `src/lib/axios.ts`. This interceptor automatically retrieves the authentication token from `localStorage` and adds it to the `Authorization` header of every outgoing HTTP request made via that `axios` instance.

## 3. Inconsistent Token Storage and Access

*   **Problem:** A discrepancy existed in how the authentication token was stored and accessed:
    *   `proxy.ts` expected the token in an HTTP cookie.
    *   The `axios` interceptor expected the token in `localStorage`.
    *   The `/api/login/route.ts` was setting an `httpOnly` cookie, which is inaccessible to client-side JavaScript (and thus to `localStorage`).
*   **Solution:**
    1.  The client-side login component (`src/app/login/page.tsx`) was modified to make its login request to the Next.js API route (`/api/login`) instead of directly to the backend. This ensured the Next.js API route could handle cookie setting.
    2.  The `src/app/login/page.tsx` was updated to store the `access_token` in `localStorage` using the key `'token'`, aligning with the key expected by the `axios` interceptor.
    3.  The `/api/login/route.ts` continued to set the secure, `httpOnly` cookie for the `proxy.ts` middleware, ensuring server-side route protection.

## 4. `ECONNREFUSED` Error When Connecting to Backend

*   **Problem:** The Next.js API route (`/api/login/route.ts`) failed to connect to the backend API with an `ECONNREFUSED` error. This was due to an incorrect backend URL (either a hardcoded IP address or `localhost`) being used within the Dockerized environment.
*   **Solution:** The backend service name (`api`) was identified from the backend's `docker-compose.yml` file. The backend URL in `src/app/api/login/route.ts` was updated to `http://api/api/admin/login`, allowing the Next.js container to correctly resolve and connect to the backend API container via Docker's internal DNS.

## 5. "Method 'GET' Not Allowed" Error from Backend

*   **Problem:** After resolving the connection issue, the backend API returned a "Method 'GET' not allowed" error, despite the Next.js API route sending a `POST` request.
*   **Solution:** A trailing slash was added to the backend API URL in `src/app/api/login/route.ts`, changing it to `http://api/api/admin/login/`. This addressed a common routing strictness in backend frameworks (like Django, which was suggested by the `docker-compose.yml`), ensuring the `POST` request was correctly routed to the intended endpoint.
