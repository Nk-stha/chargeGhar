
# Backend API Implementation Plan: Admin Coupons

This document outlines the plan for implementing the backend API for creating admin coupons.

### 1. **Core Concept & Rationale**

*   **Technological Approach:** The existing Next.js application will be leveraged to create a new API route that acts as a proxy to the main backend server. This approach is justified because it maintains consistency with the current architecture, where the Next.js application serves as a frontend and a secure gateway to the backend services. This pattern simplifies the frontend development by providing a unified API endpoint and offloads the business logic to the backend server.

*   **Non-Functional Requirements:**
    | Requirement          | Description                                                                                                                              |
    | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
    | **Security**         | The API endpoint must be secured to prevent unauthorized access. This includes validating authentication tokens (Bearer token) and CSRF tokens. |
    | **Low Latency**      | The API should respond within 200ms under normal load conditions to ensure a smooth user experience for the admin creating the coupon.      |
    | **High Availability**| The API endpoint must have a 99.9% uptime to ensure that admins can create coupons at any time.                                          |

### 2. **Implementation & Design Details**

*   **Step-by-Step Implementation Outline:**
    1.  **Create the API Route File:** Create a new file `src/app/api/admin/coupons/route.ts`.
    2.  **Implement the POST Handler:** Create an async `POST` function that accepts a `NextRequest` object.
    3.  **Extract Data from Request:** Extract the `multipart/form-data` from the request body. This includes the fields: `code`, `name`, `points_value`, `max_uses_per_user`, `valid_from`, and `valid_until`.
    4.  **Forward Request to Backend:** Create a new `FormData` object and append the extracted data. Then, make a `POST` request to the backend server at `${process.env.BASE_URL}/admin/coupons`.
    5.  **Handle Authentication:** Forward the `Authorization` and `X-CSRFTOKEN` headers from the original request to the backend server.
    6.  **Return Response:** Return the response from the backend server to the client.
    7.  **Error Handling:** Implement robust error handling to catch and log any errors that occur during the process.

*   **Components & Resources:**
    | Component/Resource | Description                                                                                                                                                           |
    | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | **Next.js API Route** | A new API route file at `src/app/api/admin/coupons/route.ts`.                                                                                                         |
    | **Backend Server** | The main backend server that contains the business logic for creating and managing coupons. The URL is configured in the `BASE_URL` environment variable.                |
    | **Environment Variable** | `BASE_URL` must be configured to point to the correct backend server URL.                                                                                             |
    | **Axios**          | The `axios` library will be used to make the HTTP request to the backend server.                                                                                        |
    | **FormData**       | The `form-data` library will be used to construct the `multipart/form-data` request body.                                                                               |

*   **Data Handling:**
    The Next.js API route will not store any data. It will act as a pass-through layer, forwarding the request data to the backend server. The backend server is responsible for validating the data, creating the coupon in the database, and returning the appropriate response. The data will be transmitted securely using HTTPS.

### 3. **Optimization & Production Readiness**

*   **High Availability & Fault Tolerance:**
    - **Backend Redundancy:** The backend server should be deployed in a high-availability configuration, with multiple instances running behind a load balancer.
    - **Health Checks:** The load balancer should be configured with health checks to automatically remove unhealthy instances from the rotation.
    - **Retry Mechanism:** A retry mechanism with exponential backoff can be implemented in the Next.js API route to handle transient backend failures.

*   **Performance Optimization:**
    - **Connection Pooling:** The backend server should use a connection pool to manage database connections efficiently.
    - **Caching:** The backend can implement caching for frequently accessed data, although it is less relevant for a `POST` request that creates a new resource.
    - **Query Optimization:** The database queries for creating a coupon should be optimized to ensure fast execution.

*   **DevOps & Monitoring:**
    - **Logging:** All requests and responses, including errors, should be logged. A structured logging format (e.g., JSON) should be used to make the logs easily searchable.
    - **Alerting:** Alerts should be configured to notify the development team of any critical errors, such as a high rate of 5xx responses or a backend server becoming unavailable.
    - **Metrics:** Key performance indicators (KPIs) such as request latency, error rate, and throughput should be monitored using a tool like Prometheus or Datadog.

### 4. **Reusability & Future Proofing**

*   **Reusability:**
    - **Modular Components:** The Next.js API route is a self-contained module that can be easily reused or modified.
    - **Common Libraries:** The use of common libraries like `axios` and `form-data` ensures consistency and reusability across the project.
    - **Backend Service:** The backend coupon service is a reusable component that can be called from other services or applications.

