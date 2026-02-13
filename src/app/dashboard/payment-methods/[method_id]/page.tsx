"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import {
  FiArrowLeft,
  FiEdit2,
  FiCreditCard,
  FiInfo,
  FiSettings,
  FiDollarSign,
  FiGlobe,
  FiCalendar,
  FiLoader,
  FiAlertCircle,
  FiCheckCircle,
  FiX,
} from "react-icons/fi";
import styles from "./paymentMethodDetail.module.css";
import axiosInstance from "@/lib/axios";
import PaymentMethodModal from "../PaymentMethodModal";

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
  data: PaymentMethod;
}

export default function PaymentMethodDetailPage() {
  const router = useRouter();
  const params = useParams();
  const methodId = params.method_id as string;

  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchMethodDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      const response = await axiosInstance.get<ApiResponse>(
        `/api/payment-methods/${methodId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response?.data?.success) {
        setMethod(response.data?.data);
      } else {
        const errorMsg = response?.data?.message || "Failed to fetch payment method details";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Failed to fetch payment method details";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (methodId) {
      fetchMethodDetail();
    }
  }, [methodId]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount: string) => {
    if (!amount) return "0.00";
    return parseFloat(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const maskConfigValue = (value: string): string => {
    if (!value) return "N/A";
    if (value.length <= 8) {
      return "•".repeat(value.length);
    }
    return value.substring(0, 4) + "•".repeat(value.length - 8) + value.substring(value.length - 4);
  };

  const handleModalSuccess = (message: string) => {
    toast.success(message);
    fetchMethodDetail();
    setShowEditModal(false);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <FiLoader className={styles.spinner} />
          <p>Loading payment method details...</p>
        </div>
      </div>
    );
  }

  if (error || !method) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <FiAlertCircle className={styles.errorIcon} />
          <p>{error || "Payment method not found"}</p>
          <button onClick={() => router.back()} className={styles.backBtn}>
            <FiArrowLeft /> Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <button onClick={() => router.back()} className={styles.backButton}>
          <FiArrowLeft /> Back
        </button>

        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            {method?.icon && (
              <img src={method.icon} alt={method?.name ?? ""} className={styles.headerIcon} />
            )}
            <div>
              <h1 className={styles.title}>{method?.name ?? "N/A"}</h1>
              <p className={styles.subtitle}>
                <span className={styles.gateway}>{method?.gateway ?? "N/A"}</span>
                <span className={styles.separator}>•</span>
                <span className={
                  method?.is_active ? styles.statusActive : styles.statusInactive
                }>
                  {method?.is_active ? "Active" : "Inactive"}
                </span>
              </p>
            </div>
          </div>

          <button
            className={styles.editButton}
            onClick={() => setShowEditModal(true)}
          >
            <FiEdit2 /> Edit Method
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.green}`}>
            <FiDollarSign />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Minimum Amount</p>
            <p className={styles.statValue}>{formatAmount(method?.min_amount ?? "0")}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.blue}`}>
            <FiDollarSign />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Maximum Amount</p>
            <p className={styles.statValue}>{formatAmount(method?.max_amount ?? "0")}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.purple}`}>
            <FiGlobe />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Currencies</p>
            <p className={styles.statValue}>{(method?.supported_currencies ?? []).length}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.orange}`}>
            {method?.is_active ? <FiCheckCircle /> : <FiX />}
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Status</p>
            <p className={styles.statValue}>{method?.is_active ? "Active" : "Inactive"}</p>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className={styles.infoGrid}>
        {/* Basic Information */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <FiInfo className={styles.cardIcon} />
            <h3>Basic Information</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Payment Method ID</span>
              <span className={styles.value}>{method?.id ?? "N/A"}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Name</span>
              <span className={styles.value}>{method?.name ?? "N/A"}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Gateway</span>
              <span className={styles.gatewayBadge}>{method?.gateway ?? "N/A"}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Status</span>
              <span className={
                method?.is_active ? styles.activeStatus : styles.inactiveStatus
              }>
                {method?.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            {method?.icon && (
              <div className={styles.infoRow}>
                <span className={styles.label}>Icon URL</span>
                <a href={method.icon} target="_blank" rel="noopener noreferrer" className={styles.link}>
                  View Icon
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Currency Support */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <FiGlobe className={styles.cardIcon} />
            <h3>Currency Support</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.currencyGrid}>
              {(method?.supported_currencies ?? []).map((currency, idx) => (
                <div key={idx} className={styles.currencyCard}>
                  <FiGlobe className={styles.currencyIcon} />
                  <span className={styles.currencyCode}>{currency}</span>
                </div>
              ))}
              {(method?.supported_currencies ?? []).length === 0 && (
                <p className={styles.emptyText}>No currencies configured</p>
              )}
            </div>
          </div>
        </div>

        {/* Amount Limits */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <FiDollarSign className={styles.cardIcon} />
            <h3>Amount Limits</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.amountRow}>
              <div className={styles.amountItem}>
                <span className={styles.amountLabel}>Minimum Amount</span>
                <span className={styles.amountValue}>
                  {formatAmount(method?.min_amount ?? "0")}
                </span>
              </div>
              <div className={styles.amountDivider}></div>
              <div className={styles.amountItem}>
                <span className={styles.amountLabel}>Maximum Amount</span>
                <span className={styles.amountValue}>
                  {formatAmount(method?.max_amount ?? "0")}
                </span>
              </div>
            </div>
            <div className={styles.rangeBar}>
              <div className={styles.rangeIndicator}></div>
            </div>
          </div>
        </div>

        {/* Configuration */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <FiSettings className={styles.cardIcon} />
            <h3>Configuration</h3>
          </div>
          <div className={styles.cardBody}>
            {Object.entries(method?.configuration ?? {}).length > 0 ? (
              <div className={styles.configList}>
                {Object.entries(method.configuration).map(([key, value], idx) => (
                  <div key={idx} className={styles.configRow}>
                    <span className={styles.configKey}>{key}</span>
                    <span className={styles.configValue}>{maskConfigValue(value)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.emptyText}>No configuration available</p>
            )}
          </div>
        </div>

        {/* Timestamps */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <FiCalendar className={styles.cardIcon} />
            <h3>Timestamps</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Created At</span>
              <span className={styles.value}>{formatDate(method?.created_at ?? "")}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Last Updated</span>
              <span className={styles.value}>{formatDate(method?.updated_at ?? "")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <PaymentMethodModal
          method={method}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}
