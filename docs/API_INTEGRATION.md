# API Integration Guide

Complete API reference based on actual implementation in `/src/app/api`.

---

## Overview

All API routes proxy requests through Next.js to Django backend. The Next.js route validates authorization and forwards headers to Django.

### Request Pattern

```
POST /api/admin/resource
Authorization: Bearer <token>
Content-Type: application/json

Body: { data }
    ↓
Next.js Route Handler (/src/app/api/admin/resource/route.ts)
    ├─ Extract Authorization header
    ├─ Forward to Django: POST /admin/resource
    └─ Return response
```

---

## Authentication Routes

### Login

```
POST /api/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}

Response: {
  "access_token": "string",
  "refresh_token": "string",
  "user": { id, email, role }
}
```

### Refresh Token

```
POST /api/refresh

{
  "refresh": "refresh_token_string"
}

Response: {
  "access_token": "string"
}
```

### Logout

```
POST /api/logout
Authorization: Bearer <token>
```

---

## Admin Profile

### Get Current Admin

```
GET /api/admin/me
Authorization: Bearer <token>

Response: { id, email, name, role }
```

---

## User Management

### List Users

```
GET /api/admin/users
Authorization: Bearer <token>

Query Parameters:
  ?page=1
  &page_size=20
  &search=name/email
  &status=active

Response: {
  success: true,
  data: [ { id, email, phone, status, kyc_status } ]
}
```

### Get User Detail

```
GET /api/admin/users/[id]
Authorization: Bearer <token>

Response: {
  id, email, phone, first_name, last_name,
  status, kyc_status, wallet_balance,
  registration_date, last_active
}
```

### Update User

```
PATCH /api/admin/users/[id]
Authorization: Bearer <token>

{
  "first_name": "string",
  "last_name": "string",
  "phone": "string"
}
```

### Update User Status

```
PATCH /api/admin/users/[id]/status
Authorization: Bearer <token>

{
  "status": "active" | "inactive" | "suspended"
}
```

### Add Balance to User

```
POST /api/admin/users/[id]/add-balance
Authorization: Bearer <token>

{
  "amount": number,
  "reason": "string"
}
```

### Get User Leaderboard

```
GET /api/admin/users/leaderboard
Authorization: Bearer <token>

Query Parameters:
  ?category=points | "rentals" | "referrals"
  &period=all | "monthly" | "yearly"
```

---

## Station Management

### List Stations

```
GET /api/admin/stations
Authorization: Bearer <token>

Query Parameters:
  ?page=1
  &page_size=20
  &search=name
  &status=active | "inactive" | "maintenance"
```

### Get Station Detail

```
GET /api/admin/stations/[station_sn]
Authorization: Bearer <token>

Response: {
  id, serial_number, name, status,
  location: { latitude, longitude, address },
  slots, powerbanks, amenities,
  statistics: { rentals, revenue, utilization }
}
```

### Create Station

```
POST /api/admin/stations
Authorization: Bearer <token>

{
  "name": "string",
  "latitude": number,
  "longitude": number,
  "address": "string"
}
```

### Update Station

```
PATCH /api/admin/stations/[station_sn]
Authorization: Bearer <token>

{
  "name": "string",
  "status": "active" | "inactive",
  "address": "string"
}
```

### List Station Issues

```
GET /api/admin/stations/issues
Authorization: Bearer <token>

Query Parameters:
  ?page=1
  &status=open | "resolved" | "closed"
```

### Create Station Issue

```
POST /api/admin/stations/issues
Authorization: Bearer <token>

{
  "station_id": "uuid",
  "type": "equipment_damage" | "maintenance_required",
  "description": "string",
  "severity": "low" | "medium" | "high"
}
```

### Get Station Issue Detail

```
GET /api/admin/stations/issues/[issue_id]
Authorization: Bearer <token>
```

### Update Station Issue

```
PATCH /api/admin/stations/issues/[issue_id]
Authorization: Bearer <token>

{
  "status": "resolved" | "closed",
  "notes": "string"
}
```

---

## Station Amenities

### List Amenities

```
GET /api/admin/amenities
Authorization: Bearer <token>
```

### Create Amenity

```
POST /api/admin/amenities
Authorization: Bearer <token>

{
  "name": "string",
  "description": "string"
}
```

### Update Amenity

```
PATCH /api/admin/amenities/[amenity_id]
Authorization: Bearer <token>

{
  "name": "string",
  "description": "string"
}
```

---

## Rental Management

### List Rentals

