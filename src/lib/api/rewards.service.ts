import instance from "../axios";
import {
  // Points types
  PointsAnalyticsResponse,
  PointsAnalyticsFilters,
  UserPointsHistoryResponse,
  UserPointsHistoryFilters,
  AdjustPointsInput,
  AdjustPointsResponse,
  // Achievements types
  AchievementsListResponse,
  AchievementsFilters,
  CreateAchievementInput,
  UpdateAchievementInput,
  AchievementDetailResponse,
  DeleteAchievementResponse,
  AchievementsAnalyticsResponse,
  // Referrals types
  ReferralsAnalyticsResponse,
  UserReferralsResponse,
  ReferralsFilters,
  CompleteReferralInput,
  CompleteReferralResponse,
  // Leaderboard types
  LeaderboardResponse,
  LeaderboardFilters,
} from "../../types/rewards.types";

/**
 * Rewards Service
 * Handles all API calls related to points, achievements, referrals, and leaderboard
 */
class RewardsService {
  private baseUrl = "/api/admin";

  // ============================================
  // POINTS MANAGEMENT METHODS
  // ============================================

  async getPointsAnalytics(
    filters?: PointsAnalyticsFilters,
  ): Promise<PointsAnalyticsResponse> {
    const params = new URLSearchParams();
    if (filters?.start_date) params.append("start_date", filters.start_date);
    if (filters?.end_date) params.append("end_date", filters.end_date);

    const url = `${this.baseUrl}/points/analytics${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await instance.get<PointsAnalyticsResponse>(url);
    return response.data;
  }

  async adjustUserPoints(
    input: AdjustPointsInput,
  ): Promise<AdjustPointsResponse> {
    const url = `${this.baseUrl}/points/adjust`;

    // Ensure adjustment_type is uppercase as backend expects
    const payload = {
      ...input,
      adjustment_type: input.adjustment_type.toUpperCase(),
    };

    const response = await instance.post<AdjustPointsResponse>(url, payload);
    return response.data;
  }

  async getUserPointsHistory(
    filters: UserPointsHistoryFilters,
  ): Promise<UserPointsHistoryResponse> {
    const params = new URLSearchParams();
    if (filters.transaction_type && filters.transaction_type !== "all") {
      params.append("transaction_type", filters.transaction_type);
    }
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.page_size)
      params.append("page_size", filters.page_size.toString());

    const url = `${this.baseUrl}/points/users/${filters.user_id}/history${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await instance.get<UserPointsHistoryResponse>(url);
    return response.data;
  }

  // ============================================
  // ACHIEVEMENTS MANAGEMENT METHODS
  // ============================================

  async getAchievements(
    filters?: AchievementsFilters,
  ): Promise<AchievementsListResponse> {
    const params = new URLSearchParams();
    if (filters?.search) params.append("search", filters.search);
    if (filters?.is_active !== undefined)
      params.append("is_active", filters.is_active.toString());
    if (filters?.criteria_type)
      params.append("criteria_type", filters.criteria_type);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.page_size)
      params.append("page_size", filters.page_size.toString());

    const url = `${this.baseUrl}/achievements${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await instance.get<AchievementsListResponse>(url);
    return response.data;
  }

  async getAchievement(id: string): Promise<AchievementDetailResponse> {
    const url = `${this.baseUrl}/achievements/${id}`;
    const response = await instance.get<AchievementDetailResponse>(url);
    return response.data;
  }

  async createAchievement(
    input: CreateAchievementInput,
  ): Promise<AchievementDetailResponse> {
    const url = `${this.baseUrl}/achievements`;
    const response = await instance.post<AchievementDetailResponse>(url, input);
    return response.data;
  }

  async updateAchievement(
    id: string,
    input: UpdateAchievementInput,
  ): Promise<AchievementDetailResponse> {
    const url = `${this.baseUrl}/achievements/${id}`;
    const response = await instance.put<AchievementDetailResponse>(url, input);
    return response.data;
  }

  async deleteAchievement(id: string): Promise<DeleteAchievementResponse> {
    const url = `${this.baseUrl}/achievements/${id}`;
    const response = await instance.delete<DeleteAchievementResponse>(url);
    return response.data;
  }

  async getAchievementsAnalytics(): Promise<AchievementsAnalyticsResponse> {
    const url = `${this.baseUrl}/achievements/analytics`;
    const response = await instance.get<AchievementsAnalyticsResponse>(url);
    return response.data;
  }

  // ============================================
  // REFERRALS MANAGEMENT METHODS
  // ============================================

  async getReferralsAnalytics(): Promise<ReferralsAnalyticsResponse> {
    const url = `${this.baseUrl}/referrals/analytics`;
    const response = await instance.get<ReferralsAnalyticsResponse>(url);
    return response.data;
  }

  async getUserReferrals(
    filters: ReferralsFilters,
  ): Promise<UserReferralsResponse> {
    if (!filters.user_id) throw new Error("User ID is required");
    const params = new URLSearchParams();
    if (filters.status) params.append("status", filters.status);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.page_size)
      params.append("page_size", filters.page_size.toString());

    const url = `${this.baseUrl}/referrals/users/${filters.user_id}${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await instance.get<UserReferralsResponse>(url);
    return response.data;
  }

  async completeReferral(
    referralId: number,
    input: CompleteReferralInput,
  ): Promise<CompleteReferralResponse> {
    const url = `${this.baseUrl}/referrals/${referralId}/complete`;
    const response = await instance.post<CompleteReferralResponse>(url, input);
    return response.data;
  }

  // ============================================
  // LEADERBOARD METHODS
  // ============================================

  async getLeaderboard(
    filters?: LeaderboardFilters,
  ): Promise<LeaderboardResponse> {
    const params = new URLSearchParams();
    if (filters?.category) params.append("category", filters.category);
    if (filters?.period) params.append("period", filters.period);
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const url = `${this.baseUrl}/users/leaderboard${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await instance.get<LeaderboardResponse>(url);
    return response.data;
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  formatDate(date: Date | string): string {
    const d = typeof date === "string" ? new Date(date) : date;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  formatPoints(points: number): string {
    const sign = points > 0 ? "+" : "";
    return `${sign}${points.toLocaleString()}`;
  }

  getCriteriaTypeLabel(criteriaType: string): string {
    switch (criteriaType) {
      case "rental_count":
        return "Rental Count";
      case "timely_return_count":
        return "Timely Returns";
      case "referral_count":
        return "Referral Count";
      default:
        return criteriaType;
    }
  }

  getReferralStatusLabel(status: string): string {
    switch (status) {
      case "pending":
        return "Pending";
      case "completed":
        return "Completed";
      case "expired":
        return "Expired";
      default:
        return status;
    }
  }

  getReferralStatusColor(status: string): string {
    switch (status) {
      case "pending":
        return "#ffc107";
      case "completed":
        return "#47b216";
      case "expired":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  }

  getLeaderboardCategoryLabel(category: string): string {
    switch (category) {
      case "overall":
        return "Overall";
      case "points":
        return "Points";
      case "rentals":
        return "Rentals";
      case "referrals":
        return "Referrals";
      case "timely_returns":
        return "Timely Returns";
      default:
        return category;
    }
  }

  getLeaderboardPeriodLabel(period: string): string {
    switch (period) {
      case "all_time":
        return "All Time";
      case "monthly":
        return "This Month";
      case "weekly":
        return "This Week";
      default:
        return period;
    }
  }

  validateAdjustPoints(input: AdjustPointsInput): {
    valid: boolean;
    error?: string;
  } {
    if (!input.user_id || input.user_id <= 0)
      return { valid: false, error: "Valid user ID is required" };
    const adjustmentTypeLower = input.adjustment_type?.toLowerCase();
    if (
      !input.adjustment_type ||
      !["add", "deduct"].includes(adjustmentTypeLower)
    ) {
      return {
        valid: false,
        error: "Adjustment type must be 'add' or 'deduct'",
      };
    }
    if (!input.points || input.points <= 0)
      return { valid: false, error: "Points must be greater than 0" };
    if (!input.reason || input.reason.trim().length < 3)
      return { valid: false, error: "Reason must be at least 3 characters" };
    return { valid: true };
  }

  validateAchievement(input: CreateAchievementInput | UpdateAchievementInput): {
    valid: boolean;
    error?: string;
  } {
    if ("name" in input && input.name && input.name.trim().length < 3) {
      return { valid: false, error: "Name must be at least 3 characters" };
    }
    if (
      "description" in input &&
      input.description &&
      input.description.trim().length < 10
    ) {
      return {
        valid: false,
        error: "Description must be at least 10 characters",
      };
    }
    if (
      "criteria_value" in input &&
      input.criteria_value !== undefined &&
      input.criteria_value <= 0
    ) {
      return { valid: false, error: "Criteria value must be greater than 0" };
    }
    if (
      "reward_value" in input &&
      input.reward_value !== undefined &&
      input.reward_value <= 0
    ) {
      return { valid: false, error: "Reward value must be greater than 0" };
    }
    return { valid: true };
  }

  calculatePercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Number(((value / total) * 100).toFixed(2));
  }
}

export const rewardsService = new RewardsService();
export default rewardsService;
