# Payment Methods Feature - Testing Checklist

## 🚀 Pre-Testing Setup

- [ ] Environment variables configured
  - [ ] `BASE_URL` set in `.env.local`
  - [ ] Backend API is running and accessible
  
- [ ] Dependencies installed
  - [ ] Run `npm install` (if not already done)
  
- [ ] Development server running
  - [ ] Run `npm run dev`
  - [ ] Server accessible at `http://localhost:3000`

- [ ] Authentication working
  - [ ] Can login to admin dashboard
  - [ ] Access token stored in localStorage
  - [ ] Token not expired

## 📋 Functional Testing

### Navigation
- [ ] Payment Methods link visible in sidebar
- [ ] Payment Methods icon shows correctly (credit card)
- [ ] Link highlights when active
- [ ] Clicking link navigates to `/dashboard/payment-methods`
- [ ] URL updates correctly

### Initial Page Load
- [ ] Loading spinner shows while fetching data
- [ ] Page title displays: "Payment Methods"
- [ ] Subtitle displays: "Manage payment gateways and their configurations"
- [ ] Add button visible in top-right
- [ ] Search bar visible
- [ ] Statistics display (Total & Active count)
- [ ] Payment methods table loads (if data exists)
- [ ] Empty state shows (if no data exists)

### Create Payment Method

#### Modal Opening
- [ ] Click "+ Add Payment Method" button
- [ ] Modal opens with overlay
- [ ] Modal title: "Add Payment Method"
- [ ] All form fields visible
- [ ] Active checkbox checked by default
- [ ] Close button (X) visible
- [ ] Clicking overlay closes modal
- [ ] Pressing ESC key closes modal

#### Form Validation
- [ ] Name field marked as required (*)
- [ ] Gateway field marked as required (*)
- [ ] Min amount field marked as required (*)
- [ ] Configuration field marked as required (*)
- [ ] Submit button disabled if JSON invalid
- [ ] Error shown for invalid JSON in configuration
- [ ] Error clears when JSON becomes valid

#### Create with Minimal Data
- [ ] Fill only required fields:
  - Name: "Test Payment"
  - Gateway: "test"
  - Min Amount: "10.00"
  - Configuration: `{"key": "value"}`
- [ ] Click "Create"
- [ ] Loading spinner shows on button
- [ ] Button text changes to "Creating..."
- [ ] Button disabled during submission
- [ ] Success message appears on success
- [ ] Modal closes automatically
- [ ] Table refreshes with new entry
- [ ] New payment method appears in list

#### Create with All Fields
- [ ] Fill all fields:
  - Name: "Complete Test"
  - Gateway: "complete"
  - Min Amount: "10.00"
  - Max Amount: "1000.00"
  - Currencies: "NPR, USD"
  - Configuration: `{"public_key": "test", "secret_key": "test"}`
  - Active: checked
- [ ] Submit successfully
- [ ] All fields saved correctly
- [ ] Currencies show as separate tags

#### Create Error Handling
- [ ] Submit with empty name → Error shown
- [ ] Submit with empty gateway → Error shown
- [ ] Submit with invalid min amount → Error shown
- [ ] Submit with invalid JSON → Error shown
- [ ] Backend error displays properly
- [ ] Form stays open on error
- [ ] Data not lost on error

### View Payment Methods

#### Table Display
- [ ] Table shows all payment methods
- [ ] Columns visible:
  - Name
  - Gateway
  - Status
  - Currencies
  - Min Amount
  - Max Amount
  - Configuration
  - Created
  - Actions
- [ ] Active status shows in green
- [ ] Inactive status shows in red
- [ ] Currencies show as tags
- [ ] Configuration values are masked
- [ ] Created date formatted correctly
- [ ] Edit and Delete icons visible

#### Configuration Masking
- [ ] Short values (≤8 chars) fully masked: `••••••••`
- [ ] Long values partially masked: `test••••••test`
- [ ] Multiple config keys all masked properly

### Search Functionality
- [ ] Type in search box
- [ ] Results filter in real-time
- [ ] Search by name works
- [ ] Search by gateway works
- [ ] Search by currency works
- [ ] Case-insensitive search
- [ ] Clear button (×) appears when typing
- [ ] Click clear button → search clears
- [ ] Empty state shows if no matches
- [ ] Message: "No payment methods match your search"

### Edit Payment Method

