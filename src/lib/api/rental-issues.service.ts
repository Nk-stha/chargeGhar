import instance from "../axios";
import {
  RentalIssuesListResponse,
  RentalIssueDetailResponse,
  UpdateRentalIssueRequest,
  UpdateRentalIssueResponse,
  DeleteRentalIssueResponse,
  RentalIssueFilters,
  RentalIssueStatus,
  RentalIssueType,
  RentalIssueListItem,
} from "../../types/rental-issues.types";

/**
 * Rental Issues Service
 * Handles all API calls related to rental issue management
 */

class RentalIssuesService {
  private baseUrl = "/api/admin/rentals/issues";

  /**
   * Get list of all rental issues with optional filters
   * @param filters - Rental issue filters (status, issue_type, search, etc.)
   * @returns Rental issues list
   */
  async getRentalIssues(
    filters?: RentalIssueFilters,
  ): Promise<RentalIssuesListResponse> {
    const params = new URLSearchParams();

    // Filter parameters
    if (filters?.status) {
      params.append("status", filters.status);
    }
    if (filters?.issue_type) {
      params.append("issue_type", filters.issue_type);
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

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

    const response = await instance.get<RentalIssuesListResponse>(url);
    return response.data;
  }

  /**
   * Get detailed information about a specific rental issue
   * @param issueId - Rental Issue ID (UUID)
   * @returns Detailed rental issue information
   */
  async getRentalIssueDetail(
    issueId: string,
  ): Promise<RentalIssueDetailResponse> {
    const response = await instance.get<RentalIssueDetailResponse>(
      `${this.baseUrl}/${issueId}`,
    );
    return response.data;
  }

  /**
   * Update a rental issue (status, notes)
   * @param issueId - Rental Issue ID (UUID)
   * @param data - Update data (status, notes)
   * @returns Updated rental issue
   */
  async updateRentalIssue(
    issueId: string,
    data: UpdateRentalIssueRequest,
  ): Promise<UpdateRentalIssueResponse> {
    const payload: any = {};

    if (data.status) {
      payload.status = data.status;
    }
    if (data.notes !== undefined && data.notes.trim()) {
      payload.notes = data.notes.trim();
    }

    const response = await instance.patch<UpdateRentalIssueResponse>(
      `${this.baseUrl}/${issueId}`,
      payload,
    );
    return response.data;
  }

  /**
   * Delete a rental issue
   * @param issueId - Rental Issue ID (UUID)
   * @returns Deletion confirmation
   */
  async deleteRentalIssue(issueId: string): Promise<DeleteRentalIssueResponse> {
    const response = await instance.delete<DeleteRentalIssueResponse>(
      `${this.baseUrl}/${issueId}`,
    );
    return response.data;
  }

  /**
   * Get rental issues by status (helper method)
   * @param status - Rental issue status
   * @param filters - Additional filters
   * @returns Filtered rental issues list
   */
  async getRentalIssuesByStatus(
    status: RentalIssueStatus,
    filters?: Omit<RentalIssueFilters, "status">,
  ): Promise<RentalIssuesListResponse> {
    return this.getRentalIssues({ ...filters, status });
  }

  /**
   * Get reported rental issues (helper method)
   */
  async getReportedIssues(
    filters?: Omit<RentalIssueFilters, "status">,
  ): Promise<RentalIssuesListResponse> {
    return this.getRentalIssuesByStatus("REPORTED", filters);
  }

  /**
   * Get resolved rental issues (helper method)
   */
  async getResolvedIssues(
    filters?: Omit<RentalIssueFilters, "status">,
  ): Promise<RentalIssuesListResponse> {
    return this.getRentalIssuesByStatus("RESOLVED", filters);
  }

  /**
   * Get rental issues by type (helper method)
   * @param issueType - Rental issue type
   * @param filters - Additional filters
   */
  async getRentalIssuesByType(
    issueType: RentalIssueType,
    filters?: Omit<RentalIssueFilters, "issue_type">,
  ): Promise<RentalIssuesListResponse> {
    return this.getRentalIssues({ ...filters, issue_type: issueType });
  }

  /**
   * Search rental issues by rental code, user name, or email
   * @param query - Search query
   * @param filters - Additional filters
   */
  async searchRentalIssues(
    query: string,
    filters?: Omit<RentalIssueFilters, "search">,
  ): Promise<RentalIssuesListResponse> {
    return this.getRentalIssues({ ...filters, search: query });
  }

  /**
   * Resolve a rental issue
   * @param issueId - Rental Issue ID
   * @param notes - Resolution notes
   */
  async resolveIssue(
    issueId: string,
    notes?: string,
  ): Promise<UpdateRentalIssueResponse> {
    return this.updateRentalIssue(issueId, {
      status: "RESOLVED",
      notes,
    });
  }

  /**
   * Reopen a rental issue
   * @param issueId - Rental Issue ID
   * @param notes - Reopen notes
   */
  async reopenIssue(
    issueId: string,
    notes?: string,
  ): Promise<UpdateRentalIssueResponse> {
    return this.updateRentalIssue(issueId, {
      status: "REPORTED",
      notes,
    });
  }

  /**
   * Format date/time for display
   * @param dateString - ISO date string
   * @param includeTime - Include time in output
   * @returns Formatted date string
   */
  formatDateTime(
    dateString: string | null,
    includeTime: boolean = true,
  ): string {
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
   * Get status color for UI
   * @param status - Rental issue status
   * @returns Hex color code
   */
  getStatusColor(status: RentalIssueStatus): string {
    switch (status) {
      case "REPORTED":
        return "#ffc107"; // Yellow
      case "RESOLVED":
        return "#47b216"; // Green
      default:
        return "#888888"; // Default gray
    }
  }

  /**
   * Get status label for UI
   * @param status - Rental issue status
   * @returns Human-readable status label
   */
  getStatusLabel(status: RentalIssueStatus): string {
    return status.charAt(0) + status.slice(1).toLowerCase();
  }

  /**
   * Get issue type color for UI
   * @param issueType - Rental issue type
   * @returns Hex color code
   */
  getIssueTypeColor(issueType: RentalIssueType): string {
    switch (issueType) {
      case "POWER_BANK_LOST":
        return "#dc3545"; // Red
      case "CHARGING_ISSUE":
        return "#ffc107"; // Yellow
      case "DAMAGED_DEVICE":
        return "#ff6b6b"; // Light Red
      case "NOT_RETURNED":
        return "#ff4040"; // Orange Red
      case "STATION_MALFUNCTION":
        return "#2196f3"; // Blue
      case "OTHER":
        return "#888888"; // Gray
      default:
        return "#888888"; // Default gray
    }
  }

  /**
   * Get issue type label for UI
   * @param issueType - Rental issue type
   * @returns Human-readable issue type label
   */
  getIssueTypeLabel(issueType: RentalIssueType): string {
    const labels: Record<RentalIssueType, string> = {
      POWER_BANK_LOST: "Power Bank Lost",
      CHARGING_ISSUE: "Charging Issue",
      DAMAGED_DEVICE: "Damaged Device",
      NOT_RETURNED: "Not Returned",
      STATION_MALFUNCTION: "Station Malfunction",
      OTHER: "Other",
    };
    return labels[issueType] || issueType;
  }

  /**
   * Get time since reported
   * @param reportedAt - Reported date string
   * @returns Time since reported string
   */
  getTimeSinceReported(reportedAt: string): string {
    const reported = new Date(reportedAt);
    const now = new Date();
    const diffMs = now.getTime() - reported.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 60) {
      return `${diffMinutes} min${diffMinutes !== 1 ? "s" : ""} ago`;
    } else if (diffMinutes < 1440) {
      const hours = Math.floor(diffMinutes / 60);
      return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    } else {
      const days = Math.floor(diffMinutes / 1440);
      return `${days} day${days !== 1 ? "s" : ""} ago`;
    }
  }

  /**
   * Export rental issues data to CSV format
   * @param issues - Array of rental issue items
   * @returns CSV string
   */
  exportToCSV(issues: RentalIssueListItem[]): string {
    const headers = [
      "Issue ID",
      "Rental Code",
      "User Name",
      "User Email",
      "Issue Type",
      "Status",
      "Description",
      "Station Name",
      "Power Bank Serial",
      "Reported At",
      "Resolved At",
    ];

    const rows = issues.map((issue) => [
      issue.id,
      issue.rental_code,
      issue.user_name,
      issue.user_email,
      this.getIssueTypeLabel(issue.issue_type),
      this.getStatusLabel(issue.status),
      issue.description,
      issue.station_name,
      issue.power_bank_serial,
      this.formatDateTime(issue.reported_at),
      this.formatDateTime(issue.resolved_at),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    return csvContent;
  }

  /**
   * Download CSV file
   * @param issues - Array of rental issue items
   * @param filename - Output filename
   */
  downloadCSV(
    issues: RentalIssueListItem[],
    filename: string = "rental_issues.csv",
  ): void {
    const csv = this.exportToCSV(issues);
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

  /**
   * Validate rental issue filters
   * @param filters - Rental issue filters
   * @returns Validation result
   */
  validateFilters(filters: RentalIssueFilters): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

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
}

// Export singleton instance
export const rentalIssuesService = new RentalIssuesService();
export default rentalIssuesService;
