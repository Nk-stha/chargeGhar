"use client";

import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import styles from "./packages.module.css";
import {
  FiPackage,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiLoader,
  FiAlertCircle,
  FiCheckCircle,
  FiX,
} from "react-icons/fi";
import PackageModal from "./PackageModal";
import axiosInstance, { getCsrfToken } from "@/lib/axios";
import DataTable from "../../../components/DataTable/dataTable";

interface RentalPackage {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: string;
  package_type: "HOURLY" | "DAILY" | "WEEKLY" | "MONTHLY";
  payment_model: "PREPAID" | "POSTPAID";
  is_active: boolean;
  package_metadata: Record<string, any>;
  duration_display: string;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    rental_packages: RentalPackage[];
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

export default function PackagesPage() {
  const [packages, setPackages] = useState<RentalPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<RentalPackage | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      const response = await axiosInstance.get<ApiResponse>("/api/rental-packages", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setPackages(response.data.data?.rental_packages || []);
      } else {
        const errorMsg = "Failed to fetch rental packages";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to fetch rental packages";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      setDeleteLoading(id);
      const token = localStorage.getItem("accessToken");
      const csrfToken = getCsrfToken();

      const response = await axiosInstance.delete(`/api/rental-packages/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-CSRFTOKEN": csrfToken || "",
        },
      });

      if (response.data.success) {
        toast.success("Package deleted successfully!");
        setSuccessMessage("Package deleted successfully");
        fetchPackages();
      } else {
        toast.error("Failed to delete package");
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to delete package";
      toast.error(errorMsg);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEdit = (pkg: RentalPackage) => {
    setEditingPackage(pkg);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingPackage(null);
  };

  const handleModalSuccess = (message: string) => {
    setSuccessMessage(message);
    fetchPackages();
    handleModalClose();
  };

  const filteredPackages = useMemo(() => {
    if (!search.trim()) return packages;

    const query = search.toLowerCase();
    return packages.filter(
      (pkg) =>
        (pkg?.name && pkg.name.toLowerCase().includes(query)) ||
        (pkg?.description && pkg.description.toLowerCase().includes(query)) ||
        (pkg?.package_type && pkg.package_type.toLowerCase().includes(query)) ||
        (pkg?.payment_model && pkg.payment_model.toLowerCase().includes(query)) ||
        (pkg?.duration_display && pkg.duration_display.toLowerCase().includes(query))
    );
  }, [search, packages]);

  if (loading) {
    return (
      <main className={styles.container}>
        <div className={styles.loadingContainer}>
          <FiLoader className={styles.spinner} />
          <p>Loading packages...</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Rental Packages</h1>
          <p className={styles.subtitle}>
            Manage rental packages and pricing plans
          </p>
        </div>
        <button
          className={styles.addButton}
          onClick={() => {
            setEditingPackage(null);
            setShowModal(true);
          }}
        >
          <FiPlus /> Add Package
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

      <div className={styles.controls}>
        <div className={styles.searchWrapper}>
          <FiSearch className={styles.searchIcon} />
          <input
            className={styles.search}
            placeholder="Search packages..."
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
        <div className={styles.stats}>
          <span className={styles.statItem}>
            Total: <strong>{packages.length}</strong>
          </span>
          <span className={styles.statItem}>
            Active:{" "}
            <strong className={styles.activeCount}>
              {packages.filter((p) => p.is_active).length}
            </strong>
          </span>
        </div>
      </div>

      <DataTable
        title="Rental Packages"
        subtitle="Configure pricing and duration for rental packages"
        columns={[
          {
            header: "Package Name",
            accessor: "name",
            render: (value: string) => (
              <span className={styles.packageName}>{value || "Unnamed Package"}</span>
            ),
          },
          {
            header: "Description",
            accessor: "description",
            render: (value: string) => (
              <span className={styles.description}>{value || "No description"}</span>
            ),
          },
          {
            header: "Duration",
            accessor: "duration_display",
            render: (value: string) => (
              <span className={styles.duration}>{value || "N/A"}</span>
            ),
          },
          {
            header: "Price",
            accessor: "price",
            render: (value: string) => (
              <span className={styles.price}>₹{value || "0"}</span>
            ),
          },
          {
            header: "Type",
            accessor: "package_type",
            render: (value: string) => (
              <span className={styles.typeTag}>{value || "N/A"}</span>
            ),
          },
          {
            header: "Payment",
            accessor: "payment_model",
            render: (value: string) => (
              <span className={styles.paymentTag}>{value || "N/A"}</span>
            ),
          },
          {
            header: "Status",
            accessor: "is_active",
            render: (value: boolean) => (
              <span className={value ? styles.statusActive : styles.statusInactive}>
                {value ? "Active" : "Inactive"}
              </span>
            ),
          },
          {
            header: "Created",
            accessor: "created_at",
            render: (value: string) => (
              <span className={styles.date}>
                {value ? new Date(value).toLocaleDateString() : "N/A"}
              </span>
            ),
          },
          {
            header: "Actions",
            accessor: "actions",
            render: (_: any, row: RentalPackage) => (
              <div className={styles.actions}>
                <button
                  className={styles.editBtn}
                  onClick={() => handleEdit(row)}
                  title="Edit package"
                >
                  <FiEdit2 />
                </button>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(row.id, row.name)}
                  disabled={deleteLoading === row.id}
                  title="Delete package"
                >
                  {deleteLoading === row.id ? (
                    <FiLoader className={styles.spinner} />
                  ) : (
                    <FiTrash2 />
                  )}
                </button>
              </div>
            ),
          },
        ]}
        data={filteredPackages}
        loading={false}
        emptyMessage={
          search
            ? "No packages match your search"
            : "No packages configured"
        }
        mobileCardRender={(row: RentalPackage) => (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              <span className={styles.packageName}>{row?.name || "Unnamed Package"}</span>
              <span className={row?.is_active ? styles.statusActive : styles.statusInactive}>
                {row?.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            <p className={styles.description}>{row?.description || "No description"}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              <span className={styles.typeTag}>{row?.package_type || "N/A"}</span>
              <span className={styles.paymentTag}>{row?.payment_model || "N/A"}</span>
              <span className={styles.duration}>{row?.duration_display || "N/A"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className={styles.price}>₹{row?.price || "0"}</span>
              <div className={styles.actions}>
                <button
                  className={styles.editBtn}
                  onClick={() => handleEdit(row)}
                  title="Edit package"
                >
                  <FiEdit2 />
                </button>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(row?.id || "", row?.name || "this package")}
                  disabled={deleteLoading === row?.id}
                  title="Delete package"
                >
                  {deleteLoading === row?.id ? <FiLoader className={styles.spinner} /> : <FiTrash2 />}
                </button>
              </div>
            </div>
          </div>
        )}
      />

      {showModal && (
        <PackageModal
          package={editingPackage}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </main>
  );
}
