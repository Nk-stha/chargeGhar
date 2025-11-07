"use client";

import React, { useEffect, useState } from "react";
import styles from "./refund.module.css";
import Modal from "../../../components/modal/modal";
import { FiCheckCircle, FiXCircle, FiRefreshCw } from "react-icons/fi";

interface Refund {
    id: string;
    user: string;
    amount: number;
    reason: string;
    created_at: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
}

const RefundsPage: React.FC = () => {
    const [refunds, setRefunds] = useState<Refund[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
    const [actionType, setActionType] = useState<"APPROVE" | "REJECT" | null>(null);
    const [adminNotes, setAdminNotes] = useState("");
    const [showModal, setShowModal] = useState(false);

    // 🔹 Fetch refunds from backend
    const fetchRefunds = async () => {
        try {
            setLoading(true);
            setError("");

            const res = await fetch("/api/admin/refunds", { cache: "no-store" });
            if (!res.ok) throw new Error("Failed to fetch refunds");

            const data = await res.json();
            if (!data?.data) throw new Error("Unexpected response structure");

            setRefunds(data.data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Something went wrong while fetching refunds");
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Run once on mount
    useEffect(() => {
        fetchRefunds();
    }, []);

    // 🔹 Process (approve/reject) a refund
    const handleProcessRefund = async () => {
        if (!selectedRefund || !actionType) return;

        try {
            setError("");

            const formData = new FormData();
            formData.append("action", actionType);
            formData.append("admin_notes", adminNotes);

            const res = await fetch(`/api/admin/refunds/${selectedRefund.id}/process`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Failed to process refund");

            // Re-fetch updated data
            await fetchRefunds();

            setShowModal(false);
            setAdminNotes("");
            setActionType(null);
            setSelectedRefund(null);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Something went wrong while processing refund");
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Refund Management</h1>
                <div className={styles.headerActions}>
                    <button onClick={fetchRefunds} className={styles.addButton}>
                        <FiRefreshCw /> Refresh
                    </button>
                </div>
            </div>

            {loading ? (
                <p>Loading refunds...</p>
            ) : error ? (
                <p style={{ color: "red" }}>{error}</p>
            ) : refunds.length === 0 ? (
                <p className={styles.noResults}>No refunds found.</p>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Amount</th>
                                <th>Reason</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {refunds.map((r) => (
                                <tr key={r.id}>
                                    <td>{r.user}</td>
                                    <td>${r.amount}</td>
                                    <td>{r.reason}</td>
                                    <td>{new Date(r.created_at).toLocaleString()}</td>
                                    <td>
                                        <span
                                            className={`${styles.status} ${r.status === "APPROVED"
                                                    ? styles.active
                                                    : r.status === "REJECTED"
                                                        ? styles.offline
                                                        : styles.maintenance
                                                }`}
                                        >
                                            {r.status}
                                        </span>
                                    </td>
                                    <td style={{ display: "flex", gap: "0.4rem" }}>
                                        <button
                                            className={styles.addButton}
                                            style={{ background: "#47b216" }}
                                            disabled={r.status !== "PENDING"}
                                            onClick={() => {
                                                setSelectedRefund(r);
                                                setActionType("APPROVE");
                                                setShowModal(true);
                                            }}
                                        >
                                            <FiCheckCircle /> Approve
                                        </button>
                                        <button
                                            className={styles.addButton}
                                            style={{ background: "#c03434" }}
                                            disabled={r.status !== "PENDING"}
                                            onClick={() => {
                                                setSelectedRefund(r);
                                                setActionType("REJECT");
                                                setShowModal(true);
                                            }}
                                        >
                                            <FiXCircle /> Reject
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && selectedRefund && (
                <Modal
                    title={actionType === "APPROVE" ? "Approve Refund" : "Reject Refund"}
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                >
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleProcessRefund();
                        }}
                        className={styles.modalForm}
                    >
                        <div className={styles.inputGroup}>
                            <label htmlFor="adminNotes">Admin Notes</label>
                            <input
                                id="adminNotes"
                                type="text"
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Enter admin notes..."
                                required
                            />
                        </div>

                        <button type="submit" className={styles.saveBtn}>
                            {actionType === "APPROVE" ? "Approve" : "Reject"}
                        </button>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default RefundsPage;
