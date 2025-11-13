# KYC Edit Feature - Main Documentation

> **Feature:** Allow admins to reject previously approved KYC submissions

---

## 📋 Table of Contents

- [Overview](#overview)
- [What's New](#whats-new)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Installation](#installation)
- [Usage Guide](#usage-guide)
- [Technical Details](#technical-details)
- [Troubleshooting](#troubleshooting)
- [FAQs](#faqs)
- [Support](#support)

---

## Overview

This feature extends the existing KYC (Know Your Customer) management system by allowing administrators to **reject KYC submissions even after they have been approved**. This provides flexibility for post-approval review and correction of KYC verification decisions.

### Business Value

- ✅ Correct approval mistakes without backend intervention
- ✅ Handle fraud detection post-approval
- ✅ Respond to expired or invalid documents
- ✅ Maintain audit trail with rejection reasons
- ✅ Improve compliance and risk management

---

## What's New

### 🎯 Core Feature
**Edit functionality for APPROVED KYC submissions** with the ability to reject them and provide a mandatory rejection reason.

### 🎨 UI Changes

1. **Table Actions Column**
   - New orange "Edit" button (📝) for APPROVED submissions
   - Click to directly open rejection modal

2. **Modal View**
   - New "Reject" button in modal footer for APPROVED submissions
   - Allows transition from viewing to rejecting

3. **Color Coding**
   - Edit button: Orange (#ff8c00)
   - Consistent with existing design system

### 🔧 Technical Changes

1. **API Endpoint Updated**
   - Old: `/api/admin/kyc/{id}`
   - New: `/api/admin/kyc/submissions/{id}`

2. **Request Format Changed**
   - Old: JSON (`application/json`)
   - New: FormData (`multipart/form-data`)

3. **Backend Integration**
   - Proper status transition support (APPROVED → REJECTED)
   - Mandatory rejection reason field
   - Admin tracking (verified_by)

---

## Quick Start

### For Admins (Users)

1. **Navigate to KYC page:**
   ```
   Dashboard → KYC Verification
   ```

2. **Find an approved submission:**
   - Look for submissions with green "APPROVED" badge
   - You'll see an orange Edit button (📝)

3. **Reject the submission:**
   - Click the Edit button
   - Enter a clear rejection reason
   - Click "Confirm Rejection"

4. **Verify the change:**
   - Status changes to red "REJECTED"
   - Table automatically refreshes
   - Rejection reason is stored

### For Developers

1. **Files Modified:**
   - `src/app/dashboard/kyc/page.tsx`
   - `src/app/dashboard/kyc/kyc.module.css`

2. **Build & Deploy:**
   ```bash
   npm run build
   npm start
   ```

3. **Test:**
   - Approve a pending KYC
   - Use Edit button to reject it
   - Verify API call format

---

## Documentation

Comprehensive documentation is available in separate files:

| Document | Description | Link |
|----------|-------------|------|
| **Implementation Details** | Technical implementation, code changes, API specs | [kyc-edit-implementation.md](./kyc-edit-implementation.md) |
| **Testing Guide** | Complete testing checklist and test cases | [kyc-edit-testing.md](./kyc-edit-testing.md) |
| **Implementation Summary** | High-level overview and completion status | [kyc-edit-summary.md](./kyc-edit-summary.md) |
| **Visual Guide** | Before/after comparisons, UI mockups | [kyc-edit-visual-guide.md](./kyc-edit-visual-guide.md) |

---

## Installation

### Prerequisites

- ✅ Node.js (v18 or higher)
- ✅ Next.js 16.x
- ✅ Admin authentication configured
- ✅ Backend API supporting the endpoint

### Setup Steps

**No additional setup required!** The feature is built into the existing codebase.

1. **Pull latest code:**
   ```bash
   git pull origin main
   ```

2. **Install dependencies (if needed):**
   ```bash
   npm install
   ```

3. **Build the project:**
   ```bash
   npm run build
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Access the feature:**
   ```
   http://localhost:3000/dashboard/kyc
   ```

---

## Usage Guide

### Scenario 1: Quick Rejection from Table

**Use Case:** You spot an approved KYC that needs immediate rejection

**Steps:**
1. Filter by "Approved" status (optional)
2. Find the submission in the table
3. Click the orange **Edit** button (📝) in Actions column
4. Modal opens in Reject mode
5. Enter rejection reason (e.g., "Documents have expired")
6. Click **Confirm Rejection**
7. Done! Status updates to REJECTED

**Time Required:** ~30 seconds

---

### Scenario 2: Detailed Review Before Rejection

**Use Case:** You want to review documents before rejecting

**Steps:**
1. Click the **View** button (👁️) on approved submission
2. Review all KYC details and documents
3. Decide if rejection is necessary
4. Click **Reject** button in modal footer
5. Modal transitions to Reject mode
6. Enter detailed rejection reason
7. Click **Confirm Rejection**
8. Done!

**Time Required:** ~2-5 minutes

---

### Best Practices

#### ✅ DO:
- Provide clear, specific rejection reasons
- Review documents carefully before rejecting
- Use professional language in rejection reasons
- Check submission date and verification details

#### ❌ DON'T:
- Leave rejection reason empty or vague
- Reject without proper review
- Use unprofessional language
- Reject approved KYCs without valid reason

---

## Technical Details

### API Specification

**Endpoint:**
```
PATCH /api/admin/kyc/submissions/{kyc_id}
```

**Authentication:**
```
Authorization: Bearer {access_token}
```

**Request Body (FormData):**
```
status: "REJECTED"
rejection_reason: "Detailed reason here"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "KYC status updated successfully",
  "data": {
    "kyc_id": "c1891e73-b531-4ce6-9697-813b8cd61509",
    "user": "username",
    "old_status": "APPROVED",
    "new_status": "REJECTED",
    "verified_by": "admin_username"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Rejection reason is required"
}
```

---

### Button State Logic

```typescript
// PENDING submissions
if (submission.status === "PENDING") {
  return [ViewButton, ApproveButton, RejectButton];
}

// APPROVED submissions (NEW!)
if (submission.status === "APPROVED") {
  return [ViewButton, EditButton];
}

// REJECTED submissions
if (submission.status === "REJECTED") {
  return [ViewButton];
}
```

---

### State Flow

```
┌──────────┐
│ PENDING  │
└────┬─────┘
     │
     ├─── Approve ──> ┌──────────┐
     │                │ APPROVED │
     │                └────┬─────┘
     │                     │
     │                     └─── Edit/Reject (NEW!) ──┐
     │                                                │
     └─── Reject ─────────────────────────────────>  │
                                                      ▼
                                                ┌──────────┐
                                                │ REJECTED │
                                                └──────────┘
```

---

## Troubleshooting

### Issue: Edit button not visible

**Possible Causes:**
- Submission status is not "APPROVED"
- CSS class not loaded
- Page cache issue

**Solution:**
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

---

### Issue: API returns 404 error

**Possible Causes:**
- Wrong endpoint URL
- Backend not updated

**Solution:**
- Verify endpoint: `/api/admin/kyc/submissions/{id}`
- Check backend logs
- Confirm backend supports the endpoint

---

### Issue: Rejection reason not saved

**Possible Causes:**
- Empty/whitespace-only reason
- Backend validation failure
- Network error

**Solution:**
- Ensure rejection reason has actual text
- Check browser console for errors
- Verify network request in DevTools

---

### Issue: 401 Unauthorized error

**Possible Causes:**
- Expired authentication token
- Invalid credentials
- Token not in localStorage

**Solution:**
```javascript
// Check token in browser console
localStorage.getItem('accessToken');

// If null or expired, re-login
window.location.href = '/login';
```

---

## FAQs

### Q: Can I re-approve a rejected KYC?

**A:** Not directly from the UI. This feature currently only supports APPROVED → REJECTED transitions. For re-approval, contact backend support or wait for future enhancement.

---

### Q: Is the rejection reason visible to the user?

**A:** This depends on your backend implementation and notification system. The reason is stored in the database and visible to admins.

---

### Q: What happens if I close the modal without confirming?

**A:** No changes are made. The status remains APPROVED. You can safely cancel at any time.

---

### Q: Can I reject multiple KYCs at once?

**A:** Not currently. Each rejection must be done individually with its own reason. Bulk actions may be added in future updates.

---

### Q: Does rejecting an approved KYC notify the user?

**A:** This depends on your backend notification system. The frontend only updates the status. Backend should handle user notifications.

---

### Q: Can I see who originally approved the KYC?

**A:** Yes, the "Verified By" column shows which admin approved it. This information is preserved even after rejection.

---

### Q: Is there an audit log of status changes?

**A:** The backend tracks the `verified_by` field and status changes. Full audit logging depends on backend implementation.

---

### Q: What if my rejection reason is too long?

**A:** There's no frontend limit on rejection reason length. The textarea is resizable. However, backend may have length limits (check with backend team).

---

## Support

### For Questions or Issues

1. **Check Documentation:**
   - Review [Implementation Details](./kyc-edit-implementation.md)
   - Check [Testing Guide](./kyc-edit-testing.md)

2. **Browser Console:**
   - Open DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for API responses

3. **Common Solutions:**
   - Clear browser cache
   - Re-login to refresh token
   - Check backend API status
   - Verify network connectivity

4. **Contact:**
   - Frontend Issues: Check component files
   - Backend Issues: Contact API team
   - Authentication: Check auth system logs

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Nov 2024 | Initial implementation of KYC edit feature |

---

## Contributing

When modifying this feature:

1. **Follow existing patterns:**
   - Use existing color palette
   - Match current UI/UX design
   - Follow project structure

2. **Test thoroughly:**
   - Run all test cases from testing guide
   - Check responsive design
   - Verify API integration

3. **Update documentation:**
   - Update relevant docs
   - Add new test cases if needed
   - Document breaking changes

---

## License

Same as main project license.

---

## Acknowledgments

- Built on existing KYC management system
- Uses react-icons/fi for icons
- Follows Next.js 16 best practices
- Production-ready and optimized

---

**Status:** ✅ Production Ready  
**Build:** ✅ Passing  
**Tests:** ✅ Verified  
**Documentation:** ✅ Complete  

---

**Last Updated:** November 2024