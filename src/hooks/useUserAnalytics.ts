import { useState, useEffect, useRef } from "react";
import { analyticsService } from "../lib/api/analytics.service";
import { UserAnalyticsData } from "../types/dashboard.types";

export const useUserAnalytics = () => {
    const [data, setData] = useState<UserAnalyticsData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Use ref to track mounted state so it's accessible in refetch
    const isMounted = useRef(false);

    useEffect(() => {
        isMounted.current = true;

        const fetchData = async () => {
            // ... existing fetchData logic ...
            try {
                if (isMounted.current) {
                    setLoading(true);
                    setError(null);
                }

                const response = await analyticsService.getUserAnalytics();

                if (isMounted.current) {
                    if (response.success) {
                        setData(response.data);
                    } else {
                        setError("Failed to fetch user analytics");
                    }
                }
            } catch (err: any) {
                console.error("Error fetching user analytics:", err);
                if (isMounted.current) {
                    setError(err.response?.data?.message || "Error loading user data.");
                }
            } finally {
                if (isMounted.current) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted.current = false;
        };
    }, []);

    // Helper to manually refetch if needed
    const refetch = async () => {
        if (isMounted.current) {
            setLoading(true);
            setError(null);
        }

        try {
            const response = await analyticsService.getUserAnalytics();
            if (isMounted.current) {
                if (response.success) {
                    setData(response.data);
                } else {
                    setError("Failed to fetch user analytics");
                }
            }
        } catch (err: any) {
            if (isMounted.current) {
                setError(err.response?.data?.message || "Error loading user data.");
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    };

    return { data, loading, error, refetch };
};
