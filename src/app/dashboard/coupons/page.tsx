"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
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
import DataTable from "../../../components/DataTable/dataTable";

interface Coupon {
  id: string;
  code: string;
  name: string;
  points_value: number;
  max_uses_per_user: number;
  is_public: boolean;
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
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isPublicFilter, setIsPublicFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [pageSize, setPageSize] = useState(20);

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
    is_public: false,
    valid_from: "",
    valid_until: "",
  });
  const [newStatus, setNewStatus] = useState("");
  const [newIsPublic, setNewIsPublic] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const buildQueryParams = (page: number) => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("page_size", String(pageSize));
    if (searchTerm.trim()) params.set("search", searchTerm.trim());
    if (statusFilter) params.set("status", statusFilter);
    if (isPublicFilter) params.set("is_public", isPublicFilter);
    
    if (startDate) {
      try {
        params.set("start_date", new Date(startDate).toISOString());
      } catch (e) {
        params.set("start_date", startDate);
      }
    }
    
    if (endDate) {
      try {
        params.set("end_date", new Date(endDate).toISOString());
      } catch (e) {
        params.set("end_date", endDate);
      }
    }
    
    return params.toString();
  };

  const fetchCoupons = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get(`/api/admin/coupons?${buildQueryParams(page)}`);

      if (response.data.success) {
        const results = response.data.data.results || [];
        setCoupons(results);
        setPagination(response.data.data.pagination);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to load coupons";
      setError(errorMessage);
      toast.error(errorMessage);
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
      const errorMessage = err.response?.data?.message || "Failed to load coupon details";
      toast.error(errorMessage);
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
      const errorMessage = err.response?.data?.message || "Failed to load usage history";
      toast.error(errorMessage);
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
        formDataToSend.append(key, String(value));
      });

      const response = await axiosInstance.post(
        "/api/admin/coupons",
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (response.data.success) {
        toast.success("Coupon created successfully");
        setShowAddModal(false);
        setFormData({
          code: "",
          name: "",
          points_value: "",
          max_uses_per_user: "",
          is_public: false,
          valid_from: "",
          valid_until: "",
        });
        fetchCoupons();
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to create coupon";
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateCoupon = async () => {
    if (!selectedCoupon || !newStatus) return;

    setActionLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("status", newStatus);
      formData.append("is_public", String(newIsPublic));

      const response = await axiosInstance.patch(
        `/api/admin/coupons/${selectedCoupon.code}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      if (response.data.success) {
        toast.success("Coupon updated successfully");
        setShowStatusModal(false);
        setNewStatus("");
        setNewIsPublic(false);
        setSelectedCoupon(null);
        fetchCoupons();
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to update coupon";
      toast.error(errorMessage);
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
        toast.success("Coupon deleted successfully");
        fetchCoupons();
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to delete coupon";
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApplyFilters = () => {
    fetchCoupons(1);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setIsPublicFilter("");
    setStartDate("");
    setEndDate("");
    setPageSize(20);
    fetchCoupons(1);
  };

  const handlePageChange = (page: number) => {
    fetchCoupons(page);
  };

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    fetchCoupons(1);
  };

  const openStatusModal = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setNewStatus(coupon.status);
    setNewIsPublic(coupon.is_public);
    setShowStatusModal(true);
  };

  const closeAllModals = () => {
    setShowAddModal(false);
    setShowDetailsModal(false);
    setShowStatusModal(false);
    setShowUsageModal(false);
    setSelectedCoupon(null);
    setNewStatus("");
    setNewIsPublic(false);
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
    total: pagination?.total_count ?? coupons.length,
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
            placeholder="Search by code, name, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleApplyFilters();
            }}
          />
          {searchTerm && (
            <button
              className={styles.clearButton}
              onClick={() => setSearchTerm("")}
              title="Clear search"
            >
              <FiX />
            </button>
          )}
        </div>
        <button className={styles.refreshButton} onClick={() => fetchCoupons(pagination?.current_page ?? 1)}>
          <FiRefreshCw /> Refresh
        </button>
      </div>

      <div className={styles.filterRow}>
        <div className={styles.filterGroup}>
          <label>Status</label>
          <select
            className={styles.select}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label>Visibility</label>
          <select
            className={styles.select}
            value={isPublicFilter}
            onChange={(e) => setIsPublicFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="true">Public</option>
            <option value="false">Private</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label>Start Date</label>
          <input
            type="datetime-local"
            className={styles.input}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className={styles.filterGroup}>
          <label>End Date</label>
          <input
            type="datetime-local"
            className={styles.input}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className={styles.filterGroup}>
          <label>Page Size</label>
          <select
            className={styles.select}
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        <div className={styles.filterActions}>
          <button className={styles.applyButton} onClick={handleApplyFilters}>
            Apply
          </button>
          <button className={styles.clearFiltersButton} onClick={handleClearFilters}>
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <DataTable
        title="All Coupons"
        subtitle={`${pagination?.total_count ?? coupons.length} ${((pagination?.total_count ?? coupons.length) === 1) ? "coupon" : "coupons"}`}
        columns={[
          {
            header: "Code",
            accessor: "code",
            render: (value: string) => (
              <span className={styles.codeCell}>{value || "N/A"}</span>
            ),
          },
          {
            header: "Name",
            accessor: "name",
            render: (value: string) => value || "N/A",
          },
          {
            header: "Points Value",
            accessor: "points_value",
            render: (value: number) => (
              <span className={styles.pointsCell}>{value ?? 0} pts</span>
            ),
          },
          {
            header: "Max Uses/User",
            accessor: "max_uses_per_user",
            render: (value: number) => value ?? 0,
          },
          {
            header: "Total Uses",
            accessor: "total_uses",
            render: (value: number) => value ?? 0,
          },
          {
            header: "Visibility",
            accessor: "is_public",
            render: (value: boolean) => (
              <span
                className={styles.statusBadge}
                style={{
                  backgroundColor: value ? "rgba(30, 142, 62, 0.1)" : "rgba(95, 99, 104, 0.1)",
                  color: value ? "#1e8e3e" : "#5f6368",
                  borderColor: value ? "#1e8e3e" : "#5f6368",
                }}
              >
                {value ? "Public" : "Private"}
              </span>
            ),
          },
          {
            header: "Status",
            accessor: "status",
            render: (value: string, row: Coupon) => (
              <span
                className={styles.statusBadge}
                style={{
                  backgroundColor: `${getStatusColor(value || "INACTIVE")}22`,
                  color: getStatusColor(value || "INACTIVE"),
                  borderColor: getStatusColor(value || "INACTIVE"),
                }}
              >
                {value || "N/A"}
              </span>
            ),
          },
          {
            header: "Valid Until",
            accessor: "valid_until",
            render: (value: string) => (
              <span className={styles.dateCell}>
                {value ? new Date(value).toLocaleDateString() : "N/A"}
              </span>
            ),
          },
          {
            header: "Actions",
            accessor: "actions",
            render: (_: any, row: Coupon) => (
              <div className={styles.actions}>
                <button
                  className={styles.actionButton}
                  onClick={() => fetchCouponDetails(row?.code)}
                  title="View Details"
                  disabled={!row?.code}
                >
                  <FiEye />
                </button>
                <button
                  className={styles.actionButton}
                  onClick={() => openStatusModal(row)}
                  title="Update Status"
                  disabled={!row?.code}
                >
                  <FiEdit2 />
                </button>
                <button
                  className={`${styles.actionButton} ${styles.deleteButton}`}
                  onClick={() => handleDelete(row?.code)}
                  title="Delete"
                  disabled={!row?.code}
                >
                  <FiTrash2 />
                </button>
              </div>
            ),
          },
        ]}
        data={coupons}
        loading={loading}
        emptyMessage="No coupons found"
        mobileCardRender={(row: Coupon) => (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              <span className={styles.codeCell}>{row?.code || "N/A"}</span>
              <span
                className={styles.statusBadge}
                style={{
                  backgroundColor: `${getStatusColor(row?.status || "INACTIVE")}22`,
                  color: getStatusColor(row?.status || "INACTIVE"),
                  borderColor: getStatusColor(row?.status || "INACTIVE"),
                }}
              >
                {row?.status || "N/A"}
              </span>
            </div>
            <p style={{ margin: 0, fontWeight: 500 }}>{row?.name || "N/A"}</p>
            <div style={{ display: "flex", gap: "1rem", fontSize: "0.9rem", color: "#aaa" }}>
              <span className={styles.pointsCell}>{row?.points_value ?? 0} pts</span>
              <span>Uses: {row?.total_uses ?? 0}/{row?.max_uses_per_user ?? 0}</span>
              <span>{row?.is_public ? "Public" : "Private"}</span>
            </div>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#999" }}>
              Valid until: {row?.valid_until ? new Date(row.valid_until).toLocaleDateString() : "N/A"}
            </p>
            <div className={styles.actions} style={{ marginTop: "0.5rem" }}>
              <button
                className={styles.actionButton}
                onClick={() => fetchCouponDetails(row?.code)}
                title="View Details"
                disabled={!row?.code}
              >
                <FiEye /> View
              </button>
              <button
                className={styles.actionButton}
                onClick={() => openStatusModal(row)}
                title="Update Status"
                disabled={!row?.code}
              >
                <FiEdit2 /> Edit
              </button>
              <button
                className={`${styles.actionButton} ${styles.deleteButton}`}
                onClick={() => handleDelete(row?.code)}
                title="Delete"
                disabled={!row?.code}
              >
                <FiTrash2 /> Delete
              </button>
            </div>
          </div>
        )}
      />

      {pagination && (
        <div className={styles.pagination}>
          <button
            className={styles.paginationButton}
            disabled={!pagination.has_previous || loading}
            onClick={() => handlePageChange(pagination.current_page - 1)}
          >
            Previous
          </button>
          <span className={styles.paginationInfo}>
            Page {pagination.current_page} of {pagination.total_pages}
          </span>
          <button
            className={styles.paginationButton}
            disabled={!pagination.has_next || loading}
            onClick={() => handlePageChange(pagination.current_page + 1)}
          >
            Next
          </button>
        </div>
      )}

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

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.is_public}
                    onChange={(e) =>
                      setFormData({ ...formData, is_public: e.target.checked })
                    }
                  />
                  <span>Public (Visible to all users)</span>
                </label>
                <p className={styles.helpText}>
                  Public coupons are visible to all users. Private coupons are only accessible via direct code entry.
                </p>
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
                      {selectedCoupon?.code || "N/A"}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Name:</label>
                    <span>{selectedCoupon?.name || "N/A"}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Points Value:</label>
                    <span className={styles.pointsCell}>
                      {selectedCoupon?.points_value ?? 0} pts
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Max Uses Per User:</label>
                    <span>{selectedCoupon?.max_uses_per_user ?? 0}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Status:</label>
                    <span
                      className={styles.statusBadge}
                      style={{
                        backgroundColor: `${getStatusColor(selectedCoupon?.status || "INACTIVE")}22`,
                        color: getStatusColor(selectedCoupon?.status || "INACTIVE"),
                        borderColor: getStatusColor(selectedCoupon?.status || "INACTIVE"),
                      }}
                    >
                      {selectedCoupon?.status || "N/A"}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Currently Valid:</label>
                    <span>
                      {selectedCoupon?.is_currently_valid ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Days Remaining:</label>
                    <span>{selectedCoupon?.days_remaining ?? 0}</span>
                  </div>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h3>Validity Period</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <label>Valid From:</label>
                    <span>{selectedCoupon?.valid_from ? formatDate(selectedCoupon.valid_from) : "N/A"}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Valid Until:</label>
                    <span>{selectedCoupon?.valid_until ? formatDate(selectedCoupon.valid_until) : "N/A"}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Created At:</label>
                    <span>{selectedCoupon?.created_at ? formatDate(selectedCoupon.created_at) : "N/A"}</span>
                  </div>
                </div>
              </div>

              {selectedCoupon?.usage_stats && (
                <div className={styles.detailSection}>
                  <div className={styles.sectionHeader}>
                    <h3>Usage Statistics</h3>
                    <button
                      className={styles.linkButton}
                      onClick={() => {
                        closeAllModals();
                        fetchCouponUsages(selectedCoupon?.code);
                      }}
                      disabled={!selectedCoupon?.code}
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
                          {selectedCoupon.usage_stats.unique_users ?? 0}
                        </p>
                      </div>
                    </div>
                    <div className={styles.miniStat}>
                      <FiTrendingUp className={styles.miniStatIcon} />
                      <div>
                        <p className={styles.miniStatLabel}>Total Uses</p>
                        <p className={styles.miniStatValue}>
                          {selectedCoupon.usage_stats.total_uses ?? 0}
                        </p>
                      </div>
                    </div>
                    <div className={styles.miniStat}>
                      <FiGift className={styles.miniStatIcon} />
                      <div>
                        <p className={styles.miniStatLabel}>Points Awarded</p>
                        <p className={styles.miniStatValue}>
                          {selectedCoupon.usage_stats.total_points_awarded ?? 0}
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

      {/* Edit Coupon Modal */}
      {showStatusModal && selectedCoupon && (
        <div className={styles.modalOverlay} onClick={closeAllModals}>
          <div
            className={styles.smallModalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>Edit Coupon</h2>
              <button className={styles.closeButton} onClick={closeAllModals}>
                <FiX />
              </button>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.modalText}>
                Editing coupon: <strong>{selectedCoupon?.code || "N/A"}</strong>
              </p>

              <div className={styles.formGroup}>
                <label>Status *</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className={styles.select}
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Visibility</label>
                <div className={styles.toggleRow}>
                  <span>{newIsPublic ? "Public" : "Private"}</span>
                  <label className={styles.toggle}>
                    <input
                      type="checkbox"
                      checked={newIsPublic}
                      onChange={(e) => setNewIsPublic(e.target.checked)}
                    />
                    <span className={styles.toggleSlider} />
                  </label>
                </div>
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
                  onClick={handleUpdateCoupon}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Updating..." : "Update Coupon"}
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
                        <tr key={usage?.id || Math.random()}>
                          <td className={styles.usernameCell}>
                            {usage?.user_username || "N/A"}
                          </td>
                          <td className={styles.pointsCell}>
                            {usage?.points_awarded ?? 0} pts
                          </td>
                          <td className={styles.dateCell}>
                            {usage?.used_at ? formatDate(usage.used_at) : "N/A"}
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
