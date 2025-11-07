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

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <FiPackage className={styles.icon} /> Rental Packages
          </div>
          <p className={styles.cardSubText}>
            Configure pricing and duration for rental packages
          </p>
        </div>

        {filteredPackages.length === 0 ? (
          <div className={styles.emptyState}>
            {search ? (
              <>
                <FiSearch className={styles.emptyIcon} />
                <p>No packages match your search</p>
              </>
            ) : (
              <>
                <FiPackage className={styles.emptyIcon} />
                <p>No packages configured</p>
                <button
                  className={styles.emptyButton}
                  onClick={() => setShowModal(true)}
                >
                  <FiPlus /> Add Your First Package
                </button>
              </>
            )}
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Package Name</th>
                  <th>Description</th>
                  <th>Duration</th>
                  <th>Price</th>
                  <th>Type</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPackages.map((pkg) => (
                  <tr key={pkg.id}>
                    <td>
                      <div className={styles.nameCell}>
                        <span className={styles.packageName}>{pkg.name}</span>
                      </div>
                    </td>
                    <td className={styles.description}>{pkg.description}</td>
                    <td>
                      <span className={styles.duration}>
                        {pkg.duration_display}
                      </span>
                    </td>
                    <td className={styles.price}>₹{pkg.price}</td>
                    <td>
                      <span className={styles.typeTag}>
                        {pkg.package_type}
                      </span>
                    </td>
                    <td>
                      <span className={styles.paymentTag}>
                        {pkg.payment_model}
                      </span>
                    </td>
                    <td>
                      <span
                        className={
                          pkg.is_active
                            ? styles.statusActive
                            : styles.statusInactive
                        }
                      >
                        {pkg.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className={styles.date}>
                      {new Date(pkg.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.editBtn}
                          onClick={() => handleEdit(pkg)}
                          title="Edit package"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDelete(pkg.id, pkg.name)}
                          disabled={deleteLoading === pkg.id}
                          title="Delete package"
                        >
                          {deleteLoading === pkg.id ? (
                            <FiLoader className={styles.spinner} />
                          ) : (
                            <FiTrash2 />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

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
