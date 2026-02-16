"use client";

import React, { useState, useEffect, useCallback } from "react";
import styles from "./rentals.module.css";
import {
  FiFilter,
  FiDownload,
  FiShoppingBag,
  FiSearch,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiAlertCircle,
} from "react-icons/fi";
import { rentalsService } from "../../../lib/api/rentals.service";
import {
  RentalListItem,
  RentalStatus,
  PaymentStatus,
} from "../../../types/rentals.types";
import DataTable from "../../../components/DataTable/dataTable";
import { useRouter } from "next/navigation";

const statusTabs: (RentalStatus | "ALL")[] = [
  "ALL",
  "ACTIVE",
  "PENDING",
  "COMPLETED",
  "OVERDUE",
  "CANCELLED",
];

export default function RentalsPage() {
  const router = useRouter();
  const [rentals, setRentals] = useState<RentalListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<RentalStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pageSize] = useState<number>(20);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const fetchRentals = useCallback(
    async (
      status?: RentalStatus | "ALL",
      page: number = 1,
      search?: string,
      dateStart?: string,
      dateEnd?: string,
    ) => {
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

        if (dateStart) {
          // Convert date to ISO format with start of day (00:00:00)
          const startDateTime = new Date(dateStart + 'T00:00:00');
          filters.start_date = startDateTime.toISOString();
          
          // If only start date is provided (no end date), set end date to end of same day
          if (!dateEnd) {
            const endDateTime = new Date(dateStart + 'T23:59:59');
            filters.end_date = endDateTime.toISOString();
          }
        }

        if (dateEnd) {
          // Convert date to ISO format with end of day (23:59:59)
          const endDateTime = new Date(dateEnd + 'T23:59:59');
          filters.end_date = endDateTime.toISOString();
        }

        const response = await rentalsService.getRentals(filters);

        if (response.success) {
          setRentals(response.data.results);
          setTotalPages(response.data.pagination.total_pages);
          setTotalCount(response.data.pagination.total_count);
          setCurrentPage(response.data.pagination.current_page);
        } else {
          setError("Failed to fetch rentals");
        }
      } catch (err: any) {
        setError("Unable to load rentals. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [pageSize],
  );

  useEffect(() => {
    fetchRentals(
      activeTab === "ALL" ? undefined : activeTab,
      currentPage,
      searchQuery,
      startDate,
      endDate,
    );
  }, [activeTab, currentPage, searchQuery, startDate, endDate, fetchRentals]);

  const handleTabClick = (tab: RentalStatus | "ALL") => {
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
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
    setCurrentPage(1);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    fetchRentals(
      activeTab === "ALL" ? undefined : activeTab,
      currentPage,
      searchQuery,
      startDate,
      endDate,
    );
  };

  const handleExportCSV = () => {
    if (rentals.length === 0) {
      alert("No data to export");
      return;
    }
    const timestamp = new Date().toISOString().split("T")[0];
    rentalsService.downloadCSV(rentals, `rentals_${timestamp}.csv`);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const getStatusClass = (status: RentalStatus): string => {
    switch (status) {
      case "ACTIVE":
        return styles.active;
      case "COMPLETED":
        return styles.completed;
      case "PENDING":
        return styles.pending;
      case "CANCELLED":
        return styles.cancelled;
      case "OVERDUE":
        return styles.overdue;
      default:
        return "";
    }
  };

  const getPaymentStatusClass = (status: PaymentStatus): string => {
    switch (status) {
      case "PAID":
        return styles.paid;
      case "PENDING":
        return styles.paymentPending;
      case "FAILED":
        return styles.failed;
      case "REFUNDED":
        return styles.refunded;
      default:
        return "";
    }
  };

  const handleRowClick = (rentalId: string) => {
    router.push(`/dashboard/rentals/${rentalId}`);
  };

  return (
    <>
      <main className={styles.container}>
        <div className={styles.headerSection}>
          <div>
            <h1 className={styles.title}>Rentals Management</h1>
            <p className={styles.subtitle}>
              View and manage all rental transactions
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

        {/* Search Bar */}
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <div className={styles.searchContainer}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by rental code, user name, or phone..."
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
          
          {/* Date Filters */}
          <div className={styles.dateFilters}>
            <div className={styles.dateInputGroup}>
              <label htmlFor="startDate" className={styles.dateLabel}>Start Date:</label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={handleStartDateChange}
                className={styles.dateInput}
              />
            </div>
            <div className={styles.dateInputGroup}>
              <label htmlFor="endDate" className={styles.dateLabel}>End Date:</label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={handleEndDateChange}
                className={styles.dateInput}
              />
            </div>
            {(startDate || endDate) && (
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

        {/* Tabs */}
        <div className={styles.tabs}>
          {statusTabs.map((tab) => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ""
                }`}
              onClick={() => handleTabClick(tab)}
              disabled={loading}
            >
              {tab === "ALL" ? "All" : rentalsService.getStatusLabel(tab)}
            </button>
          ))}
        </div>

        {/* Active Filters Indicator */}
        {(startDate || endDate || searchQuery) && (
          <div className={styles.activeFilters}>
            <FiFilter size={16} />
            <span>Active filters:</span>
            {searchQuery && <span className={styles.filterTag}>Search: "{searchQuery}"</span>}
            {startDate && !endDate && <span className={styles.filterTag}>Date: {new Date(startDate).toLocaleDateString()}</span>}
            {startDate && endDate && startDate !== endDate && (
              <>
                <span className={styles.filterTag}>From: {new Date(startDate).toLocaleDateString()}</span>
                <span className={styles.filterTag}>To: {new Date(endDate).toLocaleDateString()}</span>
              </>
            )}
            {startDate && endDate && startDate === endDate && (
              <span className={styles.filterTag}>Date: {new Date(startDate).toLocaleDateString()}</span>
            )}
          </div>
        )}

        {/* Table Card */}
        <DataTable
          title="Rentals"
          subtitle={totalCount > 0 ? `Showing ${rentals.length} of ${totalCount} rentals` : "Manage all rental transactions"}
          columns={[
            {
              header: "Rental Code",
              accessor: "rental_code",
              render: (value: string, row: RentalListItem) => (
                <div className={styles.rentalCodeCell}>
                  <span className={styles.rentalCode}>{value}</span>
                  <span className={styles.createdDate}>
                    {rentalsService.formatDateTime(row.created_at)}
                  </span>
                </div>
              ),
            },
            {
              header: "User",
              accessor: "username",
              render: (_: any, row: RentalListItem) => (
                <div className={styles.userInfo}>
                  <span className={styles.username}>{row.username || "N/A"}</span>
                  {row.user_phone && (
                    <span className={styles.phone}>{row.user_phone}</span>
                  )}
                </div>
              ),
            },
            {
              header: "Station",
              accessor: "station_name",
              render: (_: any, row: RentalListItem) => (
                <div className={styles.stationInfo}>
                  <span>{row.station_name}</span>
                  <span className={styles.stationSerial}>
                    {row.station_serial}
                  </span>
                </div>
              ),
            },
            {
              header: "Return Station",
              accessor: "return_station_name",
              render: (value: string | null) => (
                <div className={styles.stationInfo}>
                  <span>{value || "Not returned"}</span>
                </div>
              ),
            },
            {
              header: "PowerBank",
              accessor: "powerbank_serial",
              render: (value: string | null) => (
                <span className={styles.powerbankSerial}>{value || "N/A"}</span>
              ),
            },
            {
              header: "Package",
              accessor: "package_name",
              render: (_: any, row: RentalListItem) => (
                <div className={styles.packageInfo}>
                  <span>{row.package_name}</span>
                  <span className={styles.duration}>
                    {rentalsService.formatDuration(row.package_duration)}
                  </span>
                </div>
              ),
            },
            {
              header: "Started / Ended",
              accessor: "started_at",
              render: (_: any, row: RentalListItem) => (
                <div className={styles.timeInfo}>
                  <span className={styles.startTime}>
                    {rentalsService.formatDateTime(row.started_at)}
                  </span>
                  {row.ended_at && (
                    <span className={styles.endTime}>
                      {rentalsService.formatDateTime(row.ended_at)}
                    </span>
                  )}
                </div>
              ),
            },
            {
              header: "Due Date",
              accessor: "due_at",
              render: (_: any, row: RentalListItem) => (
                <div className={styles.dueInfo}>
                  <span className={styles.date}>
                    {rentalsService.formatDateTime(row.due_at)}
                  </span>
                  {row.is_returned_on_time !== null && (
                    <span className={row.is_returned_on_time ? styles.onTime : styles.late}>
                      {row.is_returned_on_time ? "On Time" : "Late"}
                    </span>
                  )}
                </div>
              ),
            },
            {
              header: "Amount",
              accessor: "amount_paid",
              render: (_: any, row: RentalListItem) => (
                <div className={styles.amountInfo}>
                  <span className={styles.amount}>
                    {rentalsService.formatAmount(row.amount_paid)}
                  </span>
                  {parseFloat(row.overdue_amount) > 0 && (
                    <span className={styles.overdueAmount}>
                      +{rentalsService.formatAmount(row.overdue_amount)} overdue
                    </span>
                  )}
                </div>
              ),
            },
            {
              header: "Payment",
              accessor: "payment_status",
              render: (value: PaymentStatus) => (
                <span
                  className={`${styles.paymentStatus} ${getPaymentStatusClass(value)}`}
                >
                  {rentalsService.getPaymentStatusLabel(value)}
                </span>
              ),
            },
            {
              header: "Status",
              accessor: "status",
              render: (value: RentalStatus) => (
                <span className={`${styles.status} ${getStatusClass(value)}`}>
                  {rentalsService.getStatusLabel(value)}
                </span>
              ),
            },
          ]}
          data={rentals}
          loading={loading}
          emptyMessage={
            error
              ? error
              : (startDate || endDate)
                ? `No rentals found for the selected date range${searchQuery ? ' and search criteria' : ''}`
                : searchQuery
                  ? "No rentals found matching your search"
                  : "No rentals found"
          }
          onRowClick={(row: RentalListItem) => handleRowClick(row.id)}
          mobileCardRender={(row: RentalListItem) => (
            <div onClick={() => handleRowClick(row.id)} style={{ cursor: "pointer" }}>
              <div style={{ marginBottom: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <span className={styles.rentalCode}>{row.rental_code}</span>
                <span className={`${styles.status} ${getStatusClass(row.status)}`}>
                  {rentalsService.getStatusLabel(row.status)}
                </span>
              </div>
              <div className={styles.userInfo} style={{ marginBottom: "0.5rem" }}>
                <span className={styles.username}>{row.username}</span>
                {row.user_phone && <span className={styles.phone}>{row.user_phone}</span>}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <span className={`${styles.paymentStatus} ${getPaymentStatusClass(row.payment_status)}`}>
                  {rentalsService.getPaymentStatusLabel(row.payment_status)}
                </span>
                <span className={styles.amount}>{rentalsService.formatAmount(row.amount_paid)}</span>
              </div>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#999" }}>
                {row.station_name} → {row.return_station_name}
              </p>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.75rem", color: "#888" }}>
                Due: {rentalsService.formatDateTime(row.due_at)}
              </p>
            </div>
          )}
        />

        {/* Pagination */}
        {totalPages > 1 && !loading && !error && rentals.length > 0 && (
          <div className={styles.pagination}>
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || loading}
              className={styles.paginationBtn}
            >
              <FiChevronLeft /> Previous
            </button>
            <span className={styles.pageInfo}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages || loading}
              className={styles.paginationBtn}
            >
              Next <FiChevronRight />
            </button>
          </div>
        )}
      </main>
    </>
  );
}
