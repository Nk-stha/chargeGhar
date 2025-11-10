// Banner Types for Admin Dashboard

/**
 * Banner Data Structure
 */
export interface Banner {
  id: string;
  title: string;
  description: string;
  image_url: string;
  redirect_url: string | null;
  display_order: number;
  is_active: boolean;
  valid_from: string;
  valid_until: string;
  created_at: string;
  updated_at: string;
  is_currently_active: boolean;
  days_remaining: number;
}

/**
 * Banner List Response
 */
export interface BannerListResponse {
  success: boolean;
  message: string;
  data: Banner[];
}

/**
 * Banner Detail Response
 */
export interface BannerDetailResponse {
  success: boolean;
  message: string;
  data: Banner;
}

/**
 * Create Banner Request
 */
export interface CreateBannerRequest {
  title: string;
  description?: string;
  image_url: string;
  redirect_url?: string;
  display_order?: number;
  is_active?: boolean;
  valid_from: string;
  valid_until: string;
}

/**
 * Update Banner Request
 */
export interface UpdateBannerRequest {
  title: string;
  description?: string;
  image_url: string;
  redirect_url?: string;
  display_order?: number;
  is_active?: boolean;
  valid_from: string;
  valid_until: string;
}

/**
 * Delete Banner Response
 */
export interface DeleteBannerResponse {
  success: boolean;
  message: string;
  data: {
    deleted: boolean;
  };
}

/**
 * Banner Error Response
 */
export interface BannerErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

/**
 * Generic API Response Type
 */
export type BannerApiResponse<T> = T | BannerErrorResponse;
