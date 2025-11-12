// API Service Layer Exports
// Provides centralized access to all API services

export { stationsService } from "./stations.service";
export { amenitiesService } from "./amenities.service";
export { mediaService } from "./media.service";
export { analyticsService } from "./analytics.service";
export { rewardsService } from "./rewards.service";

// Export as named exports for convenience
export { default as StationsService } from "./stations.service";
export { default as AmenitiesService } from "./amenities.service";
export { default as MediaService } from "./media.service";
export { default as AnalyticsService } from "./analytics.service";
export { default as RewardsService } from "./rewards.service";

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

// Re-export rewards types for convenience
export type {
  // Points types
  PointsAnalytics,
  PointsAnalyticsResponse,
  PointsTransaction,
  UserPointsHistory,
  UserPointsHistoryResponse,
  AdjustmentType,
  AdjustPointsInput,
  AdjustPointsResult,
  AdjustPointsResponse,
  PointsAnalyticsFilters,
  UserPointsHistoryFilters,
  // Achievements types
  CriteriaType,
  RewardType,
  Achievement,
  AchievementsList,
  AchievementsListResponse,
  CreateAchievementInput,
  UpdateAchievementInput,
  AchievementDetailResponse,
  DeleteAchievementResult,
  DeleteAchievementResponse,
  AchievementsAnalytics,
  AchievementsAnalyticsResponse,
  AchievementsFilters,
  // Referrals types
  ReferralStatus,
  Referral,
  UserReferrals,
  UserReferralsResponse,
  ReferralsAnalytics,
  ReferralsAnalyticsResponse,
  CompleteReferralInput,
  CompleteReferralResult,
  CompleteReferralResponse,
  ReferralsFilters,
  // Leaderboard types
  LeaderboardCategory,
  LeaderboardPeriod,
  LeaderboardEntry,
  Leaderboard,
  LeaderboardResponse,
  LeaderboardFilters,
  // Error types
  RewardsError,
  RewardsErrorResponse,
  RewardsApiResponse,
} from "../../types/rewards.types";
