import instance from "../axios";

/**
 * Config Interface
 */
export interface ConfigItem {
  value: string;
  description: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConfigsData {
  [key: string]: ConfigItem;
}

/**
 * API Response Types
 */
export interface ConfigListResponse {
  success: boolean;
  message: string;
  data: {
    configs: ConfigsData;
    total_count: number;
  };
}

export interface ConfigDetailResponse {
  success: boolean;
  message: string;
  data: {
    config_id: string;
    key: string;
    value: string;
    is_active: boolean;
    message: string;
  };
}

export interface ConfigDeleteResponse {
  success: boolean;
  message: string;
  data: {
    deleted_key: string;
    message: string;
  };
}

/**
 * Create/Update Config Request
 */
export interface CreateConfigRequest {
  key: string;
  value: string;
  description?: string;
  is_active: boolean;
}

export interface UpdateConfigRequest {
  config_id?: string;
  key?: string;
  value?: string;
  description?: string;
  is_active?: boolean;
}

/**
 * Config Service
 * Handles all API calls related to configuration management
 */
class ConfigService {
  private baseUrl = "/api/admin/config";

  /**
   * Get all configurations
   * @returns Configurations list
   */
  async getConfigs(): Promise<ConfigListResponse> {
    const response = await instance.get<ConfigListResponse>(this.baseUrl);
    return response.data;
  }

  /**
   * Create a new configuration
   * @param data - Config creation data
   * @returns Created config
   */
  async createConfig(data: CreateConfigRequest): Promise<ConfigDetailResponse> {
    try {
      const formData = new FormData();
      formData.append("key", data.key);
      formData.append("value", data.value);
      formData.append("is_active", data.is_active ? "True" : "False");

      if (data.description) {
        formData.append("description", data.description);
      }

      const response = await instance.post<ConfigDetailResponse>(
        this.baseUrl,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Update an existing configuration
   * @param data - Config update data
   * @returns Updated config
   */
  async updateConfig(data: UpdateConfigRequest): Promise<ConfigDetailResponse> {
    try {
      const formData = new FormData();

      if (data.config_id) {
        formData.append("config_id", data.config_id);
      }

      if (data.key) {
        formData.append("key", data.key);
      }

      if (data.value !== undefined) {
        formData.append("value", data.value);
      }

      if (data.description !== undefined) {
        formData.append("description", data.description);
      }

      if (data.is_active !== undefined) {
        formData.append("is_active", data.is_active ? "True" : "False");
      }

      const response = await instance.put<ConfigDetailResponse>(
        this.baseUrl,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Delete a configuration entry
   * @param configId - Config ID (UUID) or key
   * @param isKey - Whether the identifier is a key (true) or config_id (false)
   * @returns Deletion confirmation
   */
  async deleteConfig(
    identifier: string,
    isKey: boolean = false,
  ): Promise<ConfigDeleteResponse> {
    const params = new URLSearchParams();
    if (isKey) {
      params.append("key", identifier);
    } else {
      params.append("config_id", identifier);
    }

    const response = await instance.delete<ConfigDeleteResponse>(
      `${this.baseUrl}?${params.toString()}`,
    );
    return response.data;
  }

  /**
   * Download configs as CSV
   * @param configs - Configs data
   * @param filename - Output filename
   */
  downloadCSV(configs: ConfigsData, filename: string): void {
    const headers = [
      "Key",
      "Value",
      "Description",
      "Is Public",
      "Created At",
      "Updated At",
    ];

    const rows = Object.entries(configs).map(([key, config]) => [
      key,
      config.value,
      config.description,
      config.is_public ? "Yes" : "No",
      config.created_at,
      config.updated_at,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const configService = new ConfigService();
