// Rental Issues Types for Admin Dashboard

/**
 * Rental Issue Status Types
 */
export type RentalIssueStatus = "REPORTED" | "RESOLVED";

/**
 * Rental Issue Type Enum
 */
export type RentalIssueType =
  | "POWER_BANK_LOST"
  | "CHARGING_ISSUE"
  | "DAMAGED_DEVICE"
  | "NOT_RETURNED"
  | "STATION_MALFUNCTION"
  | "OTHER";

/**
 * Rental Issue List Item (from list endpoint)
 */
export interface RentalIssueListItem {
  id: string;
  rental_code: string;
  user_email: string;
  user_name: string;
  issue_type: RentalIssueType;
  description: string;
  status: RentalIssueStatus;
  images: {
    image?: string;
    [key: string]: string | undefined;
  };
  reported_at: string;
  resolved_at: string | null;
  station_name: string;
  power_bank_serial: string;
}

/**
 * User information in issue detail
 */
export interface RentalIssueUser {
  id: string;
  email: string;
  username: string;
  phone_number: string | null;
}

/**
 * Station information in issue detail
 */
export interface RentalIssueStation {
  id: string;
  name: string;
  serial_number: string;
}

/**
 * Power bank information in issue detail
 */
export interface RentalIssuePowerBank {
  id: string;
  serial_number: string;
}

/**
 * Rental information in issue detail
 */
export interface RentalIssueRental {
  id: string;
  rental_code: string;
  status: string;
  started_at: string | null;
  ended_at: string | null;
  station: RentalIssueStation;
  return_station: RentalIssueStation;
  power_bank: RentalIssuePowerBank;
}

/**
 * Rental Issue Detail (from detail endpoint)
 */
export interface RentalIssueDetail {
  id: string;
  issue_type: RentalIssueType;
  description: string;
  status: RentalIssueStatus;
  images: {
    image?: string;
    [key: string]: string | undefined;
  };
  reported_at: string;
  resolved_at: string | null;
  rental: RentalIssueRental;
  user: RentalIssueUser;
  notes?: string;
}

/**
 * Rental Issues List Response
 */
export interface RentalIssuesListResponse {
  success: boolean;
  message: string;
  data: RentalIssueListItem[];
}

/**
 * Rental Issue Detail Response
 */
export interface RentalIssueDetailResponse {
  success: boolean;
  message: string;
  data: RentalIssueDetail;
}

/**
 * Update Rental Issue Request
 */
export interface UpdateRentalIssueRequest {
  status?: RentalIssueStatus;
  notes?: string;
}

/**
 * Update Rental Issue Response
 */
export interface UpdateRentalIssueResponse {
  success: boolean;
  message: string;
  data: RentalIssueDetail;
}

/**
 * Delete Rental Issue Response
 */
export interface DeleteRentalIssueResponse {
  success: boolean;
  message: string;
  data: {
    message: string;
  };
}

/**
 * Rental Issue Filters
 */
export interface RentalIssueFilters {
  status?: RentalIssueStatus;
  issue_type?: RentalIssueType;
  search?: string;
  start_date?: string;
  end_date?: string;
}

/**
 * API Error Response
 */
export interface RentalIssueErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

/**
 * Generic API Response Type
 */
export type RentalIssueApiResponse<T> = T | RentalIssueErrorResponse;
