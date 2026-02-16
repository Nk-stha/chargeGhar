"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FiRefreshCw, FiSearch, FiX } from "react-icons/fi";
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
  const [submittedDate, setSubmittedDate] = useState<string>("");

  const fetchAds = useCallback(
    async (status?: AdStatus | "ALL", page: number = 1, search?: string, dateSubmitted?: string) => {
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
          let filteredAds = response.data || [];
          
          // Filter by submitted_at on frontend if date is selected
          if (dateSubmitted) {
            filteredAds = filteredAds.filter((ad) => {
              if (!ad?.submitted_at) return false;
              const adDate = new Date(ad.submitted_at).toISOString().split('T')[0];
              return adDate === dateSubmitted;
            });
          }
          
          setAds(filteredAds);
          setTotalCount(filteredAds.length);
          
          const counts: Record<string, number> = {};
          filteredAds.forEach((ad) => {
            if (ad?.status) {
              counts[ad.status] = (counts[ad.status] || 0) + 1;
            }
          });
          setStatusCounts(counts);
        } else {
          const errorMsg = "Failed to fetch ad requests";
          setError(errorMsg);
          toast.error(errorMsg);
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error && 'response' in err 
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message 
          : "Failed to fetch ad requests";
        const errorMsg = errorMessage || "Failed to fetch ad requests";
        setError(errorMsg);
        toast.error(errorMsg);
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
      searchQuery,
      submittedDate,
    );
  }, [activeTab, currentPage, searchQuery, submittedDate, fetchAds]);

  const handleTabClick = (tab: AdStatus | "ALL") => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchQuery("");
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Auto-search when cleared
    if (!e.target.value.trim() && searchQuery) {
      setCurrentPage(1);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleSubmittedDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSubmittedDate(e.target.value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSubmittedDate("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    toast.info("Refreshing ad requests...");
    fetchAds(
      activeTab === "ALL" ? undefined : activeTab,
      currentPage,
      searchQuery,
      submittedDate,
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
                  onClick={handleClearSearch}
                  className={styles.clearSearch}
                  title="Clear search"
                >
                  <FiX />
                </button>
              )}
            </div>
            
            {/* Date Filter */}
            <div className={styles.dateFilters}>
              <div className={styles.dateInputGroup}>
                <label htmlFor="adsSubmittedDate" className={styles.dateLabel}>Submitted Date:</label>
                <input
                  type="date"
                  id="adsSubmittedDate"
                  value={submittedDate}
                  onChange={handleSubmittedDateChange}
                  className={styles.dateInput}
                />
              </div>
              {submittedDate && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className={styles.clearFiltersBtn}
                >
                  Clear Filters
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
          
          {/* Desktop Table View */}
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Requester</th>
                  <th>Contact</th>
                  <th>Duration</th>
                  <th>Price</th>
                  <th>Stations</th>
                  <th>Date Range</th>
                  <th>Submitted</th>
                  <th>Reviewed By</th>
                  <th>Approved By</th>
                  <th>Paid At</th>
                  <th className={styles.statusColumn}>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={13} className={styles.loadingState}>
                      Loading ad requests...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={13} className={styles.emptyState}>
                      {error}
                    </td>
                  </tr>
                ) : ads.length === 0 ? (
                  <tr>
                    <td colSpan={13} className={styles.emptyState}>
                      {searchQuery
                        ? "No ad requests found matching your search"
                        : "No ad requests available"}
                    </td>
                  </tr>
                ) : (
                  ads.map((ad) => (
                    <tr key={ad?.id || Math.random()} onClick={() => ad?.id && handleViewDetail(ad.id)}>
                      <td>
                        <span className={ad?.title ? styles.adTitle : styles.adTitleEmpty}>
                          {ad?.title || "Untitled Ad"}
                        </span>
                      </td>
                      <td>
                        <span className={ad?.description ? styles.description : styles.descriptionEmpty} title={ad?.description || undefined}>
                          {ad?.description ? (ad.description.length > 50 ? `${ad.description.substring(0, 50)}...` : ad.description) : "No description"}
                        </span>
                      </td>
                      <td>
                        <div className={styles.requesterInfo}>
                          <span className={styles.requesterName}>{ad?.full_name || "Unknown"}</span>
                          <span className={styles.requesterEmail}>{ad?.user_email || ad?.user_phone || "No contact"}</span>
                        </div>
                      </td>
                      <td>
                        <span className={styles.contact}>{ad?.contact_number || "N/A"}</span>
                      </td>
                      <td>
                        <span className={ad?.duration_days ? styles.duration : styles.durationEmpty}>
                          {ad?.duration_days ? `${ad.duration_days} days` : "N/A"}
                        </span>
                      </td>
                      <td>
                        <span className={ad?.admin_price ? styles.price : styles.priceEmpty}>
                          {ad?.admin_price ? adsService.formatAmount(ad.admin_price) : "N/A"}
                        </span>
                      </td>
                      <td>
                        <span className={styles.stationCount}>
                          {ad?.station_count || 0} station{(ad?.station_count || 0) !== 1 ? "s" : ""}
                        </span>
                      </td>
                      <td>
                        {ad?.start_date && ad?.end_date ? (
                          <div className={styles.dateRange}>
                            <span className={styles.dateRangeStart}>{adsService.formatDate(ad.start_date)}</span>
                            <span className={styles.dateRangeSeparator}>→</span>
                            <span className={styles.dateRangeEnd}>{adsService.formatDate(ad.end_date)}</span>
                          </div>
                        ) : (
                          <span className={styles.dateRangeEmpty}>Not scheduled</span>
                        )}
                      </td>
                      <td>
                        <span className={styles.date}>
                          {ad?.submitted_at ? adsService.formatDate(ad.submitted_at) : "N/A"}
                        </span>
                      </td>
                      <td>
                        <span className={ad?.reviewed_by_name ? styles.adminName : styles.adminNameEmpty}>
                          {ad?.reviewed_by_name || "—"}
                        </span>
                      </td>
                      <td>
                        <span className={ad?.approved_by_name ? styles.adminName : styles.adminNameEmpty}>
                          {ad?.approved_by_name || "—"}
                        </span>
                      </td>
                      <td>
                        <span className={ad?.paid_at ? styles.date : styles.dateEmpty}>
                          {ad?.paid_at ? adsService.formatDate(ad.paid_at) : "Not paid"}
                        </span>
                      </td>
                      <td className={styles.statusCell}>
                        <span className={`${styles.statusBadge} ${getStatusBadgeClass(ad?.status || "SUBMITTED")}`}>
                          {getStatusLabel(ad?.status || "SUBMITTED")}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className={styles.mobileCards}>
            {loading ? (
              <div className={styles.loadingState}>Loading ad requests...</div>
            ) : error ? (
              <div className={styles.emptyState}>{error}</div>
            ) : ads.length === 0 ? (
              <div className={styles.emptyState}>
                {searchQuery
                  ? "No ad requests found matching your search"
                  : "No ad requests available"}
              </div>
            ) : (
              ads.map((ad) => (
                <div
                  key={ad?.id || Math.random()}
                  className={styles.adCard}
                  onClick={() => ad?.id && handleViewDetail(ad.id)}
                >
                  <div className={styles.adCardHeader}>
                    <span className={ad?.title ? styles.adCardTitle : styles.adCardTitleEmpty}>
                      {ad?.title || "Untitled Ad"}
                    </span>
                    <span className={`${styles.statusBadge} ${getStatusBadgeClass(ad?.status || "SUBMITTED")}`}>
                      {getStatusLabel(ad?.status || "SUBMITTED")}
                    </span>
                  </div>

                  <div className={styles.adCardBody}>
                    <div className={styles.adCardRow}>
                      <span className={styles.adCardLabel}>Requester</span>
                      <span className={styles.adCardValue}>{ad?.full_name || "Unknown"}</span>
                    </div>
                    <div className={styles.adCardRow}>
                      <span className={styles.adCardLabel}>Contact</span>
                      <span className={styles.adCardValue}>{ad?.contact_number || "N/A"}</span>
                    </div>
                    <div className={styles.adCardRow}>
                      <span className={styles.adCardLabel}>Duration</span>
                      <span className={styles.adCardValue}>
                        {ad?.duration_days ? `${ad.duration_days} days` : "N/A"}
                      </span>
                    </div>
                    <div className={styles.adCardRow}>
                      <span className={styles.adCardLabel}>Price</span>
                      <span className={`${styles.adCardValue} ${ad?.admin_price ? styles.price : styles.priceEmpty}`}>
                        {ad?.admin_price ? adsService.formatAmount(ad.admin_price) : "N/A"}
                      </span>
                    </div>
                    <div className={styles.adCardRow}>
                      <span className={styles.adCardLabel}>Stations</span>
                      <span className={styles.adCardValue}>
                        {ad?.station_count || 0} station{(ad?.station_count || 0) !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {(ad?.start_date || ad?.end_date) && (
                      <div className={styles.adCardRow}>
                        <span className={styles.adCardLabel}>Date Range</span>
                        <span className={styles.adCardValue}>
                          {ad?.start_date && ad?.end_date
                            ? `${adsService.formatDate(ad.start_date)} → ${adsService.formatDate(ad.end_date)}`
                            : "Not scheduled"}
                        </span>
                      </div>
                    )}
                    {ad?.reviewed_by_name && (
                      <div className={styles.adCardRow}>
                        <span className={styles.adCardLabel}>Reviewed By</span>
                        <span className={`${styles.adCardValue} ${styles.adminName}`}>
                          {ad.reviewed_by_name}
                        </span>
                      </div>
                    )}
                    {ad?.approved_by_name && (
                      <div className={styles.adCardRow}>
                        <span className={styles.adCardLabel}>Approved By</span>
                        <span className={`${styles.adCardValue} ${styles.adminName}`}>
                          {ad.approved_by_name}
                        </span>
                      </div>
                    )}
                    {ad?.paid_at && (
                      <div className={styles.adCardRow}>
                        <span className={styles.adCardLabel}>Paid At</span>
                        <span className={styles.adCardValue}>
                          {adsService.formatDate(ad.paid_at)}
                        </span>
                      </div>
                    )}
                  </div>

                  {ad?.description && (
                    <div className={styles.adCardDescription}>
                      {ad.description.length > 100
                        ? `${ad.description.substring(0, 100)}...`
                        : ad.description}
                    </div>
                  )}

                  <div className={styles.adCardFooter}>
                    <span className={styles.adCardLabel}>
                      Submitted: {ad?.submitted_at ? adsService.formatDate(ad.submitted_at) : "N/A"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default AdsPage;