#### Modal Opening
- [ ] Click edit icon (pencil) on any row
- [ ] Modal opens with "Edit Payment Method" title
- [ ] All fields pre-filled with existing data
- [ ] Configuration shows as formatted JSON
- [ ] Active checkbox reflects current status

#### Update Data
- [ ] Change name → saves correctly
- [ ] Change gateway → saves correctly
- [ ] Change min amount → saves correctly
- [ ] Change max amount → saves correctly
- [ ] Change currencies → saves correctly
- [ ] Update configuration → saves correctly
- [ ] Toggle active status → saves correctly
- [ ] Partial update works (only changed fields)

#### Update Success
- [ ] Click "Update"
- [ ] Loading state shows
- [ ] Success message appears
- [ ] Modal closes
- [ ] Table refreshes
- [ ] Updated values visible in table

#### Update Error Handling
- [ ] Invalid JSON → error shown
- [ ] Backend error → error displayed
- [ ] Network error → proper message
- [ ] Modal stays open on error

### Delete Payment Method

#### Delete Flow
- [ ] Click delete icon (trash) on any row
- [ ] Confirmation dialog appears
- [ ] Dialog shows payment method name
- [ ] "Cancel" → nothing happens
- [ ] "OK/Confirm" → deletion proceeds
- [ ] Delete icon shows loading spinner
- [ ] Other rows remain interactive

#### Delete Success
- [ ] Success message appears
- [ ] Payment method removed from table
- [ ] Statistics update (total count decreases)
- [ ] If last active removed, active count updates

#### Delete Error
- [ ] Backend error → alert shown
- [ ] Payment method remains in table
- [ ] Loading spinner stops

### Statistics
- [ ] Total count accurate
- [ ] Active count accurate
- [ ] Counts update after create
- [ ] Counts update after delete
- [ ] Counts update after status toggle

### Empty States
- [ ] No data state shows when list empty
- [ ] Icon displays (credit card)
- [ ] Message: "No payment methods configured"
- [ ] CTA button: "+ Add Your First Payment Method"
- [ ] CTA button opens modal

- [ ] Search no results state
- [ ] Icon displays (search)
- [ ] Message: "No payment methods match your search"
- [ ] No CTA button in search empty state

## 🔐 Security Testing

### Authentication
- [ ] Logout → redirect to login
- [ ] Login again → can access page
- [ ] Expired token → redirect to login
- [ ] Invalid token → redirect to login
- [ ] Token refresh works on 401

### Authorization
- [ ] Token sent in all API requests
- [ ] CSRF token sent in mutations
- [ ] Configuration values masked in UI
- [ ] No sensitive data in console logs
- [ ] No sensitive data in network tab (masked)

## 🎨 UI/UX Testing

### Visual Design
- [ ] Colors match design system
  - [ ] Primary green: #32cd32
  - [ ] Secondary green: #47b216
  - [ ] Light green: #82ea80
- [ ] Dark theme consistent
- [ ] Font family: Poppins
- [ ] Icons consistent with other pages
- [ ] Spacing consistent with other pages

### Interactions
- [ ] Buttons have hover states
- [ ] Cursor changes to pointer on clickable items
- [ ] Focus states visible on form inputs
- [ ] Tab navigation works
- [ ] Smooth animations
- [ ] No layout shifts on load

### Feedback
- [ ] Success messages auto-dismiss (3 seconds)
- [ ] Error messages stay until dismissed
- [ ] Loading spinners on all async actions
- [ ] Disabled states clear
- [ ] Tooltips on icon buttons

## 📱 Responsive Testing

### Desktop (> 1400px)
- [ ] Full layout visible
- [ ] All table columns fit
- [ ] Modal centered, max-width 700px
- [ ] Padding appropriate
- [ ] No horizontal scroll

### Tablet (768px - 1400px)
- [ ] Layout adjusts properly
- [ ] Table may scroll horizontally
- [ ] Modal responsive
- [ ] Controls stack if needed
- [ ] Readable font sizes

### Mobile (< 768px)
- [ ] Sidebar collapses
- [ ] Header stacks vertically
- [ ] Search full width
- [ ] Table scrolls horizontally
- [ ] Modal full width
- [ ] Form fields stack vertically
- [ ] Buttons full width
- [ ] Touch targets adequate (44px min)

## 🌐 Browser Compatibility

### Chrome/Edge (Chromium)
- [ ] All features work
- [ ] Animations smooth
- [ ] No console errors

