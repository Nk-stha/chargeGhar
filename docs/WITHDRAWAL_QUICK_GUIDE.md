# Withdrawal Management - Quick Reference Guide

## Quick Start

### Accessing Withdrawals
1. Log in to Admin Dashboard
2. Click **"Transactions"** in the sidebar
3. Select **"Withdrawals"** from the submenu
4. You'll see the withdrawal management interface

## Main Interface

### Analytics Cards (Top Section)
- **Total Withdrawals**: All-time withdrawal count
- **Pending**: Requests awaiting action
- **Completed**: Successfully processed
- **Rejected**: Denied requests

### Filter Buttons
- **All**: View all withdrawals
- **Requested**: Show only pending requests
- **Completed**: Show approved withdrawals
- **Rejected**: Show denied withdrawals

### Refresh Button
- Click to manually refresh data
- Located in top-right corner
- Updates both analytics and withdrawal list

## Working with Withdrawals

### Viewing Details
1. Find the withdrawal in the table
2. Click the **eye icon** (👁️) in Actions column
3. Modal opens with complete details

### Detail Modal Sections
- **Basic Information**: Reference numbers, user, payment method, status
- **Financial Details**: Amount, fees, net amount
- **Account Details**: User's payment account information
- **Timeline**: Request and processing dates
- **Admin Notes**: Previously added notes (if any)

### Approving a Withdrawal
1. Open withdrawal details (eye icon)
2. Click **"Approve"** button (green)
3. Add admin notes (optional but recommended)
4. Click **"Confirm Approval"**
5. Success message appears
6. List automatically refreshes

### Rejecting a Withdrawal
1. Open withdrawal details (eye icon)
2. Click **"Reject"** button (red)
3. Add admin notes (**REQUIRED** - explain reason)
4. Click **"Confirm Rejection"**
5. Success message appears
6. List automatically refreshes

## Status Meanings

| Status | Color | Description |
|--------|-------|-------------|
| **Requested** | 🟠 Orange | Pending admin action |
| **Completed** | 🟢 Green | Successfully approved and processed |
| **Rejected** | 🔴 Red | Denied by admin |
| **Processing** | 🔵 Blue | Currently being processed |

## Table Columns Explained

- **Reference**: Internal or gateway reference number
- **User**: Username who requested withdrawal
- **Amount**: Original withdrawal amount
- **Fee**: Processing fee charged
- **Net Amount**: Final amount user receives (Amount - Fee)
- **Payment Method**: e.g., eSewa, Khalti, etc.
- **Status**: Current status with color indicator
- **Requested At**: Date and time of request
- **Actions**: View details button

## Best Practices

### Before Approving
✅ Verify user account details are correct  
✅ Check withdrawal amount is reasonable  
✅ Confirm payment method information  
✅ Review user's transaction history if suspicious  
✅ Add notes documenting your decision

### Before Rejecting
✅ **Always provide clear rejection reason in notes**  
✅ Be specific about why it's being rejected  
✅ Mention any required actions from user  
✅ Use professional language

### Admin Notes Examples

**Good Approval Note:**
```
Verified user account. Payment details correct. 
Amount within limits. Approved for processing.
```

**Good Rejection Note:**
```
Account details do not match KYC information. 
User needs to update payment method details 
and resubmit request.
```

**Poor Note (Avoid):**
```
ok
```

## Keyboard Shortcuts

- **Esc**: Close any open modal
- **Refresh (F5)**: Reload page and data

## Mobile Usage

### On Mobile Devices
- Swipe left/right on table to see all columns
- Tap eye icon to view details
- Modals are full-screen for easier reading
- All features fully functional

## Troubleshooting

### "Failed to fetch withdrawals"
- Check your internet connection
- Click refresh button to retry
- Verify you're logged in
- Contact technical support if persists

### "Authorization required"
- Your session may have expired
- Refresh the page
- Log in again if needed

### Can't approve/reject
- Verify withdrawal status is "Requested"
- Only pending requests can be processed
- Already processed requests cannot be changed

### Process button disabled
- For rejection: Admin notes are required
- Fill in the notes field to enable button

## Tips & Tricks

💡 **Use filters** to quickly find pending requests  
💡 **Check analytics** before processing for overview  
💡 **Refresh regularly** to see new requests  
💡 **Add detailed notes** for audit trail  
💡 **Process requests promptly** to improve user satisfaction

## Important Notes

⚠️ **Actions are immediate and cannot be undone**  
⚠️ **Always double-check before confirming**  
⚠️ **Rejections require explanation in notes**  
⚠️ **Only REQUESTED status can be processed**

## Need Help?

1. Refer to full documentation: `WITHDRAWAL_IMPLEMENTATION.md`
2. Check project README for general info
3. Contact development team for technical issues
4. Review backend API documentation

## Common Workflows

### Processing Morning Requests
1. Filter by "Requested"
2. Sort by oldest first
3. Process each systematically
4. Add consistent notes

### Handling Suspicious Requests
1. Open withdrawal details
2. Review account information
3. Check user history
4. If unsure, reject with clear reason
5. Document concerns in notes

### End of Day Review
1. Check "Completed" filter
2. Verify all processed correctly
3. Review analytics for accuracy
4. Note any unusual patterns

---

**Version**: 1.0  
**Last Updated**: November 2025  
**Status**: Production Ready

For detailed technical information, see `WITHDRAWAL_IMPLEMENTATION.md`
