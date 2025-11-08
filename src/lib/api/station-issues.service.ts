import instance from "../axios";
import {
  StationIssuesListResponse,
  StationIssueDetailResponse,
  UpdateStationIssueRequest,
  UpdateStationIssueResponse,
  DeleteStationIssueResponse,
  StationIssueFilters,
  StationIssueStatus,
  StationIssuePriority,
  StationIssueType,
  StationIssueListItem,
} from "../../types/station-issues.types";

/**
 * Station Issues Service
 * Handles all API calls related to station issue management
 */

class StationIssuesService {
  private baseUrl = "/api/admin/stations/issues";

  /**
   * Get list of all station issues with optional filters
   * @param filters - Station issue filters (status, priority, issue_type, etc.)
   * @returns Station issues list
   */
  async getStationIssues(
    filters?: StationIssueFilters,
  ): Promise<StationIssuesListResponse> {
    const params = new URLSearchParams();

    // Filter parameters
    if (filters?.status) {
      params.append("status", filters.status);
    }
    if (filters?.priority) {
      params.append("priority", filters.priority);
    }
    if (filters?.issue_type) {
      params.append("issue_type", filters.issue_type);
    }
    if (filters?.station_id) {
      params.append("station_id", filters.station_id);
    }
    if (filters?.assigned_to_id) {
      params.append("assigned_to_id", filters.assigned_to_id);
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

    const response = await instance.get<StationIssuesListResponse>(url);
    return response.data;
  }

  /**
   * Get detailed information about a specific station issue
   * @param issueId - Station Issue ID (UUID)
   * @returns Detailed station issue information
   */
  async getStationIssueDetail(
    issueId: string,
  ): Promise<StationIssueDetailResponse> {
    const response = await instance.get<StationIssueDetailResponse>(
      `${this.baseUrl}/${issueId}`,
    );
    return response.data;
  }

  /**
   * Update a station issue (status, priority, assigned_to_id, notes)
   * @param issueId - Station Issue ID (UUID)
   * @param data - Update data (status, priority, assigned_to_id, notes)
   * @returns Updated station issue
   */
  async updateStationIssue(
    issueId: string,
    data: UpdateStationIssueRequest,
  ): Promise<UpdateStationIssueResponse> {
    const payload: any = {};

    if (data.status) {
      payload.status = data.status;
    }
    if (data.priority) {
      payload.priority = data.priority;
    }
    if (data.assigned_to_id && data.assigned_to_id.trim()) {
      const trimmedId = data.assigned_to_id.trim();
      // Validate UUID format
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(trimmedId)) {
        payload.assigned_to_id = trimmedId;
      }
    }
    if (data.notes !== undefined && data.notes.trim()) {
      payload.notes = data.notes.trim();
    }

    const response = await instance.patch<UpdateStationIssueResponse>(
      `${this.baseUrl}/${issueId}`,
      payload,
    );
    return response.data;
  }

  /**
   * Delete a station issue
   * @param issueId - Station Issue ID (UUID)
   * @returns Deletion confirmation
   */
  async deleteStationIssue(
    issueId: string,
  ): Promise<DeleteStationIssueResponse> {
    const response = await instance.delete<DeleteStationIssueResponse>(
      `${this.baseUrl}/${issueId}`,
    );
    return response.data;
  }

  /**
   * Get station issues by status (helper method)
   * @param status - Station issue status
   * @param filters - Additional filters
   * @returns Filtered station issues list
   */
  async getStationIssuesByStatus(
    status: StationIssueStatus,
    filters?: Omit<StationIssueFilters, "status">,
  ): Promise<StationIssuesListResponse> {
    return this.getStationIssues({ ...filters, status });
  }

  /**
   * Get station issues by priority (helper method)
   * @param priority - Station issue priority
   * @param filters - Additional filters
   */
  async getStationIssuesByPriority(
    priority: StationIssuePriority,
    filters?: Omit<StationIssueFilters, "priority">,
  ): Promise<StationIssuesListResponse> {
    return this.getStationIssues({ ...filters, priority });
  }

  /**
   * Get station issues by type (helper method)
   * @param issueType - Station issue type
   * @param filters - Additional filters
   */
  async getStationIssuesByType(
    issueType: StationIssueType,
    filters?: Omit<StationIssueFilters, "issue_type">,
  ): Promise<StationIssuesListResponse> {
    return this.getStationIssues({ ...filters, issue_type: issueType });
  }

  /**
   * Search station issues by station name, reporter name, or description
   * @param query - Search query
   * @param filters - Additional filters
   */
  async searchStationIssues(
    query: string,
    filters?: Omit<StationIssueFilters, "search">,
  ): Promise<StationIssuesListResponse> {
    return this.getStationIssues({ ...filters, search: query });
  }

  /**
   * Acknowledge a station issue
   * @param issueId - Station Issue ID
   * @param notes - Acknowledgement notes
   */
  async acknowledgeIssue(
    issueId: string,
    notes?: string,
  ): Promise<UpdateStationIssueResponse> {
    return this.updateStationIssue(issueId, {
      status: "ACKNOWLEDGED",
      notes,
    });
  }

