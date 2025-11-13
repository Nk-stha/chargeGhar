# KYC Implementation Guide

KYC (Know Your Customer) verification system management.

---

## Overview

KYC endpoints handle user document verification and approval workflows. The admin dashboard allows verification, rejection, and status tracking of KYC submissions.

---

## KYC API Endpoints

### List KYC Submissions

```
GET /api/admin/kyc
Authorization: Bearer <token>

Query Parameters:
  ?page=1
  &page_size=20
  &status=pending | "verified" | "rejected" | "under_review"
  &search=user_email

Response: {
  success: true,
  data: [
    {
      id: "uuid",
      user_id: "uuid",
      user_email: "user@example.com",
      status: "pending",
      submitted_date: "2024-11-13T10:00:00Z",
      documents: [ { type: "citizenship", url: "..." } ]
    }
  ],
  pagination: { count, next, previous, page_size, current_page }
}
```

### Get KYC Detail

```
GET /api/admin/kyc/[id]
Authorization: Bearer <token>

Response: {
  id: "uuid",
  user_id: "uuid",
  user: { email, phone, name },
  status: "pending",
  submitted_date: "2024-11-13T10:00:00Z",
  verified_date: null,
  documents: [
    {
      id: "uuid",
      type: "citizenship",
      url: "https://...",
      uploaded_at: "2024-11-13T10:00:00Z"
    }
  ],
  notes: "Verification notes",
  rejection_reason: null
}
```

### Update KYC Status

```
PATCH /api/admin/kyc/[id]
Authorization: Bearer <token>

{
  "status": "verified" | "rejected" | "under_review",
  "notes": "Verification completed successfully",
  "rejection_reason": "null" // Only if status="rejected"
}

Response: {
  success: true,
  data: { updated KYC object }
}
```

---

## Status Workflow

```
Submitted (pending)
    ↓
Admin Reviews
    ├─ Verified ✓
    ├─ Rejected ✗ (with reason)
    └─ Under Review (needs more info)
```

### Status Definitions

- **pending** - Waiting for admin review
- **verified** - Approved by admin
- **rejected** - Denied with reason
- **under_review** - Needs additional verification

---

## Component Integration

### KYC Management Page

Location: `/dashboard/kyc`

Features:

- List all KYC submissions
- Filter by status
- View submission details
- Approve/Reject submissions
- Add notes/comments

### KYC Detail Modal

- Display user documents
- Show submission history
- Manage approval status
- Add verification notes

---

## Implementation Example

```typescript
// src/lib/api/kyc.service.ts
import instance from "../axios";

class KYCService {
  async getSubmissions(page = 1, status = null) {
    const params = new URLSearchParams({ page, page_size: 20 });
    if (status) params.append("status", status);

    const response = await instance.get(`/api/admin/kyc?${params}`);
    return response.data;
  }

  async getDetail(id: string) {
    const response = await instance.get(`/api/admin/kyc/${id}`);
    return response.data.data;
  }

  async updateStatus(id: string, status: string, notes?: string) {
    const payload = { status, notes };
    const response = await instance.patch(`/api/admin/kyc/${id}`, payload);
    return response.data.data;
  }

  async rejectKYC(id: string, reason: string) {
    return this.updateStatus(id, "rejected", reason);
  }

  async approveKYC(id: string, notes?: string) {
    return this.updateStatus(id, "verified", notes);
  }
}

export const kycService = new KYCService();
```

### Usage in Component

```typescript
// In /dashboard/kyc/page.tsx
"use client";

import { useState, useEffect } from "react";
import { kycService } from "@/lib/api/kyc.service";

export default function KYCPage() {
  const [submissions, setSubmissions] = useState([]);
  const [status, setStatus] = useState("pending");

  useEffect(() => {
    loadSubmissions();
  }, [status]);

  const loadSubmissions = async () => {
    try {
      const data = await kycService.getSubmissions(1, status);
      setSubmissions(data.data);
    } catch (error) {
      console.error("Failed to load KYC:", error);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await kycService.approveKYC(id, "Approved by admin");
      await loadSubmissions();
      alert("KYC approved");
    } catch (error) {
      alert("Failed to approve KYC");
    }
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      await kycService.rejectKYC(id, reason);
      await loadSubmissions();
      alert("KYC rejected");
    } catch (error) {
      alert("Failed to reject KYC");
    }
  };

  return (
    <div>
      <h1>KYC Management</h1>

      {/* Status filter */}
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="pending">Pending</option>
        <option value="verified">Verified</option>
        <option value="rejected">Rejected</option>
        <option value="under_review">Under Review</option>
      </select>

      {/* KYC list */}
      <table>
        <thead>
          <tr>
            <th>User Email</th>
            <th>Status</th>
            <th>Submitted Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((kyc) => (
            <tr key={kyc.id}>
              <td>{kyc.user_email}</td>
              <td>{kyc.status}</td>
              <td>{new Date(kyc.submitted_date).toLocaleDateString()}</td>
              <td>
                <button onClick={() => handleApprove(kyc.id)}>Approve</button>
                <button onClick={() => handleReject(kyc.id, "Incomplete")}>
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## Best Practices

- Verify document authenticity
- Keep detailed notes for rejected submissions
- Set clear rejection reasons
- Monitor verification time
- Track approval metrics

---

**Last Updated:** November 13, 2025
**Version:** 2.0.0 (Based on Actual API Routes)
