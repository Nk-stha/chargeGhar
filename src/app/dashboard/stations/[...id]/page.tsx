"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./stationDetails.module.css";
import { FiEdit, FiArrowLeft, FiSave } from "react-icons/fi";

interface Station {
    id: string;
    name: string;
    location: string;
    status: "Active" | "Inactive";
    totalPorts: number;
    availablePorts: number;
    revenue: number;
}

export default function StationDetailsPage() {
    const { id } = useParams();
    const router = useRouter();

    // Normally you'd fetch station by ID from API
    const [station, setStation] = useState<Station>({
        id: id as string,
        name: "City Mall EV Station",
        location: "Kathmandu, Nepal",
        status: "Active",
        totalPorts: 8,
        availablePorts: 5,
        revenue: 14200,
    });

    const [isEditing, setIsEditing] = useState(false);

    const handleChange = (field: keyof Station, value: string | number) => {
        setStation((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        setIsEditing(false);
        console.log("Updated Station:", station);
        // Call PUT /api/stations/:id here
    };

    return (
        <div className={styles.container}>
            <button className={styles.backBtn} onClick={() => router.back()}>
                <FiArrowLeft /> Back
            </button>

            <h1 className={styles.title}>Station Details</h1>

            <div className={styles.card}>
                <div className={styles.row}>
                    <label>Station ID:</label>
                    <span>{station.id}</span>
                </div>

                <div className={styles.row}>
                    <label>Station Name:</label>
                    {isEditing ? (
                        <input
                            value={station.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                        />
                    ) : (
                        <span>{station.name}</span>
                    )}
                </div>

                <div className={styles.row}>
                    <label>Location:</label>
                    {isEditing ? (
                        <input
                            value={station.location}
                            onChange={(e) => handleChange("location", e.target.value)}
                        />
                    ) : (
                        <span>{station.location}</span>
                    )}
                </div>

                <div className={styles.row}>
                    <label>Status:</label>
                    {isEditing ? (
                        <select
                            value={station.status}
                            onChange={(e) =>
                                handleChange("status", e.target.value as "Active" | "Inactive")
                            }
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    ) : (
                        <span
                            className={`${styles.status} ${station.status === "Active" ? styles.active : styles.inactive
                                }`}
                        >
                            {station.status}
                        </span>
                    )}
                </div>

                <div className={styles.row}>
                    <label>Total Ports:</label>
                    {isEditing ? (
                        <input
                            type="number"
                            value={station.totalPorts}
                            onChange={(e) => handleChange("totalPorts", +e.target.value)}
                        />
                    ) : (
                        <span>{station.totalPorts}</span>
                    )}
                </div>

                <div className={styles.row}>
                    <label>Available Ports:</label>
                    {isEditing ? (
                        <input
                            type="number"
                            value={station.availablePorts}
                            onChange={(e) => handleChange("availablePorts", +e.target.value)}
                        />
                    ) : (
                        <span>{station.availablePorts}</span>
                    )}
                </div>

                <div className={styles.row}>
                    <label>Total Revenue:</label>
                    <span>₹{station.revenue}</span>
                </div>

                <div className={styles.actions}>
                    {isEditing ? (
                        <button className={styles.saveBtn} onClick={handleSave}>
                            <FiSave /> Save Changes
                        </button>
                    ) : (
                        <button
                            className={styles.editBtn}
                            onClick={() => setIsEditing(true)}
                        >
                            <FiEdit /> Edit Station
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
