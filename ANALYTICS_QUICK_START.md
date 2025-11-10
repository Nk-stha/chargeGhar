# Analytics Dashboard - Quick Start Guide

## 🚀 Quick Overview

The Analytics Dashboard provides two main features:
1. **Revenue Over Time** - Track revenue from rentals, top-ups, fines, etc.
2. **Rentals Over Time** - Monitor rental activity by status

Both features include:
- Interactive charts with period filters (Daily/Weekly/Monthly)
- Real-time data from backend API
- Responsive design for all devices
- Error handling and loading states

## 📦 What's Included

```
✅ TypeScript types (analytics.types.ts)
✅ API service layer (analytics.service.ts)
✅ Updated RevenueChart component
✅ Updated RentalsOverTime component
✅ API proxy routes (Next.js)
✅ Responsive CSS with dark theme
```

## 🎯 Using the Components

### RevenueChart Component

Already integrated in the dashboard page:

```tsx
import RevenueChart from '@/components/RevenueChart';

// In your page
<RevenueChart />
```

**Features:**
- Automatically fetches data on mount
- Period toggle: Daily (30 days) | Weekly (90 days) | Monthly (12 months)
- Shows: Rental, Rental Due, Top-up, Fine revenue
- Currency: NPR

### RentalsOverTime Component

Already integrated in the dashboard page:

```tsx
import RentalOverTime from '@/components/RentalOverTimeCard/RentalsOverTime';

// In your page
<RentalOverTime />
```

**Features:**
- Automatically fetches data on mount
- Period toggle: Daily (30 days) | Weekly (90 days) | Monthly (12 months)
- Shows: Completed, Active, Pending, Cancelled, Overdue rentals
- Summary stats: Average per period, Peak date

## 🛠️ Using the Analytics Service

### Import the Service

```typescript
import { analyticsService } from '@/lib/api/analytics.service';
```

### Fetch Revenue Data

```typescript
// Basic usage with defaults
const revenueData = await analyticsService.getRevenueOverTime({
  period: 'daily'
});

// With custom date range
const revenueData = await analyticsService.getRevenueOverTime({
  period: 'monthly',
  start_date: '2024-01-01',
  end_date: '2024-12-31'
});

// Filter by transaction type
const revenueData = await analyticsService.getRevenueOverTime({
  period: 'weekly',
  transaction_type: 'rental' // or 'rental_due', 'topup', 'fine', 'all'
});
```

### Fetch Rentals Data

```typescript
// Basic usage with defaults
const rentalsData = await analyticsService.getRentalsOverTime({
  period: 'daily'
});

// With custom date range
const rentalsData = await analyticsService.getRentalsOverTime({
  period: 'weekly',
  start_date: '2024-10-01',
  end_date: '2024-11-08'
});

// Filter by status
const rentalsData = await analyticsService.getRentalsOverTime({
  period: 'monthly',
  status: 'completed' // or 'active', 'pending', 'cancelled', 'overdue', 'all'
});
```

### Helper Methods

```typescript
// Format currency
const formatted = analyticsService.formatCurrency(1234.56, 'NPR');
// Output: "NPR 1,234.56"

// Get default date range for a period
const { start_date, end_date } = analyticsService.getDefaultDateRange('monthly');
// Returns last 12 months

// Format date
const formattedDate = analyticsService.formatDate(new Date());
// Output: "2025-11-08"

// Validate date range
const validation = analyticsService.validateDateRange('2024-01-01', '2024-12-31');
// Returns: { valid: true } or { valid: false, error: "..." }

// Calculate percentage change
const change = analyticsService.calculatePercentageChange(1200, 1000);
// Output: 20 (20% increase)

// Get UI labels
const label = analyticsService.getPeriodLabel('daily');
// Output: "Daily"
```

## 🎨 Color Palette

The components use the ChargeGhar color scheme:

```typescript
// Primary Colors
Background: #0b0b0b
Card: #121212
Secondary: #1a1a1a
Primary Green: #47b216
Light Green: #82ea80

// Status Colors
Success: #47b216 (Green)
Info: #2196f3 (Blue)
Warning: #ffc107 (Yellow)
Danger: #dc3545 (Red)
Secondary: #6c757d (Gray)
```

## 🔧 API Endpoints

### Revenue Analytics

```
GET /api/admin/analytics/revenue-over-time
```

**Query Parameters:**
- `period` (required): daily | weekly | monthly
- `start_date` (optional): YYYY-MM-DD
- `end_date` (optional): YYYY-MM-DD
- `transaction_type` (optional): rental | rental_due | topup | fine | all

