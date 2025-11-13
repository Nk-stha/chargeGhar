# Quick Start Guide: Rental Packages

## 🚀 Getting Started in 3 Minutes

### Step 1: Access Rental Packages
1. Login to your admin dashboard
2. Click **"Packages"** in the sidebar (📦 package icon)
3. You'll see a list of all configured rental packages

### Step 2: Add Your First Package

Click the **"+ Add Package"** button and fill in:

#### Example: Creating a 1 Hour Package
```
Package Name: 1 Hour Package
Description: Perfect for short trips
Duration (Minutes): 60
Price: 50.00
Package Type: Hourly
Payment Model: Prepaid
✓ Active
Package Metadata: {}
```

Click **"Create"** - Done! ✅

### Step 3: Common Package Templates

#### Hourly Package (Short Trips)
- **Name**: 1 Hour Package
- **Duration**: 60 minutes
- **Price**: 50.00
- **Type**: HOURLY
- **Payment**: PREPAID

#### Half-Day Package
- **Name**: 4 Hour Package
- **Duration**: 240 minutes
- **Price**: 150.00
- **Type**: HOURLY
- **Payment**: PREPAID

#### Daily Package
- **Name**: Daily Package
- **Duration**: 1440 minutes (24 hours)
- **Price**: 300.00
- **Type**: DAILY
- **Payment**: PREPAID

#### Weekly Package
- **Name**: Weekly Package
- **Duration**: 10080 minutes (7 days)
- **Price**: 1500.00
- **Type**: WEEKLY
- **Payment**: PREPAID

#### Monthly Package
- **Name**: Monthly Premium
- **Duration**: 43200 minutes (30 days)
- **Price**: 5000.00
- **Type**: MONTHLY
- **Payment**: PREPAID

## 📝 Quick Operations

### Edit a Package
1. Click the **✏️ pencil icon** on any row
2. Modify fields as needed
3. Click **"Update"**

### Delete a Package
1. Click the **🗑️ trash icon** on any row
2. Confirm the deletion in the popup dialog
3. Package is permanently deleted

### Search Packages
- Type in the search bar to filter by:
  - Package name (e.g., "Hour")
  - Description (e.g., "short trips")
  - Package type (e.g., "HOURLY")
  - Payment model (e.g., "PREPAID")

### Toggle Active Status
1. Click **Edit** on the package
2. Toggle the **"Active"** checkbox
3. Click **"Update"**

## 📊 Duration Guidelines

### Hourly Packages
- 1 hour = 60 minutes
- 2 hours = 120 minutes
- 4 hours = 240 minutes
- 6 hours = 360 minutes

### Daily Packages
- 1 day = 1440 minutes
- 2 days = 2880 minutes
- 3 days = 4320 minutes

### Weekly Packages
- 1 week = 10080 minutes
- 2 weeks = 20160 minutes

### Monthly Packages
- 30 days = 43200 minutes
- 60 days = 86400 minutes
- 90 days = 129600 minutes

## 💡 Package Types Explained

### HOURLY
- Best for: Short-term rentals (1-6 hours)
- Use case: Quick errands, short trips
- Example: "2 Hour Package"

### DAILY
- Best for: Full day rentals (24 hours)
- Use case: Day trips, full day activities
- Example: "Daily Unlimited"

### WEEKLY
- Best for: Week-long rentals
- Use case: Vacation rentals, business trips
- Example: "Weekly Explorer"

### MONTHLY
- Best for: Long-term subscriptions
- Use case: Regular commuters, long-term users
- Example: "Monthly Premium"

## 💳 Payment Models

### PREPAID
- Payment collected **before** service
- User pays upfront
- Most common for packages
- ✅ **Recommended** for most use cases

### POSTPAID
- Payment collected **after** service
- User pays at the end
- Suitable for corporate accounts

## ⚙️ Package Metadata

Metadata allows storing additional information as JSON:

### Basic Example
```json
{}
```
(Empty object - no additional data)

### With Features
```json
{
  "features": ["priority_support", "free_cancellation"],
  "discount_percentage": "15",
  "max_rentals_per_day": "5"
}
```

### With Restrictions
```json
{
  "min_age": "18",
  "id_verification": true,
  "allowed_zones": ["zone_a", "zone_b"]
}
```

### With Perks
```json
{
  "rollover_minutes": "120",
  "bonus_hours": "2",
  "referral_bonus": true
}
```

## ⚠️ Important Notes

### Duration Rules
- Must be a **positive integer**
- Entered in **minutes**
- System calculates display automatically
  - 60 min → "1 hour"
  - 1440 min → "1 day"

