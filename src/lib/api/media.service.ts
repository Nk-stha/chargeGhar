import instance from "../axios";
import {
  Media,
  MediaFilters,
  UploadMediaInput,
  MediaFileType,
} from "../../types/station.types";

// Media List Response with Pagination
export interface MediaListResponse {
  success: boolean;
  message: string;
  data: {
    results: Media[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_count: number;
      page_size: number;
      has_next: boolean;
      has_previous: boolean;
      next_page: number | null;
      previous_page: number | null;
    };
    filters: {
      file_type: string | null;
      user_id: number | null;
    };
  };
}

// Upload Response
export interface UploadMediaResponse {
  success: boolean;
  message: string;
  data: Media;
}

// Delete Response
export interface DeleteMediaResponse {
  success: boolean;
  message: string;
  data: {
    upload_id: string;
    message: string;
  };
}

/**
 * Media Service
 * Handles all API calls related to media uploads (images, videos, documents)
 */

class MediaService {
  private baseUrl = "/api/admin/media/uploads";

  /**
   * Get list of all media uploads with optional filters
   */
  async getMediaList(filters?: MediaFilters): Promise<MediaListResponse> {
    const params = new URLSearchParams();

    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.page_size)
      params.append("page_size", filters.page_size.toString());
    if (filters?.type) params.append("type", filters.type);
    if (filters?.user_id) params.append("user_id", filters.user_id);

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

    const response = await instance.get<MediaListResponse>(url);
    return response.data;
  }

  /**
   * Upload new media file
   */
  async uploadMedia(data: UploadMediaInput): Promise<UploadMediaResponse> {
    const formData = new FormData();
    formData.append("file", data.file);
    formData.append("file_type", data.file_type);

    const response = await instance.post<UploadMediaResponse>(
      this.baseUrl,
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
   * Upload multiple media files
   */
  async uploadMultipleMedia(
    files: File[],
    fileType: MediaFileType,
  ): Promise<UploadMediaResponse[]> {
    const uploadPromises = files.map((file) =>
      this.uploadMedia({ file, file_type: fileType }),
    );

    return Promise.all(uploadPromises);
  }

  /**
   * Delete media upload by ID
   */
  async deleteMedia(uploadId: string): Promise<DeleteMediaResponse> {
    const response = await instance.delete<DeleteMediaResponse>(
      `${this.baseUrl}/${uploadId}`,
    );
    return response.data;
  }

  /**
   * Get images only (helper method)
   */
  async getImages(
    filters?: Omit<MediaFilters, "type">,
  ): Promise<MediaListResponse> {
    return this.getMediaList({ ...filters, type: "IMAGE" });
  }

  /**
   * Get videos only (helper method)
   */
  async getVideos(
    filters?: Omit<MediaFilters, "type">,
  ): Promise<MediaListResponse> {
    return this.getMediaList({ ...filters, type: "VIDEO" });
  }

  /**
   * Get documents only (helper method)
   */
  async getDocuments(
    filters?: Omit<MediaFilters, "type">,
  ): Promise<MediaListResponse> {
    return this.getMediaList({ ...filters, type: "DOCUMENT" });
  }

  /**
   * Helper method to validate file before upload
   */
  validateFile(
    file: File,
    maxSizeMB: number = 10,
  ): { valid: boolean; error?: string } {
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
    const documentExtensions = [
      "pdf",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "txt",
      "csv",
    ];

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

  /**
   * Format file size to human readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }

  /**
   * Format date/time for display
   */
  formatDateTime(
    dateString: string | undefined,
    includeTime: boolean = true,
  ): string {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";

    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };

    if (includeTime) {
      options.hour = "2-digit";
      options.minute = "2-digit";
    }

    return date.toLocaleString("en-US", options);
  }
}

// Export singleton instance
export const mediaService = new MediaService();
export default mediaService;