### Rentals Analytics

```
GET /api/admin/analytics/rentals-over-time
```

**Query Parameters:**
- `period` (required): daily | weekly | monthly
- `start_date` (optional): YYYY-MM-DD
- `end_date` (optional): YYYY-MM-DD
- `status` (optional): completed | active | pending | cancelled | overdue | all

## 🔐 Authentication

Both endpoints require authentication:
- Automatically handled by axios interceptor
- Uses `accessToken` from localStorage
- Token refresh on 401 errors
- Redirects to login if refresh fails

## 📱 Responsive Breakpoints

```css
Desktop: 1024px+
Tablet: 768px - 1024px
Mobile: 480px - 768px
Small Mobile: < 480px
```

## 🐛 Troubleshooting

### Charts not loading

**Check:**
1. Are you logged in? (Check localStorage for `accessToken`)
2. Is the backend API running? (Check Network tab)
3. Is BASE_URL environment variable set?

**Solution:**
```typescript
// Check token
console.log(localStorage.getItem('accessToken'));

// Test API directly
fetch('/api/admin/analytics/revenue-over-time?period=daily', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
  }
})
.then(r => r.json())
.then(console.log);
```

### "No data available" message

**Possible causes:**
1. Backend has no data for selected period
2. Date range is too narrow
3. Filters are too restrictive

**Solution:**
- Try changing period to "monthly"
- Remove filters (status/transaction_type)
- Check backend database for actual data

### Error: "Failed to fetch"

**Possible causes:**
1. Network error
2. Backend API is down
3. CORS issue

**Solution:**
- Check Network tab in DevTools
- Verify backend API is accessible
- Check Next.js API routes are working

### TypeScript errors

**If you see type errors:**

```typescript
// Import types explicitly
import type { 
  RevenueAnalyticsData, 
  RentalAnalyticsData 
} from '@/types/analytics.types';

// Use the types
const revenue: RevenueAnalyticsData = await ...
```

## 📊 Data Structure Examples

### Revenue Data Structure

```typescript
{
  success: true,
  message: "Revenue analytics retrieved successfully",
  data: {
    period: "daily",
    start_date: "2025-10-09",
    end_date: "2025-11-08",
    currency: "NPR",
    total_revenue: 12345.67,
    chart_data: [
      {
        date: "2025-10-09",
        label: "Oct 09, 2025",
        total_revenue: 150.50,
        rental_revenue: 100.00,
        rental_due_revenue: 20.00,
        topup_revenue: 25.50,
        fine_revenue: 5.00,
        transaction_count: 10
      },
      // ... more data points
    ]
  }
}
```

### Rentals Data Structure

```typescript
{
  success: true,
  message: "Rentals analytics retrieved successfully",
  data: {
    period: "daily",
    start_date: "2025-10-09",
    end_date: "2025-11-08",
    total_rentals: 234,
    chart_data: [
      {
        date: "2025-10-09",
        label: "Oct 09, 2025",
        total: 15,
        completed: 10,
        active: 3,
        pending: 1,
        cancelled: 0,
        overdue: 1
      },
      // ... more data points
    ],
    summary: {
      avg_per_period: 7.8,
      peak_date: "2025-10-15",
      peak_count: 20
    }
  }
}
```

## 🚢 Deployment

### Build the project

```bash
npm run build
```

### Environment Variables

Ensure `.env.local` has:

```env
BASE_URL=https://main.chargeghar.com
```

### Production Checklist

- [ ] Build succeeds without errors
- [ ] Test on local build (`npm run build && npm start`)
- [ ] Verify authentication works
- [ ] Test all period filters
- [ ] Test responsive design
- [ ] Check browser console for errors

## 💡 Tips

1. **Performance:** Charts handle up to ~365 data points smoothly
2. **Caching:** Data is cached in React state per period
3. **Retry Logic:** Error states include retry button
4. **Accessibility:** Charts are keyboard navigable
5. **Mobile:** Pinch-to-zoom works on charts

## 📚 Related Files

```
src/types/analytics.types.ts              - TypeScript types
src/lib/api/analytics.service.ts          - API service
src/lib/api/index.ts                      - Service exports
src/components/RevenueChart.tsx           - Revenue component
src/components/RentalOverTimeCard/        - Rentals component
src/app/api/admin/analytics/              - API routes
```

## 🤝 Support

**Need help?**
- Check `ANALYTICS_IMPLEMENTATION_SUMMARY.md` for detailed docs
- Review the code comments
- Check browser DevTools console
- Test API endpoints in Postman/Insomnia

---

**Happy Coding! 🎉**