import axiosInstance from "../axios";

export interface CheckStationStatusRequest {
  station_id: string;
  include_empty?: boolean;
  checkAll?: boolean;
}

export interface EjectPowerbankRequest {
  station_id: string;
  powerbank_sn?: string;
  reason?: string;
}

export interface RebootStationRequest {
  station_id: string;
}

export interface CheckStationStatusResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface EjectPowerbankResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface RebootStationResponse {
  success: boolean;
  message: string;
  data?: {
    station_id: string;
    station_imei: string;
    action_type: string;
    is_successful: boolean;
    message: string;
    iot_history_id: string;
  };
}

export interface ScanWiFiRequest {
  station_id: string;
}

export interface ScanWiFiResponse {
  success: boolean;
  message: string;
  data?: {
    station_id: string;
    station_imei: string;
    action_type: string;
    networks: string[];
    message: string;
    iot_history_id: string;
  };
}

export interface ConnectWiFiRequest {
  station_id: string;
  wifi_ssid: string;
  wifi_password?: string;
}

export interface ConnectWiFiResponse {
  success: boolean;
  message: string;
  data?: {
    station_id: string;
    station_imei: string;
    action_type: string;
    wifi_ssid: string;
    is_successful: boolean;
    message: string;
    iot_history_id: string;
  };
}

export interface SetVolumeRequest {
  station_id: string;
  volume: number;
}

export interface SetVolumeResponse {
  success: boolean;
  message: string;
  data?: {
    station_id: string;
    station_imei: string;
    action_type: string;
    volume: number;
    is_successful: boolean;
    message: string;
    iot_history_id: string;
  };
}

export interface SetNetworkModeRequest {
  station_id: string;
  mode: "wifi" | "4g";
}

export interface SetNetworkModeResponse {
  success: boolean;
  message: string;
  data?: {
    station_id: string;
    station_imei: string;
    action_type: string;
    mode: string;
    is_successful: boolean;
    message: string;
    iot_history_id: string;
  };
}

class IotService {
  /**
   * Check station status
   */
  async checkStationStatus(
    params: CheckStationStatusRequest
  ): Promise<CheckStationStatusResponse> {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const formData = new FormData();
      formData.append("station_id", params.station_id);
      
      if (params.include_empty !== undefined) {
        formData.append("include_empty", params.include_empty.toString());
      }
      
      if (params.checkAll !== undefined) {
        formData.append("checkAll", params.checkAll.toString());
      }

      const response = await axiosInstance.post(
        "/api/internal/iot/check",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Eject powerbank from station
   */
  async ejectPowerbank(
    params: EjectPowerbankRequest
  ): Promise<EjectPowerbankResponse> {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const formData = new FormData();
      formData.append("station_id", params.station_id);
      
      if (params.powerbank_sn) {
        formData.append("powerbank_sn", params.powerbank_sn);
      }
      
      if (params.reason) {
        formData.append("reason", params.reason);
      }

      const response = await axiosInstance.post(
        "/api/internal/iot/eject",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Reboot station
   */
  async rebootStation(
    params: RebootStationRequest
  ): Promise<RebootStationResponse> {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const formData = new FormData();
      formData.append("station_id", params.station_id);

      const response = await axiosInstance.post(
        "/api/internal/iot/reboot",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Scan WiFi networks
   */
  async scanWiFi(params: ScanWiFiRequest): Promise<ScanWiFiResponse> {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const formData = new FormData();
      formData.append("station_id", params.station_id);

      const response = await axiosInstance.post(
        "/api/internal/iot/wifi/scan",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Connect to WiFi network
   */
  async connectWiFi(
    params: ConnectWiFiRequest
  ): Promise<ConnectWiFiResponse> {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const formData = new FormData();
      formData.append("station_id", params.station_id);
      formData.append("wifi_ssid", params.wifi_ssid);

      if (params.wifi_password) {
        formData.append("wifi_password", params.wifi_password);
      }

      const response = await axiosInstance.post(
        "/api/internal/iot/wifi/connect",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Set station volume
   */
  async setVolume(params: SetVolumeRequest): Promise<SetVolumeResponse> {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const formData = new FormData();
      formData.append("station_id", params.station_id);
      formData.append("volume", params.volume.toString());

      const response = await axiosInstance.post(
        "/api/internal/iot/volume",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Set station network mode
   */
  async setNetworkMode(
    params: SetNetworkModeRequest
  ): Promise<SetNetworkModeResponse> {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const formData = new FormData();
      formData.append("station_id", params.station_id);
      formData.append("mode", params.mode);

      const response = await axiosInstance.post(
        "/api/internal/iot/mode",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      throw error;
    }
  }
}

const iotService = new IotService();
export default iotService;
