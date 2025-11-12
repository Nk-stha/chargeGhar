// Rewards System Types
// Types for Points, Achievements, Referrals, and Leaderboard

// ============================================
// POINTS MANAGEMENT TYPES
// ============================================

export interface PointsAnalytics {
  total_transactions: number;
  earned: {
    total_points: number;
    transaction_count: number;
  };
  spent: {
    total_points: number;
    transaction_count: number;
  };
  adjustments: {
    total_points: number;
    transaction_count: number;
  };
  source_breakdown: Array<{
    source: string;
    total_points: number;
    transaction_count: number;
  }>;
  top_earners: Array<{
    user_id: string;
    username: string;
    total_earned: number;
  }>;
  recent_activity: Array<{
    transaction_type: string;
    total_points: number;
    count: number;
  }>;
  period: {
    start_date: string | null;
    end_date: string | null;
  };
}

export interface PointsAnalyticsResponse {
  success: boolean;
  message: string;
  data: PointsAnalytics;
}

export interface PointsTransaction {
  id: number;
  transaction_type: "earned" | "spent";
  source: string;
  points: number;
  balance_before: number;
  balance_after: number;
  description: string;
  created_at: string;
  points_value: number;
  formatted_points: string;
  metadata?: {
    admin_user_id?: number;
    adjustment_type?: string;
    [key: string]: any;
  };
}

export interface UserPointsHistory {
  user: {
    id: number;
    username: string;
    email: string;
    current_points: number;
    total_points_earned: number;
  };
  transactions: PointsTransaction[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_count: number;
    page_size: number;
    has_next: boolean;
    has_previous: boolean;
    next_page: number | null;
    previous_page: number | null;
  };
}

export interface UserPointsHistoryResponse {
  success: boolean;
  message: string;
  data: UserPointsHistory;
}

export type AdjustmentType = "add" | "deduct";

export interface AdjustPointsInput {
  user_id: number;
  adjustment_type: AdjustmentType;
  points: number;
  reason: string;
}

export interface AdjustPointsResult {
  transaction_id: string;
  user_id: string;
  username: string;
  adjustment_type: string;
  points: number;
  balance_before: number;
  balance_after: number;
  reason: string;
  adjusted_by: string;
  adjusted_at: string;
}

export interface AdjustPointsResponse {
  success: boolean;
  message: string;
  data: AdjustPointsResult;
}

export interface PointsAnalyticsFilters {
  start_date?: string;
  end_date?: string;
}

export interface UserPointsHistoryFilters {
  user_id: number;
  transaction_type?: "earned" | "spent" | "all";
  page?: number;
  page_size?: number;
}

// ============================================
// ACHIEVEMENTS MANAGEMENT TYPES
// ============================================

export type CriteriaType =
  | "rental_count"
  | "timely_return_count"
  | "referral_count";
export type RewardType = "points";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  criteria_type: CriteriaType;
  criteria_value: number;
  reward_type: RewardType;
  reward_value: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  total_unlocked: number;
  total_claimed: number;
  total_users_progress: number;
}

export interface AchievementsList {
  results: Achievement[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_count: number;
    page_size: number;
    has_next: boolean;
    has_previous: boolean;
    next_page: number | null;
    previous_page: number | null;
  };
}

export interface AchievementsListResponse {
  success: boolean;
  message: string;
  data: AchievementsList;
}

export interface CreateAchievementInput {
  name: string;
  description: string;
  criteria_type: CriteriaType;
  criteria_value: number;
  reward_type?: RewardType;
  reward_value: number;
  is_active?: boolean;
}

export interface UpdateAchievementInput {
  name?: string;
  description?: string;
  criteria_type?: CriteriaType;
  criteria_value?: number;
  reward_type?: RewardType;
  reward_value?: number;
  is_active?: boolean;
}

export interface AchievementDetailResponse {
  success: boolean;
  message: string;
  data: Achievement;
}

export interface DeleteAchievementResult {
  achievement_id: string;
  achievement_name: string;
  unlocked_count: number;
  message: string;
}

export interface DeleteAchievementResponse {
  success: boolean;
  message: string;
  data: DeleteAchievementResult;
}

