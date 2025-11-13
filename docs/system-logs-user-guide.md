# System Logs User Guide

## Overview

The System Logs feature provides administrators with a comprehensive audit trail of all actions performed in the ChargeGhar admin panel. This helps maintain transparency, track changes, and monitor admin activities in real-time.

## Features at a Glance

- 📊 **Real-time Monitoring**: View all admin actions as they happen
- 🔄 **Auto-Refresh**: Logs update automatically every 30 seconds
- 🔍 **Powerful Search**: Find specific logs quickly
- 🎯 **Smart Filters**: Filter by action type
- 📱 **Mobile Friendly**: Access logs from any device
- 👤 **Admin Attribution**: See who performed each action

---

## Accessing System Logs

### Method 1: Via Sidebar Navigation
1. Log in to the admin dashboard
2. Look for **"System Logs"** in the left sidebar (icon: activity monitor)
3. Click to open the full System Logs page

### Method 2: Via Dashboard
1. Navigate to the main **Dashboard**
2. Scroll to the **"Recent Updates"** section at the bottom
3. Click on **"System Logs"** link (green text with arrow icon)

---

## Understanding the Dashboard Widget

### Recent Updates Section

Located on the main dashboard, this widget shows the **5 most recent** admin actions:

#### What You'll See:
- **Icon**: Color-coded to indicate action type
  - 🟢 Green checkmark = Success actions (Create, Update, Approve)
  - 🟡 Yellow warning = Warning actions (Delete, Reject, Suspend)
  - 🔵 Blue info = Informational actions
- **Title**: Type of action performed
- **Description**: Detailed explanation of what happened
- **Timestamp**: How long ago the action occurred
- **Admin**: Username of the admin who performed the action

#### Example Entry:
```
✓ Update KYC Status
Updated KYC status from REJECTED to APPROVED for user janak
2 hours ago • by admin_user
```

---

## Using the System Logs Page

### 1. Page Header

**Top Right Controls:**
- **Auto-refresh Toggle**: Green button when ON, automatically refreshes logs every 30 seconds
- **Manual Refresh Button**: Circular arrow icon to refresh immediately

**Statistics Bar:**
Shows three key metrics:
- **Total Logs**: Total number of logs in the system
- **Filtered**: Number of logs matching your current filters
- **Last Update**: Time of the last data refresh

### 2. Search Functionality

**Location**: Top of the page, search box with magnifying glass icon

**How to Use:**
1. Click in the search box
2. Type any keyword:
   - Admin username (e.g., "janak")
   - Action type (e.g., "KYC", "coupon")
   - Description text (e.g., "approved")
   - Target model (e.g., "UserKYC")
3. Results filter in real-time as you type
4. Click the ✕ icon to clear search

**Search Tips:**
- Search is case-insensitive
- Searches across all text fields
- Use specific terms for better results

### 3. Filters

**Location**: "Filters" button next to search box

**How to Use:**
1. Click **"Filters"** button
2. Filter panel appears below
3. Select action type from dropdown:
   - All Actions
   - Create
   - Update
   - Delete
   - Approve
   - Reject
   - KYC Actions
   - Coupon Actions
   - Withdrawal Actions
4. Results update automatically

### 4. Log Cards

Each log is displayed as a card with complete information:

#### Card Header:
- **Icon**: Visual indicator of action type
- **Action Title**: Formatted action name
- **Target Model**: What was modified (e.g., UserKYC, Coupon)
- **Time Ago**: Relative time (e.g., "2 hours ago")
- **Full Timestamp**: Exact date and time

#### Card Body:
- **Description**: Plain English explanation of the action
- **Changes Section**: Shows what was modified
  - Old value → New value
  - Key-value pairs of all changes

#### Card Footer:
- **Admin Name**: Username (highlighted in green)
- **Admin Email**: Email address of the admin
- **IP Address**: IP from which action was performed

---

## Common Use Cases

### 1. Tracking KYC Approvals
**Scenario**: You want to see all KYC status changes

**Steps:**
1. Click **Filters** → Select **"KYC Actions"**
2. Review all KYC-related activities
3. Check who approved/rejected and when

### 2. Finding Actions by Specific Admin
**Scenario**: You want to see what admin "janak" did today

**Steps:**
1. Type **"janak"** in the search box
2. All actions by that admin are displayed
3. Sort by time to see most recent first

### 3. Monitoring Coupon Activities
**Scenario**: You need to audit coupon creations and deletions

**Steps:**
1. Click **Filters** → Select **"Coupon Actions"**
2. Review all coupon-related changes
3. Check the "Changes" section for details

### 4. Investigating Recent Changes
**Scenario**: Something changed and you need to find out what

**Steps:**
1. Look at the timestamp of when the issue occurred
2. Search for relevant keywords (e.g., "station", "user")
3. Check the "Changes" section to see exact modifications

