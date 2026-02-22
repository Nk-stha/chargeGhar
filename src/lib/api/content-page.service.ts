import instance from "../axios";
import {
  ContentPagesListResponse,
  ContentPageDetailResponse,
  UpdateContentPageRequest,
  PageType,
} from "../../types/content-page.types";

/**
 * Content Page Service
 * Handles all API calls related to content pages management
 */
class ContentPageService {
  private baseUrl = "/api/admin/content/pages";

  /**
   * Get all content pages
   * @returns Content pages list
   */
  async getContentPages(): Promise<ContentPagesListResponse> {
    const response = await instance.get<ContentPagesListResponse>(this.baseUrl);
    return response.data;
  }

  /**
   * Get content page by type
   * @param pageType - Page type
   * @returns Content page detail
   */
  async getContentPageByType(
    pageType: PageType,
  ): Promise<ContentPageDetailResponse> {
    const response = await instance.get<ContentPageDetailResponse>(
      `${this.baseUrl}/${pageType}`,
    );
    return response.data;
  }

  /**
   * Update content page
   * @param pageType - Page type
   * @param data - Update data
   * @returns Updated content page
   */
  async updateContentPage(
    pageType: PageType,
    data: UpdateContentPageRequest,
  ): Promise<ContentPageDetailResponse> {
    const formData = new FormData();
    formData.append("page_type", data.page_type);
    formData.append("title", data.title);
    formData.append("content", data.content);
    formData.append("is_active", data.is_active ? "True" : "False");

    const response = await instance.put<ContentPageDetailResponse>(
      `${this.baseUrl}/${pageType}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  }

  /**
   * Get page type label
   */
  getPageTypeLabel(pageType: PageType): string {
    const labels: Record<PageType, string> = {
      "terms-of-service": "Terms of Service",
      "privacy-policy": "Privacy Policy",
      "about": "About Us",
      "contact": "Contact Us",
      "renting-policy": "Renting Policy",
    };
    return labels[pageType] || pageType;
  }

  /**
   * Get page type icon
   */
  getPageTypeIcon(pageType: PageType): string {
    const icons: Record<PageType, string> = {
      "terms-of-service": "⚖️",
      "privacy-policy": "🛡️",
      "about": "ℹ️",
      "contact": "📞",
      "renting-policy": "📋",
    };
    return icons[pageType] || "📄";
  }
}

export const contentPageService = new ContentPageService();
