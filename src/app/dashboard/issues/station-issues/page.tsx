"use client";

import React, { useState, useEffect, useCallback } from "react";
import styles from "./station-issues.module.css";
import {
  FiAlertCircle,
  FiSearch,
  FiRefreshCw,
  FiDownload,
  FiEye,
  FiX,
} from "react-icons/fi";
import { stationIssuesService } from "../../../../lib/api/station-issues.service";
import {
  StationIssueListItem,
  StationIssueStatus,
  StationIssuePriority,
  StationIssueDetail,
} from "../../../../types/station-issues.types";

const statusTabs: (StationIssueStatus | "ALL")[] = [
  "ALL",
  "REPORTED",
  "ACKNOWLEDGED",
  "IN_PROGRESS",
  "RESOLVED",
];

export default function StationIssuesPage() {
  const [issues, setIssues] = useState<StationIssueListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<StationIssueStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedIssue, setSelectedIssue] = useState<StationIssueDetail | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<StationIssueStatus | "">(
    "",
  );
  const [selectedPriority, setSelectedPriority] = useState<
    StationIssuePriority | ""
  >("");
  const [assignedToId, setAssignedToId] = useState<string>("");

  const fetchIssues = useCallback(
    async (status?: StationIssueStatus | "ALL", search?: string) => {
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

        const response = await stationIssuesService.getStationIssues(filters);

        if (response.success) {
          setIssues(response.data);
        } else {
          setError("Failed to fetch station issues");
        }
      } catch (err: any) {
        console.error("Error fetching station issues:", err);
        setError("Unable to load station issues. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchIssues(activeTab === "ALL" ? undefined : activeTab, searchQuery);
  }, [activeTab, fetchIssues]);

  const handleTabClick = (tab: StationIssueStatus | "ALL") => {
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
    stationIssuesService.downloadCSV(issues, `station_issues_${timestamp}.csv`);
  };

  const handleViewDetails = async (issueId: string) => {
    try {
      setModalLoading(true);
      setIsModalOpen(true);
      const response =
        await stationIssuesService.getStationIssueDetail(issueId);
      if (response.success) {
        setSelectedIssue(response.data);
        setNotes(response.data.notes || "");
        setSelectedStatus(response.data.status);
        setSelectedPriority(response.data.priority);
        setAssignedToId(response.data.assigned_to?.id || "");
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
    setSelectedStatus("");
    setSelectedPriority("");
    setAssignedToId("");
  };

  const handleUpdateIssue = async (issueId: string) => {
    try {
      setUpdateLoading(true);
      const updateData: any = {};

      if (selectedStatus) {
        updateData.status = selectedStatus;
      }
      if (selectedPriority) {
        updateData.priority = selectedPriority;
      }
      if (assignedToId && assignedToId.trim()) {
        const trimmedId = assignedToId.trim();
        // Validate UUID format
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(trimmedId)) {
          alert(
            "Invalid Admin ID format. Please enter a valid UUID (e.g., 550e8400-e29b-41d4-a716-446655440000)",
          );
          setUpdateLoading(false);
          return;
        }
        updateData.assigned_to_id = trimmedId;
      }
      if (notes && notes.trim()) {
        updateData.notes = notes.trim();
      }

      if (Object.keys(updateData).length === 0) {
        alert("Please make at least one change to update");
        setUpdateLoading(false);
        return;
      }

      const response = await stationIssuesService.updateStationIssue(
        issueId,
        updateData,
      );

      if (response.success) {
        setSelectedIssue(response.data);
        fetchIssues(activeTab === "ALL" ? undefined : activeTab, searchQuery);
        alert("Issue updated successfully");
      }
    } catch (err: any) {
      console.error("Error updating issue:", err);
      alert("Failed to update issue");
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
      const response = await stationIssuesService.deleteStationIssue(issueId);

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

  const getStatusClass = (status: StationIssueStatus): string => {
    switch (status) {
      case "REPORTED":
        return styles.reported;
      case "ACKNOWLEDGED":
        return styles.acknowledged;
      case "IN_PROGRESS":
        return styles.inProgress;
      case "RESOLVED":
        return styles.resolved;
      default:
        return "";
    }
  };

  const getPriorityClass = (priority: StationIssuePriority): string => {
    switch (priority) {
      case "LOW":
        return styles.priorityLow;
      case "MEDIUM":
        return styles.priorityMedium;
      case "HIGH":
        return styles.priorityHigh;
      case "CRITICAL":
        return styles.priorityCritical;
      default:
        return "";
    }
  };

  const getIssueTypeClass = (issueType: string): string => {
    switch (issueType) {
      case "DIRTY":
        return styles.dirty;
      case "WRONG_LOCATION":
        return styles.wrongLocation;
      case "OFFLINE":
        return styles.offline;
      case "DAMAGED":
        return styles.damaged;
      case "SLOTS_ERROR":
        return styles.slotsError;
      case "AMENITY_ISSUE":
        return styles.amenityIssue;
      default:
        return styles.other;
    }
  };

  return (
    <>
      <main className={styles.container}>
        <div className={styles.headerSection}>
          <div>
            <h1 className={styles.title}>Station Issues Management</h1>
            <p className={styles.subtitle}>
              View and manage station issues reported by users
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
              placeholder="Search by station name, reporter, or description..."
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
              {tab === "ALL" ? "All" : stationIssuesService.getStatusLabel(tab)}
            </button>
          ))}
        </div>

        {/* Table Card */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <FiAlertCircle className={styles.icon} /> Station Issues
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
              <p>Loading station issues...</p>
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
              <p>No station issues found</p>
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
                    <th>Station</th>
                    <th>Reporter</th>
                    <th>Issue Type</th>
                    <th>Priority</th>
                    <th>Description</th>
                    <th>Assigned To</th>
                    <th>Reported</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.map((issue) => (
                    <tr key={issue.id}>
                      <td>
                        <div className={styles.stationInfo}>
                          <span className={styles.stationName}>
                            {issue.station_name}
                          </span>
                          <span className={styles.stationSerial}>
                            {issue.station_serial}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.userInfo}>
                          <span className={styles.username}>
                            {issue.reporter_name}
                          </span>
                          <span className={styles.email}>
                            {issue.reporter_email}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`${styles.issueType} ${getIssueTypeClass(
                            issue.issue_type,
                          )}`}
                        >
                          {stationIssuesService.getIssueTypeLabel(
                            issue.issue_type,
                          )}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`${styles.priority} ${getPriorityClass(
                            issue.priority,
                          )}`}
                        >
                          {stationIssuesService.getPriorityLabel(
                            issue.priority,
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
                        <span className={styles.assignedTo}>
                          {issue.assigned_to_name || "Unassigned"}
                        </span>
                      </td>
                      <td>
                        <div className={styles.timeInfo}>
                          <span className={styles.date}>
                            {stationIssuesService.formatDateTime(
                              issue.reported_at,
                              false,
                            )}
                          </span>
                          <span className={styles.timeAgo}>
                            {stationIssuesService.getTimeSinceReported(
                              issue.reported_at,
                            )}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`${styles.status} ${getStatusClass(
                            issue.status,
                          )}`}
                        >
                          {stationIssuesService.getStatusLabel(issue.status)}
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
              <h2>Station Issue Details</h2>
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
                          selectedIssue.issue_type,
                        )}`}
                      >
                        {stationIssuesService.getIssueTypeLabel(
                          selectedIssue.issue_type,
                        )}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Current Priority:</label>
                      <span
                        className={`${styles.priority} ${getPriorityClass(
                          selectedIssue.priority,
                        )}`}
                      >
                        {stationIssuesService.getPriorityLabel(
                          selectedIssue.priority,
                        )}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Current Status:</label>
                      <span
                        className={`${styles.status} ${getStatusClass(
                          selectedIssue.status,
                        )}`}
                      >
                        {stationIssuesService.getStatusLabel(
                          selectedIssue.status,
                        )}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Reported At:</label>
                      <span>
                        {stationIssuesService.formatDateTime(
                          selectedIssue.reported_at,
                        )}
                      </span>
                    </div>
                    {selectedIssue.resolved_at && (
                      <div className={styles.detailItem}>
                        <label>Resolved At:</label>
                        <span>
                          {stationIssuesService.formatDateTime(
                            selectedIssue.resolved_at,
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
                  <h3>Station Information</h3>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <label>Station Name:</label>
                      <span>{selectedIssue.station.station_name}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Serial Number:</label>
                      <span className={styles.stationSerial}>
                        {selectedIssue.station.serial_number}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Station Status:</label>
                      <span>{selectedIssue.station.status}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Address:</label>
                      <span>{selectedIssue.station.address}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h3>Reporter Information</h3>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <label>Username:</label>
                      <span>{selectedIssue.reporter.username}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Email:</label>
                      <span>{selectedIssue.reporter.email}</span>
                    </div>
                    {selectedIssue.reporter.phone_number && (
                      <div className={styles.detailItem}>
                        <label>Phone:</label>
                        <span>{selectedIssue.reporter.phone_number}</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedIssue.assigned_to && (
                  <div className={styles.detailSection}>
                    <h3>Assigned To</h3>
                    <div className={styles.detailGrid}>
                      <div className={styles.detailItem}>
                        <label>Username:</label>
                        <span>{selectedIssue.assigned_to.username}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <label>Email:</label>
                        <span>{selectedIssue.assigned_to.email}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className={styles.detailSection}>
                  <h3>Update Issue</h3>
                  <div className={styles.updateGrid}>
                    <div className={styles.detailItem}>
                      <label>Status:</label>
                      <select
                        className={styles.select}
                        value={selectedStatus}
                        onChange={(e) =>
                          setSelectedStatus(
                            e.target.value as StationIssueStatus,
                          )
                        }
                      >
                        <option value="REPORTED">Reported</option>
                        <option value="ACKNOWLEDGED">Acknowledged</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                      </select>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Priority:</label>
                      <select
                        className={styles.select}
                        value={selectedPriority}
                        onChange={(e) =>
                          setSelectedPriority(
                            e.target.value as StationIssuePriority,
                          )
                        }
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                      </select>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Assign To (Admin ID - Optional):</label>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="e.g., 550e8400-e29b-41d4-a716-446655440000 (leave empty to skip)"
                        value={assignedToId}
                        onChange={(e) => setAssignedToId(e.target.value)}
                      />
                      <span className={styles.helpText}>
                        Enter a valid admin profile UUID or leave empty to not
                        change assignment
                      </span>
                    </div>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Notes:</label>
                    <textarea
                      className={styles.notesTextarea}
                      placeholder="Add notes about this issue..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>

                <div className={styles.modalActions}>
                  <button
                    onClick={() => handleUpdateIssue(selectedIssue.id)}
                    className={styles.updateBtn}
                    disabled={updateLoading}
                  >
                    {updateLoading ? "Updating..." : "Update Issue"}
                  </button>
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