### 5. Reviewing Withdrawal Approvals
**Scenario**: Verify all withdrawal approvals for the day

**Steps:**
1. Click **Filters** → Select **"Withdrawal Actions"**
2. Review approval/rejection decisions
3. Check admin notes in the "Changes" section

---

## Understanding Action Types

### CREATE Actions (Green ✓)
- **CREATE_COUPON**: New coupon created
- **CREATE_STATION**: New station added
- **CREATE_PACKAGE**: New rental package created
- Indicates something new was added to the system

### UPDATE Actions (Green ✓)
- **UPDATE_KYC_STATUS**: KYC status changed
- **UPDATE_COUPON_STATUS**: Coupon activated/deactivated
- **UPDATE_STATION**: Station details modified
- Indicates existing data was modified

### DELETE Actions (Yellow ⚠)
- **DELETE_COUPON**: Coupon removed
- **DELETE_STATION**: Station deleted
- Indicates something was removed (usually soft delete)

### APPROVAL Actions (Green ✓)
- **WITHDRAWAL_APPROVE**: Withdrawal request approved
- **KYC_APPROVE**: KYC documents approved
- Indicates approval of pending requests

### REJECTION Actions (Yellow ⚠)
- **WITHDRAWAL_REJECT**: Withdrawal request denied
- **KYC_REJECT**: KYC documents rejected
- Indicates denial of requests

---

## Tips & Best Practices

### ✅ DO:
- Enable auto-refresh when monitoring active situations
- Use filters to narrow down large result sets
- Check the "Changes" section for detailed information
- Note the admin username for accountability
- Review logs regularly for audit purposes

### ❌ DON'T:
- Don't leave the page open for extended periods without refreshing
- Don't rely solely on search; use filters for better accuracy
- Don't ignore warning actions (yellow indicators)

---

## Troubleshooting

### Problem: Logs Not Updating
**Solution:**
- Check if auto-refresh is enabled (should be green)
- Click manual refresh button
- Check your internet connection
- Try logging out and back in

### Problem: Can't Find Specific Log
**Solution:**
- Clear any active filters
- Clear search terms
- Try different search keywords
- Use broader filter categories

### Problem: Page Loading Slowly
**Solution:**
- Use filters to reduce the number of displayed logs
- Disable auto-refresh if not needed
- Clear browser cache
- Check internet connection

### Problem: No Logs Showing
**Solution:**
- Verify you have admin permissions
- Check if backend API is accessible
- Refresh the page
- Contact system administrator

---

## Mobile Usage

The System Logs page is fully responsive and works on mobile devices:

### Mobile Features:
- ✅ Full functionality available
- ✅ Touch-friendly buttons
- ✅ Swipe-friendly cards
- ✅ Optimized layout for small screens
- ✅ All filters and search work normally

### Mobile Tips:
- Use landscape mode for better view
- Tap filters button to access filtering
- Scroll vertically to view all logs
- Use search for quick navigation

---

## Keyboard Shortcuts

While on the System Logs page:
- **Ctrl/Cmd + F**: Focus search box (browser default)
- **Esc**: Clear search (when search box is focused)

---

## Privacy & Security

### What's Logged:
- ✅ Action type and description
- ✅ Admin username and email
- ✅ IP address
- ✅ Timestamp
- ✅ Changes made (before/after values)

### What's NOT Logged:
- ❌ Passwords or sensitive credentials
- ❌ Personal user data
- ❌ Payment information
- ❌ Session tokens

### Access Control:
- Only authenticated admins can view logs
- Logs cannot be edited or deleted from UI
- All log views are themselves logged (audit trail)

---

## FAQ

**Q: How long are logs stored?**
A: Logs are stored permanently in the database unless manually purged by system administrators.

**Q: Can I export logs?**
A: Export functionality is not currently available but may be added in future updates.

**Q: Can I delete or edit a log?**
A: No, logs are immutable for audit integrity. Only system administrators can manage log data directly.

**Q: Why don't I see some actions?**
A: Only staff/admin actions are logged. Regular user actions are logged separately.

**Q: What happens if auto-refresh fails?**
A: The page will continue showing cached data. Try manual refresh or reload the page.

**Q: Are my searches saved?**
A: No, search terms and filters are reset when you navigate away from the page.

---

## Support

If you encounter issues or need assistance:

1. **Check this guide** for common solutions
2. **Contact your system administrator**
3. **Report bugs** to the development team
4. **Request features** through proper channels

---

## Version History

- **v1.0** (Current) - Initial release with core functionality
  - Real-time log viewing
  - Search and filter capabilities
  - Auto-refresh functionality
  - Mobile responsive design

---

**Last Updated**: November 2024  
**Document Version**: 1.0  
**Feature Status**: Production Ready ✅