import axiosInstance from "@/lib/axios";

export interface AvailableStation {
  id: string;
  station_name: string;
  serial_number: string;
  address: string;
  status: "ONLINE" | "OFFLINE";
}

export interface AvailableStationsResponse {
  success: boolean;
  message: string;
  data: AvailableStation[];
}

export const availableStationsService = {
  /**
   * Get list of stations not assigned to any partner
   * Includes cache-busting timestamp to ensure fresh data
   */
  async getAvailableStations(): Promise<AvailableStationsResponse> {
    try {
      const token = localStorage.getItem("accessToken");
      // Add timestamp to bust cache and force fresh data
      const timestamp = new Date().getTime();
      const response = await axiosInstance.get<AvailableStationsResponse>(
        `/api/admin/partners/stations/available?t=${timestamp}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
