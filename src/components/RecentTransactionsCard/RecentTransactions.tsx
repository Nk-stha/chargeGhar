import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./RecentTransactions.module.css";
import instance from "../../lib/axios";

interface User {
  id: string;
  username?: string;
  email?: string;
}

interface Transaction {
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

interface Pagination {
  current_page: number;
  total_pages: number;
  total_count: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    results: Transaction[];
    pagination: Pagination;
  };
}

const RecentTransactions: React.FC = () => {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecentTransactions();
  }, []);

  const fetchRecentTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch only 5 most recent transactions
      const response = await instance.get<ApiResponse>(
        "/api/admin/transactions?page=1&page_size=5",
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

  const getUserDisplay = (transaction: Transaction): string => {
    if (
      transaction.user &&
      typeof transaction.user === "object" &&
      transaction.user.username
    ) {
      return transaction.user.username;
    }
    if (transaction.user_phone) {
      return transaction.user_phone;
    }
    if (transaction.user && typeof transaction.user === "string") {
      return transaction.user;
    }
    return "N/A";
  };

  const getStatusClassName = (status: string | undefined): string => {
    if (!status) return styles.statusFailed;
    const normalizedStatus = status.toUpperCase();
    if (
      normalizedStatus === "SUCCESS" ||
      normalizedStatus === "COMPLETED" ||
      normalizedStatus === "PAID"
    ) {
      return styles.statusPaid;
    }
    return styles.statusFailed;
  };

  const getAmountDisplay = (amount: number | undefined | null): string => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return "Rs. 0.00";
    }
    return `Rs. ${amount.toFixed(2)}`;
  };

  const handleViewAllTransactions = () => {
    router.push("/dashboard/transactions");
  };

  if (loading) {
    return (
      <div className={styles.card}>
        <h2>Recent Transactions</h2>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.card}>
        <h2>Recent Transactions</h2>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <h2>Recent Transactions</h2>
        </div>
        <div className={styles.noData}>No transactions found</div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h2>Recent Transactions</h2>
        <span className={styles.subtitle} onClick={handleViewAllTransactions}>
          Advanced Report →
        </span>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn: Transaction) => (
              <tr key={txn.id}>
                <td>{getUserDisplay(txn)}</td>
                <td>{getAmountDisplay(txn.amount)}</td>
                <td className={getStatusClassName(txn.status)}>
                  {txn.status || "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentTransactions;
