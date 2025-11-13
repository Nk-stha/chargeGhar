# KYC Edit Feature - Testing Guide

## Quick Test Steps

### Prerequisites
- Admin account with valid authentication token
- Access to the KYC management page at `/dashboard/kyc`
- At least one APPROVED KYC submission in the database

---

## Test Case 1: View Approved KYC Submission

**Steps:**
1. Navigate to `/dashboard/kyc`
2. Filter submissions by "Approved" status
3. Locate an approved KYC submission in the table
4. Verify the following is displayed:
   - User information (name and email)
   - Document type and number
   - Green "APPROVED" badge
   - Verified by admin name
   - Actions: View button (green eye icon) and Edit button (orange edit icon)

**Expected Result:**
- Edit button (orange) is visible for approved submissions
- View button is also present

---

## Test Case 2: Click Edit Button on Approved KYC

**Steps:**
1. Click the orange Edit button on an approved KYC submission
2. Observe the modal that opens

**Expected Result:**
- Modal opens immediately in "Reject" mode
- Modal title shows "Reject KYC Submission"
- Confirmation message appears with username
- Rejection reason textarea is displayed
- Textarea shows placeholder: "Please provide a reason for rejection..."
- Red asterisk (*) indicates rejection reason is required
- Two buttons visible: "Cancel" and "Confirm Rejection"

---

## Test Case 3: Reject Without Providing Reason

**Steps:**
1. Open reject modal for approved KYC (via Edit button)
2. Leave rejection reason field empty
3. Click "Confirm Rejection" button

**Expected Result:**
- Alert appears: "Please provide a rejection reason"
- Modal remains open
- No API call is made
- Status is not updated

---

## Test Case 4: Successfully Reject Approved KYC

**Steps:**
1. Click Edit button on an approved KYC
2. Enter a valid rejection reason (e.g., "Documents are expired")
3. Click "Confirm Rejection" button
4. Wait for processing

**Expected Result:**
- Button shows loading state: "Processing..." with spinner icon
- Both buttons are disabled during processing
- API call is made to: `PATCH /api/admin/kyc/submissions/{kyc_id}`
- Request uses FormData with:
  - `status: "REJECTED"`
  - `rejection_reason: "Documents are expired"`
- On success:
  - Modal closes automatically
  - Table refreshes with updated data
  - Submission now shows red "REJECTED" badge
  - Rejection reason is stored

---

## Test Case 5: View Rejected Submission After Update

**Steps:**
1. After rejecting an approved KYC, locate the submission in the table
2. Click the View button (eye icon)
3. Review the details in the modal

**Expected Result:**
- Status shows red "REJECTED" badge
- "Rejection Reason" field is visible with the reason provided
- Only "Close" button is shown in modal footer
- No action buttons (Approve/Reject) are displayed

---

## Test Case 6: View Modal for Approved Submission

**Steps:**
1. Click View button (eye icon) on an approved submission
2. Observe modal content

**Expected Result:**
- Modal opens in "View" mode
- Title: "KYC Submission Details"
- All submission details are displayed
- Status shows green "APPROVED" badge
- Modal footer shows:
  - "Close" button
  - "Reject" button (red with X icon) - **NEW FEATURE**
- No "Approve" button (already approved)

---

## Test Case 7: Reject from View Modal

**Steps:**
1. Open View modal for approved submission
2. Click "Reject" button in modal footer
3. Observe modal transition

**Expected Result:**
- Modal transitions from View mode to Reject mode
- Modal title changes to "Reject KYC Submission"
- Rejection reason textarea appears
- Footer buttons change to "Cancel" and "Confirm Rejection"

---

## Test Case 8: Cancel Rejection

**Steps:**
1. Open reject modal for approved KYC
2. Enter some text in rejection reason
3. Click "Cancel" button

**Expected Result:**
- Modal closes
- No API call is made
- Status remains APPROVED
- Rejection reason is discarded

---

## Test Case 9: API Error Handling

**Steps:**
1. Open network tools in browser
2. Attempt to reject an approved KYC
3. Simulate network failure or 500 error

**Expected Result:**
- Alert shows error message
- Modal remains open
- User can retry or cancel
- Loading state ends

---

## Test Case 10: Pending KYC Behavior (Unchanged)

**Steps:**
1. Locate a PENDING KYC submission
2. Verify buttons in table

**Expected Result:**
- Three buttons visible: View, Approve (green check), Reject (red X)
- NO Edit button (Edit is only for approved)
- Existing functionality works as before

---

## Test Case 11: Multiple Status Transitions

**Steps:**
1. Start with a PENDING submission
2. Approve it
3. Verify Edit button appears
4. Reject it using Edit button
5. Verify final state

**Expected Result:**
- PENDING → Shows Approve & Reject buttons
- After approval → Shows Edit button
- After rejection via Edit → Shows only View button
- Status changes correctly at each step

---

## Browser Compatibility Testing

Test on:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Chrome (Android)
- [ ] Mobile Safari (iOS)

---

## Responsive Design Testing

Test at different screen sizes:
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

**Expected Result:**
- All buttons remain accessible
- Modal is properly sized and scrollable
- Edit button doesn't overlap other buttons
- Text remains readable

---

## Accessibility Testing

- [ ] All buttons have proper title attributes
- [ ] Form labels are properly associated
- [ ] Required fields are marked
- [ ] Focus states are visible
- [ ] Keyboard navigation works
- [ ] Color contrast meets WCAG standards

---

## Performance Checks

- [ ] Table refreshes efficiently after status update
- [ ] No unnecessary API calls
- [ ] Modal opens/closes smoothly
- [ ] Loading states prevent duplicate submissions
- [ ] No console errors or warnings

---

## Security Checks

- [ ] Authentication token is included in requests
- [ ] Only admins can access the page
- [ ] API validates admin permissions
- [ ] FormData is properly constructed
- [ ] No sensitive data in console logs

---

## Common Issues & Debugging

### Issue: Edit button not appearing
- Check if submission status is exactly "APPROVED"
- Verify CSS class `.editBtn` is loaded
- Check browser console for errors

### Issue: API returns 404
- Verify endpoint is `/api/admin/kyc/submissions/{id}` not `/api/admin/kyc/{id}`
- Check if backend route exists

### Issue: API returns 400
- Verify FormData is being sent (not JSON)
- Check Content-Type header is multipart/form-data
- Ensure rejection_reason is included when status is REJECTED

### Issue: Token expired
- Axios interceptor should handle token refresh
- Check localStorage for valid tokens
- Verify refresh token endpoint is working

---

## Sign-Off Checklist

Before marking as complete:
- [ ] All test cases pass
- [ ] No console errors
- [ ] UI matches design specifications
- [ ] Color scheme is consistent (#ff8c00 for edit)
- [ ] Build completes without errors
- [ ] TypeScript types are correct
- [ ] Documentation is up to date
- [ ] Code follows existing patterns

---

## Notes for QA Team

1. **Focus Area**: The new Edit button for APPROVED submissions
2. **Critical Path**: Approve → Edit → Reject with reason → Success
3. **Edge Cases**: Empty rejection reason, network failures, concurrent edits
4. **Regression Testing**: Ensure existing approve/reject functionality still works for PENDING submissions
5. **Data Integrity**: Verify rejection_reason is stored and displayed correctly