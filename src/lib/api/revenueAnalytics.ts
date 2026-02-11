import instance from "../axios";
import { RevenueAnalyticsListResponse, RevenueAnalyticsParams } from "../../types/revenueAnalytics";

export const getRevenueAnalytics = async (
    params: RevenueAnalyticsParams
): Promise<RevenueAnalyticsListResponse> => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.page_size) queryParams.append("page_size", params.page_size.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.status) queryParams.append("status", params.status);
    if (params.start_date) queryParams.append("start_date", params.start_date);
    if (params.end_date) queryParams.append("end_date", params.end_date);

    const response = await instance.get(`/api/admin/partners/revenue-analytics?${queryParams.toString()}`);
    return response.data;
};
