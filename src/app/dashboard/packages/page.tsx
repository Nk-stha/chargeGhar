"use client";

import React, { useState, useEffect, useMemo } from "react";
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
        setPackages(response.data.data.rental_packages);
      }
    } catch (err: any) {
      console.error("Error fetching rental packages:", err);
      setError(err.response?.data?.message || "Failed to fetch rental packages");
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
        setSuccessMessage("Package deleted successfully");
        fetchPackages();
      }
    } catch (err: any) {
      console.error("Error deleting package:", err);
      alert(err.response?.data?.message || "Failed to delete package");
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
        pkg.name.toLowerCase().includes(query) ||
        pkg.description.toLowerCase().includes(query) ||
        pkg.package_type.toLowerCase().includes(query) ||
        pkg.payment_model.toLowerCase().includes(query)
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
              ×
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
              <span className={styles.packageName}>{value}</span>
            ),
          },
          {
            header: "Description",
            accessor: "description",
            render: (value: string) => (
              <span className={styles.description}>{value}</span>
            ),
          },
          {
            header: "Duration",
            accessor: "duration_display",
            render: (value: string) => (
              <span className={styles.duration}>{value}</span>
            ),
          },
          {
            header: "Price",
            accessor: "price",
            render: (value: string) => (
              <span className={styles.price}>₹{value}</span>
            ),
          },
          {
            header: "Type",
            accessor: "package_type",
            render: (value: string) => (
              <span className={styles.typeTag}>{value}</span>
            ),
          },
          {
            header: "Payment",
            accessor: "payment_model",
            render: (value: string) => (
              <span className={styles.paymentTag}>{value}</span>
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
                {new Date(value).toLocaleDateString()}
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
              <span className={styles.packageName}>{row.name}</span>
              <span className={row.is_active ? styles.statusActive : styles.statusInactive}>
                {row.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            <p className={styles.description}>{row.description}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              <span className={styles.typeTag}>{row.package_type}</span>
              <span className={styles.paymentTag}>{row.payment_model}</span>
              <span className={styles.duration}>{row.duration_display}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className={styles.price}>₹{row.price}</span>
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
                  {deleteLoading === row.id ? <FiLoader className={styles.spinner} /> : <FiTrash2 />}
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