```
GET /api/admin/rentals
Authorization: Bearer <token>

Query Parameters:
  ?page=1
  &status=active | "completed" | "cancelled"
  &user_id=uuid
  &station_id=uuid
```

### Get Rental Detail

```
GET /api/admin/rentals/[rental_id]
Authorization: Bearer <token>

Response: {
  id, user: { id, name, email },
  station: { id, name },
  package: { id, name, price },
  status, payment_status, start_time, end_time,
  duration_hours, amount, late_fee, total_amount
}
```

### List Rental Issues

```
GET /api/admin/rentals/issues
Authorization: Bearer <token>

Query Parameters:
  ?page=1
  &status=open | "resolved"
```

### Create Rental Issue

```
POST /api/admin/rentals/issues
Authorization: Bearer <token>

{
  "rental_id": "uuid",
  "type": "damaged_powerbank" | "missing_powerbank",
  "description": "string"
}
```

---

## KYC Management

### List KYC Submissions

```
GET /api/admin/kyc
Authorization: Bearer <token>

Query Parameters:
  ?page=1
  &status=pending | "verified" | "rejected"
```

### Get KYC Detail

```
GET /api/admin/kyc/[id]
Authorization: Bearer <token>

Response: {
  id, user_id, submission_date,
  status, documents: [], notes
}
```

### Update KYC Status

```
PATCH /api/admin/kyc/[id]
Authorization: Bearer <token>

{
  "status": "verified" | "rejected",
  "notes": "string"
}
```

---

## Payment Methods

### List Payment Methods

```
GET /api/admin/payment-methods
Authorization: Bearer <token>
```

### Get Payment Method Detail

```
GET /api/admin/payment-methods/[method_id]
Authorization: Bearer <token>
```

### Update Payment Method

```
PATCH /api/admin/payment-methods/[method_id]
Authorization: Bearer <token>

{
  "name": "string",
  "is_active": boolean
}
```

### Get User Payment Methods

```
GET /api/admin/profiles
Authorization: Bearer <token>
```

---

## Transactions

### List Transactions

```
GET /api/admin/transactions
Authorization: Bearer <token>

Query Parameters:
  ?page=1
  &page_size=20
  &type=rental | "wallet" | "refund"
  &status=completed | "pending" | "failed"
  &start_date=2024-01-01
  &end_date=2024-12-31
```

---

## Refunds

### List Refunds

```
GET /api/admin/refunds
Authorization: Bearer <token>

Query Parameters:
  ?page=1
  &status=pending | "approved" | "rejected"
```

### Process Refund

```
POST /api/admin/refunds/[id]/process
Authorization: Bearer <token>

{
  "status": "approved" | "rejected",
  "notes": "string"
}
```

---

## Withdrawals

### List Withdrawals

```
GET /api/admin/withdrawals
Authorization: Bearer <token>

Query Parameters:
  ?page=1
  &status=pending | "completed" | "rejected"
```

### Process Withdrawal

```
POST /api/admin/withdrawals/[id]/process
Authorization: Bearer <token>

{
  "status": "approved" | "rejected"
}
```

### Get Withdrawal Analytics

```
GET /api/admin/withdrawals/analytics
Authorization: Bearer <token>
```

---

## Coupons

### List Coupons

```
GET /api/admin/coupons
Authorization: Bearer <token>

Query Parameters:
  ?page=1
  &search=code
```

### Create Coupon

```
POST /api/admin/coupons
Authorization: Bearer <token>

{
  "code": "string",
  "discount_type": "percentage" | "fixed",
  "discount_value": number,
  "max_uses": number,
  "expiry_date": "2024-12-31"
}
```

### Get Coupon Detail

```
GET /api/admin/coupons/[code]
Authorization: Bearer <token>
```

### Get Coupon Usages

```
GET /api/admin/coupons/[code]/usages
Authorization: Bearer <token>
```

### Update Coupon

```
PATCH /api/admin/coupons/[code]
Authorization: Bearer <token>

{
  "discount_value": number,
  "max_uses": number
}
```

---

## Points Management

### Get Points History

```
GET /api/admin/points/history
Authorization: Bearer <token>

Query Parameters:
  ?page=1
  &user_id=uuid
```

### Get User Points History

```
GET /api/admin/points/users/[user_id]/history
Authorization: Bearer <token>
```

### Adjust User Points

```
POST /api/admin/points/adjust
Authorization: Bearer <token>

{
  "user_id": "uuid",
  "points": number,
  "reason": "string"
}
```

### Get Points Analytics

```
GET /api/admin/points/analytics
Authorization: Bearer <token>
```

---

## Achievements

### List Achievements

