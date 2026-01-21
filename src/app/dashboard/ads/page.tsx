"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FiRefreshCw, FiSearch, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import adsService from "@/lib/api/ads.service";
import { AdRequestListItem, AdStatus } from "@/types/ads.types";
import DataTable from "@/components/DataTable/dataTable";
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
  "COMPLETED",
  "REJECTED",
  "CANCELLED",
];

const AdsPage: React.FC = () => {
  const router = useRouter();
  const [ads, setAds] = useState<AdRequestListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pageSize] = useState<number>(20);

  // Status counts
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

  const fetchAds = useCallback(
    async (status?: AdStatus | "ALL", page: number = 1, search?: string) => {
      try {
        setLoading(true);
        setError(null);

        const filters: any = {
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
          
          // Calculate status counts
          const counts: Record<string, number> = {};
          response.data.forEach((ad) => {
            counts[ad.status] = (counts[ad.status] || 0) + 1;
          });
          setStatusCounts(counts);
        } else {
          setError("Failed to fetch ad requests");
        }
      } catch (err: any) {
        console.error("Error fetching ads:", err);
        setError(err.response?.data?.message || "Failed to fetch ad requests");
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
  }, [activeTab, currentPage, searchQuery, fetchAds]);

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

  const getStatusLabel = (status: AdStatus): string => {
    return status.replace(/_/g, " ");
  };

  return (
    <main className={styles.container}>
      <div className={styles.headerSection}>
        <div>
          <h1 className={styles.title}>Ad Requests</h1>
          <p className={styles.subtitle}>
            Manage and review advertisement requests
            {totalCount > 0 && ` (${totalCount} total)`}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className={styles.refreshBtn}
          disabled={loading}
          title="Refresh data"
        >
          <FiRefreshCw className={loading ? styles.spinning : ""} />
        </button>
      </div>

      {/* Status Summary */}
      <div className={styles.statusSummary}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Total</span>
          <span className={styles.summaryValue}>{totalCount}</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Submitted</span>
          <span className={styles.summaryValue}>
            {statusCounts.SUBMITTED || 0}
          </span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Under Review</span>
          <span className={styles.summaryValue}>
            {statusCounts.UNDER_REVIEW || 0}
          </span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Running</span>
          <span className={styles.summaryValue}>
            {statusCounts.RUNNING || 0}
          </span>
        </div>
      </div>

      {/* Search Bar */}
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

      {/* Tabs */}
      <div className={styles.tabs}>
        {statusTabs.map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ""}`}
            onClick={() => handleTabClick(tab)}
            disabled={loading}
          >
            {tab === "ALL" ? "All" : getStatusLabel(tab)}
          </button>
        ))}
      </div>

      {/* Table */}
      <DataTable
        title="Ad Requests"
        subtitle={
          totalCount > 0
            ? `Showing ${ads.length} of ${totalCount} ad requests`
            : "Manage all advertisement requests"
        }
        columns={[
          {
            header: "Title",
            accessor: "title",
            render: (value: string | null) => (
              <span className={styles.adTitle}>{value || "Untitled Ad"}</span>
            ),
          },
          {
            header: "Requester",
            accessor: "full_name",
            render: (_: any, row: AdRequestListItem) => (
              <div className={styles.requesterInfo}>
                <span className={styles.requesterName}>{row.full_name}</span>
                <span className={styles.requesterEmail}>{row.user_email}</span>
              </div>
            ),
          },
          {
            header: "Contact",
            accessor: "contact_number",
            render: (value: string) => (
              <span className={styles.contact}>{value}</span>
            ),
          },
          {
            header: "Duration",
            accessor: "duration_days",
            render: (value: number | null) => (
              <span className={styles.duration}>
                {value ? `${value} days` : "N/A"}
              </span>
            ),
          },
          {
            header: "Price",
            accessor: "admin_price",
            render: (value: string | null) => (
              <span className={styles.price}>
                {adsService.formatAmount(value)}
              </span>
            ),
          },
          {
            header: "Stations",
            accessor: "station_count",
            render: (value: number) => (
              <span className={styles.stationCount}>
                {value} station{value !== 1 ? "s" : ""}
              </span>
            ),
          },
          {
            header: "Submitted",
            accessor: "submitted_at",
            render: (value: string) => (
              <span className={styles.date}>
                {adsService.formatDate(value)}
              </span>
            ),
          },
          {
            header: "Status",
            accessor: "status",
            render: (value: AdStatus) => (
              <span className={`${styles.statusBadge} ${getStatusBadgeClass(value)}`}>
                {getStatusLabel(value)}
              </span>
            ),
          },
        ]}
        data={ads}
        loading={loading}
        emptyMessage={
          error
            ? error
            : searchQuery
              ? "No ad requests found matching your search"
              : "No ad requests available"
        }
        onRowClick={(row) => handleViewDetail(row.id)}
      />
    </main>
  );
};

export default AdsPage;
