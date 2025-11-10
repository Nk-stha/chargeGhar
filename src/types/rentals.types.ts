// Rentals Types for Admin Dashboard

/**
 * Rental Status Types
 */
export type RentalStatus =
  | "PENDING"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED"
  | "OVERDUE";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

/**
 * Filter Types
 */
export type RecentFilter = "today" | "24h" | "7d" | "30d";

/**
 * Rental List Item (from list endpoint)
 */
export interface RentalListItem {
  id: string;
  rental_code: string;
  status: RentalStatus;
  payment_status: PaymentStatus;
  user_id: number;
  username: string;
  user_phone: string | null;
  station_id: string;
  station_name: string;
  station_serial: string;
  return_station_id: string;
  return_station_name: string;
  powerbank_serial: string;
  package_name: string;
  package_duration: number;
  started_at: string | null;
  ended_at: string | null;
  due_at: string;
  amount_paid: string;
  overdue_amount: string;
  is_returned_on_time: boolean;
  created_at: string;
}

/**
 * Pagination Metadata
 */
export interface PaginationMeta {
  current_page: number;
  total_pages: number;
  total_count: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
  next_page: number | null;
  previous_page: number | null;
}

/**
 * Rentals List Response
 */
export interface RentalsListData {
  results: RentalListItem[];
  pagination: PaginationMeta;
}

export interface RentalsListResponse {
  success: boolean;
  message: string;
  data: RentalsListData;
}

/**
 * Rental Detail Types (from detail endpoint)
 */
export interface RentalUser {
  id: number;
  username: string;
  phone_number: string | null;
  email: string;
}

export interface RentalStation {
  id: string;
  station_name: string;
  serial_number: string;
  address: string;
}

export interface RentalPowerbank {
  id: string;
  serial_number: string;
  model: string;
  battery_level: number;
}

export interface RentalPackage {
  id: string;
  name: string;
  duration_minutes: number;
  price: string;
}

export interface RentalDetail {
  id: string;
  rental_code: string;
  status: RentalStatus;
  payment_status: PaymentStatus;
  user: RentalUser;
  station: RentalStation;
  return_station: RentalStation;
  slot_number: number;
  powerbank: RentalPowerbank;
  package: RentalPackage;
  started_at: string | null;
  ended_at: string | null;
  due_at: string;
  created_at: string;
  updated_at: string;
  amount_paid: string;
  overdue_amount: string;
  is_returned_on_time: boolean;
  timely_return_bonus_awarded: boolean;
  extensions_count: number;
  issues_count: number;
  rental_metadata: Record<string, any>;
}

export interface RentalDetailResponse {
  success: boolean;
  message: string;
  data: RentalDetail;
}

/**
 * Rental Filters
 */
export interface RentalFilters {
  page?: number;
  page_size?: number;
  status?: RentalStatus;
  payment_status?: PaymentStatus;
  user_id?: number;
  station_id?: string;
  search?: string;
  start_date?: string;
  end_date?: string;
  recent?: RecentFilter;
}

/**
 * API Error Response
 */
export interface RentalErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

/**
 * Generic API Response Type
 */
export type RentalApiResponse<T> = T | RentalErrorResponse;

/**
 * Status Badge Props for UI
 */
export interface StatusBadgeProps {
  status: RentalStatus;
  className?: string;
}

export interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  className?: string;
}
