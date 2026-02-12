import instance from "../axios";
import { PartnerListResponse, PartnerParams, CreateVendorRequest, CreateFranchiseRequest } from "../../types/partner";

export const getPartners = async (params: PartnerParams): Promise<PartnerListResponse> => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.page_size) queryParams.append("page_size", params.page_size.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.status) queryParams.append("status", params.status);
    if (params.partner_type) queryParams.append("partner_type", params.partner_type);
    if (params.vendor_type) queryParams.append("vendor_type", params.vendor_type);
    if (params.parent_id) queryParams.append("parent_id", params.parent_id);

    const response = await instance.get(`/api/admin/partners?${queryParams.toString()}`);
    return response.data;
};

export const getPartnerDetail = async (id: string): Promise<any> => {
    const response = await instance.get(`/api/admin/partners/${id}`);
    return response.data;
};

export const createVendor = async (data: CreateVendorRequest): Promise<any> => {
    const formData = new FormData();
    formData.append("user_id", data.user_id.toString());
    formData.append("vendor_type", data.vendor_type);
    formData.append("business_name", data.business_name);
    formData.append("contact_phone", data.contact_phone);
    if (data.contact_email) formData.append("contact_email", data.contact_email);
    if (data.address) formData.append("address", data.address);
    formData.append("station_id", data.station_id);

    if (data.vendor_type === "REVENUE") {
        if (data.revenue_model) formData.append("revenue_model", data.revenue_model);
        if (data.partner_percent !== undefined) formData.append("partner_percent", data.partner_percent.toString());
        if (data.fixed_amount !== undefined) formData.append("fixed_amount", data.fixed_amount.toString());
        if (data.password) formData.append("password", data.password);
    }
    if (data.notes) formData.append("notes", data.notes);

    const response = await instance.post("/api/admin/partners/vendor", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
};

export const createFranchise = async (data: CreateFranchiseRequest): Promise<any> => {
    const formData = new FormData();
    formData.append("user_id", data.user_id.toString());
    formData.append("business_name", data.business_name);
    formData.append("contact_phone", data.contact_phone);
    if (data.contact_email) formData.append("contact_email", data.contact_email);
    if (data.address) formData.append("address", data.address);
    if (data.upfront_amount !== undefined) formData.append("upfront_amount", data.upfront_amount.toString());
    formData.append("revenue_share_percent", data.revenue_share_percent.toString());

    if (data.station_ids && data.station_ids.length > 0) {
        data.station_ids.forEach(id => formData.append("station_ids", id));
    }

    if (data.password) formData.append("password", data.password);
    if (data.notes) formData.append("notes", data.notes);

    const response = await instance.post("/api/admin/partners/franchise", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
};

export interface UpdatePartnerRequest {
    business_name?: string;
    contact_phone?: string;
    contact_email?: string;
    address?: string;
    upfront_amount?: number;
    revenue_share_percent?: number;
    notes?: string;
    station_ids?: string[];
}

export const updatePartner = async (id: string, data: UpdatePartnerRequest): Promise<any> => {
    const formData = new FormData();
    
    if (data.business_name !== undefined) formData.append("business_name", data.business_name);
    if (data.contact_phone !== undefined) formData.append("contact_phone", data.contact_phone);
    if (data.contact_email !== undefined) formData.append("contact_email", data.contact_email);
    if (data.address !== undefined) formData.append("address", data.address);
    if (data.upfront_amount !== undefined) formData.append("upfront_amount", data.upfront_amount.toString());
    if (data.revenue_share_percent !== undefined) formData.append("revenue_share_percent", data.revenue_share_percent.toString());
    if (data.notes !== undefined) formData.append("notes", data.notes);
    if (data.station_ids && data.station_ids.length > 0) {
        data.station_ids.forEach(id => formData.append("station_ids", id));
    }

    const response = await instance.patch(`/api/admin/partners/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
};

export interface ResetPasswordRequest {
    new_password: string;
    confirm_password: string;
}

export const resetPartnerPassword = async (id: string, data: ResetPasswordRequest): Promise<any> => {
    const formData = new FormData();
    formData.append("new_password", data.new_password);
    formData.append("confirm_password", data.confirm_password);

    const response = await instance.patch(`/api/admin/partners/${id}/reset-password`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
};

export interface UpdateStatusRequest {
    status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
    reason: string;
}

export const updatePartnerStatus = async (id: string, data: UpdateStatusRequest): Promise<any> => {
    const formData = new FormData();
    formData.append("status", data.status);
    formData.append("reason", data.reason);

    const response = await instance.patch(`/api/admin/partners/${id}/status`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
};

export interface UpdateVendorTypeRequest {
    vendor_type: "REVENUE" | "NON_REVENUE";
    reason: string;
    password?: string;
    revenue_model?: "PERCENTAGE" | "FIXED";
    partner_percent?: string;
    fixed_amount?: string;
}

export const updateVendorType = async (id: string, data: UpdateVendorTypeRequest): Promise<any> => {
    const formData = new FormData();
    formData.append("vendor_type", data.vendor_type);
    formData.append("reason", data.reason);
    
    if (data.password) formData.append("password", data.password);
    if (data.revenue_model) formData.append("revenue_model", data.revenue_model);
    if (data.partner_percent) formData.append("partner_percent", data.partner_percent);
    if (data.fixed_amount) formData.append("fixed_amount", data.fixed_amount);

    const response = await instance.patch(`/api/admin/partners/${id}/vendor-type`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
};
