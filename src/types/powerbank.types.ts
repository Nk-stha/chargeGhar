/**
 * PowerBank Types
 * Type definitions for PowerBank management feature
 */

// PowerBank Status
export type PowerBankStatus = "AVAILABLE" | "RENTED" | "MAINTENANCE" | "DAMAGED";

// Rental Status
export type RentalStatus = "ACTIVE" | "OVERDUE" | "COMPLETED" | "CANCELLED";

// Payment Status
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

// Pagination
export interface Pagination {
    current_page: number;
    total_pages: number;
    total_count: number;
    page_size: number;
    has_next: boolean;
    has_previous: boolean;
    next_page: number | null;
    previous_page: number | null;
}

// Current Rental Info (for list view)
export interface CurrentRentalInfo {
    rental_code: string;
    user_id: string;
    username: string;
    started_at: string;
    due_at: string;
    status: RentalStatus;
}

// Station Info (for list view)
export interface StationInfo {
    id: string;
    name: string;
    serial_number: string;
    address?: string;
}

// Slot Info
export interface SlotInfo {
    id: string;
    slot_number: number;
    status?: string;
}

// PowerBank List Item
export interface PowerBankListItem {
    id: string;
    serial_number: string;
    model: string;
    capacity_mah: number;
    status: PowerBankStatus;
    battery_level: number;
    rental_count: number;
    total_cycles: string;
    total_rentals: number;
    current_station: StationInfo | null;
    current_slot: SlotInfo | null;
    current_rental: CurrentRentalInfo | null;
    last_updated: string;
}

// PowerBank List Response
export interface PowerBankListResponse {
    success: boolean;
    message: string;
    data: {
        results: PowerBankListItem[];
        pagination: Pagination;
    };
}

// User Info (for detail view)
export interface UserInfo {
    id: string;
    username: string;
    email: string | null;
}

// Pickup Station Info
export interface PickupStationInfo {
    id: string;
    name: string;
}

// Package Info
export interface PackageInfo {
    name: string;
    duration_minutes: number;
    price: string;
}

// Current Rental Detail
export interface CurrentRentalDetail {
    rental_code: string;
    user: UserInfo;
    pickup_station: PickupStationInfo;
    package: PackageInfo;
    started_at: string;
    due_at: string;
    status: RentalStatus;
    payment_status: PaymentStatus;
}

// Hardware Info
export interface HardwareInfo {
    version: string;
    manufacturer: string;
    current?: number;
    voltage?: number;
    temperature?: number;
    area_code?: string;
    micro_switch?: string;
    solenoid_valve?: string;
    soft_version?: string;
    hard_version?: string;
}

// PowerBank Statistics
export interface PowerBankStatistics {
    total_rentals: number;
    completed_rentals: number;
    total_revenue: string;
}

// Lifecycle Info
export interface LifecycleInfo {
    total_cycles: string;
    total_rentals: number;
    avg_cycles_per_rental: string;
    avg_discharge_per_rental: string;
    recent_cycle_logs?: Array<{
        cycles: number;
        discharge: number;
        timestamp: string;
    }>;
}

// Recent History Item
export interface RecentHistoryItem {
    rental_code: string;
    user: string;
    pickup_station: string;
    return_station: string | null;
    started_at: string;
    ended_at: string | null;
    status: RentalStatus;
    amount_paid: string;
}

// PowerBank Detail
export interface PowerBankDetail {
    id: string;
    serial_number: string;
    model: string;
    capacity_mah: number;
    status: PowerBankStatus;
    battery_level: number;
    hardware_info: HardwareInfo;
    current_station: StationInfo | null;
    current_slot: SlotInfo | null;
    current_rental: CurrentRentalDetail | null;
    statistics: PowerBankStatistics;
    lifecycle?: LifecycleInfo;
    recent_history: RecentHistoryItem[];
    last_updated: string;
    created_at: string;
}

// PowerBank Detail Response
export interface PowerBankDetailResponse {
    success: boolean;
    message: string;
    data: PowerBankDetail;
}

// History Package Info
export interface HistoryPackageInfo {
    name: string;
    duration_minutes: number;
}

// History Item
export interface HistoryItem {
    rental_code: string;
    user: UserInfo;
    pickup_station: PickupStationInfo;
    return_station: PickupStationInfo | null;
    package: HistoryPackageInfo;
    started_at: string;
    ended_at: string | null;
    due_at: string;
    status: RentalStatus;
    payment_status: PaymentStatus;
    amount_paid: string;
    overdue_amount: string;
    is_returned_on_time: boolean;
}

// PowerBank Info (for history response)
export interface PowerBankInfo {
    serial_number: string;
    model: string;
}

// PowerBank History Response
export interface PowerBankHistoryResponse {
    success: boolean;
    message: string;
    data: {
        results: HistoryItem[];
        pagination: Pagination;
        powerbank: PowerBankInfo;
    };
}

// Status Update Request
export interface StatusUpdateRequest {
    status: "AVAILABLE" | "MAINTENANCE" | "DAMAGED";
    reason?: string;
}

// Status Update Response
export interface StatusUpdateResponse {
    success: boolean;
    message: string;
    data: {
        powerbank_id: string;
        serial_number: string;
        new_status: PowerBankStatus;
        message: string;
    };
}

// Analytics Status Breakdown
export interface StatusBreakdown {
    available: number;
    rented: number;
    maintenance: number;
    damaged: number;
}

// Analytics Overview
export interface AnalyticsOverview {
    total_powerbanks: number;
    status_breakdown: StatusBreakdown;
    needs_attention: number;
    avg_battery_level: number;
}

// Analytics Utilization
export interface AnalyticsUtilization {
    total_rentals: number;
    active_rentals: number;
    completed_rentals: number;
    total_revenue: string;
    utilization_rate: number;
}

// Top Performer
export interface TopPerformer {
    serial_number: string;
    model: string;
    status: PowerBankStatus;
    rental_count: number;
    total_cycles: string;
    revenue: string;
}

// Station Distribution
export interface StationDistribution {
    station: string;
    count: number;
}

// Analytics Data
export interface AnalyticsData {
    overview: AnalyticsOverview;
    utilization: AnalyticsUtilization;
    top_performers: TopPerformer[];
    station_distribution: StationDistribution[];
}

// Analytics Response
export interface PowerBankAnalyticsResponse {
    success: boolean;
    message: string;
    data: AnalyticsData;
}

// PowerBank Filters
export interface PowerBankFilters {
    status?: PowerBankStatus;
    page?: number;
    page_size?: number;
}
