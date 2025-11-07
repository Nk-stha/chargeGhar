"use client";

import React, { useState, useEffect } from "react";
import styles from "./transactions.module.css";
import { FiDownload, FiFilter } from "react-icons/fi";

const transactions = [
    { id: "1", user: "9812345678", amount: 500, method: "Discover", status: "Pending", date: "2025-09-08" },
    { id: "2", user: "9801234567", amount: 500, method: "Khalti", status: "Failed", date: "2025-09-07" },
    { id: "3", user: "9865345678", amount: 500, method: "Visa", status: "Success", date: "2025-09-06" },
    { id: "4", user: "9823456789", amount: 500, method: "Esewa", status: "Success", date: "2025-09-05" },
    { id: "5", user: "9817345678", amount: 500, method: "TopupOut", status: "Failed", date: "2025-09-04" },
];

const statusColors: Record<string, string> = {
    Success: "green",
    Pending: "yellow",
    Failed: "red",
};

const Transactions: React.FC = () => {
    const [filter, setFilter] = useState("All");
    const [sortBy, setSortBy] = useState("date");
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // ✅ Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setDropdownOpen(false);
        if (dropdownOpen) document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [dropdownOpen]);

    // ✅ Filter logic
    const filtered = filter === "All" ? transactions : transactions.filter(t => t.status === filter);

    // ✅ Sort logic
    const sorted = [...filtered].sort((a, b) => {
        if (sortBy === "amount") return b.amount - a.amount;
        if (sortBy === "status") return a.status.localeCompare(b.status);
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    // ✅ CSV download
    const downloadCSV = () => {
        const headers = ["Transaction ID", "User", "Amount", "Method", "Status", "Date"];
        const rows = sorted.map(t => [t.id, t.user, `Rs.${t.amount}`, t.method, t.status, t.date]);
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "transactions.csv";
        a.click();
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Transactions</h1>
            <p className={styles.subtitle}>View and Manage all the current and past transactions.</p>

            <div className={styles.filters}>
                {["All", "Success", "Pending", "Failed"].map(f => (
                    <button
                        key={f}
                        className={`${styles.filterButton} ${filter === f ? styles.active : ""}`}
                        onClick={() => setFilter(f)}
                    >
                        {f}
                    </button>
                ))}

                {/* ✅ Sort Dropdown */}
                <div
                    className={styles.sortWrapper}
                    onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
                >
                    <button className={styles.sortButton} onClick={() => setDropdownOpen(!dropdownOpen)}>
                        <FiFilter /> <span>Sort By</span>
                    </button>

                    {dropdownOpen && (
                        <div className={styles.dropdown}>
                            <div
                                className={`${styles.dropdownItem} ${sortBy === "date" ? styles.selected : ""}`}
                                onClick={() => {
                                    setSortBy("date");
                                    setDropdownOpen(false);
                                }}
                            >
                                Date
                            </div>
                            <div
                                className={`${styles.dropdownItem} ${sortBy === "amount" ? styles.selected : ""}`}
                                onClick={() => {
                                    setSortBy("amount");
                                    setDropdownOpen(false);
                                }}
                            >
                                Amount
                            </div>
                            <div
                                className={`${styles.dropdownItem} ${sortBy === "status" ? styles.selected : ""}`}
                                onClick={() => {
                                    setSortBy("status");
                                    setDropdownOpen(false);
                                }}
                            >
                                Status
                            </div>
                        </div >
                    )
                    }
                </div >
            </div >

            {/* ✅ Table */}
            < div className={styles.tableWrapper} >
                <div className={styles.tableHeader}>
                    <h3>Recent Transactions</h3>
                    <button className={styles.csvButton} onClick={downloadCSV}>
                        <FiDownload /> Export as CSV
                    </button>
                </div>

                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Transaction ID</th>
                            <th>User</th>
                            <th>Amount</th>
                            <th>Method</th>
                            <th>Status</th>
                            <th>Date/Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.map((t, i) => (
                            <tr key={i}>
                                <td>{t.id}</td>
                                <td>{t.user}</td>
                                <td>Rs. {t.amount}</td>
                                <td>{t.method}</td>
                                <td>
                                    <span
                                        className={styles.statusDot}
                                        style={{ backgroundColor: statusColors[t.status] }}
                                    ></span>{" "}
                                    {t.status}
                                </td>
                                <td>{t.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div >
        </div >
    );
};

export default Transactions;