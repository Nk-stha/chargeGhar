"use client";

import React, { useState } from "react";
import styles from "./stations.module.css";
import { useRouter } from "next/navigation";
import { FiMapPin, FiSearch, FiEdit, FiTrash2, FiPlus } from "react-icons/fi";
import { useDashboardData } from "../../../contexts/DashboardDataContext";

const StationsPage: React.FC = () => {
    const router = useRouter();
    const { stationsData, loading, error } = useDashboardData();

    const [search, setSearch] = useState("");

    const stations = stationsData?.results || [];

    const filteredStations = stations.filter(
        (s: any) =>
            s.station_name.toLowerCase().includes(search.toLowerCase()) ||
            s.address.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // prevents triggering row click
        if (confirm("Are you sure you want to delete this station?")) {
            console.log("Deleted station:", id);
        }
    };

    const handleEdit = (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // prevent row click
        router.push(`/stations/${id}`);
    };

    const handleRowClick = (id: string) => {
        router.push(`dashboard/stations/${id}`);
    };

    const handleAdd = () => {
        router.push(`/dashboard/stations/add`);
    };

    if (loading) return <div className={styles.container}>Loading...</div>;
    if (error) return <div className={styles.container}>{error}</div>;

    return (
        <div className={styles.StationsPage}>
            <div className={styles.container}>
                <h1 className={styles.title}>Stations</h1>
                <p className={styles.subtitle}>Add and Manage stations configurations</p>

                <div className={styles.header}>
                    <div className={styles.headerActions}>
                        <div className={styles.searchBox}>
                            <FiSearch className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Search by name or location"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <button className={styles.addButton} onClick={handleAdd}>
                            <FiPlus /> Add Station
                        </button>
                    </div>
                </div>

                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Station Name</th>
                                <th>Location</th>
                                <th>Status</th>
                                <th>Chargers</th>
                                <th>Utilization</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredStations.length > 0 ? (
                                filteredStations.map((station: any, index: number) => {
                                    const utilizationPercent =
                                        ((station.total_slots - station.available_slots) /
                                            station.total_slots) *
                                        100;

                                    return (
                                        <tr
                                            key={station.id}
                                            className={styles.clickableRow}
                                            onClick={() => handleRowClick(station.id)}
                                        >
                                            <td>{index + 1}</td>
                                            <td>
                                                <FiMapPin className={styles.icon} />{" "}
                                                {station.station_name}
                                            </td>
                                            <td>{station.address}</td>
                                            <td>
                                                <span
                                                    className={`${styles.status} ${styles[station.status.toLowerCase()]
                                                        }`}
                                                >
                                                    {station.status}
                                                </span>
                                            </td>
                                            <td>{station.total_slots}</td>
                                            <td>
                                                <div className={styles.utilizationBar}>
                                                    <div
                                                        className={styles.utilizationFill}
                                                        style={{ width: `${utilizationPercent}%` }}
                                                    />
                                                </div>
                                                <span className={styles.utilizationText}>
                                                    {utilizationPercent.toFixed(0)}%
                                                </span>
                                            </td>
                                            <td className={styles.actions}>
                                                <button
                                                    className={styles.editButton}
                                                    onClick={(e) => handleEdit(station.id, e)}
                                                >
                                                    <FiEdit />
                                                </button>
                                                <button
                                                    className={styles.deleteButton}
                                                    onClick={(e) => handleDelete(station.id, e)}
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className={styles.noResults}>
                                        No stations found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StationsPage;
