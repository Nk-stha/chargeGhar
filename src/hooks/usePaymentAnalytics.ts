import { useState, useEffect } from "react";
import { analyticsService } from "../lib/api/analytics.service";
import { PaymentAnalyticsData } from "../types/dashboard.types";

export const usePaymentAnalytics = () => {
    const [data, setData] = useState<PaymentAnalyticsData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await analyticsService.getPaymentAnalytics();

            if (response.success) {
                setData(response.data);
            } else {
                setError("Failed to fetch payment analytics");
            }
        } catch (err: any) {
            console.error("Error fetching payment analytics:", err);
            setError(err.response?.data?.message || "Error loading payment data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return { data, loading, error, refetch: fetchData };
};