  /**
   * Mark issue as in progress
   * @param issueId - Station Issue ID
   * @param assignedToId - Admin profile ID to assign
   * @param notes - Notes
   */
  async markInProgress(
    issueId: string,
    assignedToId?: string,
    notes?: string,
  ): Promise<UpdateStationIssueResponse> {
    return this.updateStationIssue(issueId, {
      status: "IN_PROGRESS",
      assigned_to_id: assignedToId,
      notes,
    });
  }

  /**
   * Resolve a station issue
   * @param issueId - Station Issue ID
   * @param notes - Resolution notes
   */
  async resolveIssue(
    issueId: string,
    notes?: string,
  ): Promise<UpdateStationIssueResponse> {
    return this.updateStationIssue(issueId, {
      status: "RESOLVED",
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
   * @param status - Station issue status
   * @returns Hex color code
   */
  getStatusColor(status: StationIssueStatus): string {
    switch (status) {
      case "REPORTED":
        return "#ffc107"; // Yellow
      case "ACKNOWLEDGED":
        return "#2196f3"; // Blue
      case "IN_PROGRESS":
        return "#ff9800"; // Orange
      case "RESOLVED":
        return "#47b216"; // Green
      default:
        return "#888888"; // Default gray
    }
  }

  /**
   * Get status label for UI
   * @param status - Station issue status
   * @returns Human-readable status label
   */
  getStatusLabel(status: StationIssueStatus): string {
    switch (status) {
      case "REPORTED":
        return "Reported";
      case "ACKNOWLEDGED":
        return "Acknowledged";
      case "IN_PROGRESS":
        return "In Progress";
      case "RESOLVED":
        return "Resolved";
      default:
        return status;
    }
  }

  /**
   * Get priority color for UI
   * @param priority - Station issue priority
   * @returns Hex color code
   */
  getPriorityColor(priority: StationIssuePriority): string {
    switch (priority) {
      case "LOW":
        return "#4caf50"; // Green
      case "MEDIUM":
        return "#ffc107"; // Yellow
      case "HIGH":
        return "#ff9800"; // Orange
      case "CRITICAL":
        return "#dc3545"; // Red
      default:
        return "#888888"; // Default gray
    }
  }

  /**
   * Get priority label for UI
   * @param priority - Station issue priority
   * @returns Human-readable priority label
   */
  getPriorityLabel(priority: StationIssuePriority): string {
    return priority.charAt(0) + priority.slice(1).toLowerCase();
  }

  /**
   * Get issue type color for UI
   * @param issueType - Station issue type
   * @returns Hex color code
   */
  getIssueTypeColor(issueType: StationIssueType): string {
    switch (issueType) {
      case "DIRTY":
        return "#795548"; // Brown
      case "WRONG_LOCATION":
        return "#ff9800"; // Orange
      case "OFFLINE":
        return "#dc3545"; // Red
      case "DAMAGED":
        return "#e91e63"; // Pink/Red
      case "SLOTS_ERROR":
        return "#ffc107"; // Yellow
      case "AMENITY_ISSUE":
        return "#2196f3"; // Blue
      default:
        return "#888888"; // Default gray
    }
  }

  /**
   * Get issue type label for UI
   * @param issueType - Station issue type
   * @returns Human-readable issue type label
   */
  getIssueTypeLabel(issueType: StationIssueType): string {
    const labels: Record<StationIssueType, string> = {
      DIRTY: "Dirty",
      WRONG_LOCATION: "Wrong Location",
      OFFLINE: "Offline",
      DAMAGED: "Damaged",
      SLOTS_ERROR: "Slots Error",
      AMENITY_ISSUE: "Amenity Issue",
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
   * Export station issues data to CSV format
   * @param issues - Array of station issue items
   * @returns CSV string
   */
  exportToCSV(issues: StationIssueListItem[]): string {
    const headers = [
      "Issue ID",
      "Station Name",
      "Station Serial",
      "Reporter Name",
      "Reporter Email",
      "Assigned To",
      "Issue Type",
      "Priority",
      "Status",
      "Description",
      "Reported At",
      "Resolved At",
    ];

    const rows = issues.map((issue) => [
      issue.id,
      issue.station_name,
      issue.station_serial,
      issue.reporter_name,
      issue.reporter_email,
      issue.assigned_to_name || "Unassigned",
      this.getIssueTypeLabel(issue.issue_type),
      this.getPriorityLabel(issue.priority),
      this.getStatusLabel(issue.status),
      issue.description,
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
   * @param issues - Array of station issue items
   * @param filename - Output filename
   */
  downloadCSV(
    issues: StationIssueListItem[],
    filename: string = "station_issues.csv",
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
   * Validate station issue filters
   * @param filters - Station issue filters
   * @returns Validation result
   */
  validateFilters(filters: StationIssueFilters): {
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
export const stationIssuesService = new StationIssuesService();
export default stationIssuesService;