```
GET /api/admin/achievements
Authorization: Bearer <token>

Query Parameters:
  ?page=1
```

### Create Achievement

```
POST /api/admin/achievements
Authorization: Bearer <token>

{
  "name": "string",
  "description": "string",
  "icon": "string",
  "points": number
}
```

### Get Achievement Detail

```
GET /api/admin/achievements/[id]
Authorization: Bearer <token>
```

### Get Achievement Analytics

```
GET /api/admin/achievements/analytics
Authorization: Bearer <token>
```

---

## Content Management

### FAQs

```
GET /api/admin/content/faqs
POST /api/admin/content/faqs
GET /api/admin/content/faqs/[faq_id]
PATCH /api/admin/content/faqs/[faq_id]
Authorization: Bearer <token>
```

### Banners

```
GET /api/admin/content/banners
POST /api/admin/content/banners
GET /api/admin/content/banners/[banner_id]
PATCH /api/admin/content/banners/[banner_id]
Authorization: Bearer <token>
```

### Contact Information

```
GET /api/admin/content/contact
POST /api/admin/content/contact
GET /api/admin/content/contact/[contact_id]
PATCH /api/admin/content/contact/[contact_id]
Authorization: Bearer <token>
```

---

## Analytics

### Revenue Over Time

```
GET /api/admin/analytics/revenue-over-time
Authorization: Bearer <token>

Query Parameters:
  ?period=daily | "weekly" | "monthly"
  &start_date=2024-01-01
  &end_date=2024-12-31

Response: {
  period: "daily",
  total_revenue: number,
  chart_data: [ { date, revenue, count } ]
}
```

### Rentals Over Time

```
GET /api/admin/analytics/rentals-over-time
Authorization: Bearer <token>

Query Parameters:
  ?period=daily | "weekly" | "monthly"
  &start_date=2024-01-01
  &end_date=2024-12-31

Response: {
  period: "daily",
  total_rentals: number,
  chart_data: [ { date, rentals, completed, cancelled } ]
}
```

---

## Dashboard & System

### Get Dashboard Data

```
GET /api/dashboard-data
Authorization: Bearer <token>

Response: {
  dashboard: { stats, recent_activity },
  profiles: [ ... ],
  stations: [ ... ]
}
```

### Get Dashboard (Direct)

```
GET /api/admin/dashboard
Authorization: Bearer <token>
```

### System Health

```
GET /api/admin/system-health
Authorization: Bearer <token>

Response: {
  status: "healthy",
  database: "connected",
  uptime: number,
  memory: number,
  cpu: number
}
```

### System Logs

```
GET /api/admin/system-logs
Authorization: Bearer <token>

Query Parameters:
  ?page=1
  &log_level=error | "warning" | "info"
```

### Action Logs

```
GET /api/admin/action-logs
Authorization: Bearer <token>

Query Parameters:
  ?page=1
  &action=create | "update" | "delete"
  &user_id=uuid
```

---

## Media Management

### Upload Media

```
POST /api/admin/media/uploads
Authorization: Bearer <token>
Content-Type: multipart/form-data

FormData: {
  "file": File,
  "type": "image" | "document"
}
```

### Get Media Detail

```
GET /api/admin/media/uploads/[upload_id]
Authorization: Bearer <token>
```

---

## System Configuration

### Get Configuration

```
GET /api/admin/config
Authorization: Bearer <token>
```

### Create Configuration

```
POST /api/admin/config
Authorization: Bearer <token>

{
  "key": "string",
  "value": "string",
  "description": "string"
}
```

### Update Configuration

```
PUT /api/admin/config
Authorization: Bearer <token>

{
  "key": "string",
  "value": "string"
}
```

### Delete Configuration

```
DELETE /api/admin/config
Authorization: Bearer <token>

{ "key": "string" }
```

---

## Late Fee Configuration

### List Late Fee Configs

```
GET /api/admin/late-fee-configs
Authorization: Bearer <token>
```

### Create Late Fee Config

```
POST /api/admin/late-fee-configs
Authorization: Bearer <token>

{
  "hours_threshold": number,
  "fee_amount": number,
  "description": "string"
}
```

### Update Late Fee Config

```
PATCH /api/admin/late-fee-configs/[config_id]
Authorization: Bearer <token>

{
  "fee_amount": number
}
```

---

## Error Responses

### 401 Unauthorized

```json
{
  "message": "Authorization header is required"
}
```

### 404 Not Found

```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "message": "Internal server error"
}
```

---

**Last Updated:** November 13, 2025
**Version:** 2.0.0 (Based on Actual Project Routes)
