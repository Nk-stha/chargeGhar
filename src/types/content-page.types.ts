/**
 * Content Page Types
 */

export type PageType = 
  | "terms-of-service"
  | "privacy-policy"
  | "about"
  | "contact"
  | "renting-policy";

export interface ContentPage {
  id: string;
  page_type: PageType;
  title: string;
  content: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * API Response Types
 */
export interface ContentPagesListResponse {
  success: boolean;
  message: string;
  data: ContentPage[];
}

export interface ContentPageDetailResponse {
  success: boolean;
  message: string;
  data: ContentPage;
}

/**
 * Update Content Page Request
 */
export interface UpdateContentPageRequest {
  page_type: PageType;
  title: string;
  content: string;
  is_active: boolean;
}
