import React from "react";
import styles from "./RecentTransactions.module.css";
import { useDashboardData } from "../../contexts/DashboardDataContext";

// 👇 define types
interface Transaction {
    user_phone: string;
    amount: number;
    status: string;
}

const RecentTransactions: React.FC = () => {
    const { dashboardData, loading, error } = useDashboardData();

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
                <div className={styles.error}>Failed to load data</div>
            </div>
        );
    }

    const transactions: Transaction[] =
        dashboardData?.dashboard?.recent_transactions || [
            { user_phone: "9000000001", amount: 850, status: "Paid" },
            { user_phone: "9000000002", amount: 210, status: "Failed" },
            { user_phone: "9000000003", amount: 400, status: "Paid" },
            { user_phone: "9000000004", amount: 250, status: "Failed" },
            { user_phone: "9000000005", amount: 520, status: "Paid" },
        ];

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h2>Recent Transactions</h2>
                <span className={styles.subtitle}>Advanced Report →</span>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>User Phone</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((txn: Transaction, index: number) => (
                            <tr key={index}>
                                <td>{txn.user_phone}</td>
                                <td>Rs. {txn.amount}</td>
                                <td
                                    className={
                                        txn.status.toLowerCase() === "paid"
                                            ? styles.statusPaid
                                            : styles.statusFailed
                                    }
                                >
                                    {txn.status}
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
