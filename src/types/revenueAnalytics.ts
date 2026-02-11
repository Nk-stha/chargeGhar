// Revenue Analytics Types — matches GET /api/admin/revenue response

export interface RevenueTransaction {
    id: string;
    created_at: string;
    gross_amount: string;
    vat_amount: string;
    service_charge: string;
    net_amount: string;
    chargeghar_share: string;
    franchise_share: string;
    vendor_share: string;
    is_distributed: boolean;
    distributed_at: string | null;
    transaction_id: string;
    transaction_status: "SUCCESS" | "PENDING" | "FAILED" | "REFUNDED";
    payment_method: string;
    user_email: string | null;
    rental_code: string | null;
    rental_status: string | null;
    started_at: string | null;
    ended_at: string | null;
    station_name: string;
    station_sn: string;
    franchise_code: string | null;
    franchise_name: string | null;
    vendor_code: string | null;
    vendor_name: string | null;
    is_reversal: boolean;
    reversal_reason: string | null;
}

export interface RevenueAnalyticsSummary {
    total_transactions: number;
    total_gross: number;
    total_vat: number;
    total_service_charge: number;
    total_net: number;
    total_chargeghar_share: number;
    total_franchise_share: number;
    total_vendor_share: number;
}

export interface RevenueAnalyticsPagination {
    current_page: number;
    total_pages: number;
    total_count: number;
    page_size: number;
    has_next: boolean;
    has_previous: boolean;
    next_page: number | null;
    previous_page: number | null;
}

export interface RevenueAnalyticsParams {
    page?: number;
    page_size?: number;
    search?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
}

export interface RevenueAnalyticsListResponse {
    success: boolean;
    message: string;
    data: {
        results: RevenueTransaction[];
        pagination: RevenueAnalyticsPagination;
        summary: RevenueAnalyticsSummary;
    };
}
