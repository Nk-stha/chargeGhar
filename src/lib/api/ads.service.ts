import instance from "../axios";
import {
  AdRequestsListResponse,
  AdRequestDetailResponse,
  AdRequestFilters,
  ReviewAdInput,
  ExecuteActionInput,
  UpdateScheduleInput,
  AdActionResponse,
  AdStatus,
} from "../../types/ads.types";

/**
 * Ads Service
 * Handles all API calls related to ad request management
 */

class AdsService {
  private baseUrl = "/api/ads/requests";

  /**
   * Get list of ad requests with optional filters
   * @param filters - Ad request filters (status, search, user_id)
   * @returns Ad requests list
   */
  async getAdRequests(
    filters?: AdRequestFilters
  ): Promise<AdRequestsListResponse> {
    const params = new URLSearchParams();

    // Pagination parameters
    if (filters?.page) {
      params.append("page", filters.page.toString());
    }
    if (filters?.page_size) {
      params.append("page_size", filters.page_size.toString());
    }

    // Filter parameters
    if (filters?.search) {
      params.append("search", filters.search);
    }
    if (filters?.status) {
      params.append("status", filters.status);
    }
    if (filters?.user_id) {
      params.append("user_id", filters.user_id);
    }

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

    const response = await instance.get<AdRequestsListResponse>(url);
    return response.data;
  }

  /**
   * Get detailed information about a specific ad request
   * @param adId - Ad Request ID (UUID)
   * @returns Detailed ad request information
   */
  async getAdRequestDetail(adId: string): Promise<AdRequestDetailResponse> {
    const response = await instance.get<AdRequestDetailResponse>(
      `${this.baseUrl}/${adId}`
    );
    return response.data;
  }

  /**
   * Review and configure ad request
   * @param adId - Ad Request ID
   * @param data - Review data
   * @returns Updated ad request
   */
  async reviewAdRequest(
    adId: string,
    data: ReviewAdInput
  ): Promise<AdRequestDetailResponse> {
    const formData = new FormData();

    if (data.title) formData.append("title", data.title);
    if (data.description) formData.append("description", data.description);
    if (data.duration_days !== undefined)
      formData.append("duration_days", data.duration_days.toString());
    if (data.admin_price) formData.append("admin_price", data.admin_price);
    if (data.admin_notes) formData.append("admin_notes", data.admin_notes);
    if (data.start_date) formData.append("start_date", data.start_date);
    if (data.duration_seconds !== undefined)
      formData.append("duration_seconds", data.duration_seconds.toString());
    if (data.display_order !== undefined)
      formData.append("display_order", data.display_order.toString());

    // Handle station_ids array
    if (data.station_ids && data.station_ids.length > 0) {
      data.station_ids.forEach((id) => {
        formData.append("station_ids", id);
      });
    }

    const response = await instance.patch<AdRequestDetailResponse>(
      `${this.baseUrl}/${adId}/review`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  /**
   * Execute action on ad request
   * @param adId - Ad Request ID
   * @param data - Action data
   * @returns Updated ad request
   */
  async executeAction(
    adId: string,
    data: ExecuteActionInput
  ): Promise<AdActionResponse> {
    const formData = new FormData();

    formData.append("action", data.action);

    if (data.rejection_reason) {
      formData.append("rejection_reason", data.rejection_reason);
    }
    if (data.start_date) {
      formData.append("start_date", data.start_date);
    }
    if (data.end_date) {
      formData.append("end_date", data.end_date);
    }
    if (data.reason) {
      formData.append("reason", data.reason);
    }

    const response = await instance.post<AdActionResponse>(
      `${this.baseUrl}/${adId}/action`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  /**
   * Update ad schedule dates
   * @param adId - Ad Request ID
   * @param data - Schedule data
   * @returns Updated ad request
   */
  async updateSchedule(
    adId: string,
    data: UpdateScheduleInput
  ): Promise<AdRequestDetailResponse> {
    const formData = new FormData();

    if (data.start_date) {
      formData.append("start_date", data.start_date);
    }
    if (data.end_date) {
      formData.append("end_date", data.end_date);
    }

    const response = await instance.patch<AdRequestDetailResponse>(
      `${this.baseUrl}/${adId}/update-schedule`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  /**
   * Get status color for badge display
   */
  getStatusColor(status: AdStatus): string {
    const colors: Record<AdStatus, string> = {
      SUBMITTED: "blue",
      UNDER_REVIEW: "orange",
      PENDING_PAYMENT: "purple",
      PAID: "green",
      SCHEDULED: "cyan",
      RUNNING: "green",
      PAUSED: "gray",
      COMPLETED: "green",
      REJECTED: "red",
      CANCELLED: "gray",
    };
    return colors[status] || "gray";
  }

  /**
   * Get available actions for current status
   */
  getAvailableActions(status: AdStatus): string[] {
    const actions: Record<AdStatus, string[]> = {
      SUBMITTED: ["reject", "cancel"],
      UNDER_REVIEW: ["approve", "reject", "cancel"],
      PENDING_PAYMENT: ["cancel"],
      PAID: ["schedule", "cancel"],
      SCHEDULED: ["pause", "cancel"],
      RUNNING: ["pause", "complete", "cancel"],
      PAUSED: ["resume", "cancel"],
      COMPLETED: [],
      REJECTED: [],
      CANCELLED: [],
    };
    return actions[status] || [];
  }

  /**
   * Check if ad can be reviewed
   */
  canReview(status: AdStatus): boolean {
    return status === "SUBMITTED" || status === "UNDER_REVIEW";
  }

  /**
   * Check if schedule can be updated
   */
  canUpdateSchedule(status: AdStatus): boolean {
    return status === "SCHEDULED" || status === "RUNNING" || status === "PAUSED";
  }

  /**
   * Format currency amount
   */
  formatAmount(amount: string | null): string {
    if (!amount) return "N/A";
    return `NPR ${parseFloat(amount).toFixed(2)}`;
  }

  /**
   * Format date
   */
  formatDate(dateString: string | null): string {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  /**
   * Format date and time
   */
  formatDateTime(dateString: string | null): string {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}

// Export singleton instance
const adsService = new AdsService();
export default adsService;
