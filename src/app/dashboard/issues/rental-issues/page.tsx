"use client";

import React, { useState, useEffect, useCallback } from "react";
import styles from "./rental-issues.module.css";
import {
  FiAlertCircle,
  FiSearch,
  FiRefreshCw,
  FiDownload,
  FiEye,
  FiX,
} from "react-icons/fi";
import { rentalIssuesService } from "../../../../lib/api/rental-issues.service";
import {
  RentalIssueListItem,
  RentalIssueStatus,
  RentalIssueDetail,
} from "../../../../types/rental-issues.types";

const statusTabs: (RentalIssueStatus | "ALL")[] = ["ALL", "REPORTED", "RESOLVED"];

export default function RentalIssuesPage() {
  const [issues, setIssues] = useState<RentalIssueListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<RentalIssueStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedIssue, setSelectedIssue] = useState<RentalIssueDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>("");

  const fetchIssues = useCallback(
    async (status?: RentalIssueStatus | "ALL", search?: string) => {
      try {
        setLoading(true);
        setError(null);

        const filters: any = {};

        if (status && status !== "ALL") {
          filters.status = status;
        }

        if (search && search.trim()) {
          filters.search = search.trim();
        }

        const response = await rentalIssuesService.getRentalIssues(filters);

        if (response.success) {
          setIssues(response.data);
        } else {
          setError("Failed to fetch rental issues");
        }
      } catch (err: any) {
        console.error("Error fetching rental issues:", err);
        setError("Unable to load rental issues. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchIssues(activeTab === "ALL" ? undefined : activeTab, searchQuery);
  }, [activeTab, fetchIssues]);

  const handleTabClick = (tab: RentalIssueStatus | "ALL") => {
    setActiveTab(tab);
    setSearchQuery("");
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchIssues(activeTab === "ALL" ? undefined : activeTab, searchQuery);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleRefresh = () => {
    fetchIssues(activeTab === "ALL" ? undefined : activeTab, searchQuery);
  };

  const handleExportCSV = () => {
    if (issues.length === 0) {
      alert("No data to export");
      return;
    }
    const timestamp = new Date().toISOString().split("T")[0];
    rentalIssuesService.downloadCSV(issues, `rental_issues_${timestamp}.csv`);
  };

  const handleViewDetails = async (issueId: string) => {
    try {
      setModalLoading(true);
      setIsModalOpen(true);
      const response = await rentalIssuesService.getRentalIssueDetail(issueId);
      if (response.success) {
        setSelectedIssue(response.data);
        setNotes(response.data.notes || "");
      }
    } catch (err) {
      console.error("Error fetching issue details:", err);
      alert("Failed to load issue details");
      setIsModalOpen(false);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedIssue(null);
    setNotes("");
  };

  const handleUpdateStatus = async (
    issueId: string,
    newStatus: RentalIssueStatus
  ) => {
    try {
      setUpdateLoading(true);
      const response = await rentalIssuesService.updateRentalIssue(issueId, {
        status: newStatus,
        notes: notes || undefined,
      });

      if (response.success) {
        setSelectedIssue(response.data);
        fetchIssues(activeTab === "ALL" ? undefined : activeTab, searchQuery);
        alert(`Issue ${newStatus.toLowerCase()} successfully`);
      }
    } catch (err: any) {
      console.error("Error updating issue:", err);
      alert("Failed to update issue status");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteIssue = async (issueId: string) => {
    if (!confirm("Are you sure you want to delete this issue?")) {
      return;
    }

    try {
      setUpdateLoading(true);
      const response = await rentalIssuesService.deleteRentalIssue(issueId);

      if (response.success) {
        handleCloseModal();
        fetchIssues(activeTab === "ALL" ? undefined : activeTab, searchQuery);
        alert("Issue deleted successfully");
      }
    } catch (err: any) {
      console.error("Error deleting issue:", err);
      alert("Failed to delete issue");
    } finally {
      setUpdateLoading(false);
    }
  };

  const getStatusClass = (status: RentalIssueStatus): string => {
    switch (status) {
      case "REPORTED":
        return styles.reported;
      case "RESOLVED":
        return styles.resolved;
      default:
        return "";
    }
  };

  const getIssueTypeClass = (issueType: string): string => {
    switch (issueType) {
      case "POWER_BANK_LOST":
        return styles.critical;
      case "CHARGING_ISSUE":
        return styles.warning;
      case "DAMAGED_DEVICE":
        return styles.danger;
      case "NOT_RETURNED":
        return styles.critical;
      case "STATION_MALFUNCTION":
        return styles.info;
      default:
        return styles.other;
    }
  };

  return (
    <>
      <main className={styles.container}>
        <div className={styles.headerSection}>
          <div>
            <h1 className={styles.title}>Rental Issues Management</h1>
            <p className={styles.subtitle}>
              View and manage rental issues reported by users
              {issues.length > 0 && ` (${issues.length} total)`}
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
              placeholder="Search by rental code, user name, or email..."
              value={searchQuery}
              onChange={handleSearchChange}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
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
              {tab === "ALL"
                ? "All"
                : rentalIssuesService.getStatusLabel(tab)}
            </button>
          ))}
        </div>

        {/* Table Card */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <FiAlertCircle className={styles.icon} /> Rental Issues
            </h2>
            <button
              className={styles.exportBtn}
              onClick={handleExportCSV}
              disabled={loading || issues.length === 0}
            >
              <FiDownload /> Export CSV
            </button>
          </div>

          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner} />
              <p>Loading rental issues...</p>
            </div>
          ) : error ? (
            <div className={styles.errorContainer}>
              <FiAlertCircle className={styles.errorIcon} />
              <p className={styles.errorText}>{error}</p>
              <button onClick={handleRefresh} className={styles.retryButton}>
                <FiRefreshCw /> Retry
              </button>
            </div>
          ) : issues.length === 0 ? (
            <div className={styles.noData}>
              <FiAlertCircle className={styles.noDataIcon} />
              <p>No rental issues found</p>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                  }}
                  className={styles.clearFiltersBtn}
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Rental Code</th>
                    <th>User</th>
                    <th>Issue Type</th>
                    <th>Description</th>
                    <th>Station</th>
                    <th>Power Bank</th>
                    <th>Reported</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.map((issue) => (
                    <tr key={issue.id}>
                      <td>
                        <span className={styles.rentalCode}>
                          {issue.rental_code}
                        </span>
                      </td>
                      <td>
                        <div className={styles.userInfo}>
                          <span className={styles.username}>
                            {issue.user_name}
                          </span>
                          <span className={styles.email}>
                            {issue.user_email}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`${styles.issueType} ${getIssueTypeClass(
                            issue.issue_type
                          )}`}
                        >
                          {rentalIssuesService.getIssueTypeLabel(
                            issue.issue_type
                          )}
                        </span>
                      </td>
                      <td>
                        <span className={styles.description}>
                          {issue.description.length > 50
                            ? `${issue.description.substring(0, 50)}...`
                            : issue.description}
                        </span>
                      </td>
                      <td>
                        <span className={styles.stationName}>
                          {issue.station_name}
                        </span>
                      </td>
                      <td>
                        <span className={styles.powerBankSerial}>
                          {issue.power_bank_serial}
                        </span>
                      </td>
                      <td>
                        <div className={styles.timeInfo}>
                          <span className={styles.date}>
                            {rentalIssuesService.formatDateTime(
                              issue.reported_at,
                              false
                            )}
                          </span>
                          <span className={styles.timeAgo}>
                            {rentalIssuesService.getTimeSinceReported(
                              issue.reported_at
                            )}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`${styles.status} ${getStatusClass(
                            issue.status
                          )}`}
                        >
                          {rentalIssuesService.getStatusLabel(issue.status)}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleViewDetails(issue.id)}
                          className={styles.viewBtn}
                          title="View details"
                        >
                          <FiEye />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Issue Detail Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>Issue Details</h2>
              <button
                onClick={handleCloseModal}
                className={styles.closeBtn}
                aria-label="Close"
              >
                <FiX />
              </button>
            </div>

            {modalLoading ? (
              <div className={styles.modalLoading}>
                <div className={styles.spinner} />
                <p>Loading issue details...</p>
              </div>
            ) : selectedIssue ? (
              <div className={styles.modalBody}>
                <div className={styles.detailSection}>
                  <h3>Issue Information</h3>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <label>Issue Type:</label>
                      <span
                        className={`${styles.issueType} ${getIssueTypeClass(
                          selectedIssue.issue_type
                        )}`}
                      >
                        {rentalIssuesService.getIssueTypeLabel(
                          selectedIssue.issue_type
                        )}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Status:</label>
                      <span
                        className={`${styles.status} ${getStatusClass(
                          selectedIssue.status
                        )}`}
                      >
                        {rentalIssuesService.getStatusLabel(
                          selectedIssue.status
                        )}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Reported At:</label>
                      <span>
                        {rentalIssuesService.formatDateTime(
                          selectedIssue.reported_at
                        )}
                      </span>
                    </div>
                    {selectedIssue.resolved_at && (
                      <div className={styles.detailItem}>
                        <label>Resolved At:</label>
                        <span>
                          {rentalIssuesService.formatDateTime(
                            selectedIssue.resolved_at
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className={styles.detailItem}>
                    <label>Description:</label>
                    <p className={styles.descriptionText}>
                      {selectedIssue.description}
                    </p>
                  </div>
                  {selectedIssue.images?.image && (
                    <div className={styles.detailItem}>
                      <label>Issue Image:</label>
                      <img
                        src={selectedIssue.images.image}
                        alt="Issue"
                        className={styles.issueImage}
                      />
                    </div>
                  )}
                </div>

                <div className={styles.detailSection}>
                  <h3>User Information</h3>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <label>Username:</label>
                      <span>{selectedIssue.user.username}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Email:</label>
                      <span>{selectedIssue.user.email}</span>
                    </div>
                    {selectedIssue.user.phone_number && (
                      <div className={styles.detailItem}>
                        <label>Phone:</label>
                        <span>{selectedIssue.user.phone_number}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h3>Rental Information</h3>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <label>Rental Code:</label>
                      <span className={styles.rentalCode}>
                        {selectedIssue.rental.rental_code}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Rental Status:</label>
                      <span>{selectedIssue.rental.status}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Station:</label>
                      <span>
                        {selectedIssue.rental.station.name} (
                        {selectedIssue.rental.station.serial_number})
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Return Station:</label>
                      <span>
                        {selectedIssue.rental.return_station.name} (
                        {selectedIssue.rental.return_station.serial_number})
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Power Bank:</label>
                      <span className={styles.powerBankSerial}>
                        {selectedIssue.rental.power_bank.serial_number}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h3>Resolution Notes</h3>
                  <textarea
                    className={styles.notesTextarea}
                    placeholder="Add notes about the resolution..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className={styles.modalActions}>
                  {selectedIssue.status === "REPORTED" ? (
                    <button
                      onClick={() =>
                        handleUpdateStatus(selectedIssue.id, "RESOLVED")
                      }
                      className={styles.resolveBtn}
                      disabled={updateLoading}
                    >
                      {updateLoading ? "Updating..." : "Mark as Resolved"}
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        handleUpdateStatus(selectedIssue.id, "REPORTED")
                      }
                      className={styles.reopenBtn}
                      disabled={updateLoading}
                    >
                      {updateLoading ? "Updating..." : "Reopen Issue"}
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteIssue(selectedIssue.id)}
                    className={styles.deleteBtn}
                    disabled={updateLoading}
                  >
                    {updateLoading ? "Deleting..." : "Delete Issue"}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