export interface AchievementsAnalytics {
  total_achievements: number;
  active_achievements: number;
  inactive_achievements: number;
  user_achievements: {
    total_unlocked: number;
    total_claimed: number;
    pending_claims: number;
    claim_rate: number;
  };
  total_points_awarded: number;
  most_unlocked_achievements: Array<{
    achievement_id: string;
    name: string;
    unlock_count: number;
    reward_value: number;
  }>;
  completion_by_criteria_type: Array<{
    criteria_type: string;
    total_achievements: number;
    total_unlocked: number;
    total_claimed: number;
    unlock_rate: number;
    claim_rate: number;
  }>;
}

export interface AchievementsAnalyticsResponse {
  success: boolean;
  message: string;
  data: AchievementsAnalytics;
}

export interface AchievementsFilters {
  search?: string;
  is_active?: boolean;
  criteria_type?: CriteriaType;
  page?: number;
  page_size?: number;
}

// ============================================
// REFERRALS TYPES
// ============================================

export type ReferralStatus = "pending" | "completed" | "expired";

export interface Referral {
  id: number;
  referral_code: string;
  status: ReferralStatus;
  invitee: {
    id: number;
    username: string;
    email: string;
    phone_number: string;
  };
  inviter_points_awarded: number;
  invitee_points_awarded: number;
  first_rental_completed: boolean;
  created_at: string;
  completed_at: string | null;
  expires_at: string;
}

export interface UserReferrals {
  user: {
    id: number;
    username: string;
    email: string;
    referral_code: string;
  };
  referrals: Referral[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_count: number;
    page_size: number;
    has_next: boolean;
    has_previous: boolean;
    next_page: number | null;
    previous_page: number | null;
  };
}

export interface UserReferralsResponse {
  success: boolean;
  message: string;
  data: UserReferrals;
}

export interface ReferralsAnalytics {
  total_referrals: number;
  successful_referrals: number;
  pending_referrals: number;
  expired_referrals: number;
  conversion_rate: number;
  total_points_awarded: number;
  average_time_to_complete: string;
  top_referrers: Array<{
    user_id: number;
    username: string;
    referral_count: number;
  }>;
  monthly_breakdown: any[];
}

export interface ReferralsAnalyticsResponse {
  success: boolean;
  message: string;
  data: ReferralsAnalytics;
}

export interface CompleteReferralInput {
  reason: string;
}

export interface CompleteReferralResult {
  referral_id: number;
  status: ReferralStatus;
  inviter: {
    id: number;
    username: string;
    points_awarded: number;
  };
  invitee: {
    id: number;
    username: string;
    points_awarded: number;
  };
  completed_at: string;
}

export interface CompleteReferralResponse {
  success: boolean;
  message: string;
  data: CompleteReferralResult;
}

export interface ReferralsFilters {
  user_id?: number;
  status?: ReferralStatus;
  page?: number;
  page_size?: number;
}

// ============================================
// LEADERBOARD TYPES
// ============================================

export type LeaderboardCategory =
  | "overall"
  | "points"
  | "rentals"
  | "referrals"
  | "timely_returns";
export type LeaderboardPeriod = "all_time" | "monthly" | "weekly";

export interface LeaderboardEntry {
  rank: number;
  username: string;
  profile_picture: string | null;
  total_rentals: number;
  total_points_earned: number;
  referrals_count: number;
  timely_returns: number;
  achievements_count: number;
  rank_change: number;
  last_updated: string;
}

export interface Leaderboard {
  category: LeaderboardCategory;
  period: LeaderboardPeriod;
  total_users: number;
  leaderboard: LeaderboardEntry[];
}

export interface LeaderboardResponse {
  success: boolean;
  message: string;
  data: Leaderboard;
}

export interface LeaderboardFilters {
  category?: LeaderboardCategory;
  period?: LeaderboardPeriod;
  limit?: number;
}

// ============================================
// ERROR TYPES
// ============================================

export interface RewardsError {
  code: string;
  message: string;
  details?: {
    [key: string]: string[];
  };
}

export interface RewardsErrorResponse {
  success: false;
  error: RewardsError;
}

// ============================================
// COMMON API RESPONSE TYPE
// ============================================

export type RewardsApiResponse<T> =
  | { success: true; message: string; data: T }
  | RewardsErrorResponse;
