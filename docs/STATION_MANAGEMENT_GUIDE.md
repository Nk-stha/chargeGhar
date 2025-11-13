# Station Management Guide

Charging station CRUD operations and issue tracking.

---

## Overview

Station management handles creation, updates, and monitoring of charging stations. Includes amenities management and issue tracking.

---

## Station API Endpoints

### List Stations

```
GET /api/admin/stations
Authorization: Bearer <token>

Query Parameters:
  ?page=1
  &page_size=20
  &search=station_name
  &status=active | "inactive" | "maintenance"

Response: {
  success: true,
  data: [
    {
      id: "uuid",
      serial_number: "STN-001",
      name: "Kathmandu Central",
      status: "active",
      location: {
        latitude: 27.7172,
        longitude: 85.3240,
        address: "Main Street, Kathmandu"
      },
      slots: { total: 20, available: 5 },
      powerbanks: { total: 50, available: 20 },
      utilization_rate: 75
    }
  ],
  pagination: { ... }
}
```

### Get Station Detail

```
GET /api/admin/stations/[station_sn]
Authorization: Bearer <token>

Response: {
  id: "uuid",
  serial_number: "STN-001",
  name: "Kathmandu Central",
  status: "active",
  location: { latitude, longitude, address, city, country },
  slots: [ { id, slot_number, status, current_rental } ],
  powerbanks: [ { id, model, status, battery_level, quantity } ],
  amenities: [ { id, name, description } ],
  statistics: {
    total_rentals: 1250,
    revenue: 125000,
    utilization_rate: 75,
    peak_hours: ["12:00-14:00", "18:00-20:00"]
  },
  issues: [ { ... } ]
}
```

### Create Station

```
POST /api/admin/stations
Authorization: Bearer <token>

{
  "name": "New Station",
  "latitude": 27.7172,
  "longitude": 85.3240,
  "address": "Station Address",
  "city": "Kathmandu",
  "country": "Nepal",
  "status": "active"
}

Response: {
  success: true,
  data: { created station object }
}
```

### Update Station

```
PATCH /api/admin/stations/[station_sn]
Authorization: Bearer <token>

{
  "name": "Updated Name",
  "status": "active" | "inactive" | "maintenance",
  "address": "New Address"
}
```

---

## Station Amenities

### List Amenities

```
GET /api/admin/amenities
Authorization: Bearer <token>

Response: {
  success: true,
  data: [
    {
      id: "uuid",
      name: "WiFi",
      description: "Free WiFi access",
      icon: "wifi"
    }
  ]
}
```

### Create Amenity

```
POST /api/admin/amenities
Authorization: Bearer <token>

{
  "name": "WiFi",
  "description": "Free WiFi access",
  "icon": "wifi"
}
```

### Update Amenity

```
PATCH /api/admin/amenities/[amenity_id]
Authorization: Bearer <token>

{
  "name": "Updated Name",
  "description": "Updated description"
}
```

---

## Station Issues

### List Station Issues

```
GET /api/admin/stations/issues
Authorization: Bearer <token>

Query Parameters:
  ?page=1
  &status=open | "resolved" | "closed"
  &station_id=uuid

Response: {
  success: true,
  data: [
    {
      id: "uuid",
      station_id: "uuid",
      station_name: "Kathmandu Central",
      type: "equipment_damage",
      description: "Powerbank charging port damaged",
      severity: "high",
      status: "open",
      reported_at: "2024-11-13T08:00:00Z",
      assigned_to: "Technician Name"
    }
  ]
}
```

### Create Station Issue

```
POST /api/admin/stations/issues
Authorization: Bearer <token>

{
  "station_id": "uuid",
  "type": "equipment_damage" | "low_stock" | "maintenance_required",
  "description": "Description of the issue",
  "severity": "low" | "medium" | "high"
}

Response: {
  success: true,
  data: { created issue object }
}
```

### Get Issue Detail