*   **Potential Scaling Challenges:**
    | Challenge                               | Mitigation                                                                                                                                                                                          |
    | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | **Increased Number of Admin Users**     | The Next.js application can be scaled horizontally by running multiple instances behind a load balancer. The backend server can also be scaled horizontally to handle the increased load.                |
    | **Large Number of Coupon Creations**    | The backend database can be scaled vertically (by increasing the instance size) or horizontally (by sharding the data). Asynchronous processing can be introduced to handle a high volume of coupon creation requests. |



# UI Implementation Plan: Admin Coupons

This document outlines the plan for a UI that will be implemented so that the admin can create coupons.

### 1. **Core Concept & Rationale**

*   **Technological aApproach** A new page will be created in the admin dashboard that will have a form to create coupons and the UI will be implemented using **React** and **Tailwind CSS** for styling, which is consistent with the existing frontend stack.

### 2. **Implementation & Design Details**

*   **Step-by-Step Implementation Outline:**
    1.  **Identify Integration Point:** The coupon creation form will be integrated into the existing modal within `src/app/dashboard/settings/page.tsx` that is triggered by the "Add Coupon" button.
    2.  **Update Modal Content:** Modify the `selectedSection === "coupon"` block within the `Modal` component to include input fields for `code`, `name`, `points_value`, `max_uses_per_user`, `valid_from`, and `valid_until`.
    3.  **State Management:** Use React's `useState` hook within the `SettingsPage` component (or a dedicated sub-component for the form) to manage the state of the new form inputs.
    4.  **Form Submission Handler:** Implement an `onSubmit` handler for the form within the modal. This handler will:
        a.  Create a `FormData` object.
        b.  Append all the collected form data (`code`, `name`, `points_value`, `max_uses_per_user`, `valid_from`, `valid_until`) to the `FormData` object.
        c.  Make an asynchronous `POST` request to the `/api/admin/coupons` endpoint using `axios`.
        d.  Include necessary headers like `Authorization` and `X-CSRFTOKEN` (if applicable, based on the backend requirements).
    5.  **Response Handling:** Handle the API response:
        a.  On success, display a success message (e.g., a toast notification), clear the form, and potentially refresh the coupon list.
        b.  On error, display an informative error message to the user.
    6.  **Input Validation:** Implement client-side validation for the form fields (e.g., required fields, date format, number ranges).

*   **Components & Resources:**
    | Component/Resource | Description                                                                                                                                                           |
    | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | **`SettingsPage` Component** | The existing `src/app/dashboard/settings/page.tsx` will be modified to accommodate the new form logic and state.                                         |
    | **`Modal` Component** | The generic `Modal` component (from `src/components/modal/modal.tsx`) will be used, with its content dynamically rendered based on `selectedSection`.
    | **Form Fields** | Input fields for `code`, `name`, `points_value`, `max_uses_per_user`, as well as date/time pickers for `valid_from` and `valid_until` will be added within the modal.                                                                                            |
    | **Axios**          | The `axios` library will be used to make the HTTP request to the backend server.                                                                                        |
    | **State Management**       | React's `useState` hook will be used to manage the form state within the `SettingsPage` component.                                                                              |

*   **Data Handling:**
    The UI will collect the coupon data from the admin user via the form in the modal. This data will be validated client-side before being sent as `multipart/form-data` to the `/api/admin/coupons` endpoint. The UI will not persist any coupon data directly; it will rely on the backend API for data storage and retrieval. Error messages from the backend will be displayed to the user.

### 3. **Optimization & Production Readiness**

*   **User Experience:**
    - **Loading States:** A loading indicator will be displayed within the modal while the API request is in progress to provide feedback to the user.
    - **Feedback:** Clear and concise success and error messages (e.g., using a toast notification system) will be displayed to the user after the API request is complete.
    - **Form Reset:** The form fields will be reset after a successful submission.

*   **Performance Optimization:**
    - **Minimal Re-renders:** Optimize state updates to minimize unnecessary component re-renders.

*   **DevOps & Monitoring:**
    - **Error Tracking:** Client-side errors during form submission or API calls will be tracked using a tool like Sentry or Bugsnag to help identify and resolve issues quickly.



# Backend & UI Implementation Plan: Get Coupons

This document outlines the plan for implementing the backend API and UI for fetching and displaying admin coupons.

