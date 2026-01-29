"use client";

import { useState, useEffect } from "react";
import { FiUsers, FiDollarSign } from "react-icons/fi";
import { MdHandshake } from "react-icons/md";
import styles from "./PartnerManagement.module.css";
import { getPartners } from "../../lib/api/partners";

interface Stats {
  totalVendors: number;
  activePartnerships: number;
  aggregatedEarnings: number;
}

const PartnerStats: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalVendors: 0,
    activePartnerships: 0,
    aggregatedEarnings: 0.0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await getPartners({ page: 1, page_size: 1 });
        
        if (response.success) {
          setStats({
            totalVendors: response.data.count,
            activePartnerships: response.data.count,
            aggregatedEarnings: 0.0, // Backend doesn't provide this yet
          });
        }
      } catch (error) {
        console.error("Failed to fetch partner stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Total Vendors */}
      <div className={styles.statCard}>
        <span className={styles.statLabel}>Total Partners</span>
        <div className={styles.statContent}>
          <span className={styles.statValue}>
            {loading ? "..." : stats.totalVendors}
          </span>
          <div className={styles.statIcon}>
            <FiUsers />
          </div>
        </div>
      </div>

      {/* Active Partnerships */}
      <div className={styles.statCard}>
        <span className={styles.statLabel}>Active Partnerships</span>
        <div className={styles.statContent}>
          <span className={styles.statValue}>
            {loading ? "..." : stats.activePartnerships}
          </span>
          <div className={styles.statIcon}>
            <MdHandshake />
          </div>
        </div>
      </div>

      {/* Aggregated Earnings */}
      <div className={styles.statCard}>
        <span className={styles.statLabel}>Aggregated Earnings</span>
        <div className={styles.statContent}>
          <div className="flex flex-col">
            <span className="text-[10px] text-[#54bc28] font-bold tracking-wider mb-0.5 opacity-80">
              NPR
            </span>
            <span className={styles.statValue}>
              {loading ? "..." : formatCurrency(stats.aggregatedEarnings)}
            </span>
          </div>
          <div className={styles.statIcon}>
            <FiDollarSign />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerStats;
