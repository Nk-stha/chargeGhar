"use client";

import React from "react";
import styles from "./RecentUpdates.module.css";
import { FiInfo, FiCheckCircle, FiAlertTriangle } from "react-icons/fi";
import { useDashboardData } from "../../contexts/DashboardDataContext";

interface Update {
    title: string;
    message: string;
    time: string;
    type: "info" | "success" | "warning";
}

const RecentUpdates: React.FC = () => {
    const { dashboardData, loading, error } = useDashboardData();

    if (loading) {
        return (
            <div className={styles.card}>
                <h2>Recent Updates</h2>
                <div className={styles.loading}>Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.card}>
                <h2>Recent Updates</h2>
                <div className={styles.error}>Failed to load updates</div>
            </div>
        );
    }

    const updates: Update[] =
        dashboardData?.dashboard?.recent_updates || [
            {
                title: "New Station Added",
                message: "Station 12, Kathmandu added successfully.",
                time: "2 hours ago",
                type: "success",
            },
            {
                title: "Maintenance Required",
                message: "Station 4 showing irregular voltage readings.",
                time: "5 hours ago",
                type: "warning",
            },
            {
                title: "System Info",
                message: "Backend server uptime is 99.8% this week.",
                time: "1 day ago",
                type: "info",
            },
        ];

    const getIcon = (type: string) => {
        switch (type) {
            case "success":
                return <FiCheckCircle className={styles.successIcon} />;
            case "warning":
                return <FiAlertTriangle className={styles.warningIcon} />;
            default:
                return <FiInfo className={styles.infoIcon} />;
        }
    };

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h2>Recent Updates</h2>
                <span className={styles.subtitle}>System Logs</span>
            </div>

            <div className={styles.list}>
                {updates.map((update: Update, index: number) => (
                    <div key={index} className={styles.updateItem}>
                        <div className={styles.iconContainer}>{getIcon(update.type)}</div>
                        <div className={styles.details}>
                            <h3>{update.title}</h3>
                            <p>{update.message}</p>
                            <span className={styles.time}>{update.time}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentUpdates;
