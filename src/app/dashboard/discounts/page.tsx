"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import styles from "./discounts.module.css";
import {
  FiPercent,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiLoader,
  FiAlertCircle,
  FiCheckCircle,
  FiRefreshCw,
  FiX,
} from "react-icons/fi";
import DiscountModal from "./DiscountModal";
import axiosInstance, { getCsrfToken } from "@/lib/axios";
import DataTable from "../../../components/DataTable/dataTable";

interface Discount {
  id: string;
  station_id?: string;
  station_name?: string;
  package_id?: string;
  package_name?: string;
  discount_percent: number | string;
  max_total_uses: number;
  max_uses_per_user: number;
  usage_count: number;
  total_uses?: number; // Alias for usage_count
  valid_from: string;
  valid_until: string;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED";
  is_valid?: boolean;
  created_at: string;
  updated_at?: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    discounts?: Discount[];
    results?: Discount[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_count: number;
      page_size: number;
      has_next: boolean;
      has_previous: boolean;
    };
  };
}

export default function DiscountsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      
      if (!token) {
        const errorMsg = "Authentication required. Please login.";
        setError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
        return;
      }

      const response = await axiosInstance.get("/api/discounts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        // Handle multiple possible response structures
        let discountsData = [];
        
        if (response.data.data) {
          discountsData = response.data.data.discounts || 
                         response.data.data.results || 
                         response.data.data || 
                         [];
        } else if (response.data.discounts) {
          discountsData = response.data.discounts;
        } else if (response.data.results) {
          discountsData = response.data.results;
        }
        
        setDiscounts(Array.isArray(discountsData) ? discountsData : []);
      } else {
        const errorMsg = response.data.message || "Failed to fetch discounts";
        setError(errorMsg);
        toast.error(errorMsg);
        setDiscounts([]);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to fetch discounts";
      setError(errorMsg);
      toast.error(errorMsg);
      setDiscounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  useEffect(() => {
    // Handle edit query parameter
    const editId = searchParams.get('edit');
    if (editId && discounts.length > 0) {
      const discountToEdit = discounts.find(d => d.id === editId);
      if (discountToEdit) {
        setEditingDiscount(discountToEdit);
        setShowModal(true);
        // Clear the query parameter
        router.replace('/dashboard/discounts', { scroll: false });
      }
    }
  }, [searchParams, discounts, router]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this discount?")) {
      return;
    }

    try {
      setDeleteLoading(id);
      const token = localStorage.getItem("accessToken");
      const csrfToken = getCsrfToken();

      const response = await axiosInstance.delete(`/api/discounts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-CSRFTOKEN": csrfToken || "",
        },
      });

      if (response.data.success) {
        toast.success("Discount deleted successfully!");
        setSuccessMessage("Discount deleted successfully");
        fetchDiscounts();
      } else {
        toast.error("Failed to delete discount");
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to delete discount";
      toast.error(errorMsg);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleRowClick = (discount: Discount) => {
    // Try to find the correct ID field
    const discountId = discount?.id || (discount as any)?.discount_id;
    
    if (!discountId) {
      toast.error("Cannot navigate: Discount ID not found");
      return;
    }
    
    router.push(`/dashboard/discounts/${discountId}`);
  };

  const handleEdit = (discount: Discount) => {
    setEditingDiscount(discount);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingDiscount(null);
  };

  const handleModalSuccess = (message: string) => {
    setSuccessMessage(message);
    fetchDiscounts();
    handleModalClose();
  };

  const filteredDiscounts = useMemo(() => {
    if (!Array.isArray(discounts)) return [];
    if (!search.trim()) return discounts;

    const query = search.toLowerCase();
    return discounts.filter(
      (discount) =>
        (discount?.station_name && discount.station_name.toLowerCase().includes(query)) ||
        (discount?.package_name && discount.package_name.toLowerCase().includes(query)) ||
        (discount?.status && discount.status.toLowerCase().includes(query)) ||
        (discount?.discount_percent && discount.discount_percent.toString().includes(query))
    );
  }, [search, discounts]);

  const stats = {
    total: Array.isArray(discounts) ? discounts.length : 0,
    active: Array.isArray(discounts) ? discounts.filter((d) => d.status === "ACTIVE").length : 0,
    inactive: Array.isArray(discounts) ? discounts.filter((d) => d.status === "INACTIVE").length : 0,
    expired: Array.isArray(discounts) ? discounts.filter((d) => d.status === "EXPIRED").length : 0,
  };

  if (loading) {
    return (
      <main className={styles.container}>
        <div className={styles.loadingContainer}>
          <FiLoader className={styles.spinner} />
          <p>Loading discounts...</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Discount Management</h1>
          <p className={styles.subtitle}>
            Configure promotional offers for specific stations and packages
          </p>
        </div>
        <button
          className={styles.addButton}
          onClick={() => {
            setEditingDiscount(null);
            setShowModal(true);
          }}
        >
          <FiPlus /> Add Discount
        </button>
      </header>

      {successMessage && (
        <div className={styles.successBanner}>
          <FiCheckCircle />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className={styles.errorBanner}>
          <FiAlertCircle />
          <span>{error}</span>
        </div>
      )}

      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiPercent />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Total Discounts</p>
            <h3 className={styles.statValue}>{stats.total}</h3>
            <p className={styles.statSubtext}>All configured offers</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiCheckCircle />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Active</p>
            <h3 className={styles.statValue}>{stats.active}</h3>
            <p className={styles.statSubtext}>Currently available</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiAlertCircle />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Inactive</p>
            <h3 className={styles.statValue}>{stats.inactive}</h3>
            <p className={styles.statSubtext}>Not active yet</p>
          </div>
        </div>

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

      <div className={styles.controls}>
        <div className={styles.searchWrapper}>
          <FiSearch className={styles.searchIcon} />
          <input
            className={styles.search}
            placeholder="Search discounts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className={styles.clearSearch}
              onClick={() => setSearch("")}
              title="Clear search"
            >
              <FiX />
            </button>
          )}
        </div>
        <button className={styles.refreshButton} onClick={() => fetchDiscounts()}>
          <FiRefreshCw /> Refresh
        </button>
      </div>

      <DataTable
        title="All Discounts"
        subtitle="Station and package-specific promotional offers"
        onRowClick={handleRowClick}
        columns={[
          {
            header: "Station",
            accessor: "station_name",
            render: (value: string) => (
              <span className={styles.stationName}>{value || "N/A"}</span>
            ),
          },
          {
            header: "Package",
            accessor: "package_name",
            render: (value: string) => (
              <span className={styles.packageName}>{value || "N/A"}</span>
            ),
          },
          {
            header: "Discount",
            accessor: "discount_percent",
            render: (value: number) => (
              <span className={styles.discountValue}>{value || 0}%</span>
            ),
          },
          {
            header: "Max Total Uses",
            accessor: "max_total_uses",
            render: (value: number) => value || 0,
          },
          {
            header: "Max Uses/User",
            accessor: "max_uses_per_user",
            render: (value: number) => value || 0,
          },
          {
            header: "Total Uses",
            accessor: "usage_count",
            render: (value: number) => value || 0,
          },
          {
            header: "Status",
            accessor: "status",
            render: (value: string) => (
              <span
                className={`${styles.statusBadge} ${
                  (value || "INACTIVE") === "ACTIVE"
                    ? styles.statusActive
                    : (value || "INACTIVE") === "INACTIVE"
                    ? styles.statusInactive
                    : styles.statusExpired
                }`}
              >
                {value || "INACTIVE"}
              </span>
            ),
          },
          {
            header: "Valid Until",
            accessor: "valid_until",
            render: (value: string) => (
              <span className={styles.date}>
                {value ? new Date(value).toLocaleDateString() : "N/A"}
              </span>
            ),
          },
          {
            header: "Actions",
            accessor: "actions",
            render: (_: any, row: Discount) => (
              <div className={styles.actions}>
                <button
                  className={styles.editBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(row);
                  }}
                  title="Edit discount"
                >
                  <FiEdit2 />
                </button>
                <button
                  className={styles.deleteBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(row?.id || "");
                  }}
                  disabled={deleteLoading === row?.id}
                  title="Delete discount"
                >
                  {deleteLoading === row?.id ? (
                    <FiLoader className={styles.spinner} />
                  ) : (
                    <FiTrash2 />
                  )}
                </button>
              </div>
            ),
          },
        ]}
        data={filteredDiscounts}
        loading={false}
        emptyMessage={
          search
            ? "No discounts match your search"
            : "No discounts configured"
        }
        mobileCardRender={(row: Discount) => (
          <div 
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem", cursor: "pointer" }}
            onClick={() => handleRowClick(row)}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              <span className={styles.stationName}>{row?.station_name || "N/A"}</span>
              <span
                className={`${styles.statusBadge} ${
                  (row?.status || "INACTIVE") === "ACTIVE"
                    ? styles.statusActive
                    : (row?.status || "INACTIVE") === "INACTIVE"
                    ? styles.statusInactive
                    : styles.statusExpired
                }`}
              >
                {row?.status || "INACTIVE"}
              </span>
            </div>
            <p className={styles.packageName}>{row?.package_name || "N/A"}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              <span className={styles.discountValue}>{row?.discount_percent || 0}% OFF</span>
              <span className={styles.usageInfo}>
                Uses: {row?.usage_count || 0}/{row?.max_total_uses || 0}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className={styles.date}>
                Until: {row?.valid_until ? new Date(row.valid_until).toLocaleDateString() : "N/A"}
              </span>
              <div className={styles.actions}>
                <button
                  className={styles.editBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(row);
                  }}
                  title="Edit discount"
                >
                  <FiEdit2 />
                </button>
                <button
                  className={styles.deleteBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(row?.id || "");
                  }}
                  disabled={deleteLoading === row?.id}
                  title="Delete discount"
                >
                  {deleteLoading === row?.id ? <FiLoader className={styles.spinner} /> : <FiTrash2 />}
                </button>
              </div>
            </div>
          </div>
        )}
      />

      {showModal && (
        <DiscountModal
          discount={editingDiscount}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </main>
  );
}
