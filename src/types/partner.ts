export interface Partner {
    id: string;
    code: string;
    partner_type: "FRANCHISE" | "VENDOR";
    vendor_type: string | null;
    business_name: string;
    contact_phone: string;
    contact_email: string;
    status: "ACTIVE" | "INACTIVE" | string;
    balance: string;
    total_earnings: string;
    created_at: string;
    parent_id: string | null;
    parent_name: string | null;
    user_id: number;
    user_email: string | null;
}

export interface PartnerDetail {
    id: string;
    code: string;
    partner_type: "FRANCHISE" | "VENDOR";
    vendor_type: string | null;
    business_name: string;
    contact_phone: string;
    contact_email: string;
    address: string | null;
    status: "ACTIVE" | "INACTIVE" | string;
    balance: string;
    total_earnings: string;
    created_at: string;
    updated_at: string;
    parent_id: string | null;
    parent_name: string | null;
    user_id: number;
    user_email: string | null;
    upfront_amount: string;
    revenue_share_percent: string | null;
    assigned_at: string;
    assigned_by_name: string;
    notes: string | null;
    stations_count: number;
    vendors_count: number;
    station_ids?: string[];
}

export interface PartnerListResponse {
    success: boolean;
    message: string;
    data: {
        results: Partner[];
        count: number;
        page: number;
        page_size: number;
        total_pages: number;
    };
}

export interface PartnerParams {
    page?: number;
    page_size?: number;
    search?: string;
    status?: string;
    partner_type?: string;
    vendor_type?: string;
    parent_id?: string;
}

export interface CreateFranchiseRequest {
    user_id: number;
    business_name: string;
    contact_phone: string;
    contact_email?: string;
    address?: string;
    upfront_amount?: number;
    revenue_share_percent: number;
    station_ids?: string[];
    password?: string;
    notes?: string;
}

export interface CreateVendorRequest {
    user_id: number;
    vendor_type: "REVENUE" | "NON_REVENUE";
    business_name: string;
    contact_phone: string;
    contact_email?: string;
    address?: string;
    station_id: string; // Single station UUID for vendor
    revenue_model?: "PERCENTAGE" | "FIXED";
    partner_percent?: number; // matched with reqandres.md
    fixed_amount?: number;
    password?: string;
    notes?: string;
}
