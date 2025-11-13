# Station Management System - Quick Setup Guide

## Overview

This guide will help you get started with the Station Management System in the ChargeGhar admin dashboard.

## Prerequisites

- Node.js 18+ installed
- Next.js 14+ project setup
- Backend API running at `process.env.BASE_URL`
- Admin authentication configured

## Installation

No additional packages need to be installed! The system uses existing project dependencies.

## Environment Variables

Ensure your `.env.local` file has:

```env
BASE_URL=https://main.chargeghar.com/api
NEXT_PUBLIC_API_URL=https://main.chargeghar.com/api
```

## File Checklist

Verify these files are in place:

### Types
- ✅ `src/types/station.types.ts`

### Services
- ✅ `src/lib/api/stations.service.ts`
- ✅ `src/lib/api/amenities.service.ts`
- ✅ `src/lib/api/media.service.ts`
- ✅ `src/lib/api/index.ts`

### Components
- ✅ `src/components/StationManagement/ImageUpload.tsx`
- ✅ `src/components/StationManagement/ImageUpload.module.css`
- ✅ `src/components/StationManagement/AmenitySelector.tsx`
- ✅ `src/components/StationManagement/AmenitySelector.module.css`
- ✅ `src/components/StationManagement/index.ts`

### API Routes
- ✅ `src/app/api/admin/stations/route.ts`
- ✅ `src/app/api/admin/stations/[station_sn]/route.ts`
- ✅ `src/app/api/admin/amenities/route.ts`
- ✅ `src/app/api/admin/amenities/[amenity_id]/route.ts`
- ✅ `src/app/api/admin/media/uploads/route.ts`

### Pages
- ✅ `src/app/dashboard/stations/page.tsx`
- ✅ `src/app/dashboard/stations/stations.module.css`
- ✅ `src/app/dashboard/stations/add/page.tsx`
- ✅ `src/app/dashboard/stations/add/add.module.css`

## Quick Start

### 1. Start Development Server

```bash
npm run dev
# or
yarn dev
```

### 2. Navigate to Stations

Open your browser and go to:
```
http://localhost:3000/dashboard/stations
```

### 3. Create Your First Station

1. Click "Add Station" button
2. Fill in the 4-step wizard:
   - **Step 1**: Basic info (name, serial number, IMEI, etc.)
   - **Step 2**: Location (lat/lng with map preview)
   - **Step 3**: Upload images and select amenities
   - **Step 4**: Review and submit

## Usage Examples

### Import Services

```typescript
import { stationsService, amenitiesService, mediaService } from "@/lib/api";
```

### Import Components

```typescript
import { ImageUpload, AmenitySelector } from "@/components/StationManagement";
```

### Import Types

```typescript
import type { Station, Amenity, Media } from "@/types/station.types";
```

### Fetch Stations

```typescript
// Get all stations
const response = await stationsService.getStations();
const stations = response.data.results;

// With filters
const filtered = await stationsService.getStations({
  status: "ONLINE",
  search: "Kathmandu",
  page: 1,
  page_size: 20
});

// Search stations
const searchResults = await stationsService.searchStations("Mall");
```

### Create a Station

```typescript
const newStation = await stationsService.createStation({
  station_name: "New Station",
  serial_number: "STN-123",
  imei: "123456789012345",
  latitude: 27.7172,
  longitude: 85.324,
  address: "Kathmandu, Nepal",
  landmark: "Near Mall",
  total_slots: 8,
  status: "OFFLINE",
  is_maintenance: false,
  hardware_info: {
    firmware_version: "1.0.0",
    hardware_version: "1.0"
  },
  amenity_ids: ["amenity-id-1", "amenity-id-2"],
  media_ids: ["media-id-1"]
});
```

### Update a Station

```typescript
await stationsService.updateStation("STN-123", {
  station_name: "Updated Name",
  status: "ONLINE",
  is_maintenance: false
});
```

### Delete a Station

```typescript
await stationsService.deleteStation("STN-123");
```

### Upload Media

```typescript
const media = await mediaService.uploadMedia({
  file: selectedFile,
  file_type: "IMAGE"
});
```

### Fetch Amenities

```typescript
// Get all active amenities
const amenities = await amenitiesService.getActiveAmenities();

// With filters
const filtered = await amenitiesService.getAmenities({
  is_active: true,
  search: "parking"
});
```

## Component Usage

### ImageUpload Component

```tsx
import { ImageUpload } from "@/components/StationManagement";
import { Media } from "@/types/station.types";

function MyComponent() {
  const [uploadedImages, setUploadedImages] = useState<Media[]>([]);

  return (
    <ImageUpload
      onUploadComplete={(media) => {
        setUploadedImages(prev => [...prev, media]);
      }}
      onRemove={(mediaId) => {
        setUploadedImages(prev => prev.filter(m => m.id !== mediaId));
      }}
      existingImages={uploadedImages}
      maxFiles={5}
      maxSizeMB={10}
      label="Upload Images"
      description="Drag and drop or click to upload"
    />
  );
}
```

