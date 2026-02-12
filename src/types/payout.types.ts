export type PayoutType = "CHARGEGHAR_TO_FRANCHISE" | "CHARGEGHAR_TO_VENDOR";
export type PayoutStatus = "PENDING" | "PROCESSING" | "APPROVED" | "COMPLETED" | "REJECTED";

export interface PayoutRequest {
  id: string;
  partner_id: string;
  partner_name: string;
  partner_code: string;
  payout_type: PayoutType;
  amount: string;
  net_amount: string;
  bank_name: string | null;
  account_number: string | null;
  account_holder_name: string | null;
  status: PayoutStatus;
  reference_id: string;
  created_at: string;
  processed_at: string | null;
  processed_by_name: string | null;
}

export interface PayoutDetail extends PayoutRequest {
  vat_deducted: string;
  service_charge_deducted: string;
  rejection_reason: string;
  admin_notes: string;
  updated_at: string;
}

export interface PayoutListResponse {
  success: boolean;
  message: string;
  data: {
    results: PayoutRequest[];
    count: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
}

export interface PayoutDetailResponse {
  success: boolean;
  message: string;
  data: PayoutDetail;
}

export interface PayoutFilters {
  page?: number;
  page_size?: number;
  partner_id?: string;
  payout_type?: PayoutType;
  status?: PayoutStatus;
}
