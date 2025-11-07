# KYC Feature - Quick Start Guide

## 🚀 Getting Started

The KYC (Know Your Customer) feature allows administrators to review and verify user-submitted identity documents.

---

## 📍 Accessing the KYC Feature

1. **Log in** to the ChargeGhar Admin Dashboard
2. Look at the **left sidebar navigation**
3. Click on **"KYC"** (with the document icon 📄)
4. You'll be taken to the KYC Management page

---

## 📊 Understanding the Dashboard

When you open the KYC page, you'll see:

### Statistics Cards (Top Row)
```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ Total           │ Pending         │ Approved        │ Rejected        │
│ Submissions     │ (Orange)        │ (Green)         │ (Red)           │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

### Control Bar
- **Search Box**: Search by username, email, or document number
- **Status Filter**: Filter by ALL, PENDING, APPROVED, or REJECTED
- **Refresh Button**: Reload the latest data

### Submissions Table
Displays all KYC submissions with:
- User information (name, email)
- Document type and number
- Status badge
- Submission date
- Verified by (admin)
- Action buttons

---

## 🔍 Common Tasks

### 1. View a KYC Submission

**Steps:**
1. Find the submission in the table
2. Click the **👁️ eye icon** in the Actions column
3. A modal will open showing:
   - Complete user details
   - Document information
   - Current status
   - Document images (front and back)
4. Click **"Close"** or click outside to close the modal

---

### 2. Approve a KYC Submission

**Option A - Direct from Table:**
1. Find a **PENDING** submission
2. Click the **✓ green check icon**
3. Confirm approval in the modal
4. Status updates to **APPROVED** ✅

**Option B - From Detail View:**
1. Click the eye icon to view details
2. Review the documents carefully
3. Click **"Approve"** button at the bottom
4. Confirm approval
5. Status updates immediately

**Result:** User's KYC is verified and they gain full access.

---

### 3. Reject a KYC Submission

**Option A - Direct from Table:**
1. Find a **PENDING** submission
2. Click the **✗ red X icon**
3. **IMPORTANT:** Enter a clear rejection reason
4. Click **"Confirm Rejection"**
5. Status updates to **REJECTED** ❌

**Option B - From Detail View:**
1. Click the eye icon to view details
2. Review the documents
3. Click **"Reject"** button
4. Enter rejection reason (mandatory)
5. Confirm rejection

**Result:** User is notified why their submission was rejected.

---

### 4. Search for a Specific Submission

**Steps:**
1. Click in the **search box** (top of table)
2. Type any of the following:
   - Username (e.g., "john")
   - Email (e.g., "john@example.com")
   - Document number (e.g., "CITIZENSHIP001")
   - Document type (e.g., "passport")
3. Results filter **instantly** as you type
4. Click the **×** to clear search

---

### 5. Filter by Status

**Steps:**
1. Click the **"Status" dropdown**
2. Select:
   - **ALL** - Show everything
   - **PENDING** - Show only pending reviews
   - **APPROVED** - Show only approved
   - **REJECTED** - Show only rejected
3. Table updates immediately

**Pro Tip:** Combine search + filter for precise results!

---

### 6. Refresh Data

**Steps:**
1. Click the **"Refresh"** button (🔄 icon)
2. Latest submissions load from server
3. All stats and table update

**When to use:** After bulk operations or to check for new submissions.

---

## 📋 Status Guide

| Status | Color | Badge | Meaning | Actions Available |
|--------|-------|-------|---------|-------------------|
| **PENDING** | 🟠 Orange | `PENDING` | Awaiting review | View, Approve, Reject |
| **APPROVED** | 🟢 Green | `APPROVED` | Verified | View only |
| **REJECTED** | 🔴 Red | `REJECTED` | Not verified | View only |

---

## ⚠️ Important Rules

### ✅ DO:
- Review documents carefully before approving
- Provide clear, specific rejection reasons
- Check document images match user information
- Verify document numbers are valid
- Keep rejection reasons professional

### ❌ DON'T:
- Approve without reviewing documents
- Reject without providing a reason (system won't allow it)
- Use vague rejection reasons like "Bad photo"
- Share user documents externally

---

## 💡 Pro Tips

1. **Batch Processing**: Use the PENDING filter to see all pending submissions at once
2. **Quick Review**: Open detail view to see both document images side-by-side
3. **Clear Communication**: Write rejection reasons that help users fix issues
4. **Regular Checks**: Check KYC page daily for new submissions
5. **Search Power**: Search works across multiple fields simultaneously

---

## 🎯 Rejection Reason Examples

### Good ❌ (Clear and Helpful)
- "Document image is blurry. Please upload a clear, well-lit photo."
- "Document has expired. Please submit a valid, current document."
- "Name on document doesn't match registered name. Please verify."
- "Back of document is required. Please upload both sides."

### Bad ❌ (Too Vague)
- "Bad"
- "Not clear"
- "Wrong"
- "No"

---

## 🔐 Security Notes

- You must be logged in as admin to access KYC
- Your actions are logged (verified_by field)
- Session expires after inactivity (automatic redirect to login)
- All data is transmitted securely

---

## 🐛 Troubleshooting

### "No submissions found"
- Check if status filter is too restrictive
- Clear search box
- Click Refresh button
- Verify backend connection

### "Authorization header required"
- Your session may have expired
- Log out and log back in
- Check if access token is valid

### Can't see Approve/Reject buttons
- Only PENDING submissions have these buttons
- APPROVED/REJECTED submissions are final

### Image not loading
- Check internet connection
- Verify document URL is valid
- Try refreshing the page

---

## 📞 Need Help?

If you encounter issues:
1. Try refreshing the page
2. Check your internet connection
3. Log out and log back in
4. Contact technical support

---

## 🎉 You're Ready!

You now know how to:
- ✅ View KYC submissions
- ✅ Approve valid documents
- ✅ Reject invalid documents with reasons
- ✅ Search and filter submissions
- ✅ Navigate the KYC dashboard

**Start reviewing submissions now!**

---

**Last Updated**: 2025  
**Version**: 1.0  
**Feature Status**: ✅ Production Ready