# Testing Guide - Admin & Users Backend Integration

## Prerequisites

Before testing, ensure you have:

1. ✅ Node.js installed (v18+)
2. ✅ All dependencies installed (`npm install`)
3. ✅ Environment variables configured
4. ✅ Valid admin credentials
5. ✅ Backend API accessible at `https://main.chargeghar.com`

---

## Environment Setup

Create or update `.env.local` in the project root:

```env
BASE_URL=https://main.chargeghar.com/api
```

---

## Starting the Application

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open browser**:
   ```
   http://localhost:3000
   ```

---

## Test Scenarios

### 1. Login Test

**Steps**:
1. Navigate to `http://localhost:3000`
2. You should be redirected to `/login`
3. Enter valid admin credentials:
   - Email: `janak@powerbank.com` (or your admin email)
   - Password: Your admin password
4. Click "Login"

**Expected Result**:
- ✅ Success message appears
- ✅ Redirected to `/dashboard`
- ✅ Access token stored in localStorage
- ✅ No errors in browser console

**Common Issues**:
- ❌ "Invalid email or password" → Check credentials
- ❌ Network error → Check backend API is accessible
- ❌ CORS error → Backend CORS configuration issue

---

### 2. Users Page - View Users

**Steps**:
1. Navigate to `/dashboard/users`
2. Wait for data to load

**Expected Result**:
- ✅ "Users" page title displayed
- ✅ Admin Users table shows profiles from backend
- ✅ Users table shows user list from backend
- ✅ Loading state appears briefly
- ✅ No errors in console

**Data to Verify**:
- Admin table shows: ID, Username, Email, Role, Status, Created Date, Created By
- Users table shows: ID, Username, Referral Code, Provider, Profile Status, KYC Status, Status, Created Date
- Check that data matches backend response

**Check Backend Data**:
Open browser DevTools → Network tab → Look for:
- Request to `/api/admin/users`
- Request to `/api/admin/profiles`
- Response data should be displayed in tables

---

### 3. Search Functionality

**Steps**:
1. On Users page, locate the search box
2. Enter a username (e.g., "janak")
3. Observe filtered results

**Expected Result**:
- ✅ Table filters in real-time
- ✅ Shows only matching users
- ✅ "No users match your search" if no results
- ✅ Clear button (×) appears in search box
- ✅ Clicking × clears search

**Test Cases**:
- Search by username: "janak"
- Search by ID: "5"
- Search by status: "ACTIVE"
- Search by referral code: "REF"

---

### 4. Sort Functionality

**Steps**:
1. Click "Sort By" button
2. Dropdown menu appears with options
3. Select "Username"
4. Click again to toggle ascending/descending

**Expected Result**:
- ✅ Dropdown shows all sort options
- ✅ Current sort option highlighted
- ✅ Arrow indicates sort direction
- ✅ Table reorders correctly
- ✅ Multiple clicks toggle direction

**Test Cases**:
- Sort by ID (numeric)
- Sort by Username (alphabetic)
- Sort by Status (alphabetic)
- Sort by Created Date (chronologic)

---

### 5. Add Admin - Open Modal

**Steps**:
1. Click "+ Add Admin" button
2. Modal appears

**Expected Result**:
- ✅ Modal overlay appears
- ✅ "Create Admin Profile" title visible
- ✅ User dropdown populated with users
- ✅ Role dropdown has options
- ✅ Password field present
- ✅ Cancel and Create buttons visible

---

### 6. Add Admin - Validation

**Steps**:
1. Click "Create Admin" without filling fields
2. Observe validation

**Expected Result**:
- ✅ Error message: "Please select a user"
- ✅ Cannot submit empty form
- ✅ Password field shows "required"

**Test Cases**:
- No user selected → Error
- Password < 8 characters → Error
- All fields valid → Allows submission

---

### 7. Add Admin - Create Successfully

**Steps**:
1. Select a user from dropdown (e.g., "testuser2")
2. Select role "admin"
3. Enter password: "12345678"
4. Click "Create Admin"

**Expected Result**:
- ✅ "Creating..." button state appears
- ✅ Request sent to `/api/admin/profiles`
- ✅ Success message: "Admin profile created successfully!"
- ✅ Modal auto-closes after 1.5 seconds
- ✅ Admin table refreshes with new admin
- ✅ New admin appears in list

**Verify in Network Tab**:
```json
POST /api/admin/profiles
{
  "user": 3,
  "role": "admin",
  "password": "12345678"
}

Response:
{
  "success": true,
  "message": "Admin profile created successfully",
  "data": { ... }
}
```

