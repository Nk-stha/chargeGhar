# Station Management System Implementation

## Overview

This document provides comprehensive documentation for the **Station Management System** implemented in the ChargeGhar admin dashboard. The system provides full CRUD (Create, Read, Update, Delete) functionality for managing charging stations with integrated media upload and amenity selection features.

## Table of Contents

1. [Architecture](#architecture)
2. [Features](#features)
3. [File Structure](#file-structure)
4. [API Integration](#api-integration)
5. [Components](#components)
6. [Usage Guide](#usage-guide)
7. [Dependencies](#dependencies)
8. [Best Practices](#best-practices)

---

## Architecture

The station management system follows a clean architecture pattern with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                    UI Components                         │
│  (Pages, Forms, Modals, Image Upload, Amenity Selector) │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│                 Service Layer                            │
│  (stationsService, amenitiesService, mediaService)      │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│                 API Routes                               │
│  (Next.js API Routes - Proxy to Backend)                │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│              Backend API                                 │
│  (Django/FastAPI Backend Server)                        │
└─────────────────────────────────────────────────────────┘
```

### Key Design Principles

1. **Type Safety**: Full TypeScript types for all data structures
2. **Separation of Concerns**: Services, components, and API routes are clearly separated
3. **Reusability**: Shared components for common functionality
4. **User Experience**: Multi-step wizard with validation and real-time feedback
5. **Error Handling**: Comprehensive error handling at all levels

---

## Features

### 1. Station Listing
- View all charging stations in a table format
- Search functionality (by name or location)
- Status indicators (Online, Offline, Maintenance)
- Utilization metrics with visual progress bars
- Click-to-view detailed information
- Edit and delete actions

### 2. Station Creation (Multi-Step Wizard)

#### Step 1: Basic Information
- Station name, serial number, IMEI
- Total slots configuration
- Address and landmark
- Status selection (Online/Offline/Maintenance)
- Maintenance mode toggle
- Real-time validation

#### Step 2: Location Details
- Latitude and longitude input
- Interactive Google Maps preview
- Coordinate validation (-90 to 90 for lat, -180 to 180 for lng)
- Location preview with address

#### Step 3: Media & Amenities
- Drag-and-drop image upload
- Multiple image support (up to 5 images, 10MB each)
- Image preview and management
- Amenity selection with visual cards
- Multi-select amenity support

#### Step 4: Review & Submit
- Comprehensive review of all entered data
- Visual summary with cards
- Map preview
- Image thumbnails
- Final submission

### 3. Station Details & Editing
- View complete station information
- Slot status and management
- Powerbank inventory
- Edit station details
- Update location and amenities

### 4. Station Deletion
- Confirmation modal with warnings
- Safety checks (prevents deletion with active rentals)
- Error feedback
- Auto-refresh after successful deletion

---

## File Structure

```
chargeGhar/
├── src/
│   ├── types/
│   │   └── station.types.ts              # TypeScript type definitions
│   │
│   ├── lib/
│   │   └── api/
│   │       ├── stations.service.ts        # Station service layer
│   │       ├── amenities.service.ts       # Amenities service layer
│   │       └── media.service.ts           # Media service layer
│   │
│   ├── components/
│   │   └── StationManagement/
│   │       ├── ImageUpload.tsx            # Reusable image upload component
│   │       ├── ImageUpload.module.css
│   │       ├── AmenitySelector.tsx        # Amenity selection component
│   │       └── AmenitySelector.module.css
│   │
│   └── app/
│       ├── api/
│       │   └── admin/
│       │       ├── stations/
│       │       │   ├── route.ts           # GET (list) & POST (create)
│       │       │   └── [station_sn]/
│       │       │       └── route.ts       # GET, PATCH, DELETE
│       │       ├── amenities/
│       │       │   ├── route.ts           # GET (list) & POST (create)
│       │       │   └── [amenity_id]/
│       │       │       └── route.ts       # GET, PATCH, DELETE
│       │       └── media/
│       │           └── uploads/
│       │               └── route.ts       # GET (list) & POST (upload)
│       │
│       └── dashboard/
│           └── stations/
│               ├── page.tsx               # Station list page
│               ├── stations.module.css
│               ├── add/
│               │   ├── page.tsx           # Add station wizard
│               │   └── add.module.css
│               └── [station_sn]/
│                   ├── page.tsx           # Station detail/edit page
│                   └── stationDetails.module.css
│
└── docs/
    └── station/
        ├── core_stations.md               # Backend API documentation
        ├── amenity.md
        └── media.md
```

---

## API Integration

### Backend Endpoints Used

#### Stations API
- `GET /api/admin/stations` - List all stations with filters
- `POST /api/admin/stations` - Create new station
- `GET /api/admin/stations/{station_sn}` - Get station details
- `PATCH /api/admin/stations/{station_sn}` - Update station
- `DELETE /api/admin/stations/{station_sn}` - Delete station

#### Amenities API
- `GET /api/admin/amenities` - List all amenities
- `POST /api/admin/amenities` - Create amenity
- `GET /api/admin/amenities/{amenity_id}` - Get amenity details
- `PATCH /api/admin/amenities/{amenity_id}` - Update amenity
- `DELETE /api/admin/amenities/{amenity_id}` - Delete amenity

#### Media API
- `GET /api/admin/media/uploads` - List uploaded media
- `POST /api/admin/media/uploads` - Upload new media

### Service Layer Methods

#### StationsService
```typescript
// List stations
getStations(filters?: StationFilters): Promise<ApiResponse<StationsListResponse>>

// Get single station
getStation(stationSn: string): Promise<ApiResponse<StationDetail>>

// Create station
createStation(data: CreateStationInput): Promise<ApiResponse<StationDetail>>

// Update station
updateStation(stationSn: string, data: UpdateStationInput): Promise<ApiResponse<Station>>

// Delete station
deleteStation(stationSn: string): Promise<ApiResponse<{ message: string }>>

// Helper methods
getOnlineStations()
getOfflineStations()
getMaintenanceStations()
searchStations(query: string)
validateStationData(data: Partial<CreateStationInput>)
calculateUtilization(station: Station): number
```

#### AmenitiesService
```typescript
// List amenities
getAmenities(filters?: AmenityFilters): Promise<ApiResponse<AmenitiesListResponse>>

// Get single amenity
getAmenity(amenityId: string): Promise<ApiResponse<Amenity>>

// Create amenity
createAmenity(data: CreateAmenityInput): Promise<ApiResponse<Amenity>>

// Update amenity
updateAmenity(amenityId: string, data: UpdateAmenityInput): Promise<ApiResponse<Amenity>>

// Delete amenity
deleteAmenity(amenityId: string): Promise<ApiResponse<{ message: string }>>

// Helper
getActiveAmenities()
```

#### MediaService
```typescript
// List media
getMediaList(filters?: MediaFilters): Promise<ApiResponse<MediaListResponse>>

// Upload media
uploadMedia(data: UploadMediaInput): Promise<ApiResponse<Media>>

// Upload multiple
uploadMultipleMedia(files: File[], fileType: MediaFileType): Promise<ApiResponse<Media>[]>

// Helpers
getImages()
getVideos()
getDocuments()
validateFile(file: File, maxSizeMB: number)
getFileTypeFromFile(file: File): MediaFileType
```

---

## Components

### ImageUpload Component

Reusable component for handling file uploads with preview and validation.

**Props:**
```typescript
interface ImageUploadProps {
  onUploadComplete?: (media: Media) => void;
  onRemove?: (mediaId: string) => void;
  existingImages?: Media[];
  maxFiles?: number;
  maxSizeMB?: number;
  accept?: string;
  fileType?: MediaFileType;
  label?: string;
  description?: string;
}
```

**Features:**
- Drag and drop support
- Multiple file selection
- File size validation
- Image preview before upload
- Batch upload functionality
- Upload progress feedback
- Existing image management
- Responsive design

**Usage:**
```tsx
<ImageUpload
  onUploadComplete={(media) => handleMediaUpload(media)}
  onRemove={(mediaId) => handleMediaRemove(mediaId)}
  existingImages={uploadedMedia}
  maxFiles={5}
  maxSizeMB={10}
  label="Station Images"
  description="Upload images of the charging station"
/>
```

### AmenitySelector Component

Interactive component for selecting amenities with visual cards.

**Props:**
```typescript
interface AmenitySelectorProps {
  selectedAmenities?: string[];
  onChange?: (amenityIds: string[]) => void;
  label?: string;
  description?: string;
  multiple?: boolean;
  showInactive?: boolean;
}
```

**Features:**
- Visual card-based selection
- Multi-select support
- Active/inactive state handling
- Loading and error states
- Emoji/icon representation
- Selected count display
- Clear all functionality
- Responsive grid layout

**Usage:**
```tsx
<AmenitySelector
  selectedAmenities={formData.amenity_ids || []}
  onChange={(amenityIds) => handleAmenityChange(amenityIds)}
  label="Available Amenities"
  description="Select amenities available at this station"
/>
```

---

## Usage Guide

### Creating a New Station

1. **Navigate to Stations Page**
   - Go to Dashboard → Stations
   - Click "Add Station" button

2. **Fill Basic Information (Step 1)**
   - Enter station name (min 3 characters)
   - Provide serial number
   - Enter IMEI
   - Set total slots (1-100)
   - Enter address (min 5 characters)
   - Optionally add landmark
   - Select status and maintenance mode
   - Click "Next"

3. **Set Location (Step 2)**
   - Enter latitude (-90 to 90)
   - Enter longitude (-180 to 180)
   - Verify location on map preview
   - Click "Next"

4. **Upload Media & Select Amenities (Step 3)**
   - Drag and drop images or click to upload
   - Wait for upload to complete
   - Select available amenities by clicking cards
   - Review selected amenities
   - Click "Next"

5. **Review & Submit (Step 4)**
   - Review all entered information
   - Verify details in summary cards
   - Check map and image previews
   - Click "Create Station"
   - Wait for success confirmation
   - Automatic redirect to stations list

### Editing a Station

1. Click on a station row in the list
2. OR click the edit button (pencil icon)
3. Modify desired fields
4. Click "Save Changes"
5. Confirmation message appears

### Deleting a Station

1. Click the delete button (trash icon) on a station
2. Confirm deletion in modal
3. Read warnings about active rentals
4. Click "Delete Station"
5. Station removed after confirmation

### Searching Stations

1. Use the search box in the header
2. Type station name or location
3. Results filter in real-time

---

## Type Definitions

### Core Types

```typescript
// Station
interface Station {
  id: string;
  station_name: string;
  serial_number: string;
  imei: string;
  latitude: string;
  longitude: string;
  address: string;
  landmark: string | null;
  total_slots: number;
  status: StationStatus;
  is_maintenance: boolean;
  hardware_info?: HardwareInfo;
  last_heartbeat: string | null;
  created_at: string;
  updated_at: string;
  amenities: string[] | Amenity[];
  available_slots: number;
  occupied_slots: number;
  total_powerbanks: number;
  available_powerbanks: number;
  slots?: Slot[];
  powerbanks?: Powerbank[];
}

type StationStatus = "ONLINE" | "OFFLINE" | "MAINTENANCE";

// Amenity
interface Amenity {
  id: string;
  name: string;
  icon: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  stations_count?: number;
}

// Media
interface Media {
  id: string;
  file_url: string;
  file_type: MediaFileType;
  original_name: string;
  file_size: number;
  uploaded_by?: number;
  cloud_provider: string;
  public_id: string;
  created_at?: string;
  updated_at?: string;
}

type MediaFileType = "IMAGE" | "VIDEO" | "DOCUMENT";
```

---

## Dependencies

### Required Packages

All dependencies are already included in the project:

- **React 18+**: Core framework
- **Next.js 14+**: Framework and routing
- **TypeScript**: Type safety
- **React Icons**: Icon library (react-icons/fi)
- **Axios**: HTTP client (already configured in lib/axios.ts)

### No Additional Installations Required

The implementation uses existing project dependencies and structure.

---

## Best Practices

### 1. Error Handling

Always wrap API calls in try-catch blocks:

```typescript
try {
  const response = await stationsService.createStation(data);
  if (response.success) {
    // Handle success
  }
} catch (err: any) {
  console.error("Error:", err);
  setError(err.response?.data?.message || "Operation failed");
}
```

### 2. Form Validation

Validate data before submission:

```typescript
const validation = stationsService.validateStationData(formData);
if (!validation.valid) {
  setError(validation.errors.join(", "));
  return;
}
```

### 3. State Management

Use proper state management for forms:

```typescript
const [formData, setFormData] = useState<Partial<CreateStationInput>>({
  // Initial values
});

const handleInputChange = (field: keyof CreateStationInput, value: any) => {
  setFormData((prev) => ({ ...prev, [field]: value }));
};
```

### 4. Loading States

Always show loading states during async operations:

```typescript
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    // API call
  } finally {
    setLoading(false);
  }
};
```

### 5. User Feedback

Provide clear feedback for all actions:

```typescript
// Success
setSuccess(true);
setTimeout(() => router.push("/dashboard/stations"), 2000);

// Error
setError("Failed to create station");
```

### 6. Cleanup

Clean up resources in useEffect:

```typescript
useEffect(() => {
  return () => {
    previews.forEach((p) => URL.revokeObjectURL(p.preview));
  };
}, [previews]);
```

---

## Troubleshooting

### Common Issues

1. **Station Creation Fails**
   - Check all required fields are filled
   - Verify coordinates are within valid ranges
   - Ensure serial number is unique
   - Check network connectivity

2. **Image Upload Fails**
   - Verify file size is under limit (10MB)
   - Check file type is supported
   - Ensure proper authentication
   - Check Cloudinary configuration

3. **Amenities Not Loading**
   - Check API endpoint availability
   - Verify authentication token
   - Check console for errors
   - Ensure backend is running

4. **Station Deletion Fails**
   - Station may have active rentals
   - Check error message in modal
   - Verify permissions
   - Contact backend admin

---

## Future Enhancements

### Potential Improvements

1. **Bulk Operations**
   - Import stations from CSV
   - Bulk update status
   - Batch deletion

2. **Advanced Filtering**
   - Filter by status
   - Filter by maintenance mode
   - Filter by date range
   - Filter by location radius

3. **Analytics**
   - Station performance metrics
   - Usage statistics
   - Revenue per station
   - Utilization trends

4. **Map View**
   - Interactive map showing all stations
   - Cluster view for nearby stations
   - Real-time status on map
   - Click to view details

5. **Station Templates**
   - Save common configurations
   - Quick setup for similar stations
   - Clone existing stations

6. **Real-time Updates**
   - WebSocket integration
   - Live status updates
   - Real-time slot availability
   - Push notifications

---

## Support

For issues or questions:

1. Check this documentation
2. Review the API documentation in `docs/station/`
3. Check console logs for errors
4. Contact the development team

---

## Changelog

### Version 1.0.0 (Current)
- Initial implementation
- Full CRUD functionality for stations
- Multi-step wizard for station creation
- Image upload with preview
- Amenity selection
- Station listing with search
- Delete confirmation modal
- Comprehensive type definitions
- Service layer architecture
- Responsive design

---

## License

This implementation is part of the ChargeGhar admin dashboard project.

---

**Last Updated**: November 2025  
**Author**: Development Team  
**Version**: 1.0.0