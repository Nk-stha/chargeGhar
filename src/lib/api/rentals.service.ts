import instance from "../axios";
import {
  RentalsListResponse,
  RentalDetailResponse,
  RentalFilters,
  RentalStatus,
  PaymentStatus,
  RecentFilter,
  RentalListItem,
} from "../../types/rentals.types";

/**
 * Rentals Service
 * Handles all API calls related to rental management
 */

class RentalsService {
  private baseUrl = "/api/admin/rentals";

  /**
   * Get list of rentals with optional filters and pagination
   * @param filters - Rental filters (status, payment_status, user_id, etc.)
   * @returns Rentals list with pagination
   */
  async getRentals(
    filters?: RentalFilters
  ): Promise<RentalsListResponse> {
    const params = new URLSearchParams();

    // Pagination parameters
    if (filters?.page) {
      params.append("page", filters.page.toString());
    }
    if (filters?.page_size) {
      params.append("page_size", filters.page_size.toString());
    }

    // Filter parameters
    if (filters?.status) {
      params.append("status", filters.status);
    }
    if (filters?.payment_status) {
      params.append("payment_status", filters.payment_status);
    }
    if (filters?.user_id) {
      params.append("user_id", filters.user_id.toString());
    }
    if (filters?.station_id) {
      params.append("station_id", filters.station_id);
    }
    if (filters?.search) {
      params.append("search", filters.search);
    }
    if (filters?.start_date) {
      params.append("start_date", filters.start_date);
    }
    if (filters?.end_date) {
      params.append("end_date", filters.end_date);
    }
    if (filters?.recent) {
      params.append("recent", filters.recent);
    }

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

    const response = await instance.get<RentalsListResponse>(url);
    return response.data;
  }

  /**
   * Get detailed information about a specific rental
   * @param rentalId - Rental ID (UUID)
   * @returns Detailed rental information
   */
  async getRentalDetail(rentalId: string): Promise<RentalDetailResponse> {
    const response = await instance.get<RentalDetailResponse>(
      `${this.baseUrl}/${rentalId}`
    );
    return response.data;
  }

  /**
   * Get rentals by status (helper method)
   * @param status - Rental status
   * @param filters - Additional filters
   * @returns Filtered rentals list
   */
  async getRentalsByStatus(
    status: RentalStatus,
    filters?: Omit<RentalFilters, "status">
  ): Promise<RentalsListResponse> {
    return this.getRentals({ ...filters, status });
  }

  /**
   * Get active rentals (helper method)
   */
  async getActiveRentals(
    filters?: Omit<RentalFilters, "status">
  ): Promise<RentalsListResponse> {
    return this.getRentalsByStatus("ACTIVE", filters);
  }

  /**
   * Get overdue rentals (helper method)
   */
  async getOverdueRentals(
    filters?: Omit<RentalFilters, "status">
  ): Promise<RentalsListResponse> {
    return this.getRentalsByStatus("OVERDUE", filters);
  }

  /**
   * Get completed rentals (helper method)
   */
  async getCompletedRentals(
    filters?: Omit<RentalFilters, "status">
  ): Promise<RentalsListResponse> {
    return this.getRentalsByStatus("COMPLETED", filters);
  }

  /**
   * Get pending rentals (helper method)
   */
  async getPendingRentals(
    filters?: Omit<RentalFilters, "status">
  ): Promise<RentalsListResponse> {
    return this.getRentalsByStatus("PENDING", filters);
  }

  /**
   * Get recent rentals (helper method)
   * @param period - Recent period (today, 24h, 7d, 30d)
   * @param filters - Additional filters
   */
  async getRecentRentals(
    period: RecentFilter,
    filters?: Omit<RentalFilters, "recent">
  ): Promise<RentalsListResponse> {
    return this.getRentals({ ...filters, recent: period });
  }

  /**
   * Search rentals by rental code or user name/phone
   * @param query - Search query
   * @param filters - Additional filters
   */
  async searchRentals(
    query: string,
    filters?: Omit<RentalFilters, "search">
  ): Promise<RentalsListResponse> {
    return this.getRentals({ ...filters, search: query });
  }

