// API Service Layer Exports
// Provides centralized access to all API services

export { stationsService } from "./stations.service";
export { amenitiesService } from "./amenities.service";
export { mediaService } from "./media.service";
export { analyticsService } from "./analytics.service";

// Export as named exports for convenience
export { default as StationsService } from "./stations.service";
export { default as AmenitiesService } from "./amenities.service";
export { default as MediaService } from "./media.service";
export { default as AnalyticsService } from "./analytics.service";

// Re-export types for convenience
export type {
  Station,
  StationDetail,
  StationStatus,
  Slot,
  SlotStatus,
  Powerbank,
  PowerbankStatus,
  Amenity,
  Media,
  MediaFileType,
  ApiResponse,
  StationsListResponse,
  AmenitiesListResponse,
  MediaListResponse,
  CreateStationInput,
  UpdateStationInput,
  CreateAmenityInput,
  UpdateAmenityInput,
  UploadMediaInput,
  StationFilters,
  AmenityFilters,
  MediaFilters,
} from "../../types/station.types";

// Re-export analytics types for convenience
export type {
  AnalyticsPeriod,
  TransactionType,
  RentalStatus,
  RevenueChartDataPoint,
  RevenueAnalyticsData,
  RevenueAnalyticsResponse,
  RevenueAnalyticsFilters,
  RentalChartDataPoint,
  RentalAnalyticsSummary,
  RentalAnalyticsData,
  RentalAnalyticsResponse,
  RentalAnalyticsFilters,
  AnalyticsErrorResponse,
  AnalyticsApiResponse,
} from "../../types/analytics.types";
