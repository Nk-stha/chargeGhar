"use client";

import React, { useState, useEffect } from "react";
import styles from "./coupons.module.css";
import {
  FiGift,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
  FiEye,
  FiX,
  FiClock,
  FiUsers,
  FiTrendingUp,
} from "react-icons/fi";
import axiosInstance from "@/lib/axios";

interface Coupon {
  id: string;
  code: string;
  name: string;
  points_value: number;
  max_uses_per_user: number;
  valid_from: string;
  valid_until: string;
  status: string;
  created_at: string;
  is_currently_valid: boolean;
  days_remaining: number;
  total_uses: number;
  usage_stats?: {
    total_uses: number;
    unique_users: number;
    total_points_awarded: number;
  };
}

interface CouponUsage {
  id: string;
  coupon_code: string;
  coupon_name: string;
  user_username: string;
  points_awarded: number;
  used_at: string;
}

interface Pagination {
  current_page: number;
  total_pages: number;
  total_count: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
}

const CouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [filteredCoupons, setFilteredCoupons] = useState<Coupon[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [couponUsages, setCouponUsages] = useState<CouponUsage[]>([]);

  // Form states
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    points_value: "",
    max_uses_per_user: "",
    valid_from: "",
    valid_until: "",
  });
  const [newStatus, setNewStatus] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = coupons.filter(
        (coupon) =>
          coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          coupon.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredCoupons(filtered);
    } else {
      setFilteredCoupons(coupons);
    }
  }, [searchTerm, coupons]);

  const fetchCoupons = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get(
        `/api/admin/coupons?page=${page}&page_size=20`,
      );

      if (response.data.success) {
        const results = response.data.data.results || [];
        setCoupons(results);
        setFilteredCoupons(results);
        setPagination(response.data.data.pagination);
      }
    } catch (err: any) {
      console.error("Error fetching coupons:", err);
      setError(err.response?.data?.message || "Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  const fetchCouponDetails = async (code: string) => {
    try {
      setActionLoading(true);
      const response = await axiosInstance.get(`/api/admin/coupons/${code}`);

      if (response.data.success) {
        setSelectedCoupon(response.data.data);
        setShowDetailsModal(true);
      }
    } catch (err: any) {
      console.error("Error fetching coupon details:", err);
      setError(err.response?.data?.message || "Failed to load coupon details");
      setTimeout(() => setError(null), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  const fetchCouponUsages = async (code: string) => {
    try {
      setActionLoading(true);
      const response = await axiosInstance.get(
        `/api/admin/coupons/${code}/usages`,
      );

      if (response.data.success) {
        setCouponUsages(response.data.data.results || []);
        setShowUsageModal(true);
      }
    } catch (err: any) {
      console.error("Error fetching usage history:", err);
      setError(err.response?.data?.message || "Failed to load usage history");
      setTimeout(() => setError(null), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      const response = await axiosInstance.post(
        "/api/admin/coupons",
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (response.data.success) {
        setSuccessMessage("Coupon created successfully");
        setShowAddModal(false);
        setFormData({
          code: "",
          name: "",
          points_value: "",
          max_uses_per_user: "",
          valid_from: "",
          valid_until: "",
        });
        fetchCoupons();
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    } catch (err: any) {
      console.error("Error creating coupon:", err);
      setError(err.response?.data?.message || "Failed to create coupon");
      setTimeout(() => setError(null), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedCoupon || !newStatus) return;

    setActionLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("status", newStatus);

      const response = await axiosInstance.patch(
        `/api/admin/coupons/${selectedCoupon.code}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      if (response.data.success) {
        setSuccessMessage("Coupon status updated successfully");
        setShowStatusModal(false);
        setNewStatus("");
        setSelectedCoupon(null);
        fetchCoupons();
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    } catch (err: any) {
      console.error("Error updating status:", err);
      setError(err.response?.data?.message || "Failed to update status");
      setTimeout(() => setError(null), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (code: string) => {
    if (!confirm(`Are you sure you want to delete coupon ${code}?`)) return;

    setActionLoading(true);
    try {
      const response = await axiosInstance.delete(`/api/admin/coupons/${code}`);

      if (response.data.success) {
        setSuccessMessage("Coupon deleted successfully");
        fetchCoupons();
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    } catch (err: any) {
      console.error("Error deleting coupon:", err);
      setError(err.response?.data?.message || "Failed to delete coupon");
      setTimeout(() => setError(null), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  const openStatusModal = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setNewStatus(coupon.status);
    setShowStatusModal(true);
  };

  const closeAllModals = () => {
    setShowAddModal(false);
    setShowDetailsModal(false);
    setShowStatusModal(false);
    setShowUsageModal(false);
    setSelectedCoupon(null);
    setNewStatus("");
    setCouponUsages([]);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "ACTIVE":
        return "#47b216";
      case "INACTIVE":
        return "#FFA500";
      case "EXPIRED":
        return "#ff4444";
      default:
        return "#aaa";
    }
  };

  // Calculate statistics
  const stats = {
    total: coupons.length,
    active: coupons.filter((c) => c.status.toUpperCase() === "ACTIVE").length,
    inactive: coupons.filter((c) => c.status.toUpperCase() === "INACTIVE")
      .length,
    expired: coupons.filter((c) => c.status.toUpperCase() === "EXPIRED").length,
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Coupon Management</h1>
          <p className={styles.subtitle}>
            Manage promotional coupons and discount codes
          </p>
        </div>
        <button
          className={styles.addButton}
          onClick={() => setShowAddModal(true)}
        >
          <FiPlus /> Add Coupon
        </button>
      </div>

      {successMessage && (
        <div className={styles.successMessage}>
          <FiCheckCircle /> {successMessage}
        </div>
      )}

      {error && (
        <div className={styles.errorMessage}>
          <FiAlertCircle /> {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        {/* Total Coupons */}
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiGift />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Total Coupons</p>
            <h3 className={styles.statValue}>{stats.total}</h3>
            <p className={styles.statSubtext}>All generated coupons</p>
          </div>
        </div>

        {/* Active Coupons */}
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiCheckCircle />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Active</p>
            <h3 className={styles.statValue}>{stats.active}</h3>
            <p className={styles.statSubtext}>Currently usable</p>
          </div>
        </div>

        {/* Inactive Coupons */}
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiClock />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Inactive</p>
            <h3 className={styles.statValue}>{stats.inactive}</h3>
            <p className={styles.statSubtext}>Not active yet</p>
          </div>
        </div>

        {/* Expired Coupons */}
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiAlertCircle />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Expired</p>
            <h3 className={styles.statValue}>{stats.expired}</h3>
            <p className={styles.statSubtext}>No longer valid</p>
          </div>
        </div>
      </div>

      {/* Search and Refresh */}
      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by code or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <button className={styles.refreshButton} onClick={() => fetchCoupons()}>
          <FiRefreshCw /> Refresh
        </button>
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <div className={styles.tableHeader}>
          <h3>All Coupons</h3>
          <span className={styles.tableCount}>
            {filteredCoupons.length}{" "}
            {filteredCoupons.length === 1 ? "coupon" : "coupons"}
          </span>
        </div>

        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading coupons...</p>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className={styles.emptyState}>
            <FiGift className={styles.emptyIcon} />
            <p>No coupons found</p>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Points Value</th>
                  <th>Max Uses/User</th>
                  <th>Total Uses</th>
                  <th>Status</th>
                  <th>Valid Until</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.map((coupon) => (
                  <tr key={coupon.id}>
                    <td className={styles.codeCell}>{coupon.code}</td>
                    <td>{coupon.name}</td>
                    <td className={styles.pointsCell}>
                      {coupon.points_value} pts
                    </td>
                    <td>{coupon.max_uses_per_user}</td>
                    <td>{coupon.total_uses || 0}</td>
                    <td>
                      <span
                        className={styles.statusBadge}
                        style={{
                          backgroundColor: `${getStatusColor(coupon.status)}22`,
                          color: getStatusColor(coupon.status),
                          borderColor: getStatusColor(coupon.status),
                        }}
                      >
                        {coupon.status}
                      </span>
                    </td>
                    <td className={styles.dateCell}>
                      {new Date(coupon.valid_until).toLocaleDateString()}
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.actionButton}
                          onClick={() => fetchCouponDetails(coupon.code)}
                          title="View Details"
                        >
                          <FiEye />
                        </button>
                        <button
                          className={styles.actionButton}
                          onClick={() => openStatusModal(coupon)}
                          title="Update Status"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                          onClick={() => handleDelete(coupon.code)}
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Coupon Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay} onClick={closeAllModals}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>Add New Coupon</h2>
              <button className={styles.closeButton} onClick={closeAllModals}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleAddCoupon} className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="e.g., WELCOME50"
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Coupon Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Welcome Bonus"
                  className={styles.input}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Points Value *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.points_value}
                    onChange={(e) =>
                      setFormData({ ...formData, points_value: e.target.value })
                    }
                    placeholder="100"
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Max Uses Per User *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.max_uses_per_user}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_uses_per_user: e.target.value,
                      })
                    }
                    placeholder="1"
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Valid From *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.valid_from}
                    onChange={(e) =>
                      setFormData({ ...formData, valid_from: e.target.value })
                    }
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Valid Until *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.valid_until}
                    onChange={(e) =>
                      setFormData({ ...formData, valid_until: e.target.value })
                    }
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={closeAllModals}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Creating..." : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedCoupon && (
        <div className={styles.modalOverlay} onClick={closeAllModals}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>Coupon Details</h2>
              <button className={styles.closeButton} onClick={closeAllModals}>
                <FiX />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.detailSection}>
                <h3>Basic Information</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <label>Code:</label>
                    <span className={styles.codeCell}>
                      {selectedCoupon.code}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Name:</label>
                    <span>{selectedCoupon.name}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Points Value:</label>
                    <span className={styles.pointsCell}>
                      {selectedCoupon.points_value} pts
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Max Uses Per User:</label>
                    <span>{selectedCoupon.max_uses_per_user}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Status:</label>
                    <span
                      className={styles.statusBadge}
                      style={{
                        backgroundColor: `${getStatusColor(selectedCoupon.status)}22`,
                        color: getStatusColor(selectedCoupon.status),
                        borderColor: getStatusColor(selectedCoupon.status),
                      }}
                    >
                      {selectedCoupon.status}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Currently Valid:</label>
                    <span>
                      {selectedCoupon.is_currently_valid ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Days Remaining:</label>
                    <span>{selectedCoupon.days_remaining}</span>
                  </div>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h3>Validity Period</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <label>Valid From:</label>
                    <span>{formatDate(selectedCoupon.valid_from)}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Valid Until:</label>
                    <span>{formatDate(selectedCoupon.valid_until)}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Created At:</label>
                    <span>{formatDate(selectedCoupon.created_at)}</span>
                  </div>
                </div>
              </div>

              {selectedCoupon.usage_stats && (
                <div className={styles.detailSection}>
                  <div className={styles.sectionHeader}>
                    <h3>Usage Statistics</h3>
                    <button
                      className={styles.linkButton}
                      onClick={() => {
                        closeAllModals();
                        fetchCouponUsages(selectedCoupon.code);
                      }}
                    >
                      View History <FiTrendingUp />
                    </button>
                  </div>
                  <div className={styles.statsGrid}>
                    <div className={styles.miniStat}>
                      <FiUsers className={styles.miniStatIcon} />
                      <div>
                        <p className={styles.miniStatLabel}>Unique Users</p>
                        <p className={styles.miniStatValue}>
                          {selectedCoupon.usage_stats.unique_users}
                        </p>
                      </div>
                    </div>
                    <div className={styles.miniStat}>
                      <FiTrendingUp className={styles.miniStatIcon} />
                      <div>
                        <p className={styles.miniStatLabel}>Total Uses</p>
                        <p className={styles.miniStatValue}>
                          {selectedCoupon.usage_stats.total_uses}
                        </p>
                      </div>
                    </div>
                    <div className={styles.miniStat}>
                      <FiGift className={styles.miniStatIcon} />
                      <div>
                        <p className={styles.miniStatLabel}>Points Awarded</p>
                        <p className={styles.miniStatValue}>
                          {selectedCoupon.usage_stats.total_points_awarded}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedCoupon && (
        <div className={styles.modalOverlay} onClick={closeAllModals}>
          <div
            className={styles.smallModalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>Update Status</h2>
              <button className={styles.closeButton} onClick={closeAllModals}>
                <FiX />
              </button>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.modalText}>
                Update status for coupon: <strong>{selectedCoupon.code}</strong>
              </p>

              <div className={styles.formGroup}>
                <label>Status *</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className={styles.select}
                  required
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="EXPIRED">EXPIRED</option>
                </select>
              </div>

              <div className={styles.modalFooter}>
                <button
                  className={styles.cancelButton}
                  onClick={closeAllModals}
                >
                  Cancel
                </button>
                <button
                  className={styles.submitButton}
                  onClick={handleUpdateStatus}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Updating..." : "Update Status"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Usage History Modal */}
      {showUsageModal && (
        <div className={styles.modalOverlay} onClick={closeAllModals}>
          <div
            className={styles.largeModalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>Usage History</h2>
              <button className={styles.closeButton} onClick={closeAllModals}>
                <FiX />
              </button>
            </div>

            <div className={styles.modalBody}>
              {couponUsages.length === 0 ? (
                <div className={styles.emptyState}>
                  <FiUsers className={styles.emptyIcon} />
                  <p>No usage history found</p>
                </div>
              ) : (
                <div className={styles.usageTableContainer}>
                  <table className={styles.usageTable}>
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Points Awarded</th>
                        <th>Used At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {couponUsages.map((usage) => (
                        <tr key={usage.id}>
                          <td className={styles.usernameCell}>
                            {usage.user_username}
                          </td>
                          <td className={styles.pointsCell}>
                            {usage.points_awarded} pts
                          </td>
                          <td className={styles.dateCell}>
                            {formatDate(usage.used_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponsPage;
