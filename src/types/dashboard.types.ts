// Shared interfaces
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

// Transaction Types
export interface User {
    id: string;
    username?: string;
    email?: string;
}

export interface Transaction {
    id: string;
    user?: string | User;
    user_phone?: string;
    amount?: number;
    payment_method?: string;
    status?: string;
    transaction_type?: string;
    created_at?: string;
    updated_at?: string;
}

// Analytics Types
export type AnalyticsPeriod = "daily" | "weekly" | "monthly" | "yearly";

export interface ChartDataPoint {
    label: string;
    rental_revenue: number;
    rental_due_revenue: number;
    topup_revenue: number;
    fine_revenue: number;
    total: number;
}

export interface RevenueData {
    total_revenue: number;
    currency: string;
    period: string;
    start_date: string;
    end_date: string;
    chart_data: ChartDataPoint[];
}

export interface Pagination {
    current_page: number;
    total_pages: number;
    total_count: number;
    page_size: number;
    has_next: boolean;
    has_previous: boolean;
}

export interface PaymentAnalyticsSummary {
    total_revenue: number;
    total_transactions: number;
    rental_revenue: number;
    topup_revenue: number;
}

export interface ChartDataSet {
    labels: string[];
    values: number[];
    counts?: number[];
    percentages?: number[];
}

export interface PaymentMethodsBreakdown {
    wallet: number;
    gateway: number;
    points: number;
    combination: number;
}

export interface TopUser {
    user_id: string;
    username: string;
    email: string;
    total_transaction_amount: number;
    rental_payment_amount: number;
    topup_amount: number;
    wallet_balance: number;
    rental_count: number;
    transaction_count: number;
    payment_methods: PaymentMethodsBreakdown;
    gateways_used: {
        khalti: number;
        esewa: number;
        stripe: number;
    };
}

export interface PaymentAnalyticsData {
    summary: PaymentAnalyticsSummary;
    overall_payment_methods: ChartDataSet;
    gateway_breakdown: ChartDataSet;
    top_10_users: TopUser[];
    revenue_breakdown_chart: ChartDataSet;
    payment_method_by_transaction_type: {
        rentals: PaymentMethodsBreakdown;
        topups: PaymentMethodsBreakdown;
    };
}

export interface PowerBankRentalSummary {
    total_rentals: number;
    active_rentals: number;
    overdue_rentals: number;
    completed_rentals: number;
    cancelled_rentals: number;
}

export interface RentalCycles {
    total_completed: number;
    duration_unit: string;
    average_duration: number;
    longest_duration: number;
    shortest_duration: number;
    average_display: string;
    longest_display: string;
    shortest_display: string;
}

export interface RentalTrendDataset {
    label: string;
    data: number[];
}

export interface RentalTrendChart {
    labels: string[];
    period: string;
    datasets: RentalTrendDataset[];
}

export interface PowerBankRentalAnalyticsData {
    summary: PowerBankRentalSummary;
    rental_status_chart: ChartDataSet;
    payment_methods_for_rentals: ChartDataSet;
    gateway_breakdown_for_rentals: ChartDataSet;
    rental_cycles: RentalCycles;
    rental_trend_chart: RentalTrendChart;
}

export interface StationSummary {
    total_stations: number;
    online_stations: number;
    offline_stations: number;
    maintenance_stations: number;
    total_slots: number;
    occupied_slots: number;
    utilization_rate: number;
}

export interface TopStation {
    station_id: string;
    station_name: string;
    serial_number: string;
    total_rentals: number;
    total_revenue: number;
    total_slots: number;
    occupied_slots: number;
    utilization_rate: number;
    average_rental_duration: number;
    status: string;
    address: string;
    payment_methods: PaymentMethodsBreakdown;
}

export interface StationPerformanceData {
    summary: StationSummary;
    top_10_stations: TopStation[];
    station_revenue_chart: RentalTrendChart;
    station_rental_count_chart: RentalTrendChart;
    station_status_distribution: ChartDataSet;
    utilization_trend: RentalTrendChart;
}

export interface UserAnalyticsSummary {
    total_users: number;
    active_users: number;
    inactive_users: number;
    suspended_users: number;
    new_users_today: number;
    new_users_this_week: number;
    new_users_this_month: number;
}

export interface UserAnalyticsData {
    summary: UserAnalyticsSummary;
    user_growth_chart: RentalTrendChart; // Reusing structure: labels, period, datasets
    user_status_chart: ChartDataSet;     // Reusing structure: labels, values
}

export interface PaginatedResponse<T> {
    results: T[];
    pagination: Pagination;
}
