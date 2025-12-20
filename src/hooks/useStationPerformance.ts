import { useState, useEffect } from "react";
import { analyticsService } from "../lib/api/analytics.service";
import { StationPerformanceData } from "../types/dashboard.types";

export const useStationPerformance = () => {
    const [data, setData] = useState<StationPerformanceData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await analyticsService.getStationPerformance();

            if (response.success) {
                setData(response.data);
            } else {
                setError("Failed to fetch station performance data");
            }
        } catch (err: any) {
            console.error("Error fetching station performance:", err);
            setError(err.response?.data?.message || "Error loading station data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return { data, loading, error, refetch: fetchData };
};
