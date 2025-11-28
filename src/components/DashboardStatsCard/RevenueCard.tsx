import React from "react";
import { FiTrendingUp, FiDollarSign } from "react-icons/fi";
import styles from "./RevenueCard.module.css";

interface Props {
    value: string | number;
    trend?: number; // percentage change
}

const RevenueCard: React.FC<Props> = ({ value, trend }) => {
    return (
        <div className={styles.revenueCard}>
            <div className={styles.header}>
                <div className={styles.iconWrapper}>
                    <FiDollarSign className={styles.icon} />
                </div>
                <div className={styles.info}>
                    <p className={styles.title}>Revenue Today</p>
                    <h2 className={styles.value}>{value}</h2>
                </div>
            </div>
            {trend !== undefined && (
                <div className={styles.trend}>
                    <FiTrendingUp className={styles.trendIcon} />
                    <span className={styles.trendText}>
                        {trend > 0 ? "+" : ""}{trend}% from yesterday
                    </span>
                </div>
            )}
        </div>
    );
};

export default RevenueCard;