**Common Issues**:
- ❌ "User already has admin profile" → Select different user
- ❌ 401 Unauthorized → Token expired, login again
- ❌ 403 Forbidden → Not super admin
- ❌ Network error → Check backend connectivity

---

### 8. Profile Page Test

**Steps**:
1. Navigate to `/dashboard/profile`
2. Wait for data to load

**Expected Result**:
- ✅ "Profile" page title displayed
- ✅ Admin avatar with username shown
- ✅ Left card shows profile details
- ✅ Right card shows account information
- ✅ All fields are read-only
- ✅ Dates formatted correctly
- ✅ "Time since" calculations correct

**Data to Verify**:
- User ID (UUID format)
- Username matches logged-in user
- Email matches logged-in user
- Role displayed correctly
- Status shows "Active" in green
- Created date formatted as "Nov 5, 2025, 01:24 PM"
- "X days ago" calculation accurate

**Check Backend Call**:
- Request to `/api/admin/profiles`
- Current user profile identified from JWT token
- All profile fields populated

---

### 9. Error Handling Test

**Test Case 1: Network Error**
1. Disconnect internet
2. Refresh `/dashboard/users`
3. Expected: Error message displayed

**Test Case 2: Token Expired**
1. Wait for token to expire (or manually remove from localStorage)
2. Try to access `/dashboard/users`
3. Expected: Redirected to login

**Test Case 3: Invalid Token**
1. Open DevTools → Application → localStorage
2. Modify `accessToken` value
3. Refresh page
4. Expected: Redirected to login

---

## Manual API Testing (Optional)

Use Postman or curl to test directly:

### Get Users
```bash
curl -X GET \
  'https://main.chargeghar.com/api/admin/users' \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE'
```

### Get Admin Profiles
```bash
curl -X GET \
  'https://main.chargeghar.com/api/admin/profiles' \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE'
```

### Create Admin Profile
```bash
curl -X POST \
  'https://main.chargeghar.com/api/admin/profiles' \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -H 'Content-Type: multipart/form-data' \
  -F 'user=4' \
  -F 'role=admin' \
  -F 'password=12345678'
```

---

## Browser Console Checks

Open DevTools → Console and verify:

1. **No errors** during normal operation
2. **Network requests** succeed (200 status)
3. **localStorage** contains:
   - `accessToken`
   - `refreshToken`
4. **React Context** populated with data

---

## Troubleshooting

### Issue: "Loading..." never finishes
**Solution**: 
- Check network tab for failed requests
- Verify backend URL in `.env.local`
- Check CORS configuration on backend

### Issue: "No admins found" or "No users found"
**Solution**:
- Verify backend has data
- Check API response in Network tab
- Ensure token has proper permissions

### Issue: "Authorization header is required"
**Solution**:
- Clear localStorage
- Login again
- Verify token is being sent in requests

### Issue: Modal doesn't show users
**Solution**:
- Check users API response
- Verify usersData in context
- Check browser console for errors

### Issue: Date shows "Invalid Date"
**Solution**:
- Verify date format from backend
- Check date_joined field exists
- Ensure date is ISO 8601 format

---

## Success Criteria

All tests pass when:

- ✅ Login works without errors
- ✅ Users list loads from backend
- ✅ Admin profiles list loads from backend
- ✅ Search filters users correctly
- ✅ Sort changes table order
- ✅ Add Admin modal opens and populates
- ✅ Admin creation succeeds
- ✅ Table refreshes after creation
- ✅ Profile page shows current admin
- ✅ All dates format correctly
- ✅ Status colors display properly
- ✅ No console errors
- ✅ Loading states work
- ✅ Error messages appear when needed

---

## Performance Check

Monitor:
- Page load time < 2 seconds
- API response time < 500ms
- Search/sort feels instant
- No UI freezing during operations

---

## Browser Compatibility

Test in:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

---

## Next Steps After Testing

1. ✅ Document any bugs found
2. ✅ Take screenshots of working features
3. ✅ Verify with backend team
4. ✅ Get user acceptance
5. ✅ Prepare for deployment

---

## Contact

If you encounter issues not covered in this guide:
- Check `IMPLEMENTATION_SUMMARY.md` for technical details
- Review code comments in modified files
- Check browser console for detailed errors
- Verify backend API documentation

---

## Quick Command Reference

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

---

**Happy Testing! 🚀**