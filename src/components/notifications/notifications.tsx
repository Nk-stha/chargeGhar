"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "./notifications.module.css";
import { FiMoreVertical, FiBell } from "react-icons/fi";

interface NotificationItem {
    id: number;
    text: string;
    time: string;
    unread: boolean;
}

const Notifications: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
    const popupRef = useRef<HTMLDivElement>(null);

    const notifications: NotificationItem[] = [
        { id: 1, text: "User +9779000000001 has not returned power bank in time.", time: "30 min ago", unread: true },
        { id: 2, text: "Station City Mall is now active.", time: "2 hours ago", unread: false },
        { id: 3, text: "Admin user added a new package.", time: "5 hours ago", unread: false },
    ];

    const filtered = activeTab === "unread"
        ? notifications.filter((n) => n.unread)
        : notifications;

    // Close popup on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className={styles.container} ref={popupRef}>
            {/* Notification Bell */}
            <button
                className={styles.iconButton}
                onClick={() => setIsOpen((prev) => !prev)}
                aria-label="Notifications"
            >
                <FiBell className={styles.bellIcon} />
                {notifications.some((n) => n.unread) && <span className={styles.badge}></span>}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className={styles.popup}>
                    <div className={styles.header}>
                        <h3>Notifications</h3>
                        <FiMoreVertical />
                    </div>

                    <div className={styles.tabs}>
                        <button
                            className={`${styles.tab} ${activeTab === "all" ? styles.active : ""}`}
                            onClick={() => setActiveTab("all")}
                        >
                            All
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === "unread" ? styles.active : ""}`}
                            onClick={() => setActiveTab("unread")}
                        >
                            Unread
                        </button>
                    </div>

                    <div className={styles.list}>
                        {filtered.length === 0 ? (
                            <p className={styles.empty}>No notifications</p>
                        ) : (
                            filtered.map((n) => (
                                <div key={n.id} className={`${styles.notification} ${n.unread ? styles.unread : ""}`}>
                                    <span className={styles.dot}></span>
                                    <div className={styles.text}>
                                        <p>{n.text}</p>
                                        <span>{n.time}</span>
                                    </div>
                                    <FiMoreVertical className={styles.moreIcon} />
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notifications;
