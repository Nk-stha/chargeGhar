# Achievement API Integration - Quick Reference

## 🎯 Feature Summary

The Achievement feature in ChargeGhar admin dashboard includes:

| Operation        | Status         | Access                       | Location                       |
| ---------------- | -------------- | ---------------------------- | ------------------------------ |
| **Create**       | ✅ Implemented | Button: "Create Achievement" | `/dashboard/achievements`      |
| **Read**         | ✅ Implemented | Grid view with cards         | `/dashboard/achievements`      |
| **View Details** | ✅ Implemented | Click achievement card       | `/dashboard/achievements/[id]` |
| **Edit**         | ✅ Implemented | "Edit" button on card        | Modal popup                    |
| **Delete**       | ✅ Implemented | "Delete" button on card      | Confirmation modal             |

---

## 🚀 How to Use

### Create Achievement

```
1. Click "Create Achievement" button (top right)
2. Fill form:
   - Name: "Master Renter"
   - Description: "Complete 20 successful rentals"
   - Criteria Type: Rental Count
   - Criteria Value: 20
   - Reward Points: 1000
   - Status: Active ✓
3. Click "Create Achievement"
4. ✅ Success message appears, achievement added to list
```

### View Achievements

```
1. Go to /dashboard/achievements
2. See grid with all achievements
3. View statistics:
   - Total Achievements card
   - Active count card
   - Unlocked/Claimed card
   - Points awarded card
4. See "Most Unlocked Achievements" table
```

### Search & Filter

```
Search: Type in search box to find by name
Filter by Criteria: Select from dropdown (Rental Count, Timely Returns, Referrals)
Filter by Status: Select Active or Inactive
Click Refresh: Reload the data
```

### View Achievement Details

```
1. Click any achievement card
2. Route to /dashboard/achievements/[achievement-id]
3. See full details:
   - Name and description
   - Criteria and requirement
   - Reward value
   - Unlock statistics
   - Creation/Update timestamps
```

### Edit Achievement

```
1. Find achievement in list
2. Click "Edit" button
3. Modal opens with current values
4. Change desired fields (all optional)
5. Click "Update Achievement"
6. ✅ Changes saved, list refreshes
```

### Delete Achievement

```
1. Find achievement in list
2. Click "Delete" button
3. Confirmation modal shows:
   - Achievement name
   - Achievement description
   - Warning message
4. Click "Delete" to confirm
5. ✅ Achievement removed, list refreshes
```

---

## 📊 API Endpoints Called

### Create

```
POST /api/admin/achievements
Body: {
  name, description, criteria_type, criteria_value,
  reward_type, reward_value, is_active
}
Response: { success, data: Achievement }
```

### List

```
GET /api/admin/achievements?search=...&criteria_type=...&is_active=...
Response: { success, data: { results: Achievement[] } }
```

### Get Single

```
GET /api/admin/achievements/{id}
Response: { success, data: Achievement }
```

### Update

```
PUT /api/admin/achievements/{id}
Body: { name?, description?, criteria_value?, reward_value?, is_active? }
Response: { success, data: Achievement }
```

### Delete

```
DELETE /api/admin/achievements/{id}
Response: { success, data: { message: "..." } }
```

### Analytics

```
GET /api/admin/achievements/analytics
Response: { success, data: AchievementsAnalytics }
```

---

## 📁 Files Involved

**Frontend:**

- `/src/app/dashboard/achievements/page.tsx` - Main list page (981 lines)
- `/src/app/dashboard/achievements/[id]/page.tsx` - Detail page
- `/src/app/dashboard/achievements/achievements.module.css` - Styles
- `/src/app/dashboard/achievements/[id]/achievementDetail.module.css` - Detail styles

**Backend Service:**

- `/src/lib/api/rewards.service.ts` - Service layer with all methods

**Types:**

- `/src/types/rewards.types.ts` - TypeScript types

**Navigation:**

- `/src/components/Navbar/Navbar.tsx` - Menu item added

---

## 🔴 Common Issues & Solutions

| Issue                     | Solution                                                             |
| ------------------------- | -------------------------------------------------------------------- |
| **Modal doesn't open**    | Check browser console (F12) for errors. Verify modal CSS is loading. |
| **Form validation error** | Ensure: name ≥ 3 chars, description ≥ 10 chars, values ≥ 1           |
| **API error 401**         | JWT token expired. Refresh page or login again.                      |
| **API error 400**         | Invalid request body. Check form values.                             |
| **Edit modal empty**      | Click Edit button again, page may need refresh.                      |
| **Delete not working**    | Check network tab. Ensure you're admin.                              |
| **Search not working**    | Type complete name or part of it. Search is case-sensitive.          |

