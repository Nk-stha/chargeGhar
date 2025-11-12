export type FeeType = "MULTIPLIER" | "FLAT_RATE" | "COMPOUND";

export interface LateFeeConfiguration {
  id: string;
  name: string;
  fee_type: FeeType;
  fee_type_display: string;
  multiplier: string;
  flat_rate_per_hour: string;
  grace_period_minutes: number;
  max_daily_rate: string;
  is_active: boolean;
  applicable_package_types: string[];
  metadata: Record<string, any>;
  description_text: string;
  created_at: string;
  updated_at: string;
}

export interface LateFeeConfigPagination {
  current_page: number;
  total_pages: number;
  total_count: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
  next_page: number | null;
  previous_page: number | null;
}

export interface LateFeeConfigSummary {
  total_configurations: number;
  active_configurations: number;
  inactive_configurations: number;
}

export interface LateFeeConfigsResponse {
  success: boolean;
  message: string;
  data: {
    configurations: LateFeeConfiguration[];
    pagination: LateFeeConfigPagination;
    summary: LateFeeConfigSummary;
  };
}

export interface LateFeeConfigResponse {
  success: boolean;
  message: string;
  data: {
    configuration: LateFeeConfiguration;
  };
}

export interface CreateLateFeeConfigRequest {
  name: string;
  fee_type: FeeType;
  multiplier?: number;
  flat_rate_per_hour?: number;
  grace_period_minutes?: number;
  max_daily_rate?: number;
  is_active?: boolean;
  applicable_package_types?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateLateFeeConfigRequest {
  name?: string;
  fee_type?: FeeType;
  multiplier?: number;
  flat_rate_per_hour?: number;
  grace_period_minutes?: number;
  max_daily_rate?: number;
  is_active?: boolean;
  applicable_package_types?: string[];
  metadata?: Record<string, any>;
}

export interface DeleteLateFeeConfigResponse {
  success: boolean;
  message: string;
  data: {
    deleted_configuration: string;
    message: string;
  };
}
