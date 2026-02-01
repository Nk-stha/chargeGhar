"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  FiEdit, FiInfo, FiPercent, FiCalendar, 
  FiMapPin, FiPackage, FiUsers, FiTrendingUp,
  FiCheckCircle, FiClock, FiTrash2
} from "react-icons/fi";
import axiosInstance, { getCsrfToken } from "@/lib/axios";
import styles from "./discountDetail.module.css";

interface DiscountDetail {
  id: string;
  station_name: string;
  package_name: string;
  discount_percent: string;
  max_total_uses: number;
  max_uses_per_user: number;
  usage_count: number;
  valid_from: string;
  valid_until: string;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED";
  is_valid: boolean;
  created_at: string;
  updated_at: string;
  station: {
    id: string;
    name: string;
    serial_number: string;
  };
  package: {
    id: string;
    name: string;
    price: number;
    duration_minutes: number;
  };
  created_by_username: string;
}

export default function DiscountDetailPage() {
  const router = useRouter();
  const params = useParams();
  const discountId = params.id as string;

  const [discount, setDiscount] = useState<DiscountDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchDiscountDetail = async () => {
      try {
        setLoading(true);
        console.log("Fetching discount with ID:", discountId);
        const token = localStorage.getItem("accessToken");
        
        const url = `/api/discounts/${discountId}`;
        console.log("API URL:", url);
        console.log("Token exists:", !!token);
        
        const response = await axiosInstance.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        console.log("Discount detail response:", response.data);
        
        if (response.data.success) {
          setDiscount(response.data.data);
        } else {
          setError(response.data.message || "Failed to load discount details");
        }
      } catch (err: any) {
        console.error("Error fetching discount:", err);
        console.error("Error status:", err.response?.status);
        console.error("Error response:", err.response?.data);
        console.error("Error message:", err.message);
        console.error("Full error:", err);
        
        if (err.response?.status === 404) {
          setError("Discount not found. It may have been deleted.");
        } else {
          setError(err.response?.data?.message || err.message || "Failed to load discount details");
        }
      } finally {
        setLoading(false);
      }
    };

    if (discountId) {
      console.log("discountId from params:", discountId);
      fetchDiscountDetail();
    } else {
      console.error("No discountId found in params");
    }
  }, [discountId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const calculateUsagePercentage = () => {
    if (!discount) return 0;
    return (discount.usage_count / discount.max_total_uses) * 100;
  };

  const handleDelete = async () => {
    if (!discount) return;
    
    if (!confirm(`Are you sure you want to delete this discount (${discount.discount_percent}% OFF)?`)) {
      return;
    }

    try {
      setDeleteLoading(true);
      const token = localStorage.getItem("accessToken");
      const csrfToken = getCsrfToken();

      const response = await axiosInstance.delete(`/api/discounts/${discount.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-CSRFTOKEN": csrfToken || "",
        },
      });

      if (response.data.success) {
        alert("Discount deleted successfully");
        router.push("/dashboard/discounts");
      }
    } catch (err: any) {
      console.error("Error deleting discount:", err);
      alert(err.response?.data?.message || "Failed to delete discount");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading discount details...</p>
        </div>
      </div>
    );
  }

  if (error || !discount) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <p>{error || "Discount not found"}</p>
          <button onClick={() => router.back()} className={styles.backBtn}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>{discount.discount_percent}% OFF</h1>
          <span
            className={styles.statusBadge}
            style={{
              backgroundColor: `${getStatusColor(discount.status)}22`,
              color: getStatusColor(discount.status),
              borderColor: getStatusColor(discount.status),
            }}
          >
            {discount.status}
          </span>
        </div>
        <div className={styles.headerRight}>
          <button 
            className={styles.editBtn}
            onClick={() => router.push(`/dashboard/discounts?edit=${discount.id}`)}
            disabled={deleteLoading}
          >
            <FiEdit /> Edit
          </button>
          <button 
            className={styles.deleteBtn}
            onClick={handleDelete}
            disabled={deleteLoading}
          >
            <FiTrash2 /> {deleteLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.green}`}>
            <FiPercent />
          </div>
          <div>
            <p className={styles.statLabel}>Discount</p>
            <p className={styles.statValue}>{discount.discount_percent}%</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.blue}`}>
            <FiUsers />
          </div>
          <div>
            <p className={styles.statLabel}>Total Uses</p>
            <p className={styles.statValue}>
              {discount.usage_count} / {discount.max_total_uses}
            </p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.orange}`}>
            <FiTrendingUp />
          </div>
          <div>
            <p className={styles.statLabel}>Max Per User</p>
            <p className={styles.statValue}>{discount.max_uses_per_user}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.purple}`}>
            <FiCheckCircle />
          </div>
          <div>
            <p className={styles.statLabel}>Status</p>
            <p className={styles.statValue}>
              {discount.is_valid ? "Valid" : "Invalid"}
            </p>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className={styles.infoGrid}>
        {/* Discount Information */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <FiInfo />
            <h3>Discount Information</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Discount ID</span>
              <span className={styles.value}>{discount.id}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Discount Percentage</span>
              <span className={styles.valueHighlight}>
                {discount.discount_percent}%
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Status</span>
              <span
                className={styles.statusBadge}
                style={{
                  backgroundColor: `${getStatusColor(discount.status)}22`,
                  color: getStatusColor(discount.status),
                  borderColor: getStatusColor(discount.status),
                }}
              >
                {discount.status}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Currently Valid</span>
              <span className={styles.value}>
                {discount.is_valid ? "Yes" : "No"}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Created By</span>
              <span className={styles.value}>{discount.created_by_username}</span>
            </div>
          </div>
        </div>

        {/* Station & Package */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <FiMapPin />
            <h3>Station & Package</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.infoSection}>
              <div className={styles.sectionTitle}>
                <FiMapPin className={styles.sectionIcon} />
                <span>Station</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Name</span>
                <span className={styles.value}>{discount.station.name}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Serial Number</span>
                <span className={styles.codeValue}>
                  {discount.station.serial_number}
                </span>
              </div>
            </div>

            <div className={styles.divider}></div>

            <div className={styles.infoSection}>
              <div className={styles.sectionTitle}>
                <FiPackage className={styles.sectionIcon} />
                <span>Package</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Name</span>
                <span className={styles.value}>{discount.package.name}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Price</span>
                <span className={styles.valueHighlight}>
                  NPR {discount.package.price}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Duration</span>
                <span className={styles.value}>
                  {discount.package.duration_minutes} minutes
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Statistics */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <FiTrendingUp />
            <h3>Usage Statistics</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Total Uses</span>
              <span className={styles.value}>{discount.usage_count}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Max Total Uses</span>
              <span className={styles.value}>{discount.max_total_uses}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Max Per User</span>
              <span className={styles.value}>{discount.max_uses_per_user}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Usage Progress</span>
              <div className={styles.progressWrapper}>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill} 
                    style={{ width: `${calculateUsagePercentage()}%` }}
                  ></div>
                </div>
                <span className={styles.progressValue}>
                  {calculateUsagePercentage().toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Validity Period */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <FiCalendar />
            <h3>Validity Period</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Valid From</span>
              <span className={styles.value}>{formatDate(discount.valid_from)}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Valid Until</span>
              <span className={styles.value}>{formatDate(discount.valid_until)}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Created At</span>
              <span className={styles.value}>{formatDate(discount.created_at)}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Last Updated</span>
              <span className={styles.value}>{formatDate(discount.updated_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
