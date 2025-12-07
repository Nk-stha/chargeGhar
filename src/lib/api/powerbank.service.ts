import instance from "../axios";
import {
    PowerBankListResponse,
    PowerBankDetailResponse,
    PowerBankHistoryResponse,
    StatusUpdateResponse,
    PowerBankAnalyticsResponse,
    PowerBankFilters,
    PowerBankStatus,
    PowerBankListItem,
} from "../../types/powerbank.types";

/**
 * PowerBank Service
 * Handles all API calls related to powerbank management
 */
class PowerBankService {
    private baseUrl = "/api/admin/powerbanks";

    // Get list of all powerbanks with optional filters
    async getPowerBanks(
        filters?: PowerBankFilters
    ): Promise<PowerBankListResponse> {
        const params = new URLSearchParams();

        if (filters?.status) params.append("status", filters.status);
        if (filters?.page) params.append("page", filters.page.toString());
        if (filters?.page_size)
            params.append("page_size", filters.page_size.toString());

        const queryString = params.toString();
        const url = `${this.baseUrl}${queryString ? `?${queryString}` : ""}`;

        const response = await instance.get(url);
        return response.data;
    }

    // Get single powerbank details by ID
    async getPowerBankDetail(
        powerbankId: string
    ): Promise<PowerBankDetailResponse> {
        const response = await instance.get(`${this.baseUrl}/${powerbankId}`);
        return response.data;
    }

    // Get powerbank rental history
    async getPowerBankHistory(
        powerbankId: string,
        page?: number,
        pageSize?: number
    ): Promise<PowerBankHistoryResponse> {
        const params = new URLSearchParams();
        if (page) params.append("page", page.toString());
        if (pageSize) params.append("page_size", pageSize.toString());

        const queryString = params.toString();
        const url = `${this.baseUrl}/${powerbankId}/history${queryString ? `?${queryString}` : ""}`;

        const response = await instance.get(url);
        return response.data;
    }

    // Update powerbank status
    async updatePowerBankStatus(
        powerbankId: string,
        status: "AVAILABLE" | "MAINTENANCE" | "DAMAGED",
        reason?: string
    ): Promise<StatusUpdateResponse> {
        const formData = new FormData();
        formData.append("status", status);
        if (reason) {
            formData.append("reason", reason);
        }

        const response = await instance.post(
            `${this.baseUrl}/${powerbankId}/status`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return response.data;
    }

    // Get powerbank fleet analytics
    async getAnalytics(): Promise<PowerBankAnalyticsResponse> {
        const response = await instance.get(`${this.baseUrl}/analytics`);
        return response.data;
    }

    // Helper: Get powerbanks by status
    async getPowerBanksByStatus(
        status: PowerBankStatus,
        page?: number
    ): Promise<PowerBankListResponse> {
        return this.getPowerBanks({ status, page });
    }

    // Helper: Get status color for UI
    getStatusColor(status: PowerBankStatus): string {
        const colors: Record<PowerBankStatus, string> = {
            AVAILABLE: "#22c55e",
            RENTED: "#3b82f6",
            MAINTENANCE: "#eab308",
            DAMAGED: "#ef4444",
        };
        return colors[status] || "#9ca3af";
    }

    // Helper: Get status background color for UI
    getStatusBgColor(status: PowerBankStatus): string {
        const colors: Record<PowerBankStatus, string> = {
            AVAILABLE: "rgba(34, 197, 94, 0.1)",
            RENTED: "rgba(59, 130, 246, 0.1)",
            MAINTENANCE: "rgba(234, 179, 8, 0.1)",
            DAMAGED: "rgba(239, 68, 68, 0.1)",
        };
        return colors[status] || "rgba(156, 163, 175, 0.1)";
    }

    // Helper: Get rental status color
    getRentalStatusColor(status: string): string {
        const colors: Record<string, string> = {
            ACTIVE: "#22c55e",
            OVERDUE: "#ef4444",
            COMPLETED: "#9ca3af",
            CANCELLED: "#6b7280",
        };
        return colors[status] || "#9ca3af";
    }

    // Helper: Get rental status background color
    getRentalStatusBgColor(status: string): string {
        const colors: Record<string, string> = {
            ACTIVE: "rgba(34, 197, 94, 0.1)",
            OVERDUE: "rgba(239, 68, 68, 0.1)",
            COMPLETED: "rgba(156, 163, 175, 0.1)",
            CANCELLED: "rgba(107, 114, 128, 0.1)",
        };
        return colors[status] || "rgba(156, 163, 175, 0.1)";
    }

    // Helper: Format date for display
    formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    }

    // Helper: Format date time for display
    formatDateTime(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    // Helper: Get time ago string
    getTimeAgo(dateString: string): string {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 60) {
            return `${diffMins} min${diffMins !== 1 ? "s" : ""} ago`;
        } else if (diffHours < 24) {
            return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
        } else if (diffDays < 7) {
            return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
        } else {
            return this.formatDate(dateString);
        }
    }

    // Helper: Format battery level with color
    getBatteryColor(level: number): string {
        if (level >= 70) return "#22c55e";
        if (level >= 30) return "#eab308";
        return "#ef4444";
    }

    // Helper: Get battery icon level
    getBatteryLevel(level: number): "high" | "medium" | "low" {
        if (level >= 70) return "high";
        if (level >= 30) return "medium";
        return "low";
    }

    // Helper: Format currency
    formatCurrency(amount: string): string {
        const num = parseFloat(amount);
        return `NPR ${num.toLocaleString("en-NP", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    // Helper: Calculate utilization rate color
    getUtilizationColor(rate: number): string {
        if (rate >= 70) return "#22c55e";
        if (rate >= 40) return "#eab308";
        return "#ef4444";
    }

    // Helper: Check if powerbank needs attention
    needsAttention(powerbank: PowerBankListItem): boolean {
        return (
            powerbank.battery_level < 20 ||
            powerbank.status === "DAMAGED" ||
            powerbank.status === "MAINTENANCE"
        );
    }
}

// Export singleton instance
export const powerBankService = new PowerBankService();
export default powerBankService;
