// Station Issues Types for Admin Dashboard

/**
 * Station Issue Status Types
 */
export type StationIssueStatus =
  | "REPORTED"
  | "ACKNOWLEDGED"
  | "IN_PROGRESS"
  | "RESOLVED";

/**
 * Station Issue Priority Types
 */
export type StationIssuePriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

/**
 * Station Issue Type Enum
 */
export type StationIssueType =
  | "DIRTY"
  | "WRONG_LOCATION"
  | "OFFLINE"
  | "DAMAGED"
  | "SLOTS_ERROR"
  | "AMENITY_ISSUE";

/**
 * Station Issue List Item (from list endpoint)
 */
export interface StationIssueListItem {
  id: string;
  station_name: string;
  station_serial: string;
  reporter_name: string;
  reporter_email: string;
  assigned_to_name: string | null;
  issue_type: StationIssueType;
  description: string;
  priority: StationIssuePriority;
  status: StationIssueStatus;
  images: {
    image?: string;
    [key: string]: string | undefined;
  };
  reported_at: string;
  resolved_at: string | null;
}

/**
 * Reporter information in issue detail
 */
export interface StationIssueReporter {
  id: string;
  email: string;
  username: string;
  phone_number: string | null;
}

/**
 * Assigned admin information in issue detail
 */
export interface StationIssueAssignedTo {
  id: string;
  email: string;
  username: string;
}

/**
 * Station information in issue detail
 */
export interface StationIssueStation {
  id: string;
  station_name: string;
  serial_number: string;
  address: string;
  status: string;
}

/**
 * Station Issue Detail (from detail endpoint)
 */
export interface StationIssueDetail {
  id: string;
  issue_type: StationIssueType;
  description: string;
  priority: StationIssuePriority;
  status: StationIssueStatus;
  images: {
    image?: string;
    [key: string]: string | undefined;
  };
  reported_at: string;
  resolved_at: string | null;
  station: StationIssueStation;
  reporter: StationIssueReporter;
  assigned_to: StationIssueAssignedTo | null;
  notes?: string;
}

/**
 * Station Issues List Response
 */
export interface StationIssuesListResponse {
  success: boolean;
  message: string;
  data: StationIssueListItem[];
}

/**
 * Station Issue Detail Response
 */
export interface StationIssueDetailResponse {
  success: boolean;
  message: string;
  data: StationIssueDetail;
}

/**
 * Update Station Issue Request
 */
export interface UpdateStationIssueRequest {
  status?: StationIssueStatus;
  priority?: StationIssuePriority;
  assigned_to_id?: string;
  notes?: string;
}

/**
 * Update Station Issue Response
 */
export interface UpdateStationIssueResponse {
  success: boolean;
  message: string;
  data: StationIssueDetail;
}

/**
 * Delete Station Issue Response
 */
export interface DeleteStationIssueResponse {
  success: boolean;
  message: string;
  data: {
    message: string;
  };
}

/**
 * Station Issue Filters
 */
export interface StationIssueFilters {
  status?: StationIssueStatus;
  priority?: StationIssuePriority;
  issue_type?: StationIssueType;
  station_id?: string;
  assigned_to_id?: string;
  search?: string;
  start_date?: string;
  end_date?: string;
}

/**
 * API Error Response
 */
export interface StationIssueErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

/**
 * Generic API Response Type
 */
export type StationIssueApiResponse<T> = T | StationIssueErrorResponse;
