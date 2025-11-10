// Station Types
export interface Station {
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
  is_deleted: boolean;
  hardware_info?: HardwareInfo;
  last_heartbeat: string | null;
  created_at: string;
  updated_at: string;
  amenities: Amenity[];
  media: Media[];
  available_slots?: number;
  occupied_slots?: number;
  total_powerbanks?: number;
  available_powerbanks?: number;
  slots?: Slot[];
  powerbanks?: Powerbank[];
}

export interface StationDetail {
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
  is_deleted: boolean;
  hardware_info?: HardwareInfo;
  last_heartbeat: string | null;
  created_at: string;
  updated_at: string;
  amenities: Amenity[];
  media: Media[];
  slots: Slot[];
  powerbanks: Powerbank[];
  available_slots?: number;
  occupied_slots?: number;
  total_powerbanks?: number;
  available_powerbanks?: number;
}

export interface HardwareInfo {
  firmware_version?: string;
  hardware_version?: string;
  signal_strength?: number;
  protocol_version?: string;
}

export type StationStatus = "ONLINE" | "OFFLINE" | "MAINTENANCE";

export interface Slot {
  id: string;
  slot_number: number;
  status: SlotStatus;
  battery_level: number;
  last_updated: string;
  powerbank: Powerbank | null;
  current_rental_id: string | null;
}

export type SlotStatus = "AVAILABLE" | "OCCUPIED" | "MAINTENANCE" | "RESERVED";

export interface Powerbank {
  id: string;
  serial_number: string;
  model: string;
  capacity_mah: number;
  status: PowerbankStatus;
  battery_level: number;
  slot_number: number | null;
  last_updated: string;
}

export type PowerbankStatus =
  | "AVAILABLE"
  | "RENTED"
  | "MAINTENANCE"
  | "CHARGING"
  | "LOW_BATTERY";

// Amenity Types
export interface Amenity {
  id: string;
  name: string;
  icon: string;
  description: string;
  is_active: boolean;
  is_available: boolean;
  created_at?: string;
  updated_at?: string;
  stations_count?: number;
}

// Media Types
export interface Media {
  id: string;
  media_upload_id: string;
  media_type: MediaFileType;
  title: string;
  description?: string;
  is_primary: boolean;
  file_url: string;
  thumbnail_url: string;
  created_at: string;
  // Legacy fields for backward compatibility
  file_type?: MediaFileType;
  original_name?: string;
  file_size?: number;
  uploaded_by?: number;
  cloud_provider?: string;
  public_id?: string;
  updated_at?: string;
}

export type MediaFileType = "IMAGE" | "VIDEO" | "DOCUMENT";

// Media Upload for Station Creation/Update
export interface MediaUpload {
  media_upload_id: string;
  media_type: MediaFileType;
  title?: string;
  is_primary?: boolean;
}

// Pagination Types
export interface Pagination {
  current_page: number;
  total_pages: number;
  total_count: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
  next_page: number | null;
  previous_page: number | null;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface StationsListResponse {
  results: Station[];
  pagination: Pagination;
}

export interface AmenitiesListResponse {
  results: Amenity[];
  pagination: Pagination;
}

export interface MediaListResponse {
  results: Media[];
  pagination: Pagination;
  filters?: {
    file_type: MediaFileType | null;
    user_id: string | null;
  };
}

// Form/Input Types
export interface CreateStationInput {
  station_name: string;
  serial_number: string;
  imei: string;
  latitude: number;
  longitude: number;
  address: string;
  landmark?: string;
  total_slots: number;
  status: StationStatus;
  is_maintenance: boolean;
  hardware_info?: HardwareInfo;
  amenity_ids?: string[];
  media_uploads?: MediaUpload[];
}

export interface UpdateStationInput {
  station_name?: string;
  latitude?: string | number;
  longitude?: string | number;
  address?: string;
  landmark?: string;
  status?: StationStatus;
  is_maintenance?: boolean;
  hardware_info?: HardwareInfo;
  amenity_ids?: string[];
  media_uploads?: MediaUpload[];
}

export interface CreateAmenityInput {
  name: string;
  icon: string;
  description: string;
  is_active: boolean;
}

export interface UpdateAmenityInput {
  name?: string;
  icon?: string;
  description?: string;
  is_active?: boolean;
}

export interface UploadMediaInput {
  file: File;
  file_type: MediaFileType;
}

// Filter Types
export interface StationFilters {
  page?: number;
  page_size?: number;
  search?: string;
  status?: StationStatus;
  is_maintenance?: boolean;
  start_date?: string;
  end_date?: string;
}

export interface AmenityFilters {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: boolean;
}

export interface MediaFilters {
  page?: number;
  page_size?: number;
  type?: MediaFileType;
  user_id?: string;
}
