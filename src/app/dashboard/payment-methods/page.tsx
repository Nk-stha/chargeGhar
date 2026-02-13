"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import styles from "./payment-methods.module.css";
import {
  FiCreditCard,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiLoader,
  FiAlertCircle,
  FiCheckCircle,
  FiX,
  FiEye,
} from "react-icons/fi";
import PaymentMethodModal from "./PaymentMethodModal";
import axiosInstance, { getCsrfToken } from "@/lib/axios";

interface PaymentMethod {
  id: string;
  name: string;
  gateway: string;
  icon?: string;
  is_active: boolean;
  configuration: Record<string, string>;
  min_amount: string;
  max_amount: string;
  supported_currencies: string[];
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    payment_methods: PaymentMethod[];
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

export default function PaymentMethodsPage() {
  const router = useRouter();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      const response = await axiosInstance.get<ApiResponse>("/api/payment-methods", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response?.data?.success) {
        setPaymentMethods(response.data?.data?.payment_methods ?? []);
      } else {
        const errorMsg = response?.data?.message || "Failed to fetch payment methods";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Failed to fetch payment methods";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
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

      const response = await axiosInstance.delete(`/api/payment-methods/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-CSRFTOKEN": csrfToken || "",
        },
      });

      if (response?.data?.success) {
        toast.success("Payment method deleted successfully");
        fetchPaymentMethods();
      } else {
        const errorMsg = response?.data?.message || "Failed to delete payment method";
        toast.error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Failed to delete payment method";
      toast.error(errorMsg);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    setShowModal(true);
  };

  const handleViewDetail = (methodId: string) => {
    router.push(`/dashboard/payment-methods/${methodId}`);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingMethod(null);
  };

  const handleModalSuccess = (message: string) => {
    toast.success(message);
    fetchPaymentMethods();
    handleModalClose();
  };

  const filteredMethods = useMemo(() => {
    if (!search.trim()) return paymentMethods;

    const query = search.toLowerCase();
    return paymentMethods.filter(
      (method) =>
        (method?.name ?? "").toLowerCase().includes(query) ||
        (method?.gateway ?? "").toLowerCase().includes(query) ||
        (method?.supported_currencies ?? []).some((curr) =>
          curr.toLowerCase().includes(query)
        )
    );
  }, [search, paymentMethods]);

  const maskConfigValue = (value: string): string => {
    if (!value) return "N/A";
    if (value.length <= 8) {
      return "•".repeat(value.length);
    }
    return value.substring(0, 4) + "•".repeat(value.length - 8) + value.substring(value.length - 4);
  };

  if (loading) {
    return (
      <main className={styles.container}>
        <div className={styles.loadingContainer}>
          <FiLoader className={styles.spinner} />
          <p>Loading payment methods...</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Payment Methods</h1>
          <p className={styles.subtitle}>
            Manage payment gateways and their configurations
          </p>
        </div>
        <button
          className={styles.addButton}
          onClick={() => {
            setEditingMethod(null);
            setShowModal(true);
          }}
        >
          <FiPlus /> Add Payment Method
        </button>
      </header>

      {successMessage && (
        <div className={styles.successBanner}>
          <FiCheckCircle />
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className={styles.closeBanner}>
            <FiX />
          </button>
        </div>
      )}

      {error && (
        <div className={styles.errorBanner}>
          <FiAlertCircle />
          <span>{error}</span>
          <button onClick={() => setError(null)} className={styles.closeBanner}>
            <FiX />
          </button>
        </div>
      )}

      <div className={styles.controls}>
        <div className={styles.searchWrapper}>
          <FiSearch className={styles.searchIcon} />
          <input
            className={styles.search}
            placeholder="Search payment methods..."
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
            Total: <strong>{paymentMethods.length}</strong>
          </span>
          <span className={styles.statItem}>
            Active:{" "}
            <strong className={styles.activeCount}>
              {paymentMethods.filter((m) => m.is_active).length}
            </strong>
          </span>
        </div>
      </div>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <FiCreditCard className={styles.icon} /> Payment Gateways
          </div>
          <p className={styles.cardSubText}>
            Configure and manage available payment methods
          </p>
        </div>

        {filteredMethods.length === 0 ? (
          <div className={styles.emptyState}>
            {search ? (
              <>
                <FiSearch className={styles.emptyIcon} />
                <p>No payment methods match your search</p>
              </>
            ) : (
              <>
                <FiCreditCard className={styles.emptyIcon} />
                <p>No payment methods configured</p>
                <button
                  className={styles.emptyButton}
                  onClick={() => setShowModal(true)}
                >
                  <FiPlus /> Add Your First Payment Method
                </button>
              </>
            )}
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Gateway</th>
                  <th>Status</th>
                  <th>Currencies</th>
                  <th>Min Amount</th>
                  <th>Max Amount</th>
                  <th>Configuration</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMethods.map((method) => (
                  <tr key={method?.id ?? Math.random()}>
                    <td>
                      <div className={styles.nameCell}>
                        {method?.icon && (
                          <img src={method.icon} alt={method?.name ?? ""} className={styles.methodIcon} />
                        )}
                        <span 
                          className={styles.methodName}
                          onClick={() => handleViewDetail(method?.id)}
                          style={{ cursor: 'pointer' }}
                          title="View details"
                        >
                          {method?.name ?? "N/A"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={styles.gateway}>{method?.gateway ?? "N/A"}</span>
                    </td>
                    <td>
                      <span
                        className={
                          method?.is_active
                            ? styles.statusActive
                            : styles.statusInactive
                        }
                      >
                        {method?.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className={styles.currencyList}>
                        {(method?.supported_currencies ?? []).map((curr, idx) => (
                          <span key={idx} className={styles.currencyTag}>
                            {curr}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className={styles.amount}>{method?.min_amount ?? "0"}</td>
                    <td className={styles.amount}>{method?.max_amount ?? "0"}</td>
                    <td>
                      <div className={styles.configCell}>
                        {Object.entries(method?.configuration ?? {}).map(
                          ([key, value], idx) => (
                            <div key={idx} className={styles.configItem}>
                              <span className={styles.configKey}>{key}:</span>
                              <span className={styles.configValue}>
                                {maskConfigValue(value)}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </td>
                    <td className={styles.date}>
                      {method?.created_at ? new Date(method.created_at).toLocaleDateString() : "N/A"}
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.viewBtn}
                          onClick={() => handleViewDetail(method?.id)}
                          title="View details"
                        >
                          <FiEye />
                        </button>
                        <button
                          className={styles.editBtn}
                          onClick={() => handleEdit(method)}
                          title="Edit payment method"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDelete(method?.id, method?.name ?? "payment method")}
                          disabled={deleteLoading === method?.id}
                          title="Delete payment method"
                        >
                          {deleteLoading === method?.id ? (
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

        {/* Mobile Card View */}
        {filteredMethods.length > 0 && (
          <div className={styles.mobileCards}>
            {filteredMethods.map((method) => (
              <div key={method?.id ?? Math.random()} className={styles.mobileCard}>
                <div 
                  className={styles.mobileCardHeader}
                  onClick={() => handleViewDetail(method?.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.mobileCardTitle}>
                    {method?.icon && (
                      <img src={method.icon} alt={method?.name ?? ""} className={styles.methodIconMobile} />
                    )}
                    <div>
                      <h3>{method?.name ?? "N/A"}</h3>
                      <span className={styles.gateway}>{method?.gateway ?? "N/A"}</span>
                    </div>
                  </div>
                  <span
                    className={
                      method?.is_active
                        ? styles.statusActive
                        : styles.statusInactive
                    }
                  >
                    {method?.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className={styles.mobileCardBody}>
                  <div className={styles.mobileCardRow}>
                    <span className={styles.mobileLabel}>Currencies:</span>
                    <div className={styles.currencyList}>
                      {(method?.supported_currencies ?? []).map((curr, idx) => (
                        <span key={idx} className={styles.currencyTag}>
                          {curr}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className={styles.mobileCardRow}>
                    <span className={styles.mobileLabel}>Min Amount:</span>
                    <span>{method?.min_amount ?? "0"}</span>
                  </div>

                  <div className={styles.mobileCardRow}>
                    <span className={styles.mobileLabel}>Max Amount:</span>
                    <span>{method?.max_amount ?? "0"}</span>
                  </div>

                  <div className={styles.mobileCardRow}>
                    <span className={styles.mobileLabel}>Configuration:</span>
                    <div className={styles.configCell}>
                      {Object.entries(method?.configuration ?? {}).map(
                        ([key, value], idx) => (
                          <div key={idx} className={styles.configItem}>
                            <span className={styles.configKey}>{key}:</span>
                            <span className={styles.configValue}>
                              {maskConfigValue(value)}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className={styles.mobileCardRow}>
                    <span className={styles.mobileLabel}>Created:</span>
                    <span>{method?.created_at ? new Date(method.created_at).toLocaleDateString() : "N/A"}</span>
                  </div>
                </div>

                <div className={styles.mobileCardFooter}>
                  <button
                    className={styles.viewBtn}
                    onClick={() => handleViewDetail(method?.id)}
                  >
                    <FiEye /> View
                  </button>
                  <button
                    className={styles.editBtn}
                    onClick={() => handleEdit(method)}
                  >
                    <FiEdit2 /> Edit
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(method?.id, method?.name ?? "payment method")}
                    disabled={deleteLoading === method?.id}
                  >
                    {deleteLoading === method?.id ? (
                      <>
                        <FiLoader className={styles.spinner} /> Deleting...
                      </>
                    ) : (
                      <>
                        <FiTrash2 /> Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {showModal && (
        <PaymentMethodModal
          method={editingMethod}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </main>
  );
}
