import React from "react";
import { useRouter } from "next/navigation";
import styles from "./RecentTransactions.module.css";
import { useRecentTransactions } from "../../hooks/useRecentTransactions";
import { Transaction } from "../../types/dashboard.types";
import Skeleton from "../ui/Skeleton";

const RecentTransactions: React.FC = () => {
  const router = useRouter();
  const { transactions, loading, error } = useRecentTransactions(5);

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
              {[1, 2, 3, 4, 5].map((_, idx) => (
                <tr key={idx}>
                  <td><Skeleton width="60%" height={20} /></td>
                  <td><Skeleton width="40%" height={20} /></td>
                  <td><Skeleton width="30%" height={20} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
