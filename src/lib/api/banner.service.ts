import instance from "../axios";
import {
  BannerListResponse,
  BannerDetailResponse,
  CreateBannerRequest,
  UpdateBannerRequest,
  DeleteBannerResponse,
  Banner,
} from "../../types/banner.types";

/**
 * Banner Service
 * Handles all API calls related to banner management
 */

class BannerService {
  private baseUrl = "/api/admin/content/banners";

  /**
   * Get list of all banners
   * @returns Banners list
   */
  async getBanners(): Promise<BannerListResponse> {
    const response = await instance.get<BannerListResponse>(this.baseUrl);
    return response.data;
  }

  /**
   * Get detailed information about a specific banner
   * @param bannerId - Banner ID (UUID)
   * @returns Detailed banner information
   */
  async getBannerDetail(bannerId: string): Promise<BannerDetailResponse> {
    const response = await instance.get<BannerDetailResponse>(
      `${this.baseUrl}/${bannerId}`,
    );
    return response.data;
  }

  /**
   * Create a new banner
   * @param data - Banner creation data
   * @returns Created banner
   */
  async createBanner(data: CreateBannerRequest): Promise<BannerDetailResponse> {
    const payload: any = {
      title: data.title,
      image_url: data.image_url,
      valid_from: data.valid_from,
      valid_until: data.valid_until,
    };

    if (data.description) {
      payload.description = data.description;
    }
    if (data.redirect_url) {
      payload.redirect_url = data.redirect_url;
    }
    if (data.display_order !== undefined) {
      payload.display_order = data.display_order;
    }
    if (data.is_active !== undefined) {
      payload.is_active = data.is_active;
    }

    const response = await instance.post<BannerDetailResponse>(
      this.baseUrl,
      payload,
    );
    return response.data;
  }

  /**
   * Update a banner
   * @param bannerId - Banner ID (UUID)
   * @param data - Banner update data
   * @returns Updated banner
   */
  async updateBanner(
    bannerId: string,
    data: UpdateBannerRequest,
  ): Promise<BannerDetailResponse> {
    const payload: any = {
      title: data.title,
      image_url: data.image_url,
      valid_from: data.valid_from,
      valid_until: data.valid_until,
    };

    if (data.description) {
      payload.description = data.description;
    }
    if (data.redirect_url) {
      payload.redirect_url = data.redirect_url;
    }
    if (data.display_order !== undefined) {
      payload.display_order = data.display_order;
    }
    if (data.is_active !== undefined) {
      payload.is_active = data.is_active;
    }

    const response = await instance.put<BannerDetailResponse>(
      `${this.baseUrl}/${bannerId}`,
      payload,
    );
    return response.data;
  }

  /**
   * Delete a banner
   * @param bannerId - Banner ID (UUID)
   * @returns Deletion confirmation
   */
  async deleteBanner(bannerId: string): Promise<DeleteBannerResponse> {
    const response = await instance.delete<DeleteBannerResponse>(
      `${this.baseUrl}/${bannerId}`,
    );
    return response.data;
  }

  /**
   * Format date/time for display
   * @param dateString - ISO date string
   * @param includeTime - Include time in output
   * @returns Formatted date string
   */
  formatDateTime(dateString: string | null, includeTime: boolean = true): string {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";

    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };

    if (includeTime) {
      options.hour = "2-digit";
      options.minute = "2-digit";
    }

    return date.toLocaleString("en-US", options);
  }

  /**
   * Format date for input field (YYYY-MM-DDTHH:mm)
   * @param dateString - ISO date string
   * @returns Formatted date string for input
   */
  formatDateForInput(dateString: string): string {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  /**
   * Get status badge class
   * @param banner - Banner object
   * @returns Status indicator class
   */
  getStatusClass(banner: Banner): string {
    if (!banner.is_active) {
      return "inactive";
    }
    if (banner.is_currently_active) {
      return "active";
    }
    return "scheduled";
  }

  /**
   * Get status label
   * @param banner - Banner object
   * @returns Human-readable status label
   */
  getStatusLabel(banner: Banner): string {
    if (!banner.is_active) {
      return "Inactive";
    }
    if (banner.is_currently_active) {
      return "Active";
    }
    return "Scheduled";
  }

  /**
   * Get remaining time text
   * @param daysRemaining - Number of days remaining
   * @returns Formatted remaining time text
   */
  getRemainingTimeText(daysRemaining: number): string {
    if (daysRemaining < 0) {
      return "Expired";
    }
    if (daysRemaining === 0) {
      return "Expires today";
    }
    if (daysRemaining === 1) {
      return "1 day remaining";
    }
    return `${daysRemaining} days remaining`;
  }

  /**
   * Validate date range
   * @param validFrom - Start date
   * @param validUntil - End date
   * @returns Validation result
   */
  validateDateRange(validFrom: string, validUntil: string): {
    valid: boolean;
    error?: string;
  } {
    const from = new Date(validFrom);
    const until = new Date(validUntil);

    if (isNaN(from.getTime())) {
      return { valid: false, error: "Invalid start date" };
    }

    if (isNaN(until.getTime())) {
      return { valid: false, error: "Invalid end date" };
    }

    if (from >= until) {
      return { valid: false, error: "End date must be after start date" };
    }

    return { valid: true };
  }

  /**
   * Export banners data to CSV format
   * @param banners - Array of banner items
   * @returns CSV string
   */
  exportToCSV(banners: Banner[]): string {
    const headers = [
      "ID",
      "Title",
      "Description",
      "Display Order",
      "Status",
      "Valid From",
      "Valid Until",
      "Days Remaining",
      "Redirect URL",
      "Created At",
    ];

    const rows = banners.map((banner) => [
      banner.id,
      banner.title,
      banner.description || "",
      banner.display_order.toString(),
      this.getStatusLabel(banner),
      this.formatDateTime(banner.valid_from),
      this.formatDateTime(banner.valid_until),
      banner.days_remaining.toString(),
      banner.redirect_url || "",
      this.formatDateTime(banner.created_at),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    return csvContent;
  }

  /**
   * Download CSV file
   * @param banners - Array of banner items
   * @param filename - Output filename
   */
  downloadCSV(banners: Banner[], filename: string = "banners.csv"): void {
    const csv = this.exportToCSV(banners);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Export singleton instance
export const bannerService = new BannerService();
export default bannerService;
