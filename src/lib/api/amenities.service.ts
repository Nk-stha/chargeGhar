import instance from "../axios";
import {
  ApiResponse,
  AmenitiesListResponse,
  Amenity,
  AmenityFilters,
  CreateAmenityInput,
  UpdateAmenityInput,
} from "../../types/station.types";

/**
 * Amenities Service
 * Handles all API calls related to station amenities
 */

class AmenitiesService {
  private baseUrl = "/api/admin/amenities";

  /**
   * Get list of all amenities with optional filters
   */
  async getAmenities(
    filters?: AmenityFilters
  ): Promise<ApiResponse<AmenitiesListResponse>> {
    const params = new URLSearchParams();

    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.page_size) params.append("page_size", filters.page_size.toString());
    if (filters?.search) params.append("search", filters.search);
    if (filters?.is_active !== undefined) params.append("is_active", filters.is_active.toString());

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

    const response = await instance.get<ApiResponse<AmenitiesListResponse>>(url);
    return response.data;
  }

  /**
   * Get single amenity by ID
   */
  async getAmenity(amenityId: string): Promise<ApiResponse<Amenity>> {
    const response = await instance.get<ApiResponse<Amenity>>(
      `${this.baseUrl}/${amenityId}`
    );
    return response.data;
  }

  /**
   * Create new amenity
   */
  async createAmenity(
    data: CreateAmenityInput
  ): Promise<ApiResponse<Amenity>> {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("icon", data.icon);
    formData.append("description", data.description);
    formData.append("is_active", data.is_active.toString());

    const response = await instance.post<ApiResponse<Amenity>>(
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
   * Update existing amenity
   */
  async updateAmenity(
    amenityId: string,
    data: UpdateAmenityInput
  ): Promise<ApiResponse<Amenity>> {
    const formData = new FormData();

    if (data.name !== undefined) formData.append("name", data.name);
    if (data.icon !== undefined) formData.append("icon", data.icon);
    if (data.description !== undefined) formData.append("description", data.description);
    if (data.is_active !== undefined) formData.append("is_active", data.is_active.toString());

    const response = await instance.patch<ApiResponse<Amenity>>(
      `${this.baseUrl}/${amenityId}`,
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
   * Delete amenity
   */
  async deleteAmenity(amenityId: string): Promise<ApiResponse<{ message: string }>> {
    const response = await instance.delete<ApiResponse<{ message: string }>>(
      `${this.baseUrl}/${amenityId}`
    );
    return response.data;
  }

  /**
   * Get active amenities only (helper method)
   */
  async getActiveAmenities(): Promise<ApiResponse<AmenitiesListResponse>> {
    return this.getAmenities({ is_active: true });
  }
}

// Export singleton instance
export const amenitiesService = new AmenitiesService();
export default amenitiesService;