## Backend API Implementation

### 1. **Core Concept & Rationale**

*   **Technological Approach:** An API route in the Next.js application will be created to act as a proxy for the main backend server. This is consistent with the existing architecture, providing a unified API gateway for the frontend and centralizing backend communication.

*   **Non-Functional Requirements:**
    | Requirement          | Description                                                                                                                              |
    | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
    | **Security**         | The API endpoint must be secured, forwarding the `Authorization` token to the backend to ensure only authenticated admins can access the data. |
    | **Low Latency**      | The API should respond within 300ms under normal load to ensure the coupon list loads quickly for the user.      |
    | **Data Integrity**| The data returned from the backend must be accurately proxied to the frontend without modification.                                          |

### 2. **Implementation & Design Details**

*   **Step-by-Step Implementation Outline:**
    1.  **Modify API Route File:** Open the existing file `src/app/api/admin/coupons/route.ts`.
    2.  **Implement the GET Handler:** Add an async `GET` function that accepts a `NextRequest` object.
    3.  **Forward Request to Backend:** Make a `GET` request to the backend server at `${process.env.BASE_URL}/admin/coupons` using the custom `axios` instance.
    4.  **Handle Authentication:** The existing `axios` interceptor will automatically attach the `Authorization` header.
    5.  **Return Response:** Return the paginated coupon data from the backend server to the client.
    6.  **Error Handling:** Implement error handling to catch and log any issues during the proxy request.

*   **Components & Resources:**
    | Component/Resource | Description                                                                                                                                                           |
    | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | **Next.js API Route** | The existing API route file at `src/app/api/admin/coupons/route.ts` will be modified to include a `GET` handler.                                                                                                         |
    | **Backend Server** | The main backend server that serves the coupon data.                |
    | **Axios Instance** | The pre-configured `axios` instance from `src/lib/axios.ts` will be used to make the request.                                                                                        |

*   **Data Handling:**
    The Next.js API route will act as a pass-through proxy for the `GET` request. It will not perform any data manipulation. The backend is responsible for querying the database, pagination, and returning the coupon list.

## UI Implementation

### 1. **Core Concept & Rationale**

*   **Technological Approach:** The existing `SettingsPage` component (`src/app/dashboard/settings/page.tsx`) will be updated to fetch and display the list of coupons dynamically. This avoids creating new pages and keeps related functionality within the same view, improving user experience.

### 2. **Implementation & Design Details**

*   **Step-by-Step Implementation Outline:**
    1.  **State Management:** Create a new state variable, `const [coupons, setCoupons] = useState([]);`, to hold the list of coupons fetched from the API.
    2.  **Data Fetching:** Use a `useEffect` hook to fetch the coupons when the component mounts. This hook will call an async function that:
        a.  Makes a `GET` request to the `/api/admin/coupons` endpoint using the custom `axios` instance.
        b.  On success, updates the `coupons` state with the `results` array from the API response (`response.data.data.results`).
        c.  Handles any potential errors during the fetch.
    3.  **Dynamic Rendering:** Modify the coupon table in the JSX to map over the `coupons` state variable instead of the hardcoded data.
    4.  **Refresh on Create:** In the `handleCreateCoupon` function, after a new coupon is successfully created, call the function that fetches coupons to refresh the list, ensuring the new coupon appears in the table without a page reload.

*   **Components & Resources:**
    | Component/Resource | Description                                                                                                                                                           |
    | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | **`SettingsPage` Component** | The `src/app/dashboard/settings/page.tsx` component will be modified to fetch and display dynamic coupon data.                                         |
    | **React Hooks** | `useState` will be used for storing the coupon list, and `useEffect` will be used for fetching the data on component mount.                                                                                            |
    | **Axios Instance** | The custom `axios` instance from `src/lib/axios.ts` will be used for the `GET` request.                                                                                        |

### 3. **Optimization & Production Readiness**

*   **User Experience:**
    - **Loading State:** Display a loading indicator (e.g., a spinner) in the coupon table while the data is being fetched.
    - **Empty State:** If no coupons are returned from the API, display a user-friendly message in the table (e.g., "No coupons found. Add one to get started!").

*   **Performance Optimization:**
    - **Pagination:** While the backend supports pagination, the initial UI implementation will fetch the first page. Future enhancements could include adding UI controls for navigating through pages.

