"use client";

import React, { useState, useEffect, useMemo } from "react";
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
} from "react-icons/fi";
import PaymentMethodModal from "./PaymentMethodModal";
import axiosInstance, { getCsrfToken } from "@/lib/axios";

interface PaymentMethod {
  id: string;
  name: string;
  gateway: string;
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

      if (response.data.success) {
        setPaymentMethods(response.data.data.payment_methods);
      }
    } catch (err: any) {
      console.error("Error fetching payment methods:", err);
      setError(err.response?.data?.message || "Failed to fetch payment methods");
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

      if (response.data.success) {
        setSuccessMessage("Payment method deleted successfully");
        fetchPaymentMethods();
      }
    } catch (err: any) {
      console.error("Error deleting payment method:", err);
      alert(err.response?.data?.message || "Failed to delete payment method");
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingMethod(null);
  };

  const handleModalSuccess = (message: string) => {
    setSuccessMessage(message);
    fetchPaymentMethods();
    handleModalClose();
  };

  const filteredMethods = useMemo(() => {
    if (!search.trim()) return paymentMethods;

    const query = search.toLowerCase();
    return paymentMethods.filter(
      (method) =>
        method.name.toLowerCase().includes(query) ||
        method.gateway.toLowerCase().includes(query) ||
        method.supported_currencies.some((curr) =>
          curr.toLowerCase().includes(query)
        )
    );
  }, [search, paymentMethods]);

  const maskConfigValue = (value: string): string => {
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
  console.log(editingMethod)
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
                  <tr key={method.id}>
                    <td>
                      <div className={styles.nameCell}>
                        <span className={styles.methodName}>{method.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className={styles.gateway}>{method.gateway}</span>
                    </td>
                    <td>
                      <span
                        className={
                          method.is_active
                            ? styles.statusActive
                            : styles.statusInactive
                        }
                      >
                        {method.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className={styles.currencyList}>
                        {method.supported_currencies.map((curr, idx) => (
                          <span key={idx} className={styles.currencyTag}>
                            {curr}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className={styles.amount}>{method.min_amount}</td>
                    <td className={styles.amount}>{method.max_amount}</td>
                    <td>
                      <div className={styles.configCell}>
                        {Object.entries(method.configuration).map(
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
                      {new Date(method.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.editBtn}
                          onClick={() => handleEdit(method)}
                          title="Edit payment method"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDelete(method.id, method.name)}
                          disabled={deleteLoading === method.id}
                          title="Delete payment method"
                        >
                          {deleteLoading === method.id ? (
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
        <PaymentMethodModal
          method={editingMethod}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </main>
  );
}
