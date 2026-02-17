"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import styles from "./monitor.module.css";
import { 
    FiFilter, 
    FiChevronDown, 
    FiInfo,
    FiCheckCircle,
    FiAlertTriangle,
    FiXCircle,
    FiRefreshCw,
    FiSearch,
    FiX,
    FiChevronUp,
} from "react-icons/fi";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../components/ui/Tabs";
import axiosInstance from "../../../lib/axios";
import RevenueChart from "../../../components/RevenueChart";
import RecentTransactions from "../../../components/RecentTransactionsCard/RecentTransactions";
import RentalOverTime from "../../../components/RentalOverTimeCard/RentalsOverTime";
import MonitorRentals from "../../../components/MonitorRentalsCard/MonitorRentalsCard";
import RecentUpdates from "../../../components/RecentUpdates/RecentUpdates";
import SystemHealth from "../../../components/SystemHealth/SystemHealth";
import PaymentAnalyticsDashboard from "../../../components/PaymentAnalytics/PaymentAnalyticsDashboard";
import PowerBankRentalAnalytics from "../../../components/PowerBankRentalAnalytics/PowerBankRentalAnalytics";
import StationAnalytics from "../../../components/StationAnalytics/StationAnalytics";
import UserAnalytics from "../../../components/UserAnalytics/UserAnalytics";
import PowerBankPerformance from "../../../components/PowerBankPerformance/PowerBankPerformance";
import WithdrawalsAnalytics from "../../../components/WithdrawalsAnalytics/WithdrawalsAnalytics";
import ReferralsAnalytics from "../../../components/ReferralsAnalytics/ReferralsAnalytics";
import PointsAnalytics from "../../../components/PointsAnalytics/PointsAnalytics";
import AchievementsAnalytics from "../../../components/AchievementsAnalytics/AchievementsAnalytics";
import PartnerRevenueAnalytics from "../../../components/PartnerRevenueAnalytics/PartnerRevenueAnalytics";
import StationDistributionStats from "../../../components/StationDistributionStats/StationDistributionStats";
import PayoutStats from "../../../components/PayoutStats/PayoutStats";
import AdsStats from "../../../components/AdsStats/AdsStats";
import RentalStats from "../../../components/RentalStats/RentalStats";

// Admin Logs Component
interface ActionLog {
  id: string;
  action_type: string;
  target_model: string;
  target_id: string;
  changes: Record<string, any>;
  description: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  admin_username: string;
  admin_email: string;
}