  /**
   * Format rental duration for display
   * @param minutes - Duration in minutes
   * @returns Formatted duration string
   */
  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min${minutes !== 1 ? "s" : ""}`;
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours} hr${hours !== 1 ? "s" : ""}`;
      }
      return `${hours} hr${hours !== 1 ? "s" : ""} ${remainingMinutes} min`;
    } else {
      const days = Math.floor(minutes / 1440);
      const remainingHours = Math.floor((minutes % 1440) / 60);
      if (remainingHours === 0) {
        return `${days} day${days !== 1 ? "s" : ""}`;
      }
      return `${days} day${days !== 1 ? "s" : ""} ${remainingHours} hr${remainingHours !== 1 ? "s" : ""}`;
    }
  }

  /**
   * Format amount with currency
   * @param amount - Amount string
   * @param currency - Currency code (default: NPR)
   * @returns Formatted currency string
   */
  formatAmount(amount: string, currency: string = "NPR"): string {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return amount;
    return `${currency} ${numAmount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
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
   * Calculate rental duration in minutes
   * @param startedAt - Start date string
   * @param endedAt - End date string or null
   * @returns Duration in minutes, or null if not started
   */
  calculateRentalDuration(
    startedAt: string | null,
    endedAt: string | null
  ): number | null {
    if (!startedAt) return null;

    const start = new Date(startedAt);
    const end = endedAt ? new Date(endedAt) : new Date();

    const durationMs = end.getTime() - start.getTime();
    return Math.floor(durationMs / (1000 * 60));
  }

  /**
   * Check if rental is overdue
   * @param rental - Rental item
   * @returns True if overdue
   */
  isOverdue(rental: RentalListItem): boolean {
    if (rental.status === "OVERDUE") return true;
    if (!rental.due_at) return false;

    const dueDate = new Date(rental.due_at);
    const now = new Date();
    return now > dueDate && rental.status === "ACTIVE";
  }

  /**
   * Get time until due
   * @param dueAt - Due date string
   * @returns Formatted time until due
   */
  getTimeUntilDue(dueAt: string): string {
    const due = new Date(dueAt);
    const now = new Date();
    const diff = due.getTime() - now.getTime();

    if (diff < 0) {
      const minutesOverdue = Math.floor(Math.abs(diff) / (1000 * 60));
      if (minutesOverdue < 60) {
        return `${minutesOverdue} min overdue`;
      } else if (minutesOverdue < 1440) {
        const hours = Math.floor(minutesOverdue / 60);
        return `${hours} hr${hours !== 1 ? "s" : ""} overdue`;
      } else {
        const days = Math.floor(minutesOverdue / 1440);
        return `${days} day${days !== 1 ? "s" : ""} overdue`;
      }
    }

    const minutesRemaining = Math.floor(diff / (1000 * 60));
    if (minutesRemaining < 60) {
      return `${minutesRemaining} min remaining`;
    } else if (minutesRemaining < 1440) {
      const hours = Math.floor(minutesRemaining / 60);
      return `${hours} hr${hours !== 1 ? "s" : ""} remaining`;
    } else {
      const days = Math.floor(minutesRemaining / 1440);
      return `${days} day${days !== 1 ? "s" : ""} remaining`;
    }
  }

  /**
   * Get status color for UI
   * @param status - Rental status
   * @returns Hex color code
   */
  getStatusColor(status: RentalStatus): string {
    switch (status) {
      case "ACTIVE":
        return "#2196f3"; // Blue
      case "COMPLETED":
        return "#47b216"; // Green
      case "PENDING":
        return "#ffc107"; // Yellow
      case "CANCELLED":
        return "#6c757d"; // Gray
      case "OVERDUE":
        return "#dc3545"; // Red
      default:
        return "#888888"; // Default gray
    }
  }

  /**
   * Get payment status color for UI
   * @param status - Payment status
   * @returns Hex color code
   */
  getPaymentStatusColor(status: PaymentStatus): string {
    switch (status) {
      case "PAID":
        return "#47b216"; // Green
      case "PENDING":
        return "#ffc107"; // Yellow
      case "FAILED":
        return "#dc3545"; // Red
      case "REFUNDED":
        return "#2196f3"; // Blue
      default:
        return "#888888"; // Default gray
    }
  }

  /**
   * Get status label for UI
   * @param status - Rental status
   * @returns Human-readable status label
   */
  getStatusLabel(status: RentalStatus): string {
    return status.charAt(0) + status.slice(1).toLowerCase();
  }

  /**
   * Get payment status label for UI
   * @param status - Payment status
   * @returns Human-readable payment status label
   */
  getPaymentStatusLabel(status: PaymentStatus): string {
    return status.charAt(0) + status.slice(1).toLowerCase();
  }

  /**
   * Validate rental filters
   * @param filters - Rental filters
   * @returns Validation result
   */
  validateFilters(filters: RentalFilters): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (filters.page !== undefined && filters.page < 1) {
      errors.push("Page number must be at least 1");
    }

    if (filters.page_size !== undefined) {
      if (filters.page_size < 1 || filters.page_size > 100) {
        errors.push("Page size must be between 1 and 100");
      }
    }

    if (filters.start_date && filters.end_date) {
      const start = new Date(filters.start_date);
      const end = new Date(filters.end_date);

      if (isNaN(start.getTime())) {
        errors.push("Invalid start date format");
      }

      if (isNaN(end.getTime())) {
        errors.push("Invalid end date format");
      }

      if (start > end) {
        errors.push("Start date must be before or equal to end date");
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Export rentals data to CSV format
   * @param rentals - Array of rental items
   * @returns CSV string
   */
  exportToCSV(rentals: RentalListItem[]): string {
    const headers = [
      "Rental Code",
      "Status",
      "Payment Status",
      "User",
      "Phone",
      "Station",
      "Return Station",
      "Powerbank",
      "Package",
      "Duration (min)",
      "Started At",
      "Ended At",
      "Due At",
      "Amount Paid",
      "Overdue Amount",
      "On Time",
      "Created At",
    ];

    const rows = rentals.map((rental) => [
      rental.rental_code,
      rental.status,
      rental.payment_status,
      rental.username,
      rental.user_phone || "N/A",
      rental.station_name,
      rental.return_station_name,
      rental.powerbank_serial,
      rental.package_name,
      rental.package_duration.toString(),
      rental.started_at || "N/A",
      rental.ended_at || "N/A",
      rental.due_at,
      rental.amount_paid,
      rental.overdue_amount,
      rental.is_returned_on_time ? "Yes" : "No",
      rental.created_at,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    return csvContent;
  }

  /**
   * Download CSV file
   * @param rentals - Array of rental items
   * @param filename - Output filename
   */
  downloadCSV(rentals: RentalListItem[], filename: string = "rentals.csv"): void {
    const csv = this.exportToCSV(rentals);
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
export const rentalsService = new RentalsService();
export default rentalsService;
