import instance from "../axios";
import {
  ApiResponse,
  StationsListResponse,
  Station,
  StationDetail,
  StationFilters,
  CreateStationInput,
  UpdateStationInput,
} from "../../types/station.types";

/**
 * Stations Service
 * Handles all API calls related to charging stations
 */

class StationsService {
  private baseUrl = "/api/admin/stations";

  /**
   * Get list of all stations with optional filters
   */
  async getStations(
    filters?: StationFilters
  ): Promise<ApiResponse<StationsListResponse>> {
    const params = new URLSearchParams();

    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.page_size) params.append("page_size", filters.page_size.toString());
    if (filters?.search) params.append("search", filters.search);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.is_maintenance !== undefined)
      params.append("is_maintenance", filters.is_maintenance.toString());
    if (filters?.start_date) params.append("start_date", filters.start_date);
    if (filters?.end_date) params.append("end_date", filters.end_date);

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

    const response = await instance.get<ApiResponse<StationsListResponse>>(url);
    return response.data;
  }

  /**
   * Get single station details by serial number
   */
  async getStation(stationSn: string): Promise<ApiResponse<StationDetail>> {
    const response = await instance.get<ApiResponse<StationDetail>>(
      `${this.baseUrl}/${stationSn}`
    );
    return response.data;
  }

  /**
   * Create new station
   */
  async createStation(
    data: CreateStationInput
  ): Promise<ApiResponse<StationDetail>> {
    const requestBody = {
      station_name: data.station_name,
      serial_number: data.serial_number,
      imei: data.imei,
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address,
      landmark: data.landmark || null,
      total_slots: data.total_slots,
      status: data.status,
      is_maintenance: data.is_maintenance,
      hardware_info: data.hardware_info || {},
      amenity_ids: data.amenity_ids || [],
      media_ids: data.media_ids || [],
    };

    const response = await instance.post<ApiResponse<StationDetail>>(
      this.baseUrl,
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  }

  /**
   * Update existing station
   */
  async updateStation(
    stationSn: string,
    data: UpdateStationInput
  ): Promise<ApiResponse<Station>> {
    const formData = new FormData();

    if (data.station_name !== undefined)
      formData.append("station_name", data.station_name);
    if (data.latitude !== undefined)
      formData.append("latitude", data.latitude.toString());
    if (data.longitude !== undefined)
      formData.append("longitude", data.longitude.toString());
    if (data.address !== undefined)
      formData.append("address", data.address);
    if (data.landmark !== undefined)
      formData.append("landmark", data.landmark);
    if (data.status !== undefined)
      formData.append("status", data.status);
    if (data.is_maintenance !== undefined)
      formData.append("is_maintenance", data.is_maintenance.toString());
    if (data.hardware_info !== undefined)
      formData.append("hardware_info", JSON.stringify(data.hardware_info));
    if (data.amenity_ids !== undefined)
      formData.append("amenity_ids", JSON.stringify(data.amenity_ids));
    if (data.media_ids !== undefined)
      formData.append("media_ids", JSON.stringify(data.media_ids));

    const response = await instance.patch<ApiResponse<Station>>(
      `${this.baseUrl}/${stationSn}`,
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
   * Delete station (soft delete)
   */
  async deleteStation(
    stationSn: string
  ): Promise<ApiResponse<{ message: string }>> {
    const response = await instance.delete<ApiResponse<{ message: string }>>(
      `${this.baseUrl}/${stationSn}`
    );
    return response.data;
  }

  /**
   * Get online stations only (helper method)
   */
  async getOnlineStations(
    filters?: Omit<StationFilters, "status">
  ): Promise<ApiResponse<StationsListResponse>> {
    return this.getStations({ ...filters, status: "ONLINE" });
  }

  /**
   * Get offline stations only (helper method)
   */
  async getOfflineStations(
    filters?: Omit<StationFilters, "status">
  ): Promise<ApiResponse<StationsListResponse>> {
    return this.getStations({ ...filters, status: "OFFLINE" });
  }

  /**
   * Get stations in maintenance (helper method)
   */
  async getMaintenanceStations(
    filters?: Omit<StationFilters, "is_maintenance">
  ): Promise<ApiResponse<StationsListResponse>> {
    return this.getStations({ ...filters, is_maintenance: true });
  }

  /**
   * Search stations by name or address
   */
  async searchStations(
    query: string,
    filters?: Omit<StationFilters, "search">
  ): Promise<ApiResponse<StationsListResponse>> {
    return this.getStations({ ...filters, search: query });
  }

  /**
   * Validate station data before creation/update
   */
  validateStationData(data: Partial<CreateStationInput>): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validate station name
    if (data.station_name !== undefined && data.station_name.trim().length < 3) {
      errors.push("Station name must be at least 3 characters long");
    }

    // Validate serial number
    if (data.serial_number !== undefined && data.serial_number.trim().length === 0) {
      errors.push("Serial number is required");
    }

    // Validate IMEI
    if (data.imei !== undefined && data.imei.trim().length === 0) {
      errors.push("IMEI is required");
    }

    // Validate coordinates
    if (data.latitude !== undefined) {
      const lat = Number(data.latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        errors.push("Latitude must be between -90 and 90");
      }
    }

    if (data.longitude !== undefined) {
      const lng = Number(data.longitude);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        errors.push("Longitude must be between -180 and 180");
      }
    }

    // Validate address
    if (data.address !== undefined && data.address.trim().length < 5) {
      errors.push("Address must be at least 5 characters long");
    }

    // Validate total slots
    if (data.total_slots !== undefined) {
      if (data.total_slots < 1 || data.total_slots > 100) {
        errors.push("Total slots must be between 1 and 100");
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate station utilization percentage
   */
  calculateUtilization(station: Station): number {
    if (station.total_slots === 0) return 0;
    return Math.round(
      ((station.total_slots - station.available_slots) / station.total_slots) * 100
    );
  }

  /**
   * Get station status color for UI
   */
  getStatusColor(status: string): string {
    switch (status.toUpperCase()) {
      case "ONLINE":
        return "#47b216"; // Green
      case "OFFLINE":
        return "#dc3545"; // Red
      case "MAINTENANCE":
        return "#ffc107"; // Yellow
      default:
        return "#6c757d"; // Gray
    }
  }

  /**
   * Format station address for display
   */
  formatAddress(station: Station): string {
    if (station.landmark) {
      return `${station.address}, ${station.landmark}`;
    }
    return station.address;
  }

  /**
   * Check if station needs maintenance based on heartbeat
   */
  needsMaintenance(station: Station): boolean {
    if (station.is_maintenance) return true;

    if (!station.last_heartbeat) return true;

    const lastHeartbeat = new Date(station.last_heartbeat);
    const now = new Date();
    const hoursSinceHeartbeat = (now.getTime() - lastHeartbeat.getTime()) / (1000 * 60 * 60);

    // If no heartbeat in 24 hours, needs maintenance
    return hoursSinceHeartbeat > 24;
  }
}

// Export singleton instance
export const stationsService = new StationsService();
export default stationsService;