const AdminLogsContent: React.FC = () => {
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ActionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [showFilters, setShowFilters] = useState(false);

  const fetchActionLogs = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      const response = await axiosInstance.get("/api/admin/action-logs");

      if (response.data.success) {
        setActionLogs(response.data.data);
        setLastUpdate(new Date());
      } else {
        toast.error(response.data.message || "Failed to load logs");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load admin logs");
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActionLogs();
  }, [fetchActionLogs]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => fetchActionLogs(false), 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchActionLogs]);

  useEffect(() => {
    let filtered = [...actionLogs];
    if (filterType !== "all") {
      filtered = filtered.filter((log) =>
        (log?.action_type || "").toLowerCase().includes(filterType.toLowerCase())
      );
    }
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          (log?.description || "").toLowerCase().includes(search) ||
          (log?.admin_username || "").toLowerCase().includes(search) ||
          (log?.action_type || "").toLowerCase().includes(search) ||
          (log?.target_model || "").toLowerCase().includes(search)
      );
    }
    setFilteredLogs(filtered);
  }, [actionLogs, searchTerm, filterType]);

  const getUpdateType = (actionType: string): "info" | "success" | "warning" => {
    const successActions = ["CREATE_", "UPDATE_", "APPROVE", "ACTIVE"];
    const warningActions = ["DELETE_", "REJECT", "SUSPEND", "INACTIVE"];
    if (successActions.some((action) => actionType.includes(action))) return "success";
    if (warningActions.some((action) => actionType.includes(action))) return "warning";
    return "info";
  };

  const getIcon = (type: "info" | "success" | "warning") => {
    switch (type) {
      case "success": return <FiCheckCircle className={styles.successIcon} />;
      case "warning": return <FiAlertTriangle className={styles.warningIcon} />;
      default: return <FiInfo className={styles.infoIcon} />;
    }
  };

  const formatTimeAgo = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInMinutes = Math.floor(diffInMs / 60000);
      const diffInHours = Math.floor(diffInMs / 3600000);
      const diffInDays = Math.floor(diffInMs / 86400000);
      if (diffInMinutes < 1) return "Just now";
      if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
      if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
      if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
      return date.toLocaleDateString();
    } catch {
      return timestamp;
    }
  };

  const formatDateTime = (timestamp: string): string => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  const formatTitle = (actionType: string): string => {
    return actionType.split("_").map((word) => word.charAt(0) + word.slice(1).toLowerCase()).join(" ");
  };

  return (
    <div className={styles.logsContent}>
      <div className={styles.logsHeader}>
        <div className={styles.logsHeaderActions}>
          <button
            className={`${styles.autoRefreshBtn} ${autoRefresh ? styles.active : ""}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <FiRefreshCw className={autoRefresh ? styles.spinning : ""} />
            {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
          </button>
          <button className={styles.refreshBtn} onClick={() => fetchActionLogs(true)} disabled={loading}>
            <FiRefreshCw />
          </button>
        </div>
      </div>

      <div className={styles.logsControls}>
        <div className={styles.searchContainer}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          {searchTerm && (
            <button className={styles.clearBtn} onClick={() => setSearchTerm("")}>
              <FiX />
            </button>
          )}
        </div>
        <button className={styles.filterToggle} onClick={() => setShowFilters(!showFilters)}>
          <FiFilter />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className={styles.filterPanel}>
          <label>Action Type:</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className={styles.filterSelect}>
            <option value="all">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="approve">Approve</option>
            <option value="reject">Reject</option>
          </select>
        </div>
      )}

      <div className={styles.statsBar}>
        <div className={styles.stat}>
          <span>Total: {actionLogs.length}</span>
        </div>
        <div className={styles.stat}>
          <span>Filtered: {filteredLogs.length}</span>
        </div>
        <div className={styles.stat}>
          <span>Updated: {lastUpdate.toLocaleTimeString()}</span>
        </div>
      </div>

      {loading && actionLogs.length === 0 ? (
        <div className={styles.loadingContainer}>
          <FiRefreshCw className={styles.spinner} />
          <p>Loading admin logs...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className={styles.emptyContainer}>
          <FiInfo />
          <p>No logs found</p>
        </div>
      ) : (
        <div className={styles.logsListContainer}>
          {filteredLogs.map((log) => {
            const updateType = getUpdateType(log?.action_type || "");
            return (
              <div key={log?.id} className={styles.logCard}>
                <div className={styles.logHeader}>
                  <div className={styles.logTitle}>
                    <div className={styles.iconContainer}>{getIcon(updateType)}</div>
                    <div>
                      <h3>{formatTitle(log?.action_type || "Unknown")}</h3>
                      <span className={styles.targetModel}>{log?.target_model || "N/A"}</span>
                    </div>
                  </div>
                  <div className={styles.logMeta}>
                    <span className={styles.timeAgo}>{formatTimeAgo(log?.created_at || "")}</span>
                    <span className={styles.timestamp}>{formatDateTime(log?.created_at || "")}</span>
                  </div>
                </div>
                <div className={styles.logBody}>
                  <p>{log?.description || "No description"}</p>
                  {log?.changes && Object.keys(log.changes).length > 0 && (
                    <div className={styles.changesContainer}>
                      <h4>Changes:</h4>
                      <div className={styles.changes}>
                        {Object.entries(log.changes).map(([key, value]) => (
                          <div key={key} className={styles.changeItem}>
                            <span className={styles.changeKey}>{key}:</span>
                            <span className={styles.changeValue}>
                              {typeof value === "object" ? JSON.stringify(value) : String(value ?? "N/A")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className={styles.logFooter}>
                  <div className={styles.adminInfo}>
                    <span>{log?.admin_username || "Unknown"}</span>
                    <span>{log?.admin_email || "N/A"}</span>
                  </div>
                  <div className={styles.technicalInfo}>
                    <span>{log?.ip_address || "N/A"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// System Logs Component
interface SystemLog {
  id: string;
  level: string;
  message: string;
  source?: string;
  module?: string;
  timestamp: string;
  details?: string;
  user?: string;
  ip_address?: string;
  created_at: string;
}

interface Pagination {
  current_page: number;
  total_pages: number;
  total_count: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
}

const SystemLogsContent: React.FC = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const fetchLogs = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("page_size", "50");
      if (filterLevel !== "all") params.append("level", filterLevel.toUpperCase());
      if (searchTerm) params.append("search", searchTerm);

      const response = await axiosInstance.get(`/api/admin/system-logs?${params.toString()}`);

      if (response.data.success) {
        setLogs(response.data.data.results);
        setPagination(response.data.data.pagination);
        setLastUpdate(new Date());
      } else {
        toast.error("Failed to load system logs");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load system logs");
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterLevel, searchTerm]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => fetchLogs(false), 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchLogs]);

  const getLevelIcon = (level: string) => {
    const levelUpper = level.toUpperCase();
    switch (levelUpper) {
      case "INFO": return <FiInfo className={styles.iconInfo} />;
      case "WARNING": return <FiAlertTriangle className={styles.iconWarning} />;
      case "ERROR":
      case "CRITICAL": return <FiXCircle className={styles.iconError} />;
      default: return <FiInfo className={styles.iconInfo} />;
    }
  };

  const getLevelClass = (level: string) => {
    const levelUpper = level.toUpperCase();
    switch (levelUpper) {
      case "INFO": return styles.levelInfo;
      case "WARNING": return styles.levelWarning;
      case "ERROR":
      case "CRITICAL": return styles.levelError;
      case "DEBUG": return styles.levelDebug;
      default: return styles.levelInfo;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && pagination && newPage <= pagination.total_pages) {
      setCurrentPage(newPage);
    }
  };

  const levels = ["all", "info", "warning", "error", "debug", "critical"];

  return (
    <div className={styles.logsContent}>
      <div className={styles.logsHeader}>
        <div className={styles.logsHeaderActions}>
          <button className={styles.refreshBtn} onClick={() => fetchLogs(true)} disabled={loading}>
            <FiRefreshCw className={loading ? styles.spinning : ""} />
            Refresh
          </button>
          <label className={styles.autoRefreshLabel}>
            <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
            <span>Auto-refresh</span>
          </label>
        </div>
      </div>

      <div className={styles.logsControls}>
        <div className={styles.searchContainer}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          {searchTerm && (
            <button className={styles.clearBtn} onClick={() => setSearchTerm("")}>
              <FiX />
            </button>
          )}
        </div>
        <button className={styles.filterToggle} onClick={() => setShowFilters(!showFilters)}>
          <FiFilter />
          Filters
          {showFilters ? <FiChevronUp /> : <FiChevronDown />}
        </button>
      </div>

      {showFilters && (
        <div className={styles.filterPanel}>
          <label>Log Level:</label>
          <div className={styles.levelFilters}>
            {levels.map((level) => (
              <button
                key={level}
                className={`${styles.levelButton} ${filterLevel === level ? styles.active : ""}`}
                onClick={() => {
                  setFilterLevel(level);
                  setCurrentPage(1);
                }}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={styles.statsBar}>
        <div className={styles.stat}>
          <span>Total: {pagination?.total_count || 0}</span>
        </div>
        <div className={styles.stat}>
          <span>Showing: {logs.length}</span>
        </div>
        <div className={styles.stat}>
          <span>Updated: {lastUpdate.toLocaleTimeString()}</span>
        </div>
      </div>

      {loading && logs.length === 0 ? (
        <div className={styles.loadingContainer}>
          <FiRefreshCw className={styles.spinner} />
          <p>Loading system logs...</p>
        </div>
      ) : (
        <>
          <div className={styles.logsListContainer}>
            {logs.length > 0 ? (
              logs.map((log) => (
                <div key={log?.id} className={styles.logCard}>
                  <div className={styles.logHeader}>
                    <div className={styles.logLevel}>
                      {getLevelIcon(log?.level || "INFO")}
                      <span className={getLevelClass(log?.level || "INFO")}>
                        {(log?.level || "INFO").toUpperCase()}
                      </span>
                    </div>
                    <div className={styles.logMeta}>
                      {log?.source && <span className={styles.logSource}>{log.source}</span>}
                      {log?.module && <span className={styles.logModule}>{log.module}</span>}
                      <span className={styles.logTimestamp}>
                        {formatDate(log?.timestamp || log?.created_at || "")}
                      </span>
                    </div>
                  </div>
                  <div className={styles.logMessage}>{log?.message || "No message"}</div>
                  {(log?.details || log?.user || log?.ip_address) && (
                    <>
                      <button
                        className={styles.expandButton}
                        onClick={() => setExpandedLog(expandedLog === log?.id ? null : log?.id)}
                      >
                        {expandedLog === log?.id ? (
                          <><FiChevronUp /> Hide Details</>
                        ) : (
                          <><FiChevronDown /> Show Details</>
                        )}
                      </button>
                      {expandedLog === log?.id && (
                        <div className={styles.logDetails}>
                          {log?.details && (
                            <div className={styles.detailItem}>
                              <strong>Details:</strong>
                              <pre>{log.details}</pre>
                            </div>
                          )}
                          {log?.user && (
                            <div className={styles.detailItem}>
                              <strong>User:</strong>
                              <span>{log.user}</span>
                            </div>
                          )}
                          {log?.ip_address && (
                            <div className={styles.detailItem}>
                              <strong>IP:</strong>
                              <span>{log.ip_address}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))
            ) : (
              <div className={styles.emptyContainer}>
                <FiInfo />
                <p>No system logs found</p>
              </div>
            )}
          </div>

          {pagination && pagination.total_pages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageButton}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.has_previous || loading}
              >
                Previous
              </button>
              <div className={styles.pageInfo}>
                Page {pagination.current_page} of {pagination.total_pages}
              </div>
              <button
                className={styles.pageButton}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.has_next || loading}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

type AnalyticsFilter = 
  | "all"
  | "revenue"
  | "rentals"
  | "station-analytics"
  | "powerbank-rentals"
  | "user-analytics"
  | "payment-analytics"
  | "withdrawals-analytics"
  | "referrals-analytics"
  | "points-analytics"
  | "achievements-analytics"
  | "partner-revenue-analytics";

type StatisticsFilter =
  | "all"
  | "station-distribution"
  | "payout-stats"
  | "ads-stats"
  | "rental-stats"
  | "powerbank-performance"
  | "monitor-rentals"
  | "recent-transactions"
  | "recent-updates";

const MonitorPage: React.FC = () => {
    const [selectedFilter, setSelectedFilter] = useState<AnalyticsFilter>("all");
    const [selectedStatsFilter, setSelectedStatsFilter] = useState<StatisticsFilter>("all");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isStatsDropdownOpen, setIsStatsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const statsDropdownRef = useRef<HTMLDivElement>(null);

    const filterOptions = [
        { value: "all", label: "All Analytics" },
        { value: "revenue", label: "Revenue Over Time" },
        { value: "rentals", label: "Rentals Over Time" },
        { value: "station-analytics", label: "Station Analytics" },
        { value: "powerbank-rentals", label: "PowerBank Rental Analytics" },
        { value: "user-analytics", label: "User Analytics" },
        { value: "payment-analytics", label: "Payment Analytics" },
        { value: "withdrawals-analytics", label: "Withdrawals Analytics" },
        { value: "referrals-analytics", label: "Referrals Analytics" },
        { value: "points-analytics", label: "Points Analytics" },
        { value: "achievements-analytics", label: "Achievements Analytics" },
        { value: "partner-revenue-analytics", label: "Partner Revenue Analytics" },
    ];

    const statsFilterOptions = [
        { value: "all", label: "All Statistics" },
        { value: "station-distribution", label: "Station Distribution Stats" },
        { value: "payout-stats", label: "Payout Statistics" },
        { value: "ads-stats", label: "Ads Statistics" },
        { value: "rental-stats", label: "Rental Statistics" },
        { value: "powerbank-performance", label: "PowerBank Performance" },
        { value: "monitor-rentals", label: "Monitor Rentals" },
        { value: "recent-transactions", label: "Recent Transactions" },
        { value: "recent-updates", label: "Recent Updates" },
    ];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
            if (statsDropdownRef.current && !statsDropdownRef.current.contains(event.target as Node)) {
                setIsStatsDropdownOpen(false);
            }
        };

        if (isDropdownOpen || isStatsDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isDropdownOpen, isStatsDropdownOpen]);

    const shouldShow = (card: AnalyticsFilter) => {
        return selectedFilter === "all" || selectedFilter === card;
    };

    const shouldShowStats = (card: StatisticsFilter) => {
        return selectedStatsFilter === "all" || selectedStatsFilter === card;
    };

    return (
        <div className={styles.monitorContainer}>
            <header className={styles.header}>
                <div className={styles.headerTitle}>
                    <h1>Monitor Dashboard</h1>
                    <p>Real-time monitoring, statistics, analytics, and system logs</p>
                </div>
                <div className={styles.headerRight}>
                    <SystemHealth />
                </div>
            </header>

            {/* Tabs for Statistics, Analytics, and Logs */}
            <Tabs defaultValue="statistics">
                <TabsList>
                    <TabsTrigger value="statistics">Statistics</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="logs">Logs</TabsTrigger>
                </TabsList>

                {/* Statistics Tab Content */}
                <TabsContent value="statistics">
                    {/* Statistics Filter */}
                    <div className={styles.filterSection}>
                        <div className={styles.filterWrapper}>
                            <FiFilter className={styles.filterIcon} />
                            <div className={styles.dropdown} ref={statsDropdownRef}>
                                <button
                                    className={styles.dropdownButton}
                                    onClick={() => setIsStatsDropdownOpen(!isStatsDropdownOpen)}
                                >
                                    <span>
                                        {statsFilterOptions.find(opt => opt.value === selectedStatsFilter)?.label || "All Statistics"}
                                    </span>
                                    <FiChevronDown className={`${styles.dropdownIcon} ${isStatsDropdownOpen ? styles.dropdownIconOpen : ""}`} />
                                </button>
                                {isStatsDropdownOpen && (
                                    <div className={styles.dropdownMenu}>
                                        {statsFilterOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                className={`${styles.dropdownItem} ${selectedStatsFilter === option.value ? styles.dropdownItemActive : ""}`}
                                                onClick={() => {
                                                    setSelectedStatsFilter(option.value as StatisticsFilter);
                                                    setIsStatsDropdownOpen(false);
                                                }}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={styles.grid}>
                        {shouldShowStats("station-distribution") && (
                            <div className={`${styles.col12} ${styles.hFull}`}>
                                <StationDistributionStats />
                            </div>
                        )}

                        {shouldShowStats("payout-stats") && (
                            <div className={`${styles.col12} ${styles.hFull}`}>
                                <PayoutStats />
                            </div>
                        )}

                        {shouldShowStats("ads-stats") && (
                            <div className={`${styles.col12} ${styles.hFull}`}>
                                <AdsStats />
                            </div>
                        )}

                        {shouldShowStats("rental-stats") && (
                            <div className={`${styles.col12} ${styles.hFull}`}>
                                <RentalStats />
                            </div>
                        )}

                        {shouldShowStats("powerbank-performance") && (
                            <div className={`${styles.col12} ${styles.hFull}`}>
                                <PowerBankPerformance />
                            </div>
                        )}

                        {shouldShowStats("monitor-rentals") && (
                            <div className={`${styles.col12} ${styles.hFull}`}>
                                <MonitorRentals />
                            </div>
                        )}

                        {shouldShowStats("recent-transactions") && (
                            <div className={`${styles.col6} ${styles.hFull}`}>
                                <RecentTransactions />
                            </div>
                        )}
                        
                        {shouldShowStats("recent-updates") && (
                            <div className={`${styles.col6} ${styles.hFull}`}>
                                <RecentUpdates />
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* Analytics Tab Content */}
                <TabsContent value="analytics">
                    {/* Analytics Filter */}
                    <div className={styles.filterSection}>
                        <div className={styles.filterWrapper}>
                            <FiFilter className={styles.filterIcon} />
                            <div className={styles.dropdown} ref={dropdownRef}>
                                <button
                                    className={styles.dropdownButton}
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                >
                                    <span>
                                        {filterOptions.find(opt => opt.value === selectedFilter)?.label || "All Analytics"}
                                    </span>
                                    <FiChevronDown className={`${styles.dropdownIcon} ${isDropdownOpen ? styles.dropdownIconOpen : ""}`} />
                                </button>
                                {isDropdownOpen && (
                                    <div className={styles.dropdownMenu}>
                                        {filterOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                className={`${styles.dropdownItem} ${selectedFilter === option.value ? styles.dropdownItemActive : ""}`}
                                                onClick={() => {
                                                    setSelectedFilter(option.value as AnalyticsFilter);
                                                    setIsDropdownOpen(false);
                                                }}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Analytics Content Grid */}
                    <div className={styles.grid}>
                        {/* Revenue & Rentals Trends */}
                        {shouldShow("revenue") && (
                            <div className={`${styles.col6} ${styles.hFull}`}>
                                <RevenueChart />
                            </div>
                        )}
                        {shouldShow("rentals") && (
                            <div className={`${styles.col6} ${styles.hFull}`}>
                                <RentalOverTime />
                            </div>
                        )}

                        {/* Station, PowerBank, User Analytics */}
                        {shouldShow("station-analytics") && (
                            <div className={`${styles.col12} ${styles.hFull}`}>
                                <StationAnalytics />
                            </div>
                        )}
                        {shouldShow("powerbank-rentals") && (
                            <div className={`${styles.col12} ${styles.hFull}`}>
                                <PowerBankRentalAnalytics />
                            </div>
                        )}
                        {shouldShow("user-analytics") && (
                            <div className={`${styles.col12} ${styles.hFull}`}>
                                <UserAnalytics />
                            </div>
                        )}

                        {/* Payment Analytics */}
                        {shouldShow("payment-analytics") && (
                            <div className={`${styles.col12} ${styles.hFull}`}>
                                <PaymentAnalyticsDashboard />
                            </div>
                        )}

                        {/* Withdrawals Analytics */}
                        {shouldShow("withdrawals-analytics") && (
                            <div className={`${styles.col12} ${styles.hFull}`}>
                                <WithdrawalsAnalytics />
                            </div>
                        )}

                        {/* Referrals & Points Analytics */}
                        {shouldShow("referrals-analytics") && (
                            <div className={`${styles.col6} ${styles.hFull}`}>
                                <ReferralsAnalytics />
                            </div>
                        )}
                        {shouldShow("points-analytics") && (
                            <div className={`${styles.col6} ${styles.hFull}`}>
                                <PointsAnalytics />
                            </div>
                        )}

                        {/* Achievements & Partner Revenue Analytics */}
                        {shouldShow("achievements-analytics") && (
                            <div className={`${styles.col6} ${styles.hFull}`}>
                                <AchievementsAnalytics />
                            </div>
                        )}
                        {shouldShow("partner-revenue-analytics") && (
                            <div className={`${styles.col6} ${styles.hFull}`}>
                                <PartnerRevenueAnalytics />
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* Logs Tab Content */}
                <TabsContent value="logs">
                    <Tabs defaultValue="admin-logs">
                        <TabsList>
                            <TabsTrigger value="admin-logs">Admin Logs</TabsTrigger>
                            <TabsTrigger value="system-logs">System Logs</TabsTrigger>
                        </TabsList>

                        <TabsContent value="admin-logs">
                            <AdminLogsContent />
                        </TabsContent>

                        <TabsContent value="system-logs">
                            <SystemLogsContent />
                        </TabsContent>
                    </Tabs>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default MonitorPage;