*   **DevOps & Monitoring:**
    - **Error Tracking:** Any client-side errors during the data fetch will be tracked using a tool like Sentry or Bugsnag.

# Backend & UI Implementation Plan: Delete Coupon

This document outlines the plan for implementing the backend API and UI for deleting admin coupons.

## Backend API Implementation

### 1. **Core Concept & Rationale**

*   **Technological Approach:** A new dynamic API route will be created in the Next.js application to handle the deletion of a specific coupon. This route will proxy the request to the main backend server, maintaining consistency with the existing architecture.

*   **Non-Functional Requirements:**
    | Requirement          | Description                                                                                                                              |
    | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
    | **Security**         | The API endpoint must be secured, forwarding the `Authorization` token to the backend to ensure only authenticated admins can delete coupons. |
    | **Low Latency**      | The API should respond within 200ms under normal load to ensure a responsive UI.      |
    | **Idempotency**      | The `DELETE` operation should be idempotent. Deleting the same coupon multiple times should result in the same state (the coupon is deleted). |

### 2. **Implementation & Design Details**

*   **Step-by-Step Implementation Outline:**
    1.  **Create Dynamic API Route File:** Create a new file `src/app/api/admin/coupons/[code]/route.ts`.
    2.  **Implement the DELETE Handler:** Add an async `DELETE` function that accepts a `NextRequest` object and a `params` object containing the coupon code.
    3.  **Forward Request to Backend:** Make a `DELETE` request to the backend server at `${process.env.BASE_URL}/admin/coupons/${params.code}` using the custom `axios` instance.
    4.  **Handle Authentication:** The existing `axios` interceptor will automatically attach the `Authorization` header.
    5.  **Return Response:** Return the response from the backend server to the client.
    6.  **Error Handling:** Implement error handling to catch and log any issues during the proxy request.

*   **Components & Resources:**
    | Component/Resource | Description                                                                                                                                                           |
    | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | **Next.js API Route** | A new dynamic API route file at `src/app/api/admin/coupons/[code]/route.ts`.                                                                                                         |
    | **Backend Server** | The main backend server that handles the coupon deletion logic.                |
    | **Axios Instance** | The pre-configured `axios` instance from `src/lib/axios.ts` will be used to make the request.                                                                                        |

*   **Data Handling:**
    The Next.js API route will act as a pass-through proxy for the `DELETE` request. The backend is responsible for deleting the coupon from the database.

## UI Implementation

### 1. **Core Concept & Rationale**

*   **Technological Approach:** The `SettingsPage` component (`src/app/dashboard/settings/page.tsx`) will be updated to include the delete functionality in the coupons table. This keeps the coupon management functionality consolidated in one place.

### 2. **Implementation & Design Details**

*   **Step-by-Step Implementation Outline:**
    1.  **Create `handleDelete` Function:** Create an async function `handleDelete` that accepts the coupon code as an argument.
    2.  **Confirmation Dialog:** Before proceeding, the function will show a confirmation dialog (e.g., `window.confirm()`) to prevent accidental deletions.
    3.  **API Request:** If the user confirms, make a `DELETE` request to the `/api/admin/coupons/${code}` endpoint using the custom `axios` instance.
    4.  **Response Handling:**
        a.  On success, display a success message and refresh the coupon list by calling `fetchCoupons()`.
        b.  On error, display an informative error message.
    5.  **Update UI:** Wire up the "Delete" button in the coupon table to call the `handleDelete` function, passing the coupon's code.

*   **Components & Resources:**
    | Component/Resource | Description                                                                                                                                                           |
    | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | **`SettingsPage` Component** | The `src/app/dashboard/settings/page.tsx` component will be modified to include the delete functionality.                                         |
    | **`handleDelete` Function** | A new function to handle the logic of confirming and deleting a coupon.                                                                                            |
    | **Axios Instance** | The custom `axios` instance from `src/lib/axios.ts` will be used for the `DELETE` request.                                                                                        |

### 3. **Optimization & Production Readiness**

*   **User Experience:**
    - **Confirmation:** The confirmation dialog is a critical UX feature to prevent accidental data loss.
    - **Feedback:** Clear success and error messages provide immediate feedback to the user.

*   **Performance Optimization:**
    - **List Refresh:** Refreshing the list after deletion ensures the UI is in sync with the backend state.

*   **DevOps & Monitoring:**
    - **Error Tracking:** Any client-side errors during the delete operation will be tracked using a tool like Sentry or Bugsnag.