### Firefox
- [ ] All features work
- [ ] Styling consistent
- [ ] No console errors

### Safari
- [ ] All features work
- [ ] Date formatting correct
- [ ] Animations work
- [ ] No console errors

## ⚡ Performance Testing

### Load Time
- [ ] Initial page load < 2 seconds
- [ ] Data fetch < 1 second
- [ ] Modal opens instantly
- [ ] Search filters instantly

### Interactions
- [ ] No lag when typing in search
- [ ] Table re-renders efficiently
- [ ] Modal animations smooth (60fps)
- [ ] No memory leaks on repeated actions

### Data Handling
- [ ] Handles 10 payment methods smoothly
- [ ] Handles 50+ payment methods (if applicable)
- [ ] Search on large dataset fast

## 🐛 Error Scenarios

### Network Errors
- [ ] API down → error message shown
- [ ] Slow network → loading states work
- [ ] Request timeout → error handled
- [ ] Network loss mid-request → error shown

### Invalid Data
- [ ] Malformed API response → error shown
- [ ] Missing required fields in response → handled
- [ ] Invalid date format → doesn't crash
- [ ] Null values → handled gracefully

### Edge Cases
- [ ] Payment method with very long name
- [ ] Payment method with special characters
- [ ] Configuration with nested objects
- [ ] Configuration with arrays
- [ ] Very large min/max amounts
- [ ] Currency list with 10+ currencies
- [ ] Rapid clicking buttons → no duplicate requests

## 🔄 State Management

### Component State
- [ ] State updates correctly after create
- [ ] State updates correctly after edit
- [ ] State updates correctly after delete
- [ ] Search state independent
- [ ] Modal state resets on close

### URL State
- [ ] URL stays at `/dashboard/payment-methods`
- [ ] No unwanted URL changes
- [ ] Browser back button works

## 📝 Real-World Scenarios

### Khalti Integration
- [ ] Create Khalti payment method
- [ ] Configuration:
  ```json
  {
    "public_key": "test_public_key_xxx",
    "secret_key": "test_secret_key_xxx"
  }
  ```
- [ ] Min: 10.00
- [ ] Max: 100000.00
- [ ] Currency: NPR
- [ ] Status: Active
- [ ] Saves successfully
- [ ] All data displayed correctly

### eSewa Integration
- [ ] Create eSewa payment method
- [ ] Configuration:
  ```json
  {
    "merchant_id": "ESEWA-TEST",
    "secret_key": "test_secret"
  }
  ```
- [ ] Min: 10.00
- [ ] Max: 50000.00
- [ ] Currency: NPR
- [ ] Saves successfully

### Stripe Integration
- [ ] Create Stripe payment method
- [ ] Configuration:
  ```json
  {
    "public_key": "pk_test_xxxxx",
    "secret_key": "sk_test_xxxxx"
  }
  ```
- [ ] Min: 1.00
- [ ] Max: 10000.00
- [ ] Currencies: USD, GBP, EUR
- [ ] Saves successfully

### Multiple Payment Methods
- [ ] Create 3 different payment methods
- [ ] All appear in list
- [ ] Can edit any of them
- [ ] Can delete any of them
- [ ] Search works across all
- [ ] Statistics correct

## ✅ Final Checks

### Code Quality
- [ ] No console errors in production
- [ ] No console warnings
- [ ] No TypeScript errors (except known IDE cache issue)
- [ ] Code follows project patterns
- [ ] CSS modules used consistently

### Documentation
- [ ] README files present
- [ ] Quick start guide accurate
- [ ] API documentation complete
- [ ] Comments in complex code

### Production Ready
- [ ] All tests pass
- [ ] No hardcoded test data
- [ ] Environment variables used correctly
- [ ] Error handling comprehensive
- [ ] User feedback clear and helpful

---

## 📊 Test Results Summary

**Date Tested:** _____________

**Tested By:** _____________

**Environment:**
- Browser: _____________
- OS: _____________
- Screen Size: _____________

**Results:**
- Total Tests: _____ 
- Passed: _____ ✅
- Failed: _____ ❌
- Skipped: _____ ⏭️

**Critical Issues Found:**
1. _____________
2. _____________
3. _____________

**Notes:**
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________

**Status:** ⬜ Ready for Production  ⬜ Needs Fixes  ⬜ Major Issues

---

**Sign Off:**

Developer: _________________ Date: _______

QA/Tester: _________________ Date: _______

Product Owner: _____________ Date: _______