import instance from "../axios";
import { StationDistributionListResponse, StationDistributionParams } from "../../types/stationDistribution";

export const getStationDistributions = async (
    params: StationDistributionParams
): Promise<StationDistributionListResponse> => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.page_size) queryParams.append("page_size", params.page_size.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.is_active !== undefined) queryParams.append("is_active", params.is_active.toString());

    const response = await instance.get(`/api/admin/partners/stations?${queryParams.toString()}`);
    return response.data;
};

export const deactivateStationDistribution = async (
    distributionId: string
): Promise<{ success: boolean; message: string }> => {
    const response = await instance.delete(`/api/admin/partners/stations/${distributionId}`);
    return response.data;
};
