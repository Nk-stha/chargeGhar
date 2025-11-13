# Station Management - Quick Reference Card

## 🚀 Quick Start

```bash
# Navigate to stations
http://localhost:3000/dashboard/stations

# Add new station
http://localhost:3000/dashboard/stations/add
```

## 📦 Imports

### Services
```typescript
import { 
  stationsService, 
  amenitiesService, 
  mediaService 
} from "@/lib/api";
```

### Components
```typescript
import { 
  ImageUpload, 
  AmenitySelector 
} from "@/components/StationManagement";
```

### Types
```typescript
import type { 
  Station, 
  StationDetail,
  Amenity, 
  Media,
  CreateStationInput,
  UpdateStationInput 
} from "@/types/station.types";
```

## 🔧 Common Operations

### List Stations
```typescript
// All stations
const response = await stationsService.getStations();
const stations = response.data.results;

// With filters
const filtered = await stationsService.getStations({
  status: "ONLINE",
  search: "keyword",
  page: 1,
  page_size: 20
});

// By status
const online = await stationsService.getOnlineStations();
const offline = await stationsService.getOfflineStations();
const maintenance = await stationsService.getMaintenanceStations();
```

### Get Station Details
```typescript
const station = await stationsService.getStation("serial-number");
```

### Create Station
```typescript
const newStation = await stationsService.createStation({
  station_name: "Station Name",
  serial_number: "STN-001",
  imei: "123456789012345",
  latitude: 27.7172,
  longitude: 85.324,
  address: "Full Address",
  landmark: "Near landmark",
  total_slots: 8,
  status: "OFFLINE",
  is_maintenance: false,
  hardware_info: {
    firmware_version: "1.0.0",
    hardware_version: "1.0"
  },
  amenity_ids: ["id1", "id2"],
  media_ids: ["media-id"]
});
```

### Update Station
```typescript
await stationsService.updateStation("serial-number", {
  station_name: "New Name",
  status: "ONLINE",
  latitude: 27.7172,
  longitude: 85.324
});
```

### Delete Station
```typescript
await stationsService.deleteStation("serial-number");
```

### Search Stations
```typescript
const results = await stationsService.searchStations("keyword");
```

## 🎯 Amenities

### List Amenities
```typescript
// All active
const amenities = await amenitiesService.getActiveAmenities();

// With filters
const filtered = await amenitiesService.getAmenities({
  is_active: true,
  search: "parking"
});
```

### Create Amenity
```typescript
await amenitiesService.createAmenity({
  name: "WiFi",
  icon: "wifi",
  description: "Free WiFi available",
  is_active: true
});
```

## 📸 Media Upload

### Upload Single File
```typescript
const media = await mediaService.uploadMedia({
  file: selectedFile,
  file_type: "IMAGE"
});
```

### Upload Multiple
```typescript
const results = await mediaService.uploadMultipleMedia(
  filesArray, 
  "IMAGE"
);
```

### List Media
```typescript
const images = await mediaService.getImages();
const videos = await mediaService.getVideos();
```

## 🎨 Component Usage

### ImageUpload
```tsx
<ImageUpload
  onUploadComplete={(media) => handleUpload(media)}
  onRemove={(id) => handleRemove(id)}
  existingImages={images}
  maxFiles={5}
  maxSizeMB={10}
  label="Upload Images"
/>
```

### AmenitySelector
```tsx
<AmenitySelector
  selectedAmenities={selected}
  onChange={setSelected}
  label="Select Amenities"
  multiple={true}
/>
```

## ✅ Validation Rules

| Field | Rule |
|-------|------|
| Station Name | Min 3 chars, Required |
| Serial Number | Not empty, Required |
| IMEI | Not empty, Required |
| Latitude | -90 to 90, Required |
| Longitude | -180 to 180, Required |
| Address | Min 5 chars, Required |
| Total Slots | 1-100, Required |
| Images | Max 5 files, 10MB each |

## 🎯 Status Values

```typescript
type StationStatus = "ONLINE" | "OFFLINE" | "MAINTENANCE";
type MediaFileType = "IMAGE" | "VIDEO" | "DOCUMENT";
```

## 🔍 Common Patterns

### Error Handling
```typescript
try {
  const result = await stationsService.createStation(data);
  if (result.success) {
    // Success
  }
} catch (err: any) {
  console.error(err);
  setError(err.response?.data?.message || "Operation failed");
}
```

### Loading State
```typescript
const [loading, setLoading] = useState(false);

const doSomething = async () => {
  setLoading(true);
  try {
    await stationsService.someMethod();
  } finally {
    setLoading(false);
  }
};
```

### Form State
```typescript
const [formData, setFormData] = useState<Partial<CreateStationInput>>({
  // initial values
});

const handleChange = (field: keyof CreateStationInput, value: any) => {
  setFormData(prev => ({ ...prev, [field]: value }));
};
```

## 🌐 API Response Format

```typescript
{
  success: boolean,
  message: string,
  data: T
}
```

## 📊 Helper Methods

```typescript
// Calculate utilization
const percent = stationsService.calculateUtilization(station);

// Validate data
const validation = stationsService.validateStationData(data);
if (!validation.valid) {
  console.error(validation.errors);
}

// Get status color
const color = stationsService.getStatusColor(station.status);

// Format address
const fullAddress = stationsService.formatAddress(station);

// Check maintenance needed
const needsMaint = stationsService.needsMaintenance(station);

// Validate file
const validation = mediaService.validateFile(file, 10);
if (!validation.valid) {
  console.error(validation.error);
}

// Get file type
const type = mediaService.getFileTypeFromFile(file);
```

## 🔗 Pagination

```typescript
const response = await stationsService.getStations({
  page: 1,
  page_size: 20
});

const pagination = response.data.pagination;
// {
//   current_page: 1,
//   total_pages: 5,
//   total_count: 100,
//   page_size: 20,
//   has_next: true,
//   has_previous: false,
//   next_page: 2,
//   previous_page: null
// }
```

## 🛠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| Auth Error | Check login & token |
| Upload Fails | Check file size/type |
| Amenities Empty | Verify backend API |
| Delete Fails | Check active rentals |
| Validation Fails | Review required fields |

## 📱 Responsive Breakpoints

```css
Desktop: 1024px+
Tablet: 768px - 1023px
Mobile: < 768px
```

## 🎨 Theme Colors

```css
Primary: #47b216 (Green)
Background: #0b0b0b (Dark)
Card: #1a1a1a
Border: #2a2a2a
Text: #e0e0e0
Error: #dc3545
Warning: #ffc107
```

## 📍 File Locations

```
Types:     src/types/station.types.ts
Services:  src/lib/api/
Components: src/components/StationManagement/
API Routes: src/app/api/admin/
Pages:     src/app/dashboard/stations/
```

## 🚦 Quick Checklist

### Creating Station
- [ ] Fill basic info (name, serial, IMEI)
- [ ] Set location (lat/lng)
- [ ] Upload images (optional)
- [ ] Select amenities (optional)
- [ ] Review and submit

### Testing
- [ ] Create station
- [ ] View station list
- [ ] Search stations
- [ ] Edit station
- [ ] Delete station
- [ ] Upload media
- [ ] Select amenities

## 📚 Documentation

- Full Docs: `docs/STATION_MANAGEMENT_IMPLEMENTATION.md`
- Setup Guide: `docs/STATION_MANAGEMENT_SETUP.md`
- Summary: `docs/STATION_MANAGEMENT_SUMMARY.md`

---

**Version**: 1.0.0  
**Last Updated**: November 2025

**💡 Tip**: Keep this card handy for quick reference!