```
GET /api/admin/stations/issues/[issue_id]
Authorization: Bearer <token>
```

### Update Issue

```
PATCH /api/admin/stations/issues/[issue_id]
Authorization: Bearer <token>

{
  "status": "resolved" | "closed",
  "notes": "Issue has been resolved",
  "assigned_to": "Technician Name"
}
```

---

## Implementation Example

```typescript
// src/lib/api/stations.service.ts
import instance from "../axios";

class StationsService {
  async getStations(page = 1, search = "") {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: "20",
    });
    if (search) params.append("search", search);

    const response = await instance.get(`/api/admin/stations?${params}`);
    return response.data;
  }

  async getStationDetail(stationSn: string) {
    const response = await instance.get(`/api/admin/stations/${stationSn}`);
    return response.data.data;
  }

  async createStation(data: any) {
    const response = await instance.post("/api/admin/stations", data);
    return response.data.data;
  }

  async updateStation(stationSn: string, data: any) {
    const response = await instance.patch(
      `/api/admin/stations/${stationSn}`,
      data
    );
    return response.data.data;
  }

  async getAmenities() {
    const response = await instance.get("/api/admin/amenities");
    return response.data.data;
  }

  async createAmenity(data: any) {
    const response = await instance.post("/api/admin/amenities", data);
    return response.data.data;
  }

  async getStationIssues(status = null) {
    const params = new URLSearchParams({ page: "1" });
    if (status) params.append("status", status);

    const response = await instance.get(`/api/admin/stations/issues?${params}`);
    return response.data;
  }

  async createIssue(data: any) {
    const response = await instance.post("/api/admin/stations/issues", data);
    return response.data.data;
  }

  async updateIssue(issueId: string, data: any) {
    const response = await instance.patch(
      `/api/admin/stations/issues/${issueId}`,
      data
    );
    return response.data.data;
  }
}

export const stationsService = new StationsService();
```

### Usage in Component

```typescript
// In /dashboard/stations/page.tsx
"use client";

import { useState, useEffect } from "react";
import { stationsService } from "@/lib/api/stations.service";

export default function StationsPage() {
  const [stations, setStations] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadStations();
  }, [search]);

  const loadStations = async () => {
    try {
      const data = await stationsService.getStations(1, search);
      setStations(data.data);
    } catch (error) {
      console.error("Failed to load stations:", error);
    }
  };

  const handleCreateStation = async () => {
    try {
      await stationsService.createStation({
        name: "New Station",
        latitude: 27.7172,
        longitude: 85.324,
        address: "Address",
        city: "Kathmandu",
        country: "Nepal",
      });
      await loadStations();
      alert("Station created");
    } catch (error) {
      alert("Failed to create station");
    }
  };

  return (
    <div>
      <h1>Stations</h1>

      <input
        type="text"
        placeholder="Search stations..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <button onClick={handleCreateStation}>Create Station</button>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Location</th>
            <th>Status</th>
            <th>Utilization</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {stations.map((station) => (
            <tr key={station.id}>
              <td>{station.name}</td>
              <td>{station.location.city}</td>
              <td>{station.status}</td>
              <td>{station.utilization_rate}%</td>
              <td>
                <button>Edit</button>
                <button>View Details</button>
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

## Station Status Workflow

```
Creating Station
    ↓
Active - Operating normally
    ├─ Inactive - Temporarily closed
    └─ Maintenance - Under maintenance
```

### Status Transitions

- **active** → Can change to inactive or maintenance
- **inactive** → Can reactivate to active
- **maintenance** → Return to active when complete

---

## Issue Management

### Severity Levels

- **low** - Minor issues, no urgent action
- **medium** - Should be addressed soon
- **high** - Urgent, affects operations

### Issue Types

- **equipment_damage** - Hardware problems
- **low_stock** - Powerbanks running low
- **maintenance_required** - Scheduled maintenance

---

**Last Updated:** November 13, 2025
**Version:** 2.0.0 (Based on Actual API Routes)