---

## ✅ Testing Checklist

Before going to production, verify:

- [ ] Create button opens modal
- [ ] Form validation works (try invalid values)
- [ ] Success message appears after create
- [ ] New achievement appears in list
- [ ] Search filters achievements by name
- [ ] Criteria filter shows correct achievements
- [ ] Status filter works
- [ ] Refresh button reloads data
- [ ] Edit button opens modal with data
- [ ] Edit saves changes
- [ ] Delete button shows confirmation
- [ ] Delete removes achievement
- [ ] Analytics cards show correct numbers
- [ ] Most Unlocked table displays
- [ ] Click on card navigates to detail page
- [ ] Detail page shows all information
- [ ] Edit on detail page works
- [ ] Back button returns to list
- [ ] Works on mobile (responsive)
- [ ] No console errors

---

## 🎨 UI Components

### Achievements Page Includes:

1. **Header** - Title + Create button
2. **Notifications** - Success/Error banners
3. **Stats Dashboard** - 4 cards with analytics
4. **Search & Filters** - Search box + 2 dropdowns + refresh
5. **Achievement Grid** - Responsive card layout
6. **Achievement Cards** - Name, description, stats, actions
7. **Rankings Table** - Most unlocked achievements
8. **Create Modal** - Form with validation
9. **Edit Modal** - Form with pre-filled data
10. **Delete Modal** - Confirmation dialog

### Achievement Card Shows:

- 🎯 Achievement name
- 📝 Description
- 🏆 Criteria type (with emoji: 🚗 👥 ⏰)
- 🎯 Criteria value (requirement)
- ⭐ Reward points
- 📊 Statistics (Unlocked, Claimed, In Progress)
- 🟢/🔴 Active/Inactive badge
- ✏️ Edit button
- 🗑️ Delete button

---

## 🔐 Authentication

All requests require:

- **Authorization Header** with JWT token
- Automatically added by axios interceptor
- Token valid for 1 hour (auto-refresh on 401)

---

## 📈 Performance Notes

- Parallel API calls: Gets achievements and analytics simultaneously
- Debounced search to reduce API calls
- Pagination on backend (handled automatically)
- CSS modules for scoped styling
- Responsive images and icons

---

## 🎓 Code Examples

### Using rewardsService

```typescript
// Get all achievements
const response = await rewardsService.getAchievements({
  search: "Master",
  criteria_type: "rental_count",
  is_active: true,
});

// Create achievement
const result = await rewardsService.createAchievement({
  name: "Loyalty Master",
  description: "Complete 50 rentals",
  criteria_type: "rental_count",
  criteria_value: 50,
  reward_type: "points",
  reward_value: 2000,
  is_active: true,
});

// Update achievement
const updated = await rewardsService.updateAchievement("achievement_id", {
  reward_value: 2500,
});

// Delete achievement
await rewardsService.deleteAchievement("achievement_id");

// Get analytics
const analytics = await rewardsService.getAchievementsAnalytics();
```

---

## 🌐 Responsive Design

| Screen                | Layout        | Cards Per Row |
| --------------------- | ------------- | ------------- |
| Desktop (>1024px)     | 4-column grid | 4             |
| Tablet (768-1024px)   | 3-column grid | 3             |
| Mobile (480-768px)    | 1-column      | 1             |
| Small Mobile (<480px) | Full width    | 1             |

---

## 📞 Support & Troubleshooting

**For Developers:**

- Check TypeScript types in `/src/types/rewards.types.ts`
- Service methods in `/src/lib/api/rewards.service.ts`
- Component code in `/src/app/dashboard/achievements/page.tsx`

**For Users:**

- Click "Create Achievement" to add new
- Use search and filters to find achievements
- Click "Edit" to modify existing
- Click "Delete" to remove (confirmation required)

---

## 🚀 Next Steps

Potential enhancements:

1. Bulk delete achievements
2. Export achievements to CSV
3. Import achievements from file
4. Achievement templates
5. User progress tracking
6. Achievement unlock history
7. Notification system for unlocks
8. Achievement tier/levels

---

**Last Updated:** November 13, 2025  
**Status:** ✅ PRODUCTION READY
