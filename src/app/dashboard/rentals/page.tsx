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
import RentalDetailModal from "../../../components/RentalDetailModal/RentalDetailModal";

const statusTabs: (RentalStatus | "ALL")[] = [
  "ALL",
  "ACTIVE",
  "PENDING",
  "COMPLETED",
  "OVERDUE",
  "CANCELLED",
];

export default function RentalsPage() {
  const [rentals, setRentals] = useState<RentalListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<RentalStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pageSize] = useState<number>(20);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedRentalId, setSelectedRentalId] = useState<string>("");

  const fetchRentals = useCallback(
    async (
      status?: RentalStatus | "ALL",
      page: number = 1,
      search?: string,
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
        console.error("Error fetching rentals:", err);
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
    );
  }, [activeTab, currentPage, searchQuery, fetchRentals]);

  const handleTabClick = (tab: RentalStatus | "ALL") => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchQuery("");
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchRentals(activeTab === "ALL" ? undefined : activeTab, 1, searchQuery);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleRefresh = () => {
    fetchRentals(
      activeTab === "ALL" ? undefined : activeTab,
      currentPage,
      searchQuery,
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
    setSelectedRentalId(rentalId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRentalId("");
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
          <button type="submit" className={styles.searchBtn} disabled={loading}>
            Search
          </button>
        </form>

        {/* Tabs */}
        <div className={styles.tabs}>
          {statusTabs.map((tab) => (
            <button
              key={tab}
              className={`${styles.tab} ${
                activeTab === tab ? styles.activeTab : ""
              }`}
              onClick={() => handleTabClick(tab)}
              disabled={loading}
            >
              {tab === "ALL" ? "All" : rentalsService.getStatusLabel(tab)}
            </button>
          ))}
        </div>

        {/* Table Card */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <FiShoppingBag className={styles.icon} /> Rentals
            </h2>
            <button
              className={styles.exportBtn}
              onClick={handleExportCSV}
              disabled={loading || rentals.length === 0}
            >
              <FiDownload /> Export CSV
            </button>
          </div>

          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner} />
              <p>Loading rentals...</p>
            </div>
          ) : error ? (
            <div className={styles.errorContainer}>
              <FiAlertCircle className={styles.errorIcon} />
              <p className={styles.errorText}>{error}</p>
              <button onClick={handleRefresh} className={styles.retryButton}>
                <FiRefreshCw /> Retry
              </button>
            </div>
          ) : rentals.length === 0 ? (
            <div className={styles.noData}>
              <FiShoppingBag className={styles.noDataIcon} />
              <p>No rentals found</p>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  className={styles.clearFiltersBtn}
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Rental Code</th>
                      <th>User</th>
                      <th>Station</th>
                      <th>Return Station</th>
                      <th>Package</th>
                      <th>Due Date</th>
                      <th>Amount</th>
                      <th>Payment</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rentals.map((rental) => (
                      <tr
                        key={rental.id}
                        onClick={() => handleRowClick(rental.id)}
                        className={styles.clickableRow}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            handleRowClick(rental.id);
                          }
                        }}
                      >
                        <td>
                          <span className={styles.rentalCode}>
                            {rental.rental_code}
                          </span>
                        </td>
                        <td>
                          <div className={styles.userInfo}>
                            <span className={styles.username}>
                              {rental.username}
                            </span>
                            {rental.user_phone && (
                              <span className={styles.phone}>
                                {rental.user_phone}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className={styles.stationInfo}>
                            <span>{rental.station_name}</span>
                            <span className={styles.stationSerial}>
                              {rental.station_serial}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className={styles.stationInfo}>
                            <span>{rental.return_station_name}</span>
                          </div>
                        </td>
                        <td>
                          <div className={styles.packageInfo}>
                            <span>{rental.package_name}</span>
                            <span className={styles.duration}>
                              {rentalsService.formatDuration(
                                rental.package_duration,
                              )}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={styles.date}>
                            {rentalsService.formatDateTime(rental.due_at)}
                          </span>
                        </td>
                        <td>
                          <span className={styles.amount}>
                            {rentalsService.formatAmount(rental.amount_paid)}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`${styles.paymentStatus} ${getPaymentStatusClass(
                              rental.payment_status,
                            )}`}
                          >
                            {rentalsService.getPaymentStatusLabel(
                              rental.payment_status,
                            )}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`${styles.status} ${getStatusClass(
                              rental.status,
                            )}`}
                          >
                            {rentalsService.getStatusLabel(rental.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
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
            </>
          )}
        </section>
      </main>

      {/* Rental Detail Modal */}
      <RentalDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        rentalId={selectedRentalId}
      />
    </>
  );
}
