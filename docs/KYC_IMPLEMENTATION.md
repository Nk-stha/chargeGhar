# KYC Implementation Documentation

## Overview
This document describes the implementation of the KYC (Know Your Customer) verification feature for the ChargeGhar admin dashboard. This feature allows administrators to review, approve, or reject user-submitted KYC documents.

## Features Implemented

### 1. KYC Submissions List
- View all KYC submissions from users
- Display submission details including:
  - User information (username, email)
  - Document type (e.g., CITIZENSHIP)
  - Document number
  - Submission status (PENDING, APPROVED, REJECTED)
  - Submission date
  - Verified by (admin username)

### 2. Status Management
- **Approve KYC**: Administrators can approve pending KYC submissions
- **Reject KYC**: Administrators can reject pending KYC submissions with a mandatory rejection reason
- Real-time status updates

### 3. Search & Filter
- **Search**: Search by username, email, document number, or document type
- **Filter**: Filter submissions by status (ALL, PENDING, APPROVED, REJECTED)
- **Refresh**: Manual refresh to get latest submissions

### 4. Statistics Dashboard
- Total Submissions count
- Pending submissions count
- Approved submissions count
- Rejected submissions count

### 5. Document Viewing
- View document images (front and back)
- Modal-based detail view for each submission
- Quick actions from the detail view

## File Structure

```
chargeGhar/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── admin/
│   │   │       └── kyc/
│   │   │           ├── route.ts                    # GET /api/admin/kyc - List submissions
│   │   │           └── [id]/
│   │   │               └── route.ts                # PATCH /api/admin/kyc/[id] - Update status
│   │   └── dashboard/
│   │       └── kyc/
│   │           ├── page.tsx                        # KYC management page component
│   │           └── kyc.module.css                  # Styles for KYC page
│   └── components/
│       └── Navbar/
│           └── Navbar.tsx                          # Updated with KYC menu item
```

## API Endpoints

### 1. GET /api/admin/kyc
**Description**: Fetch all KYC submissions

**Headers**:
- `Authorization: Bearer <access_token>`

**Response**:
```json
{
  "success": true,
  "message": "KYC submissions retrieved successfully",
  "data": {
    "kyc_submissions": [
      {
        "id": "uuid",
        "user_id": "string",
        "username": "string",
        "email": "string",
        "phone_number": "string | null",
        "document_type": "string",
        "document_number": "string",
        "document_front_url": "string",
        "document_back_url": "string | null",
        "status": "PENDING | APPROVED | REJECTED",
        "verified_at": "string | null",
        "verified_by_username": "string | null",
        "rejection_reason": "string | null",
        "created_at": "string",
        "updated_at": "string"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "total_count": 1,
      "page_size": 20,
      "has_next": false,
      "has_previous": false,
      "next_page": null,
      "previous_page": null
    }
  }
}
```

### 2. PATCH /api/admin/kyc/[id]
**Description**: Update KYC submission status

**Headers**:
- `Authorization: Bearer <access_token>`
- `X-CSRFTOKEN: <csrf_token>`

**Request Body**:
```json
{
  "status": "APPROVED | REJECTED",
  "rejection_reason": "string (required when status is REJECTED)"
}
```

**Response**:
```json
{
  "success": true,
  "message": "KYC status updated successfully",
  "data": {
    "kyc_id": "uuid",
    "user": "string",
    "old_status": "string",
    "new_status": "string",
    "verified_by": "string"
  }
}
```

## Usage Guide

### Accessing KYC Management
1. Log in to the admin dashboard
2. Click on "KYC" in the sidebar navigation
3. The KYC management page will display all submissions

### Reviewing a Submission
1. Click the "eye" icon (👁️) in the Actions column
2. Review the user details and document images
3. Click "Approve" or "Reject" buttons if the submission is pending

### Approving a Submission
1. Click the "check" icon (✓) directly from the list, OR
2. View the submission and click "Approve" button
3. Confirm the approval in the modal
4. The status will update to "APPROVED"

### Rejecting a Submission
1. Click the "X" icon directly from the list, OR
2. View the submission and click "Reject" button
3. Provide a mandatory rejection reason
4. Confirm the rejection in the modal
5. The status will update to "REJECTED"

### Searching and Filtering
- Use the search bar to search by username, email, document number, or document type
- Use the status dropdown to filter by submission status
- Click "Refresh" to reload the latest data

## Color Palette & Design Consistency

The implementation follows the existing ChargeGhar design system:

- **Primary Green**: `#82ea80` (titles, active states)
- **Success Green**: `#32cd32` (approved status, approve buttons)
- **Warning Orange**: `#ff8c00` (pending status)
- **Error Red**: `#ff4444` (rejected status, reject buttons)
- **Background Dark**: `#0b0b0b` (main background)
- **Card Background**: `#121212` (cards, modals)
- **Border Color**: `#2a2a2a` (borders, separators)
- **Text Primary**: `#fff` (primary text)
- **Text Secondary**: `#aaa` (secondary text, labels)

## Authentication

The KYC feature uses the existing authentication system:
- Access token is automatically included in API requests via axios interceptor
- Token is stored in localStorage after admin login
- Unauthorized requests will redirect to login page

## Environment Variables

Ensure the following environment variable is set in `.env.local`:
```
BASE_URL=https://main.chargeghar.com/api
```

## Future Enhancements (Optional)

- Pagination controls for large datasets
- Bulk approval/rejection actions
- Export KYC data to CSV/Excel
- Document image zoom/fullscreen view
- Email notifications to users on status change
- Audit log for KYC status changes
- Filter by date range
- Sort by different columns

## Troubleshooting

### "Authorization header is required"
- Ensure you're logged in and access token is stored in localStorage
- Check browser console for token expiration
- Try logging out and logging back in

### KYC submissions not loading
- Check network tab for API errors
- Verify BASE_URL environment variable is correctly set
- Ensure backend API is accessible

### Unable to update status
- Ensure rejection reason is provided when rejecting
- Check CSRF token is being sent correctly
- Verify admin has permission to update KYC status

## Testing Checklist

- [ ] View KYC submissions list
- [ ] Search for submissions by username
- [ ] Filter submissions by status
- [ ] View submission details in modal
- [ ] Approve a pending submission
- [ ] Reject a pending submission with reason
- [ ] Verify status updates reflect immediately
- [ ] Test responsive design on mobile devices
- [ ] Verify authentication and token refresh
- [ ] Test error handling for failed API calls

## Notes

- Only PENDING submissions can be approved or rejected
- Rejection reason is mandatory when rejecting a submission
- The backend API URL is proxied through Next.js API routes for security
- All API calls use the axios instance with automatic token injection
- The feature integrates seamlessly with the existing dashboard layout and styling