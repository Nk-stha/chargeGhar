import { useState, useEffect } from "react";
import instance from "../lib/axios";
import { Transaction, ApiResponse, PaginatedResponse } from "../types/dashboard.types";

export const useRecentTransactions = (limit: number = 5) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await instance.get<ApiResponse<PaginatedResponse<Transaction>>>(
                `/api/admin/transactions?page=1&page_size=${limit}`
            );

            if (response.data.success && response.data.data.results) {
                setTransactions(response.data.data.results);
            } else {
                setError("Failed to load transactions");
            }
        } catch (err: any) {
            console.error("Error fetching recent transactions:", err);
            setError(err.response?.data?.message || "Failed to load transactions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [limit]);

    return { transactions, loading, error, refetch: fetchTransactions };
};