### AmenitySelector Component

```tsx
import { AmenitySelector } from "@/components/StationManagement";

function MyComponent() {
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  return (
    <AmenitySelector
      selectedAmenities={selectedAmenities}
      onChange={setSelectedAmenities}
      label="Select Amenities"
      description="Choose available amenities"
      multiple={true}
    />
  );
}
```

## Testing

### Test Station Creation

1. Go to `/dashboard/stations/add`
2. Fill all required fields (marked with *)
3. Upload at least one image
4. Select some amenities
5. Click through all steps
6. Submit and verify creation

### Test Station Listing

1. Go to `/dashboard/stations`
2. Verify stations are displayed
3. Test search functionality
4. Click on a station to view details

### Test Station Deletion

1. Click delete button on any station
2. Verify confirmation modal appears
3. Check warning messages
4. Confirm deletion
5. Verify station is removed

## Validation Rules

### Station Name
- Minimum 3 characters
- Required field

### Serial Number
- Cannot be empty
- Must be unique
- Required field

### IMEI
- Cannot be empty
- Required field

### Coordinates
- Latitude: -90 to 90
- Longitude: -180 to 180
- Both required

### Address
- Minimum 5 characters
- Required field

### Total Slots
- Minimum: 1
- Maximum: 100
- Required field

### Images
- Max files: 5
- Max size per file: 10MB
- Accepted formats: JPEG, PNG, WebP, GIF

## Troubleshooting

### Issue: "Authorization header is required"
**Solution**: Ensure you're logged in and the auth token is valid.

### Issue: Images not uploading
**Solution**: 
- Check file size (max 10MB)
- Verify file format (image/*)
- Check network connection
- Verify Cloudinary configuration in backend

### Issue: Amenities not loading
**Solution**:
- Check backend API is running
- Verify `/api/admin/amenities` endpoint
- Check console for errors

### Issue: Station creation fails
**Solution**:
- Verify all required fields are filled
- Check coordinates are valid
- Ensure serial number is unique
- Check backend logs

### Issue: Delete fails with "active rentals"
**Solution**: Station cannot be deleted if it has active rentals. Complete or cancel rentals first.

## API Response Format

All API responses follow this structure:

```typescript
{
  success: boolean,
  message: string,
  data: T
}
```

### Success Response Example
```json
{
  "success": true,
  "message": "Station created successfully",
  "data": {
    "id": "station-id",
    "station_name": "New Station",
    ...
  }
}
```

### Error Response Example
```json
{
  "success": false,
  "message": "Validation error",
  "data": null
}
```

## Performance Tips

1. **Pagination**: Use `page` and `page_size` parameters for large datasets
2. **Search**: Debounce search input (300-500ms) to reduce API calls
3. **Caching**: Utilize React Query or SWR for better caching
4. **Image Optimization**: Compress images before upload
5. **Lazy Loading**: Load station details on demand

## Security Considerations

1. **Authentication**: All endpoints require valid auth token
2. **Authorization**: Only admin users can manage stations
3. **File Upload**: Backend validates file types and sizes
4. **Input Validation**: Both frontend and backend validate inputs
5. **CSRF Protection**: Use CSRF tokens for state-changing operations

## Best Practices

1. **Error Handling**: Always wrap API calls in try-catch
2. **Loading States**: Show loading indicators during async operations
3. **User Feedback**: Display success/error messages
4. **Form Validation**: Validate before submission
5. **Cleanup**: Clean up resources (URLs, subscriptions) in useEffect
6. **Type Safety**: Use TypeScript types consistently
7. **Accessibility**: Ensure forms are keyboard navigable

## Common Patterns

### Loading Pattern
```typescript
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    const data = await stationsService.getStations();
    // handle data
  } catch (error) {
    // handle error
  } finally {
    setLoading(false);
  }
};
```

### Error Handling Pattern
```typescript
const [error, setError] = useState<string | null>(null);

try {
  await stationsService.createStation(data);
} catch (err: any) {
  setError(err.response?.data?.message || "Operation failed");
}
```

### Form State Pattern
```typescript
const [formData, setFormData] = useState<Partial<CreateStationInput>>({
  // initial values
});

const handleChange = (field: keyof CreateStationInput, value: any) => {
  setFormData(prev => ({ ...prev, [field]: value }));
};
```

## Additional Resources

- [Full Implementation Documentation](./STATION_MANAGEMENT_IMPLEMENTATION.md)
- [Backend API Documentation](./station/core_stations.md)
- [TypeScript Types Reference](../src/types/station.types.ts)

## Support

For issues or questions:
1. Check this documentation
2. Review implementation docs
3. Check console for errors
4. Contact development team

## Next Steps

1. ✅ Setup complete
2. ✅ Test all features
3. 🔄 Implement station details page (if needed)
4. 🔄 Add advanced filtering
5. 🔄 Implement analytics
6. 🔄 Add real-time updates

---

**Happy Coding! 🚀**

Last Updated: November 2025
Version: 1.0.0