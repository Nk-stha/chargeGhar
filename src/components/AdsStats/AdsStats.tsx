"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./AdsStats.module.css";
import { FiDollarSign, FiTrendingUp, FiActivity, FiPieChart, FiUsers, FiLoader } from "react-icons/fi";
import { toast } from "sonner";

interface AdRequest {
  id: string;
  user_id: string;
  user_email: string | null;
  user_phone: string;
  full_name: string;
  contact_number: string;
  title: string | null;
  description: string | null;
  status: string;
  duration_days: number | null;
  admin_price: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  approved_at: string | null;
  paid_at: string | null;
  completed_at: string | null;
  start_date: string | null;
  end_date: string | null;
  reviewed_by_name: string | null;
  approved_by_name: string | null;
  station_count: number;
}

interface AdsResponse {
  success: boolean;
  message: string;
  data: AdRequest[];
}

const AdsStats: React.FC = () => {
  const router = useRouter();
  const [ads, setAds] = useState<AdRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittedDate, setSubmittedDate] = useState<string>("");

  useEffect(() => {
    fetchAds();
  }, [submittedDate]);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/ads/requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data: AdsResponse = await response.json();

      if (data.success) {
        let filteredAds = data.data;
        
        // Filter by submitted_at on frontend if date is selected
        if (submittedDate) {
          filteredAds = filteredAds.filter((ad: AdRequest) => {
            const adDate = new Date(ad.submitted_at).toISOString().split('T')[0];
            return adDate === submittedDate;
          });
        }
        
        setAds(filteredAds);
      } else {
        setError("Failed to load ads statistics");
        toast.error("Failed to load ads statistics");
      }
    } catch {
      setError("Failed to load ads statistics");
      toast.error("Failed to load ads statistics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <FiLoader className={styles.spinner} />
          <p>Loading ads statistics...</p>
        </div>
      </div>
    );
  }

  if (error || !ads) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <p>{error || "No data available"}</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const paidAds = ads.filter((ad) => ad.status === "PAID");
  const totalRevenue = paidAds.reduce((sum, ad) => sum + parseFloat(ad.admin_price || "0"), 0);

  const pendingPaymentAds = ads.filter((ad) => ad.status === "PENDING_PAYMENT");
  const revenuePipeline = pendingPaymentAds.reduce((sum, ad) => sum + parseFloat(ad.admin_price || "0"), 0);

  const activeCampaigns = ads.filter((ad) => ad.status === "PAID" || ad.status === "COMPLETED").length;

  const statusDistribution = ads.reduce((acc, ad) => {
    acc[ad.status] = (acc[ad.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const uniqueAdvertisers = new Set(ads.map((ad) => ad.user_id)).size;
  const revenuePerAdvertiser = uniqueAdvertisers > 0 ? (totalRevenue / uniqueAdvertisers).toFixed(0) : "0";

  const formatAmount = (amount: string | null) => {
    if (!amount) return "N/A";
    return `Rs. ${parseFloat(amount).toLocaleString()}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      SUBMITTED: "#888",
      PENDING_PAYMENT: "#f59e0b",
      PAID: "#10b981",
      COMPLETED: "#3b82f6",
      REJECTED: "#ef4444",
    };
    return colors[status] || "#888";
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <FiActivity /> Ads Statistics
        </h2>
        <div className={styles.dateFilter}>
          <label htmlFor="adsSubmittedDate" className={styles.dateLabel}>Submitted:</label>
          <input
            type="date"
            id="adsSubmittedDate"
            value={submittedDate}
            onChange={(e) => setSubmittedDate(e.target.value)}
            className={styles.dateInput}
          />
          {submittedDate && (
            <button
              type="button"
              onClick={() => setSubmittedDate("")}
              className={styles.clearDateBtn}
              title="Clear date filter"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.metricsGrid}>
          <div
            className={styles.metricCard}
            onClick={() => router.push("/dashboard/ads")}
          >
            <div className={styles.metricIcon} style={{ backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}>
              <FiDollarSign />
            </div>
            <div className={styles.metricInfo}>
              <span className={styles.metricLabel}>Total Revenue (Paid)</span>
              <span className={styles.metricValue}>Rs. {totalRevenue.toLocaleString()}</span>
              <span className={styles.metricSubtext}>{paidAds.length} paid campaigns</span>
            </div>
          </div>

          <div
            className={styles.metricCard}
            onClick={() => router.push("/dashboard/ads")}
          >
            <div className={styles.metricIcon} style={{ backgroundColor: "rgba(251, 146, 60, 0.1)", color: "#fb923c" }}>
              <FiTrendingUp />
            </div>
            <div className={styles.metricInfo}>
              <span className={styles.metricLabel}>Revenue Pipeline</span>
              <span className={styles.metricValue}>Rs. {revenuePipeline.toLocaleString()}</span>
              <span className={styles.metricSubtext}>{pendingPaymentAds.length} pending payment</span>
            </div>
          </div>

          <div
            className={styles.metricCard}
            onClick={() => router.push("/dashboard/ads")}
          >
            <div className={styles.metricIcon} style={{ backgroundColor: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}>
              <FiActivity />
            </div>
            <div className={styles.metricInfo}>
              <span className={styles.metricLabel}>Active Campaigns</span>
              <span className={styles.metricValue}>{activeCampaigns}</span>
            </div>
          </div>

          <div
            className={styles.metricCard}
            onClick={() => router.push("/dashboard/ads")}
          >
            <div className={styles.metricIcon} style={{ backgroundColor: "rgba(168, 85, 247, 0.1)", color: "#a855f7" }}>
              <FiPieChart />
            </div>
            <div className={styles.metricInfo}>
              <span className={styles.metricLabel}>Status Distribution</span>
              <span className={styles.metricValue}>
                {statusDistribution["SUBMITTED"] || 0} / {statusDistribution["PENDING_PAYMENT"] || 0} / {statusDistribution["PAID"] || 0}
              </span>
              <span className={styles.metricSubtext}>Submitted / Pending / Paid</span>
            </div>
          </div>

          <div
            className={styles.metricCard}
            onClick={() => router.push("/dashboard/ads")}
          >
            <div className={styles.metricIcon} style={{ backgroundColor: "rgba(130, 234, 128, 0.1)", color: "#82ea80" }}>
              <FiUsers />
            </div>
            <div className={styles.metricInfo}>
              <span className={styles.metricLabel}>Revenue per Advertiser</span>
              <span className={styles.metricValue}>Rs. {revenuePerAdvertiser}</span>
              <span className={styles.metricSubtext}>{uniqueAdvertisers} advertisers</span>
            </div>
          </div>
        </div>

        {/* Recent Campaigns */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <FiActivity /> Recent Ad Campaigns
          </h3>
          <div className={styles.campaignList}>
            {ads.slice(0, 5).map((ad) => (
              <div key={ad.id} className={styles.campaignItem}>
                <div className={styles.campaignInfo}>
                  <span className={styles.campaignTitle}>{ad.title || "Untitled"}</span>
                  <span className={styles.campaignAdvertiser}>{ad.full_name}</span>
                </div>
                <div className={styles.campaignDetails}>
                  <span className={styles.campaignPrice}>{formatAmount(ad.admin_price)}</span>
                  <span
                    className={styles.campaignStatus}
                    style={{
                      backgroundColor: `${getStatusColor(ad.status)}22`,
                      color: getStatusColor(ad.status),
                    }}
                  >
                    {ad.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdsStats;
