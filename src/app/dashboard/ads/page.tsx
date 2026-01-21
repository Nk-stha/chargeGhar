"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FiRefreshCw, FiSearch } from "react-icons/fi";
import adsService from "@/lib/api/ads.service";
import { AdRequestListItem, AdStatus } from "@/types/ads.types";
import styles from "./ads.module.css";

const statusTabs: (AdStatus | "ALL")[] = [
  "ALL",
  "SUBMITTED",
  "UNDER_REVIEW",
  "PENDING_PAYMENT",
  "PAID",
  "SCHEDULED",
  "RUNNING",
  "PAUSED",
];

function AdsPage() {
  const router = useRouter();
  const [ads, setAds] = useState<AdRequestListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pageSize] = useState<number>(20);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

  const fetchAds = useCallback(
    async (status?: AdStatus | "ALL", page: number = 1, search?: string) => {
      try {
        setLoading(true);
        setError(null);

        const filters: Record<string, unknown> = {
          page,
          page_size: pageSize,
        };

        if (status && status !== "ALL") {
          filters.status = status;
        }

        if (search && search.trim()) {
          filters.search = search.trim();
        }

        const response = await adsService.getAdRequests(filters);

        if (response.success) {
          setAds(response.data);
          setTotalCount(response.data.length);
          
          const counts: Record<string, number> = {};
          response.data.forEach((ad) => {
            counts[ad.status] = (counts[ad.status] || 0) + 1;
          });
          setStatusCounts(counts);
        } else {
          setError("Failed to fetch ad requests");
        }
      } catch (err: unknown) {
        console.error("Error fetching ads:", err);
        const errorMessage = err instanceof Error && 'response' in err 
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message 
          : "Failed to fetch ad requests";
        setError(errorMessage || "Failed to fetch ad requests");
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  useEffect(() => {
    fetchAds(
      activeTab === "ALL" ? undefined : activeTab,
      currentPage,
      searchQuery
    );
  }, [activeTab, currentPage, fetchAds]);

  const handleTabClick = (tab: AdStatus | "ALL") => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchQuery("");
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchAds(activeTab === "ALL" ? undefined : activeTab, 1, searchQuery);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleRefresh = () => {
    fetchAds(
      activeTab === "ALL" ? undefined : activeTab,
      currentPage,
      searchQuery
    );
  };

  const handleViewDetail = (adId: string) => {
    router.push(`/dashboard/ads/${adId}`);
  };

  const getStatusBadgeClass = (status: AdStatus): string => {
    const statusMap: Record<AdStatus, string> = {
      SUBMITTED: styles.statusBlue,
      UNDER_REVIEW: styles.statusOrange,
      PENDING_PAYMENT: styles.statusPurple,
      PAID: styles.statusGreen,
      SCHEDULED: styles.statusCyan,
      RUNNING: styles.statusGreenPulse,
      PAUSED: styles.statusGray,
      COMPLETED: styles.statusGreenCheck,
      REJECTED: styles.statusRed,
      CANCELLED: styles.statusGrayStrike,
    };
    return statusMap[status] || styles.statusGray;
  };

  const getStatusLabel = (status: AdStatus | "ALL"): string => {
    return status.replace(/_/g, " ");
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Ad Requests</h1>
          <p>Manage and review advertisement requests ({totalCount} total)</p>
        </div>
        <div className={styles.headerRight}>
          <button
            onClick={handleRefresh}
            className={styles.iconBtn}
            disabled={loading}
            title="Refresh"
          >
            <FiRefreshCw size={20} className={loading ? styles.spinning : ""} />
          </button>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.statusSummary}>
          <div className={`${styles.glassCard} ${styles.glowGreen}`}>
            <span className={styles.summaryLabel}>Total</span>
            <span className={styles.summaryValue}>{totalCount}</span>
          </div>
          <div className={styles.glassCard}>
            <span className={styles.summaryLabel}>Submitted</span>
            <span className={styles.summaryValue}>
              {statusCounts.SUBMITTED || 0}
            </span>
          </div>
          <div className={styles.glassCard}>
            <span className={styles.summaryLabel}>Under Review</span>
            <span className={styles.summaryValue}>
              {statusCounts.UNDER_REVIEW || 0}
            </span>
          </div>
          <div className={styles.glassCard}>
            <span className={styles.summaryLabel}>Running</span>
            <span className={styles.summaryValue}>
              {statusCounts.RUNNING || 0}
            </span>
          </div>
        </div>

        <div className={styles.searchSection}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.searchContainer}>
              <FiSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by title, name, or email..."
                value={searchQuery}
                onChange={handleSearchChange}
                className={styles.searchInput}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  className={styles.clearSearch}
                >
                  ×
                </button>
              )}
            </div>
            <button type="submit" className={styles.searchBtn} disabled={loading}>
              Search
            </button>
          </form>

          <div className={styles.tabs}>
            {statusTabs.map((tab) => (
              <button
                key={tab}
                className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ""}`}
                onClick={() => handleTabClick(tab)}
                disabled={loading}
              >
                {tab === "ALL" ? "ALL" : getStatusLabel(tab)}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <h3>Ad Requests</h3>
            <p>Showing {ads.length} of {totalCount} ad requests</p>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Requester</th>
                  <th>Contact</th>
                  <th>Duration</th>
                  <th>Price</th>
                  <th>Stations</th>
                  <th>Submitted</th>
                  <th className={styles.statusColumn}>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className={styles.loadingState}>
                      Loading ad requests...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={8} className={styles.emptyState}>
                      {error}
                    </td>
                  </tr>
                ) : ads.length === 0 ? (
                  <tr>
                    <td colSpan={8} className={styles.emptyState}>
                      {searchQuery
                        ? "No ad requests found matching your search"
                        : "No ad requests available"}
                    </td>
                  </tr>
                ) : (
                  ads.map((ad) => (
                    <tr key={ad.id} onClick={() => handleViewDetail(ad.id)}>
                      <td>
                        <span className={ad.title ? styles.adTitle : styles.adTitleEmpty}>
                          {ad.title || "Untitled Ad"}
                        </span>
                      </td>
                      <td>
                        <div className={styles.requesterInfo}>
                          <span className={styles.requesterName}>{ad.full_name}</span>
                          <span className={styles.requesterEmail}>{ad.user_email}</span>
                        </div>
                      </td>
                      <td>
                        <span className={styles.contact}>{ad.contact_number}</span>
                      </td>
                      <td>
                        <span className={ad.duration_days ? styles.duration : styles.durationEmpty}>
                          {ad.duration_days ? `${ad.duration_days} days` : "N/A"}
                        </span>
                      </td>
                      <td>
                        <span className={ad.admin_price ? styles.price : styles.priceEmpty}>
                          {ad.admin_price ? adsService.formatAmount(ad.admin_price) : "N/A"}
                        </span>
                      </td>
                      <td>
                        <span className={styles.stationCount}>
                          {ad.station_count} station{ad.station_count !== 1 ? "s" : ""}
                        </span>
                      </td>
                      <td>
                        <span className={styles.date}>
                          {adsService.formatDate(ad.submitted_at)}
                        </span>
                      </td>
                      <td className={styles.statusCell}>
                        <span className={`${styles.statusBadge} ${getStatusBadgeClass(ad.status)}`}>
                          {getStatusLabel(ad.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}

export default AdsPage;
