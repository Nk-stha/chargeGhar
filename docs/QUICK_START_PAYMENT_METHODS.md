# Quick Start Guide: Payment Methods

## 🚀 Getting Started in 3 Minutes

### Step 1: Access Payment Methods
1. Login to your admin dashboard
2. Click **"Payment Methods"** in the sidebar (💳 credit card icon)
3. You'll see a list of all configured payment gateways

### Step 2: Add Your First Payment Method

Click the **"+ Add Payment Method"** button and fill in:

#### Example: Adding Khalti
```
Name: Khalti
Gateway: khalti
Minimum Amount: 10.00
Maximum Amount: 100000.00
Supported Currencies: NPR
Configuration:
{
  "public_key": "your_khalti_public_key",
  "secret_key": "your_khalti_secret_key"
}
✓ Active
```

Click **"Create"** - Done! ✅

### Step 3: Common Payment Gateways

#### Khalti (Nepal)
```json
{
  "public_key": "test_public_key_xxxxx",
  "secret_key": "test_secret_key_xxxxx"
}
```
- Min: 10 NPR
- Max: 100,000 NPR
- Currency: NPR

#### eSewa (Nepal)
```json
{
  "merchant_id": "ESEWA-MERCHANT-ID",
  "secret_key": "your_secret_key"
}
```
- Min: 10 NPR
- Max: 50,000 NPR
- Currency: NPR

#### Stripe (International)
```json
{
  "public_key": "pk_test_xxxxxxxxxxxxx",
  "secret_key": "sk_test_xxxxxxxxxxxxx"
}
```
- Min: 1.00
- Max: Unlimited
- Currencies: USD, GBP, EUR, etc.

## 📝 Quick Operations

### Edit a Payment Method
1. Click the **✏️ pencil icon** on any row
2. Modify fields
3. Click **"Update"**

### Delete a Payment Method
1. Click the **🗑️ trash icon** on any row
2. Confirm deletion
3. Payment method is removed

### Search Payment Methods
- Type in the search bar to filter by:
  - Name (e.g., "Khalti")
  - Gateway (e.g., "stripe")
  - Currency (e.g., "NPR")

### Toggle Active Status
1. Click **Edit** on the payment method
2. Toggle the **"Active"** checkbox
3. Click **"Update"**

## ⚠️ Important Notes

### Configuration Format
- Must be valid JSON
- Use double quotes for keys and values
- No trailing commas
- Test in a JSON validator if unsure

### Security
- Configuration values are masked in the UI
- Never share secret keys
- Use test keys for development
- Use production keys only in production

### Best Practices
- ✅ Use descriptive names (e.g., "Khalti Nepal", "Stripe USD")
- ✅ Set appropriate min/max amounts
- ✅ Test with small amounts first
- ✅ Disable unused gateways instead of deleting
- ✅ Keep multiple backup payment methods

## 🐛 Troubleshooting

### "Invalid JSON format" error
**Solution:** Check your configuration JSON:
```json
❌ Wrong:
{
  'key': 'value',  // Single quotes
  "another": "value",  // Trailing comma not allowed at end
}

✅ Correct:
{
  "key": "value",
  "another": "value"
}
```

### Configuration not saving
**Solution:**
- Ensure all required fields are filled
- Check JSON is valid
- Verify you have admin permissions

### Can't see payment methods
**Solution:**
- Check you're logged in
- Verify authentication token is valid
- Refresh the page

## 💡 Pro Tips

1. **Copy Existing Configuration**: Edit a similar payment method and copy its configuration format

2. **Test Mode First**: Always use test keys before production:
   - Khalti: Keys starting with `test_`
   - Stripe: Keys starting with `pk_test_` and `sk_test_`
   - eSewa: Use sandbox environment

3. **Multiple Currencies**: Add comma-separated currencies:
   ```
   NPR, USD, EUR, GBP
   ```

4. **Quick Search**: Use Ctrl+F (Cmd+F on Mac) to search the page if you have many payment methods

5. **Backup Configuration**: Keep a copy of your configurations in a secure place

## 📊 Feature Overview

| Feature | Status |
|---------|--------|
| Create Payment Method | ✅ |
| Edit Payment Method | ✅ |
| Delete Payment Method | ✅ |
| Search/Filter | ✅ |
| Active/Inactive Toggle | ✅ |
| Multiple Currencies | ✅ |
| JSON Validation | ✅ |
| Masked Credentials | ✅ |
| Responsive Design | ✅ |

## 🎯 Next Steps

1. ✅ Add your primary payment gateway
2. ✅ Add a backup payment gateway
3. ✅ Test with small transactions
4. ✅ Monitor payment success rates
5. ✅ Update to production keys when ready

## 📞 Need Help?

- Check browser console for errors (F12)
- Verify API endpoint is configured correctly
- Review backend logs for detailed errors
- Contact development team with error details

---

**Ready to accept payments!** 🎉

For detailed documentation, see [PAYMENT_METHODS_README.md](./PAYMENT_METHODS_README.md)