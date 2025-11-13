# KYC Edit Feature - Quick Start Guide

## 🚀 For Admins (End Users)

### What Can You Do?

As an admin, you can now:
- **View** any KYC submission details (read-only)
- **Edit** any KYC submission status (change to any status)

### Available Status Changes

You can change the status between:
- **PENDING** (🟠 Orange) - Awaiting review
- **APPROVED** (🟢 Green) - Verified and accepted  
- **REJECTED** (🔴 Red) - Not approved

**All transitions are supported:**
- PENDING → APPROVED or REJECTED
- APPROVED → PENDING or REJECTED
- REJECTED → PENDING or APPROVED

---

## 📋 How to Use

### Method 1: Quick Edit (20 seconds)

**Use when:** You need to quickly change a status

1. Navigate to **Dashboard → KYC Verification**
2. Find the submission in the table
3. Click the **📝 Edit** button (orange)
4. Select new status from dropdown:
   - Pending
   - Approved
   - Rejected
5. If you selected **Rejected**, enter a reason (mandatory)
6. Review the change preview
7. Click **💾 Save Changes**
8. Done! Status is updated.

### Method 2: Review Then Edit (1-3 minutes)

**Use when:** You want to review documents before making changes

1. Click the **👁️ View** button (green) on any submission
2. Review all details:
   - User information
   - Document type and number
   - Current status
   - Document images (front & back)
   - Verification history
3. Click **📝 Edit Status** button at the bottom
4. Modal switches to Edit mode
5. Follow steps 4-8 from Method 1

---

## 💡 Common Use Cases

### Case 1: Approve a Pending KYC
```
Status: PENDING → APPROVED
Steps:
1. Click Edit
2. Select "Approved"
3. Click Save Changes
✅ No rejection reason needed
```

### Case 2: Reject a Pending KYC
```
Status: PENDING → REJECTED
Steps:
1. Click Edit
2. Select "Rejected"
3. Enter rejection reason (e.g., "Documents are expired")
4. Click Save Changes
⚠️ Rejection reason is mandatory
```

### Case 3: Reject an Approved KYC (Post-Approval Review)
```
Status: APPROVED → REJECTED
Steps:
1. Click Edit on approved submission
2. Select "Rejected"
3. Enter reason (e.g., "Fraudulent documents detected")
4. Click Save Changes
⚠️ Rejection reason is mandatory
```

### Case 4: Correct a Mistake (Re-approve)
```
Status: REJECTED → APPROVED
Steps:
1. Click Edit
2. Select "Approved"
3. Click Save Changes
✅ Previous rejection reason is cleared
```

### Case 5: Move Back to Pending (Need More Review)
```
Status: APPROVED/REJECTED → PENDING
Steps:
1. Click Edit
2. Select "Pending"
3. Click Save Changes
✅ Can be reviewed again later
```

---

## ⚠️ Important Rules

### When Rejecting (Status = REJECTED)
- ✅ **Must** provide a rejection reason
- ✅ Be clear and specific
- ✅ Use professional language
- ❌ Cannot save without a reason

### When Approving or Moving to Pending
- ✅ No rejection reason needed
- ✅ Previous rejection reason is cleared
- ✅ Can save immediately

---

## 🎯 Button Guide

### In Table View

| Button | Icon | Color | Purpose |
|--------|------|-------|---------|
| **View** | 👁️ | Green | See details (read-only) |
| **Edit** | 📝 | Orange | Change status |

**Both buttons are always visible for all submissions.**

### In Modal View Mode

| Button | Icon | Color | Action |
|--------|------|-------|--------|
| **Close** | - | Gray | Close modal |
| **Edit Status** | 📝 | Green | Switch to edit mode |

### In Modal Edit Mode

| Button | Icon | Color | Action |
|--------|------|-------|--------|
| **Cancel** | - | Gray | Discard changes |
| **Save Changes** | 💾 | Green | Save new status |

---

## 🎨 Status Colors