### Price Rules
- Must be a **positive decimal**
- Up to 2 decimal places
- Include currency symbol in UI only
- Store as: "50.00" (not "₹50.00")

### Metadata Format
- Must be valid JSON
- Use double quotes for keys and values
- No trailing commas
- Can be empty object: `{}`

## 🎯 Best Practices

1. **Naming Convention**
   - ✅ "1 Hour Package"
   - ✅ "Daily Unlimited"
   - ❌ "pkg1"
   - ❌ "TEST123"

2. **Descriptions**
   - ✅ "Perfect for short trips around the city"
   - ✅ "Best value for all-day activities"
   - ❌ "Package"
   - ❌ "Good"

3. **Pricing Strategy**
   - Hourly: Lower per-hour rate
   - Daily: 20-30% discount vs hourly
   - Weekly: 40-50% discount vs daily
   - Monthly: 60-70% discount vs weekly

4. **Duration Consistency**
   - Hourly: 1-12 hours (60-720 minutes)
   - Daily: 1-7 days (1440-10080 minutes)
   - Weekly: 1-4 weeks (10080-40320 minutes)
   - Monthly: 30-90 days (43200-129600 minutes)

5. **Active Management**
   - Keep seasonal packages inactive during off-season
   - Test new packages before activating
   - Archive old packages instead of deleting

## 🐛 Troubleshooting

### "Invalid JSON format" error
**Solution:** Check your metadata JSON:
```json
❌ Wrong:
{
  'key': 'value',  // Single quotes
}  // Trailing comma

✅ Correct:
{
  "key": "value"
}
```

### Duration not calculating correctly
**Solution:**
- Ensure you're entering **minutes**, not hours
- 1 hour = 60 minutes
- 1 day = 1440 minutes

### Package not appearing for users
**Solution:**
- Check "Active" checkbox is enabled
- Verify price is greater than 0
- Confirm duration is valid

### Can't save package
**Solution:**
- Fill all required fields (marked with *)
- Ensure price and duration are positive numbers
- Verify JSON metadata is valid

## 📈 Common Scenarios

### Creating Starter Packages
1. **Quick Start (1 Hour)** - ₹50
2. **Extended (4 Hours)** - ₹150
3. **All Day (24 Hours)** - ₹300

### Creating Premium Packages
1. **Weekend Special (3 Days)** - ₹750
2. **Weekly Explorer (7 Days)** - ₹1500
3. **Monthly Premium (30 Days)** - ₹5000

### Creating Business Packages
- Set payment_model to **POSTPAID**
- Add metadata: `{"corporate": true, "invoice_required": true}`
- Higher durations, bulk discounts

## 🎁 Pro Tips

1. **Test Before Launch**
   - Create as inactive first
   - Test pricing calculations
   - Verify duration displays correctly
   - Then activate

2. **Bundle Pricing**
   - 1 Hour: ₹50/hour
   - 4 Hours: ₹37.50/hour (25% discount)
   - Daily: ₹12.50/hour (75% discount)

3. **Seasonal Packages**
   - Store in metadata: `{"season": "summer"}`
   - Deactivate when season ends
   - Reactivate next year

4. **Track Changes**
   - Check "Updated" date in table
   - Keep notes in description
   - Use metadata for version info

5. **Quick Search**
   - Use Ctrl+F (Cmd+F on Mac)
   - Search by type: "HOURLY"
   - Search by price range in description

## 📊 Feature Overview

| Feature | Status |
|---------|--------|
| Create Package | ✅ |
| Edit Package | ✅ |
| Delete Package | ✅ |
| Search/Filter | ✅ |
| Active/Inactive Toggle | ✅ |
| All Package Types | ✅ |
| Both Payment Models | ✅ |
| JSON Metadata | ✅ |
| Duration Auto-Display | ✅ |
| Responsive Design | ✅ |

## 🎯 Quick Checklist

Setting up your rental packages:

1. ✅ Create hourly package (1-6 hours)
2. ✅ Create daily package (24 hours)
3. ✅ Create weekly package (7 days)
4. ✅ Set competitive pricing
5. ✅ Write clear descriptions
6. ✅ Activate packages
7. ✅ Test user flow
8. ✅ Monitor bookings

## 📞 Need Help?

- Check browser console for errors (F12)
- Verify API endpoint is configured correctly
- Review backend logs for detailed errors
- Contact development team with error details

---

**Ready to configure your rental packages!** 🎉

For detailed technical documentation, see [RENTAL_PACKAGES_SUMMARY.md](./RENTAL_PACKAGES_SUMMARY.md)