import instance from "../axios";
import {
  ApiResponse,
  MediaListResponse,
  Media,
  MediaFilters,
  UploadMediaInput,
  MediaFileType,
} from "../../types/station.types";

/**
 * Media Service
 * Handles all API calls related to media uploads (images, videos, documents)
 */

class MediaService {
  private baseUrl = "/api/admin/media/uploads";

  /**
   * Get list of all media uploads with optional filters
   */
  async getMediaList(
    filters?: MediaFilters
  ): Promise<ApiResponse<MediaListResponse>> {
    const params = new URLSearchParams();

    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.page_size) params.append("page_size", filters.page_size.toString());
    if (filters?.type) params.append("type", filters.type);
    if (filters?.user_id) params.append("user_id", filters.user_id);

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

    const response = await instance.get<ApiResponse<MediaListResponse>>(url);
    return response.data;
  }

  /**
   * Upload new media file
   */
  async uploadMedia(data: UploadMediaInput): Promise<ApiResponse<Media>> {
    const formData = new FormData();
    formData.append("file", data.file);
    formData.append("file_type", data.file_type);

    const response = await instance.post<ApiResponse<Media>>(
      this.baseUrl,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  /**
   * Upload multiple media files
   */
  async uploadMultipleMedia(
    files: File[],
    fileType: MediaFileType
  ): Promise<ApiResponse<Media>[]> {
    const uploadPromises = files.map((file) =>
      this.uploadMedia({ file, file_type: fileType })
    );

    return Promise.all(uploadPromises);
  }

  /**
   * Get images only (helper method)
   */
  async getImages(filters?: Omit<MediaFilters, "type">): Promise<ApiResponse<MediaListResponse>> {
    return this.getMediaList({ ...filters, type: "IMAGE" });
  }

  /**
   * Get videos only (helper method)
   */
  async getVideos(filters?: Omit<MediaFilters, "type">): Promise<ApiResponse<MediaListResponse>> {
    return this.getMediaList({ ...filters, type: "VIDEO" });
  }

  /**
   * Get documents only (helper method)
   */
  async getDocuments(filters?: Omit<MediaFilters, "type">): Promise<ApiResponse<MediaListResponse>> {
    return this.getMediaList({ ...filters, type: "DOCUMENT" });
  }

  /**
   * Helper method to validate file before upload
   */
  validateFile(file: File, maxSizeMB: number = 10): { valid: boolean; error?: string } {
    const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds ${maxSizeMB}MB limit`,
      };
    }

    return { valid: true };
  }

  /**
   * Helper to determine file type from file extension
   */
  getFileTypeFromFile(file: File): MediaFileType {
    const extension = file.name.split(".").pop()?.toLowerCase();

    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"];
    const videoExtensions = ["mp4", "avi", "mov", "wmv", "flv", "mkv", "webm"];
    const documentExtensions = ["pdf", "doc", "docx", "xls", "xlsx", "txt", "csv"];

    if (imageExtensions.includes(extension || "")) {
      return "IMAGE";
    } else if (videoExtensions.includes(extension || "")) {
      return "VIDEO";
    } else if (documentExtensions.includes(extension || "")) {
      return "DOCUMENT";
    }

    // Default to IMAGE if can't determine
    return "IMAGE";
  }
}

// Export singleton instance
export const mediaService = new MediaService();
export default mediaService;
