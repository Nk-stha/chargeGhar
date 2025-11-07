"use client";

import React from "react";
import styles from "./MonitorRentalsCard.module.css";
import { FiClock, FiZap, FiMapPin } from "react-icons/fi";
import { useDashboardData } from "../../contexts/DashboardDataContext";

interface Rental {
    station_name: string;
    user_phone: string;
    duration: string; // e.g. "25 mins"
    status: "Active" | "Completed" | "Pending";
}

const MonitorRentals: React.FC = () => {
    const { dashboardData, loading, error } = useDashboardData();

    if (loading) {
        return (
            <div className={styles.card}>
                <h2>Monitor Rentals</h2>
                <div className={styles.loading}>Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.card}>
                <h2>Monitor Rentals</h2>
                <div className={styles.error}>Failed to load data</div>
            </div>
        );
    }

    const rentals: Rental[] =
        dashboardData?.dashboard?.monitor_rentals || [
            {
                station_name: "Station A",
                user_phone: "9800000001",
                duration: "20 mins",
                status: "Active",
            },
            {
                station_name: "Station B",
                user_phone: "9800000002",
                duration: "Completed",
                status: "Completed",
            },
            {
                station_name: "Station C",
                user_phone: "9800000003",
                duration: "5 mins",
                status: "Active",
            },
            {
                station_name: "Station D",
                user_phone: "9800000004",
                duration: "Pending",
                status: "Pending",
            },
        ];

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h2>Monitor Rentals</h2>
                <span className={styles.subtitle}>Live Overview</span>
            </div>

            <div className={styles.list}>
                {rentals.map((rental: Rental, index: number) => (
                    <div key={index} className={styles.item}>
                        <div className={styles.iconContainer}>
                            <FiZap className={styles.icon} />
                        </div>
                        <div className={styles.details}>
                            <h3>{rental.station_name}</h3>
                            <p>
                                <FiMapPin size={14} /> {rental.user_phone}
                            </p>
                        </div>
                        <div className={styles.duration}>
                            <FiClock size={14} /> {rental.duration}
                        </div>
                        <div
                            className={`${styles.status} ${rental.status === "Active"
                                ? styles.active
                                : rental.status === "Completed"
                                    ? styles.completed
                                    : styles.pending
                                }`}
                        >
                            {rental.status}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MonitorRentals;
