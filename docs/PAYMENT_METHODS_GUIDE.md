# Payment Methods Guide

Payment method and transaction management.

---

## Overview

Payment methods are configured in the system for user transactions. Admin manages payment methods, processes refunds/withdrawals, and views transaction history.

---

## Payment Methods API

### List Payment Methods

```
GET /api/admin/payment-methods
Authorization: Bearer <token>

Response: {
  success: true,
  data: [
    {
      id: "uuid",
      name: "esewa",
      display_name: "eSewa",
      is_active: true,
      commission_rate: 2.5,
      min_amount: 100,
      max_amount: 100000
    }
  ]
}
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
  "display_name": "string",
  "is_active": true,
  "commission_rate": 2.5
}
```

---

## Transaction Management

### List Transactions

```
GET /api/admin/transactions
Authorization: Bearer <token>

Query Parameters:
  ?page=1
  &page_size=20
  &type=rental | "wallet_topup" | "refund" | "withdrawal"
  &status=completed | "pending" | "failed"
  &start_date=2024-01-01
  &end_date=2024-12-31
  &payment_method=esewa

Response: {
  success: true,
  data: [
    {
      id: "uuid",
      user_id: "uuid",
      amount: 500.00,
      type: "rental",
      status: "completed",
      payment_method: "esewa",
      transaction_id: "eSewa-12345",
      created_at: "2024-11-13T10:00:00Z"
    }
  ],
  pagination: { ... }
}
```

---

## Refund Processing

### List Refunds

```
GET /api/admin/refunds
Authorization: Bearer <token>

Query Parameters:
  ?page=1
  &status=pending | "approved" | "rejected"

Response: {
  success: true,
  data: [
    {
      id: "uuid",
      rental_id: "uuid",
      user_id: "uuid",
      amount: 500.00,
      reason: "User requested cancellation",
      status: "pending",
      requested_at: "2024-11-13T10:00:00Z"
    }
  ]
}
```

### Process Refund

```
POST /api/admin/refunds/[id]/process
Authorization: Bearer <token>

{
  "status": "approved" | "rejected",
  "admin_notes": "Refund processed successfully"
}

Response: {
  success: true,
  message: "Refund processed",
  data: { updated refund object }
}
```

---

## Withdrawal Processing

### List Withdrawals

```
GET /api/admin/withdrawals
Authorization: Bearer <token>

Query Parameters:
  ?page=1
  &status=pending | "completed" | "rejected"

Response: {
  success: true,
  data: [
    {
      id: "uuid",
      user_id: "uuid",
      amount: 5000.00,
      bank_account: "1234567890",
      status: "pending",
      requested_at: "2024-11-13T10:00:00Z"
    }
  ]
}
```

### Process Withdrawal

```
POST /api/admin/withdrawals/[id]/process
Authorization: Bearer <token>

{
  "status": "approved" | "rejected",
  "transaction_ref": "BANK-12345",
  "notes": "Processed successfully"
}

Response: {
  success: true,
  data: { updated withdrawal object }
}
```

### Get Withdrawal Analytics

```
GET /api/admin/withdrawals/analytics
Authorization: Bearer <token>

Response: {
  total_withdrawals: 50000.00,
  total_pending: 10000.00,
  total_processed: 40000.00,
  average_processing_time: "2 days"
}
```

---

## Implementation Example

```typescript
// src/lib/api/payment.service.ts
import instance from "../axios";

class PaymentService {
  async getPaymentMethods() {
    const response = await instance.get("/api/admin/payment-methods");
    return response.data.data;
  }

  async getTransactions(filters = {}) {
    const params = new URLSearchParams({
      page: 1,
      page_size: 20,
      ...filters,
    });
    const response = await instance.get(`/api/admin/transactions?${params}`);
    return response.data;
  }

  async getRefunds(status = null) {
    const params = new URLSearchParams({ page: 1 });
    if (status) params.append("status", status);
    const response = await instance.get(`/api/admin/refunds?${params}`);
    return response.data.data;
  }

  async processRefund(refundId: string, status: string, notes?: string) {
    const response = await instance.post(
      `/api/admin/refunds/${refundId}/process`,
      { status, admin_notes: notes }
    );
    return response.data.data;
  }

  async getWithdrawals(status = null) {
    const params = new URLSearchParams({ page: 1 });
    if (status) params.append("status", status);
    const response = await instance.get(`/api/admin/withdrawals?${params}`);
    return response.data.data;
  }

  async processWithdrawal(withdrawalId: string, status: string, ref: string) {
    const response = await instance.post(
      `/api/admin/withdrawals/${withdrawalId}/process`,
      { status, transaction_ref: ref }
    );
    return response.data.data;
  }
}

export const paymentService = new PaymentService();
```

### Usage in Component

```typescript
// In /dashboard/transactions/page.tsx
"use client";

import { useState, useEffect } from "react";
import { paymentService } from "@/lib/api/payment.service";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const data = await paymentService.getTransactions({
        status: "completed",
      });
      setTransactions(data.data);
    } catch (error) {
      console.error("Failed to load transactions:", error);
    }
  };

  return (
    <div>
      <h1>Transactions</h1>
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Amount</th>
            <th>Type</th>
            <th>Method</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td>{tx.user_id}</td>
              <td>NPR {tx.amount.toLocaleString()}</td>
              <td>{tx.type}</td>
              <td>{tx.payment_method}</td>
              <td>{tx.status}</td>
              <td>{new Date(tx.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## Supported Payment Methods

Common methods configured in the system:

- eSewa
- Khalti
- Bank Transfer
- Card Payment

Each method has configuration for:

- Commission rate
- Min/Max transaction amount
- Status (active/inactive)

---

**Last Updated:** November 13, 2025
**Version:** 2.0.0 (Based on Actual API Routes)
