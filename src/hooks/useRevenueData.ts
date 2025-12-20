import { useState, useEffect } from "react";
import { analyticsService } from "../lib/api/analytics.service";
import { RevenueData, AnalyticsPeriod } from "../types/dashboard.types";

export const useRevenueData = (period: AnalyticsPeriod) => {
    const [data, setData] = useState<RevenueData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const dateRange = analyticsService.getDefaultDateRange(period);
            const response = await analyticsService.getRevenueOverTime({
                period,
                start_date: dateRange.start_date,
                end_date: dateRange.end_date,
            });

            if (response.success) {
                // Adapt the response data to match our type if necessary
                // Assuming response.data matches RevenueData structure
                setData(response.data as unknown as RevenueData);
            } else {
                setError("Failed to fetch revenue data");
            }
        } catch (err) {
            console.error("Error fetching revenue data:", err);
            setError("Error loading revenue data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [period]);

    return { data, loading, error, refetch: fetchData };
};
