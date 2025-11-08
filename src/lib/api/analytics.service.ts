import instance from "../axios";
import {
  RevenueAnalyticsResponse,
  RevenueAnalyticsFilters,
  RentalAnalyticsResponse,
  RentalAnalyticsFilters,
  AnalyticsPeriod,
  TransactionType,
  RentalStatus,
} from "../../types/analytics.types";

/**
 * Analytics Service
 * Handles all API calls related to admin dashboard analytics
 */

class AnalyticsService {
  private baseUrl = "/api/admin/analytics";

  /**
   * Get revenue analytics over time
   * @param filters - Revenue analytics filters (period, dates, transaction type)
   * @returns Revenue analytics data with chart data
   */
  async getRevenueOverTime(
    filters: RevenueAnalyticsFilters
  ): Promise<RevenueAnalyticsResponse> {
    const params = new URLSearchParams();

    // Required parameter
    params.append("period", filters.period);

    // Optional parameters
    if (filters.start_date) {
      params.append("start_date", filters.start_date);
    }
    if (filters.end_date) {
      params.append("end_date", filters.end_date);
    }
    if (filters.transaction_type && filters.transaction_type !== "all") {
      params.append("transaction_type", filters.transaction_type);
    }

    const url = `${this.baseUrl}/revenue-over-time?${params.toString()}`;
    const response = await instance.get<RevenueAnalyticsResponse>(url);
    return response.data;
  }

  /**
   * Get rentals analytics over time
   * @param filters - Rental analytics filters (period, dates, status)
   * @returns Rental analytics data with chart data
   */
  async getRentalsOverTime(
    filters: RentalAnalyticsFilters
  ): Promise<RentalAnalyticsResponse> {
    const params = new URLSearchParams();

    // Required parameter
    params.append("period", filters.period);

    // Optional parameters
    if (filters.start_date) {
      params.append("start_date", filters.start_date);
    }
    if (filters.end_date) {
      params.append("end_date", filters.end_date);
    }
    if (filters.status && filters.status !== "all") {
      params.append("status", filters.status);
    }

    const url = `${this.baseUrl}/rentals-over-time?${params.toString()}`;
    const response = await instance.get<RentalAnalyticsResponse>(url);
    return response.data;
  }

  /**
   * Format date to YYYY-MM-DD format for API
   * @param date - Date object or date string
   * @returns Formatted date string
   */
  formatDate(date: Date | string): string {
    const d = typeof date === "string" ? new Date(date) : date;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  /**
   * Get default date range based on period
   * @param period - Analytics period (daily, weekly, monthly)
   * @returns Object with start_date and end_date
   */
  getDefaultDateRange(period: AnalyticsPeriod): {
    start_date: string;
    end_date: string;
  } {
    const end_date = new Date();
    const start_date = new Date();

    switch (period) {
      case "daily":
        start_date.setDate(end_date.getDate() - 30); // 30 days
        break;
      case "weekly":
        start_date.setDate(end_date.getDate() - 90); // ~13 weeks
        break;
      case "monthly":
        start_date.setMonth(end_date.getMonth() - 12); // 12 months
        break;
    }

    return {
      start_date: this.formatDate(start_date),
      end_date: this.formatDate(end_date),
    };
  }

  /**
   * Validate date range
   * @param start_date - Start date string
   * @param end_date - End date string
   * @returns Validation result with error message if invalid
   */
  validateDateRange(
    start_date?: string,
    end_date?: string
  ): { valid: boolean; error?: string } {
    if (!start_date || !end_date) {
      return { valid: true };
    }

    const start = new Date(start_date);
    const end = new Date(end_date);

    if (isNaN(start.getTime())) {
      return { valid: false, error: "Invalid start date format" };
    }

    if (isNaN(end.getTime())) {
      return { valid: false, error: "Invalid end date format" };
    }

    if (start > end) {
      return {
        valid: false,
        error: "Start date must be before or equal to end date",
      };
    }

    // Check if date range is not too large (e.g., max 2 years)
    const maxDays = 730; // ~2 years
    const daysDiff = Math.floor(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff > maxDays) {
      return {
        valid: false,
        error: "Date range cannot exceed 2 years",
      };
    }

    return { valid: true };
  }

  /**
   * Format currency with symbol
   * @param amount - Amount to format
   * @param currency - Currency code (default: NPR)
   * @returns Formatted currency string
   */
  formatCurrency(amount: number, currency: string = "NPR"): string {
    return `${currency} ${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  /**
   * Calculate percentage change between two values
   * @param current - Current value
   * @param previous - Previous value
   * @returns Percentage change (positive or negative)
   */
  calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Number((((current - previous) / previous) * 100).toFixed(2));
  }

  /**
   * Get period label for UI display
   * @param period - Analytics period
   * @returns Human-readable period label
   */
  getPeriodLabel(period: AnalyticsPeriod): string {
    switch (period) {
      case "daily":
        return "Daily";
      case "weekly":
        return "Weekly";
      case "monthly":
        return "Monthly";
      default:
        return period;
    }
  }

  /**
   * Get transaction type label for UI display
   * @param type - Transaction type
   * @returns Human-readable transaction type label
   */
  getTransactionTypeLabel(type: TransactionType): string {
    switch (type) {
      case "rental":
        return "Rental";
      case "rental_due":
        return "Rental Due";
      case "topup":
        return "Top-up";
      case "fine":
        return "Fine";
      case "all":
        return "All Transactions";
      default:
        return type;
    }
  }

  /**
   * Get rental status label for UI display
   * @param status - Rental status
   * @returns Human-readable rental status label
   */
  getRentalStatusLabel(status: RentalStatus): string {
    switch (status) {
      case "completed":
        return "Completed";
      case "active":
        return "Active";
      case "pending":
        return "Pending";
      case "cancelled":
        return "Cancelled";
      case "overdue":
        return "Overdue";
      case "all":
        return "All Rentals";
      default:
        return status;
    }
  }

  /**
   * Get color for chart based on revenue type
   * @param type - Revenue type
   * @returns Hex color code
   */
  getRevenueColor(type: string): string {
    switch (type) {
      case "rental_revenue":
        return "#47b216"; // Primary green
      case "rental_due_revenue":
        return "#82ea80"; // Light green
      case "topup_revenue":
        return "#2196f3"; // Blue
      case "fine_revenue":
        return "#ff9800"; // Orange
      default:
        return "#47b216"; // Default green
    }
  }

  /**
   * Get color for chart based on rental status
   * @param status - Rental status
   * @returns Hex color code
   */
  getRentalStatusColor(status: string): string {
    switch (status) {
      case "completed":
        return "#47b216"; // Green
      case "active":
        return "#2196f3"; // Blue
      case "pending":
        return "#ffc107"; // Yellow
      case "cancelled":
        return "#6c757d"; // Gray
      case "overdue":
        return "#dc3545"; // Red
      default:
        return "#82ea80"; // Light green
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
export default analyticsService;
