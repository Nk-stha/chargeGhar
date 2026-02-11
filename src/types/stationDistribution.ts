// Station Distribution Types — matches GET /api/admin/partners/stations response

export interface StationDistribution {
    id: string;
    station_id: string;
    station_name: string;
    station_code: string;
    partner_id: string;
    partner_name: string;
    partner_code: string;
    distribution_type: "CHARGEGHAR_TO_VENDOR" | "CHARGEGHAR_TO_FRANCHISE";
    effective_date: string;
    expiry_date: string | null;
    is_active: boolean;
    created_at: string;
}

export interface StationDistributionParams {
    page?: number;
    page_size?: number;
    search?: string;
    is_active?: boolean;
}

export interface StationDistributionListResponse {
    success: boolean;
    message: string;
    data: {
        results: StationDistribution[];
        count: number;
        page: number;
        page_size: number;
        total_pages: number;
    };
}