- 🟠 **PENDING** - Orange (#ff8c00)
- 🟢 **APPROVED** - Green (#32cd32)
- 🔴 **REJECTED** - Red (#ff4444)

---

## ❌ Troubleshooting

### Error: "Please select a status"
**Problem:** No status selected in dropdown  
**Solution:** Choose Pending, Approved, or Rejected from dropdown

### Error: "Please provide a rejection reason when status is REJECTED"
**Problem:** Selected "Rejected" but reason field is empty  
**Solution:** Enter a clear rejection reason in the text area

### Modal doesn't open
**Problem:** JavaScript error or loading issue  
**Solution:** Refresh the page (Ctrl+R or Cmd+R)

### Changes not saving
**Problem:** Network error or authentication issue  
**Solution:** 
1. Check your internet connection
2. Try refreshing the page
3. Log out and log back in
4. Contact support if issue persists

---

## 🔐 For Developers

### Quick Technical Overview

**Files Modified:**
- `/src/app/dashboard/kyc/page.tsx` - Main component
- `/src/app/dashboard/kyc/kyc.module.css` - Styles

**API Endpoint:**
```
PATCH /api/admin/kyc/{kyc_id}
```

**Request Format (JSON):**
```json
{
  "status": "PENDING" | "APPROVED" | "REJECTED",
  "rejection_reason": "string" // Only required if status is REJECTED
}
```

**Response Format:**
```json
{
  "success": true,
  "message": "KYC status updated successfully",
  "data": {
    "kyc_id": "uuid",
    "user": "username",
    "old_status": "APPROVED",
    "new_status": "REJECTED",
    "verified_by": "admin_username"
  }
}
```

### Local Development

```bash
# Install dependencies (if needed)
npm install

# Run development server
npm run dev

# Access the page
http://localhost:3000/dashboard/kyc

# Build for production
npm run build

# Start production server
npm start
```

### Testing Checklist

- [ ] View modal opens correctly
- [ ] Edit modal opens correctly
- [ ] Status dropdown shows 3 options
- [ ] Rejection reason appears/hides based on status
- [ ] Cannot save without status selection
- [ ] Cannot save REJECTED without reason
- [ ] Can save PENDING without reason
- [ ] Can save APPROVED without reason
- [ ] Change preview shows correct transition
- [ ] API call succeeds with correct data
- [ ] Table refreshes after save
- [ ] Modal closes after save
- [ ] All status transitions work

---

## 📚 More Documentation

For detailed information, see:

- **[Full Implementation Guide](./kyc-edit-implementation.md)** - Technical details
- **[Visual Guide](./kyc-edit-visual-guide.md)** - UI mockups and workflows
- **[Complete README](./KYC_EDIT_README.md)** - Comprehensive documentation

---

## 💬 Tips & Best Practices

### For Admins

✅ **DO:**
- Review documents carefully before approving
- Provide specific rejection reasons
- Use professional language
- Double-check status changes

❌ **DON'T:**
- Approve without reviewing documents
- Use vague rejection reasons like "bad documents"
- Change status randomly without reason
- Ignore verification history

### For Developers

✅ **DO:**
- Test all status transitions
- Validate form inputs
- Handle API errors gracefully
- Check responsive design
- Maintain consistent styling

❌ **DON'T:**
- Skip validation
- Ignore error cases
- Remove loading states
- Break existing functionality

---

## 🎉 Success Indicators

You'll know it's working when:
- ✅ Both buttons (View & Edit) are visible for all submissions
- ✅ Edit button opens a modal with status dropdown
- ✅ Rejection reason field appears only for "Rejected" status
- ✅ Change preview shows before saving
- ✅ Status updates after clicking Save Changes
- ✅ Table automatically refreshes
- ✅ Modal closes after successful save

---

## 📞 Need Help?

1. **Check the documentation** - Start with this guide
2. **Review error messages** - They tell you what's wrong
3. **Check browser console** - For technical errors (F12)
4. **Contact support** - If issue persists

---

## 🏆 Quick Reference

```
┌─────────────────────────────────────────────────────────┐
│  ACTION          │  STEPS                               │
├──────────────────┼──────────────────────────────────────┤
│  View Details    │  Click 👁️ View → Review → Close     │
│  Quick Edit      │  Click 📝 Edit → Select → Save      │
│  Approve         │  Edit → Approved → Save              │
│  Reject          │  Edit → Rejected → Enter Reason → Save │
│  Re-approve      │  Edit → Approved → Save              │
│  Back to Pending │  Edit → Pending → Save               │
└──────────────────┴──────────────────────────────────────┘
```

---

**Version:** 1.0.0  
**Status:** ✅ Production Ready  
**Last Updated:** November 2024  
**Build Status:** ✅ Passing