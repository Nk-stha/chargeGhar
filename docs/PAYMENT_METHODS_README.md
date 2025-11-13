# Payment Methods Management

## Overview

The Payment Methods feature allows administrators to manage payment gateways and their configurations for the ChargeGhar platform. This includes creating, viewing, editing, and deleting payment methods with support for various payment gateways.

## Features

- ✅ View all payment methods in a clean, organized table
- ✅ Create new payment methods with gateway configurations
- ✅ Edit existing payment methods
- ✅ Delete payment methods with confirmation
- ✅ Search and filter payment methods
- ✅ Toggle payment method active/inactive status
- ✅ Masked configuration values for security
- ✅ Support for multiple currencies per payment method
- ✅ Real-time validation for JSON configuration
- ✅ Responsive design for all screen sizes

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── payment-methods/
│   │       ├── route.ts                    # GET (list) & POST (create) handlers
│   │       └── [method_id]/
│   │           └── route.ts                # GET, PATCH, DELETE handlers
│   └── dashboard/
│       └── payment-methods/
│           ├── page.tsx                    # Main payment methods page
│           ├── payment-methods.module.css  # Page styles
│           ├── PaymentMethodModal.tsx      # Create/Edit modal component
│           └── PaymentMethodModal.module.css # Modal styles
└── components/
    └── Navbar/
        └── Navbar.tsx                      # Updated with Payment Methods link
```

## API Endpoints

### 1. GET `/api/admin/payment-methods`
Fetches all payment methods with pagination support.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `page_size` (optional): Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "message": "Payment methods retrieved successfully",
  "data": {
    "payment_methods": [...],
    "pagination": {...}
  }
}
```

### 2. POST `/api/admin/payment-methods`
Creates a new payment method.

**Required Fields:**
- `name`: Payment method name
- `gateway`: Gateway identifier
- `is_active`: Active status (boolean)
- `configuration`: JSON object with gateway config
- `min_amount`: Minimum transaction amount

**Optional Fields:**
- `max_amount`: Maximum transaction amount
- `supported_currencies`: Array of currency codes

### 3. GET `/api/admin/payment-methods/{method_id}`
Retrieves a specific payment method by ID.

### 4. PATCH `/api/admin/payment-methods/{method_id}`
Updates an existing payment method (partial update supported).

### 5. DELETE `/api/admin/payment-methods/{method_id}`
Deletes a payment method.

## Usage Guide

### Accessing Payment Methods
1. Navigate to the dashboard
2. Click on "Payment Methods" in the sidebar (credit card icon)

### Creating a New Payment Method
1. Click the "+ Add Payment Method" button
2. Fill in the required fields:
   - **Name**: Display name (e.g., "Khalti", "eSewa")
   - **Gateway**: Gateway identifier (e.g., "khalti", "esewa")
   - **Minimum Amount**: Lowest transaction amount allowed
   - **Maximum Amount**: Highest transaction amount (optional)
   - **Supported Currencies**: Comma-separated list (e.g., "NPR, USD")
   - **Configuration**: JSON object with gateway credentials
   - **Active**: Toggle to enable/disable
3. Click "Create" to save

### Configuration Format
The configuration field must be valid JSON:

```json
{
  "public_key": "your_public_key_here",
  "secret_key": "your_secret_key_here"
}
```

**Examples:**

**Khalti:**
```json
{
  "public_key": "test_public_key_xxx",
  "secret_key": "test_secret_key_xxx"
}
```

**eSewa:**
```json
{
  "merchant_id": "your_merchant_id",
  "secret_key": "your_secret_key"
}
```

**Stripe:**
```json
{
  "public_key": "pk_test_xxxxx",
  "secret_key": "sk_test_xxxxx"
}
```

### Editing a Payment Method
1. Click the edit icon (pencil) on any payment method row
2. Modify the fields as needed
3. Click "Update" to save changes

### Deleting a Payment Method
1. Click the delete icon (trash) on any payment method row
2. Confirm the deletion in the popup dialog
3. The payment method will be permanently deleted

### Searching Payment Methods
- Use the search bar to filter by name, gateway, or currency
- Results update in real-time as you type
- Click the "×" button to clear the search

## Security Features

1. **Authentication Required**: All API calls require a valid JWT token
2. **CSRF Protection**: POST, PATCH, and DELETE requests include CSRF tokens
3. **Masked Credentials**: Configuration values are partially masked in the UI
4. **Delete Confirmation**: Prevents accidental deletion of payment methods

## Technical Implementation

### Authentication
The implementation uses the existing authentication system:
- JWT tokens stored in localStorage
- Token automatically added to API requests via axios interceptor
- Automatic token refresh on expiry

### State Management
- Local component state using React hooks
- Real-time search with useMemo for performance
- Optimistic UI updates with error handling

### Form Validation
- Client-side validation for required fields
- Real-time JSON validation for configuration
- Error messages displayed inline

### Styling
- Consistent with existing dashboard design
- Color palette: Green (#32cd32, #47b216, #82ea80) and dark theme
- Responsive design using CSS modules
- Smooth animations and transitions

## Color Palette

- **Primary Green**: #32cd32
- **Secondary Green**: #47b216
- **Light Green**: #82ea80
- **Success**: #00ff99
- **Error**: #ff4444
- **Background**: #0b0b0b
- **Card Background**: #121212
- **Border**: #2a2a2a
- **Text Primary**: #fff
- **Text Secondary**: #aaa

## Best Practices

1. **Always validate JSON** before saving configuration
2. **Use descriptive gateway names** (lowercase, no spaces)
3. **Set appropriate min/max amounts** based on gateway limits
4. **Test payment methods** after creation
5. **Keep credentials secure** - never expose in logs
6. **Disable unused gateways** instead of deleting them

## Troubleshooting

### Modal won't open
- Check browser console for errors
- Verify authentication token is valid
- Clear browser cache and reload

### Configuration validation error
- Ensure JSON is properly formatted
- Check for missing commas or quotes
- Use a JSON validator tool if needed

### API errors
- Verify BASE_URL is set correctly in .env
- Check network tab for detailed error messages
- Ensure admin permissions are granted

### TypeScript errors
- Run `npm run dev` to restart the development server
- TypeScript cache issues may require a restart

## Future Enhancements

- [ ] Bulk import/export payment methods
- [ ] Gateway-specific validation rules
- [ ] Test payment method connectivity
- [ ] Payment method usage statistics
- [ ] Webhook configuration support
- [ ] Multi-tenant gateway configurations

## Support

For issues or questions:
1. Check the browser console for errors
2. Verify API responses in Network tab
3. Review the backend logs
4. Contact the development team

---

**Version**: 1.0.0  
**Last Updated**: November 2025  
**Author**: ChargeGhar Development Team