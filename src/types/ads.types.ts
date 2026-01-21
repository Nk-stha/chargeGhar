// Ad Request Types for Admin Dashboard

/**
 * Ad Status Types
 */
export type AdStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "PENDING_PAYMENT"
  | "PAID"
  | "SCHEDULED"
  | "RUNNING"
  | "PAUSED"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELLED";

export type AdContentType = "IMAGE" | "VIDEO";

/**
 * Ad Request List Item
 */
export interface AdRequestListItem {
  id: string;
  user_id: string;
  user_email: string;
  user_phone: string | null;
  full_name: string;
  contact_number: string;
  title: string | null;
  description: string | null;
  status: AdStatus;
  duration_days: number | null;
  admin_price: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  approved_at: string | null;
  paid_at: string | null;
  completed_at: string | null;
  start_date: string | null;
  end_date: string | null;
  reviewed_by_name: string | null;
  approved_by_name: string | null;
  station_count: number;
}

/**
 * User Info
 */
export interface AdUser {
  id: string;
  email: string;
  username: string;
  phone_number: string | null;
}

/**
 * Admin Info
 */
export interface AdAdmin {
  id: string;
  username: string;
  email: string;
}

/**
 * Media Upload
 */
export interface AdMediaUpload {
  id: string;
  file_url: string;
  file_type: "IMAGE" | "VIDEO";
  original_name: string;
  file_size: number;
}

/**
 * Ad Content
 */
export interface AdContent {
  id: string;
  content_type: AdContentType;
  duration_seconds: number;
  display_order: number;
  is_active: boolean;
  media_upload: AdMediaUpload;
}

/**
 * Ad Station
 */
export interface AdStation {
  id: string;
  station_name: string;
  serial_number: string;
  address: string;
  status: string;
}

/**
 * Ad Transaction
 */
export interface AdTransaction {
  id: string;
  transaction_id: string;
  amount: string;
  currency: string;
  status: string;
  payment_method_type: string;
  created_at: string;
}

/**
 * Ad Request Detail
 */
export interface AdRequestDetail {
  id: string;
  user: AdUser;
  full_name: string;
  contact_number: string;
  title: string | null;
  description: string | null;
  status: AdStatus;
  duration_days: number | null;
  admin_price: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  approved_at: string | null;
  paid_at: string | null;
  completed_at: string | null;
  start_date: string | null;
  end_date: string | null;
  rejection_reason: string | null;
  admin_notes: string | null;
  reviewed_by: AdAdmin | null;
  approved_by: AdAdmin | null;
  ad_content: AdContent | null;
  stations: AdStation[];
  transaction: AdTransaction | null;
}

/**
 * Filter Types
 */
export interface AdRequestFilters {
  page?: number;
  page_size?: number;
  search?: string;
  status?: AdStatus;
  user_id?: string;
}

/**
 * Pagination Metadata
 */
export interface AdPagination {
  current_page: number;
  total_pages: number;
  total_count: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
}

/**
 * API Response Types
 */
export interface AdRequestsListResponse {
  success: boolean;
  message: string;
  data: AdRequestListItem[];
}

export interface AdRequestDetailResponse {
  success: boolean;
  message: string;
  data: AdRequestDetail;
}

/**
 * Review Ad Input
 */
export interface ReviewAdInput {
  title?: string;
  description?: string;
  duration_days?: number;
  admin_price?: string;
  admin_notes?: string;
  station_ids?: string[];
  start_date?: string;
  duration_seconds?: number;
  display_order?: number;
}

/**
 * Ad Action Types
 */
export type AdActionType =
  | "approve"
  | "reject"
  | "schedule"
  | "pause"
  | "resume"
  | "cancel"
  | "complete";

/**
 * Execute Action Input
 */
export interface ExecuteActionInput {
  action: AdActionType;
  rejection_reason?: string;
  start_date?: string;
  end_date?: string;
  reason?: string;
}

/**
 * Update Schedule Input
 */
export interface UpdateScheduleInput {
  start_date?: string;
  end_date?: string;
}

/**
 * Action Response
 */
export interface AdActionResponse {
  success: boolean;
  message: string;
  data: AdRequestDetail;
}
