// Analytics Types for Admin Dashboard

/**
 * Common Types
 */
export type AnalyticsPeriod = "daily" | "weekly" | "monthly";

export type TransactionType =
  | "rental"
  | "rental_due"
  | "topup"
  | "fine"
  | "all";

export type RentalStatus =
  | "completed"
  | "active"
  | "pending"
  | "cancelled"
  | "overdue"
  | "all";

/**
 * Revenue Analytics Types
 */
export interface RevenueChartDataPoint {
  date: string;
  label: string;
  total_revenue: number;
  rental_revenue: number;
  rental_due_revenue: number;
  topup_revenue: number;
  fine_revenue: number;
  transaction_count: number;
}

export interface RevenueAnalyticsData {
  period: AnalyticsPeriod;
  start_date: string;
  end_date: string;
  currency: string;
  total_revenue: number;
  chart_data: RevenueChartDataPoint[];
}

export interface RevenueAnalyticsResponse {
  success: boolean;
  message: string;
  data: RevenueAnalyticsData;
}

export interface RevenueAnalyticsFilters {
  period: AnalyticsPeriod;
  start_date?: string;
  end_date?: string;
  transaction_type?: TransactionType;
}

/**
 * Rentals Analytics Types
 */
export interface RentalChartDataPoint {
  date: string;
  label: string;
  total: number;
  completed: number;
  active: number;
  pending: number;
  cancelled: number;
  overdue: number;
}

export interface RentalAnalyticsSummary {
  avg_per_period: number;
  peak_date: string | null;
  peak_count: number;
}

export interface RentalAnalyticsData {
  period: AnalyticsPeriod;
  start_date: string;
  end_date: string;
  total_rentals: number;
  chart_data: RentalChartDataPoint[];
  summary: RentalAnalyticsSummary;
}

export interface RentalAnalyticsResponse {
  success: boolean;
  message: string;
  data: RentalAnalyticsData;
}

export interface RentalAnalyticsFilters {
  period: AnalyticsPeriod;
  start_date?: string;
  end_date?: string;
  status?: RentalStatus;
}

/**
 * API Error Response
 */
export interface AnalyticsErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

/**
 * Generic API Response
 */
export type AnalyticsApiResponse<T> = T | AnalyticsErrorResponse;
