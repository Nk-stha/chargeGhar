"use client";

import React, { useState } from "react";
import styles from "./rentals.module.css";
import { FiFilter, FiDownload, FiShoppingBag } from "react-icons/fi";

const rentalData = [
  { id: "R001", user: "U001", station: "Gwarko, Lalitpur", package: "30 Min/s", start: "03:00 PM", end: "-----", amount: "-----", status: "Active" },
  { id: "R002", user: "U002", station: "City Square Mall, Samakhushi", package: "30 Min/s", start: "02:45 PM", end: "-----", amount: "-----", status: "Overdue" },
  { id: "R003", user: "U003", station: "New Road, Sundhara", package: "1 Day/s", start: "02:17 PM", end: "-----", amount: "-----", status: "Active" },
  { id: "R004", user: "U004", station: "Paknajol, Chhetrapati", package: "1 Hr/s", start: "12:00 PM", end: "Null", amount: "Null", status: "Refunded" },
  { id: "R005", user: "U005", station: "DDC, Lainchor", package: "1 Hr/s", start: "08:00 AM", end: "09:00 AM", amount: "Rs 100", status: "Completed" },
];

type Rental = {
  id: string;
  user: string;
  station: string;
  package: string;
  start: string;
  end: string;
  amount: string;
  status: string;
};

const tabs = ["All", "Active", "Overdue", "Completed", "Refunded"] as const;
type Tab = typeof tabs[number];

export default function RentalsPage() {
  const [originalData, setOriginalData] = useState<Rental[]>(rentalData);
  const [filteredData, setFilteredData] = useState<Rental[]>(rentalData);
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // 🔹 TAB FILTER FUNCTIONALITY
  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab);
    if (tab === "All") {
      setFilteredData(originalData);
    } else {
      const filtered = originalData.filter((rental) => rental.status === tab);
      setFilteredData(filtered);
    }
  };

  // 🔹 SORT FUNCTIONALITY
  const handleSort = () => {
    const sortedData = [...filteredData].sort((a, b) => {
      const valA = a.station.toLowerCase();
      const valB = b.station.toLowerCase();
      return sortOrder === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    });
    setFilteredData(sortedData);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  // 🔹 EXPORT CSV FUNCTIONALITY
  const handleExportCSV = () => {
    const headers = [
      "Rental ID",
      "User",
      "Station Name",
      "Package",
      "Start Time",
      "End Time",
      "Amount",
      "Status",
    ];
    const csvRows = [
      headers.join(","),
      ...filteredData.map((r) =>
        [
          r.id,
          r.user,
          r.station,
          r.package,
          r.start,
          r.end,
          r.amount,
          r.status,
        ].join(",")
      ),
    ];
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "rentals.csv";
    link.click();
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Rentals</h1>
      <p className={styles.subtitle}>
        View and manage all the rental history and packages.
      </p>

      {/* Tabs */}
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ""
              }`}
            onClick={() => handleTabClick(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <button className={styles.sortBtn} onClick={handleSort}>
          <FiFilter className={styles.icon} /> Sort By Station
        </button>
      </div>

      {/* Table Card */}
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <FiShoppingBag className={styles.icon} /> Rentals
          </h2>
          <button className={styles.exportBtn} onClick={handleExportCSV}>
            <FiDownload /> Export as CSV
          </button>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Rental ID</th>
              <th>User</th>
              <th>Station Name</th>
              <th>Package</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Amount (Rs)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((rental) => (
              <tr key={rental.id}>
                <td>{rental.id}</td>
                <td>{rental.user}</td>
                <td>{rental.station}</td>
                <td>{rental.package}</td>
                <td>{rental.start}</td>
                <td>{rental.end}</td>
                <td>{rental.amount}</td>
                <td>
                  <span
                    className={`${styles.status} ${styles[rental.status.toLowerCase()]
                      }`}
                  >
                    {rental.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}