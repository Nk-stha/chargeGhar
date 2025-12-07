"use client";

import React, { useState, useMemo } from "react";
import styles from "./users.module.css";
import {
  FiShield,
  FiUsers,
  FiSearch,
  FiArrowDown,
  FiChevronDown,
  FiChevronUp,
  FiDollarSign,
  FiUserCheck,
  FiX,
  FiAlertCircle,
} from "react-icons/fi";
import { userService } from "../../../lib/api/user.service";
import AddAdminModal from "./addadmin/AddAdminModal";
import AdminProfileModal from "../../../components/AdminProfileModal/AdminProfileModal";
import { useDashboardData } from "../../../contexts/DashboardDataContext";
import DataTable from "../../../components/DataTable/dataTable";

interface UserProfile {
  full_name: string | null;
  date_of_birth: string | null;
  address: string | null;
  is_profile_complete: boolean;
}

interface User {
  id: number;
  email: string | null;
  phone_number: string | null;
  username: string;
  profile_picture: string | null;
  referral_code: string | null;
  status: string;
  is_active: boolean;
  date_joined: string;
  last_login: string | null;
  profile_complete: boolean;
  kyc_status: string;
  profile: UserProfile;
  social_provider: string;
}

interface AdminProfile {
  id: string;
  role: string;
  is_active: boolean;
  is_super_admin: boolean;
  created_at: string;
  updated_at: string;
  username: string;
  email: string;
  created_by_username: string;
}

export default function UsersPage() {
  const {
    profilesData,
    usersData,
    loading,
    error,
    refetchProfiles,
    refetchUsers,
  } = useDashboardData();
  const [activeTab, setActiveTab] = useState<"admin" | "users">("admin");
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof User>("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");

  // Add Balance Modal
  const [showAddBalanceModal, setShowAddBalanceModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [balanceAmount, setBalanceAmount] = useState("");
  const [balanceReason, setBalanceReason] = useState("");
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState("");

  // Update Status Modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUser, setStatusUser] = useState<User | null>(null);
  const [newStatus, setNewStatus] = useState<"ACTIVE" | "BANNED" | "INACTIVE">(
    "ACTIVE",
  );
  const [statusReason, setStatusReason] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState("");

  const sortOptions: { key: keyof User; label: string }[] = [
    { key: "id", label: "ID" },
    { key: "username", label: "Name" },
    { key: "status", label: "Status" },
    { key: "kyc_status", label: "KYC Status" },
    { key: "social_provider", label: "Provider" },
    { key: "date_joined", label: "Created Date" },
  ];

  const admins: AdminProfile[] = profilesData || [];
  const users: User[] = usersData?.results || [];

  const handleSortSelect = (key: keyof User) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setShowSortMenu(false);
  };

  const handleAdminClick = (profileId: string) => {
    setSelectedProfileId(profileId);
    setShowProfileModal(true);
  };

  const handleCloseProfileModal = () => {
    setShowProfileModal(false);
    setSelectedProfileId("");
  };

  const handleProfileUpdate = () => {
    refetchProfiles();
  };

  const handleProfileDelete = () => {
    refetchProfiles();
  };

  const handleOpenAddBalance = (user: User) => {
    setSelectedUser(user);
    setBalanceAmount("");
    setBalanceReason("");
    setBalanceError("");
    setShowAddBalanceModal(true);
  };

  const handleCloseAddBalance = () => {
    setShowAddBalanceModal(false);
    setSelectedUser(null);
    setBalanceAmount("");
    setBalanceReason("");
    setBalanceError("");
  };

  const handleSubmitAddBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (!balanceAmount || parseFloat(balanceAmount) <= 0) {
      setBalanceError("Please enter a valid amount");
      return;
    }

    if (!balanceReason.trim()) {
      setBalanceError("Please enter a reason");
      return;
    }

    try {
      setBalanceLoading(true);
      setBalanceError("");
      await userService.addBalance(
        selectedUser.id,
        balanceAmount,
        balanceReason,
      );
      alert("Balance added successfully!");
      handleCloseAddBalance();
      refetchUsers();
    } catch (err: any) {
      setBalanceError(err.response?.data?.message || "Failed to add balance");
    } finally {
      setBalanceLoading(false);
    }
  };

  const handleOpenStatusModal = (user: User) => {
    setStatusUser(user);
    setNewStatus(user.status as "ACTIVE" | "BANNED" | "INACTIVE");
    setStatusReason("");
    setStatusError("");
    setShowStatusModal(true);
  };

  const handleCloseStatusModal = () => {
    setShowStatusModal(false);
    setStatusUser(null);
    setStatusReason("");
    setStatusError("");
  };

  const handleSubmitStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusUser) return;

    if (!statusReason.trim()) {
      setStatusError("Please enter a reason for status change");
      return;
    }

    try {
      setStatusLoading(true);
      setStatusError("");
      await userService.updateStatus(statusUser.id, newStatus, statusReason);
      alert("User status updated successfully!");
      handleCloseStatusModal();
      refetchUsers();
    } catch (err: any) {
      setStatusError(err.response?.data?.message || "Failed to update status");
    } finally {
      setStatusLoading(false);
    }
  };

  const displayedUsers = useMemo((): User[] => {
    let list: User[] = [...users];

    // Search: filter by ID, username, status, email, phone
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (u) =>
          u.id.toString().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          u.status.toLowerCase().includes(q) ||
          (u.referral_code && u.referral_code.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q)) ||
          (u.phone_number && u.phone_number.toLowerCase().includes(q)) ||
          (u.profile?.full_name && u.profile.full_name.toLowerCase().includes(q)),
      );
    }

    // Sort
    return list.sort((a, b) => {
      let aVal: string | number | boolean | null;
      let bVal: string | number | boolean | null;

      // Handle sortKey that could be 'profile' (object) - skip sorting for that
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (sortKey === "profile") {
        // Sort by full_name when profile is selected
        aVal = a.profile?.full_name || "";
        bVal = b.profile?.full_name || "";
      } else if (sortKey === "id") {
        aVal = Number(aValue);
        bVal = Number(bValue);
      } else if (sortKey === "date_joined" || sortKey === "last_login") {
        aVal = aValue ? new Date(aValue as string).getTime() : 0;
        bVal = bValue ? new Date(bValue as string).getTime() : 0;
      } else if (sortKey === "profile_complete" || sortKey === "is_active") {
        aVal = aValue ? 1 : 0;
        bVal = bValue ? 1 : 0;
      } else {
        aVal = String(aValue || "").toLowerCase();
        bVal = String(bValue || "").toLowerCase();
      }

      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [search, sortKey, sortDir, users]);

  if (loading) {
    return <main className={styles.container}>Loading...</main>;
  }

  if (error) {
    return <main className={styles.container}>{error}</main>;
  }

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Users</h1>
        <p className={styles.subtitle}>
          View and Manage admins, users and their permissions.
        </p>
      </header>

      {/* Tab Navigation */}
      <div className={styles.tabContainer}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === "admin" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("admin")}
          >
            <FiShield className={styles.tabIcon} />
            <span className={styles.tabText}>Admin Users</span>
            <span className={styles.tabBadge}>{admins.length}</span>
          </button>
          <button
            className={`${styles.tab} ${activeTab === "users" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("users")}
          >
            <FiUsers className={styles.tabIcon} />
            <span className={styles.tabText}>Regular Users</span>
            <span className={styles.tabBadge}>{users.length}</span>
          </button>
        </div>
        {activeTab === "admin" && (
          <div className={styles.addButtonWrapper}>
            <button
              className={styles.addButton}
              onClick={() => setShowModal(true)}
            >
              + Add Admin
            </button>
          </div>
        )}
      </div>

      {/* Admin Users Table */}
      {activeTab === "admin" && (
        <DataTable
          title="Admin Users"
          subtitle="Manage admins and their permissions"
          columns={[
            {
              header: "ID",
              accessor: "id",
              render: (v) => (
                <span style={{ color: "#aaa", fontSize: "0.85rem", fontFamily: "monospace" }}>
                  {`${v.slice(0, 8)}...`}
                </span>
              ),
            },
            {
              header: "Username",
              accessor: "username",
              render: (v) => (
                <span style={{ color: "#eee", fontSize: "0.9rem", fontWeight: "500" }}>
                  {v}
                </span>
              ),
            },
            {
              header: "Email",
              accessor: "email",
              render: (v) => (
                <span style={{ color: "#aaa", fontSize: "0.85rem" }}>
                  {v}
                </span>
              ),
            },
            {
              header: "Role",
              accessor: "role",
              render: (_: any, row) => (
                <span style={{
                  display: "inline-block",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                  fontWeight: "500",
                  textTransform: "capitalize",
                  backgroundColor: row.is_super_admin ? "rgba(130, 234, 128, 0.1)" : "rgba(156, 163, 175, 0.1)",
                  color: row.is_super_admin ? "#82ea80" : "rgb(156, 163, 175)",
                }}>
                  {row.role.replace("_", " ")}
                </span>
              ),
            },
            {
              header: "Status",
              accessor: "is_active",
              render: (v) => (
                <span style={{
                  display: "inline-block",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                  fontWeight: "500",
                  backgroundColor: v ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                  color: v ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)",
                }}>
                  {v ? "Active" : "Inactive"}
                </span>
              ),
            },
            {
              header: "Created Date",
              accessor: "created_at",
              render: (v) => (
                <span style={{ color: "#ccc", fontSize: "0.85rem" }}>
                  {new Date(v).toLocaleDateString()}
                </span>
              ),
            },
            {
              header: "Created By",
              accessor: "created_by_username",
              render: (v) => (
                <span style={{ color: "#aaa", fontSize: "0.85rem" }}>
                  {v || "—"}
                </span>
              ),
            },
          ]}
          data={admins}
          emptyMessage="No admins found"
          loading={loading}
          mobileCardRender={(row) => (
            <>
              <div style={{ marginBottom: "0.75rem" }}>
                <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: "600", color: "#eee" }}>
                  {row.username}
                </p>
                <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "#888" }}>
                  {row.email}
                </p>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <span style={{
                  padding: "0.25rem 0.5rem",
                  borderRadius: "4px",
                  fontSize: "0.7rem",
                  fontWeight: "500",
                  textTransform: "capitalize",
                  backgroundColor: row.is_super_admin ? "rgba(130, 234, 128, 0.1)" : "rgba(156, 163, 175, 0.1)",
                  color: row.is_super_admin ? "#82ea80" : "rgb(156, 163, 175)",
                }}>
                  {row.role.replace("_", " ")}
                </span>
                <span style={{
                  padding: "0.25rem 0.5rem",
                  borderRadius: "4px",
                  fontSize: "0.7rem",
                  fontWeight: "500",
                  backgroundColor: row.is_active ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                  color: row.is_active ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)",
                }}>
                  {row.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "#888" }}>
                Created {new Date(row.created_at).toLocaleDateString()} by {row.created_by_username || "—"}
              </p>
            </>
          )}
        />

      )}

      {/* USER CONTROLS */}
      {activeTab === "users" && (
        <div className={styles.controls}>
          {/* SEARCH */}
          <div style={{ position: "relative", width: "240px" }}>
            <FiSearch
              style={{
                position: "absolute",
                left: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#777",
                fontSize: "1rem",
              }}
            />
            <input
              className={styles.search}
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                paddingLeft: "2.5rem",
                paddingRight: search ? "2rem" : "1rem",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#aaa",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                  padding: 0,
                }}
                title="Clear search"
              >
                ×
              </button>
            )}
          </div>

          {/* SORT BY BUTTON */}
          <div style={{ position: "relative" }}>
            <button
              className={styles.sortBtn}
              onClick={() => setShowSortMenu((s) => !s)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
              }}
            >
              <FiArrowDown style={{ fontSize: "1rem" }} />
              Sort By
              <FiChevronDown
                style={{ fontSize: "0.8rem", marginLeft: "0.25rem" }}
              />
            </button>

            {/* SORT OPTIONS */}
            {showSortMenu && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  background: "#1a1a1a",
                  border: "1px solid #2a2a2a",
                  borderRadius: "8px",
                  minWidth: "180px",
                  zIndex: 10,
                  marginTop: "0.5rem",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                  overflow: "hidden",
                }}
              >
                {sortOptions.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => handleSortSelect(opt.key)}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      textAlign: "left",
                      background: sortKey === opt.key ? "#333" : "transparent",
                      color: sortKey === opt.key ? "#fff" : "#ccc",
                      border: "none",
                      fontSize: "0.9rem",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (sortKey !== opt.key) {
                        e.currentTarget.style.backgroundColor = "#2a2a2a";
                        e.currentTarget.style.color = "#32cd32";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (sortKey !== opt.key) {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#ccc";
                      }
                    }}
                  >
                    <span>{opt.label}</span>
                    {sortKey === opt.key && (
                      <span style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                        {sortDir === "asc" ? (
                          <FiChevronUp />
                        ) : (
                          <FiChevronDown />
                        )}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Users Table */}
      {activeTab === "users" && (
        <DataTable
          title="Users"
          subtitle="Manage registered users"
          columns={[
            {
              header: "User",
              accessor: "username",
              render: (_: any, row) => (
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div
                    style={{
                      width: "2rem",
                      height: "2rem",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      backgroundColor: "rgba(130, 234, 128, 0.1)",
                      color: "#82ea80",
                      flexShrink: 0,
                    }}
                  >
                    {row.username.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: "500", color: "#eee", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {row.profile?.full_name || row.username}
                    </p>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      @{row.username}
                    </p>
                  </div>
                </div>
              ),
            },
            {
              header: "Contact",
              accessor: "phone_number",
              render: (v) => (
                <span style={{ 
                  fontSize: "0.85rem", 
                  fontWeight: "600", 
                  color: "#fff"
                }}>
                  {v || "—"}
                </span>
              ),
            },
            {
              header: "Provider",
              accessor: "social_provider",
              render: (_: any, row) => (
                <div style={{ minWidth: 0 }}>
                  <p style={{ 
                    margin: 0, 
                    fontSize: "0.85rem", 
                    fontWeight: "600", 
                    color: "#fff",
                    overflow: "hidden", 
                    textOverflow: "ellipsis", 
                    whiteSpace: "nowrap"
                  }}>
                    {row.email || "—"}
                  </p>
                  <p style={{ 
                    margin: "0.25rem 0 0 0", 
                    fontSize: "0.7rem", 
                    fontWeight: "500",
                    color: row.social_provider === "GOOGLE" ? "#4285f4" : "#82ea80",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}>
                    {row.social_provider}
                  </p>
                </div>
              ),
            },
            {
              header: "KYC",
              accessor: "kyc_status",
              render: (v) => {
                const getKYCStyle = (status: string) => {
                  if (status === "APPROVED") return { bg: "rgba(34, 197, 94, 0.1)", color: "rgb(34, 197, 94)" };
                  if (status === "PENDING") return { bg: "rgba(234, 179, 8, 0.1)", color: "rgb(234, 179, 8)" };
                  return { bg: "rgba(156, 163, 175, 0.1)", color: "rgb(156, 163, 175)" };
                };
                const style = getKYCStyle(v);
                return (
                  <span style={{
                    display: "inline-block",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                    fontWeight: "500",
                    backgroundColor: style.bg,
                    color: style.color,
                  }}>
                    {v.replace("_", " ")}
                  </span>
                );
              },
            },
            {
              header: "Status",
              accessor: "status",
              render: (v) => (
                <span style={{
                  display: "inline-block",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                  fontWeight: "500",
                  backgroundColor: v === "ACTIVE" ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                  color: v === "ACTIVE" ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)",
                }}>
                  {v}
                </span>
              ),
            },
            {
              header: "Joined",
              accessor: "date_joined",
              render: (v) => (
                <span style={{ color: "#ccc", fontSize: "0.85rem" }}>
                  {new Date(v).toLocaleDateString()}
                </span>
              ),
            },
            {
              header: "Last Login",
              accessor: "last_login",
              render: (v) => (
                <span style={{ color: v ? "#ccc" : "#666", fontSize: "0.85rem" }}>
                  {v ? new Date(v).toLocaleDateString() : "Never"}
                </span>
              ),
            },
            {
              header: "Actions",
              accessor: "actions",
              align: "right",
              render: (_: any, row) => (
                <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                  <button
                    onClick={() => handleOpenAddBalance(row)}
                    title="Add Balance"
                    className={styles.actionButtonGreen}
                  >
                    <FiDollarSign size={14} />
                  </button>
                  <button
                    onClick={() => handleOpenStatusModal(row)}
                    title="Update Status"
                    className={styles.actionButtonOrange}
                  >
                    <FiUserCheck size={14} />
                  </button>
                </div>
              ),
            },
          ]}
          data={displayedUsers}
          emptyMessage={search ? "No users match your search." : "No users found."}
          loading={loading}
          mobileCardRender={(row) => (
            <>
              <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      width: "2.5rem",
                      height: "2.5rem",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      backgroundColor: "rgba(130, 234, 128, 0.1)",
                      color: "#82ea80",
                      flexShrink: 0,
                    }}
                  >
                    {row.username.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: "500", color: "#eee", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {row.profile?.full_name || row.username}
                    </p>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      @{row.username}
                    </p>
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: "0.75rem" }}>
                <p style={{ margin: 0, fontSize: "0.8rem", color: "#ccc", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {row.email || row.phone_number || "No contact info"}
                </p>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <span style={{
                  padding: "0.25rem 0.5rem",
                  borderRadius: "4px",
                  fontSize: "0.7rem",
                  fontWeight: "500",
                  backgroundColor: row.social_provider === "GOOGLE" ? "rgba(66, 133, 244, 0.1)" : "rgba(156, 163, 175, 0.1)",
                  color: row.social_provider === "GOOGLE" ? "#4285f4" : "rgb(156, 163, 175)",
                  textTransform: "capitalize",
                }}>
                  {row.social_provider.toLowerCase()}
                </span>
                <span style={{
                  padding: "0.25rem 0.5rem",
                  borderRadius: "4px",
                  fontSize: "0.7rem",
                  fontWeight: "500",
                  backgroundColor: row.kyc_status === "APPROVED" ? "rgba(34, 197, 94, 0.1)" : "rgba(156, 163, 175, 0.1)",
                  color: row.kyc_status === "APPROVED" ? "rgb(34, 197, 94)" : "rgb(156, 163, 175)",
                }}>
                  {row.kyc_status.replace("_", " ")}
                </span>
                <span style={{
                  padding: "0.25rem 0.5rem",
                  borderRadius: "4px",
                  fontSize: "0.7rem",
                  fontWeight: "500",
                  backgroundColor: row.status === "ACTIVE" ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                  color: row.status === "ACTIVE" ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)",
                }}>
                  {row.status}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "#888" }}>
                Joined {new Date(row.date_joined).toLocaleDateString()}
              </p>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid #222" }}>
                <button
                  onClick={() => handleOpenAddBalance(row)}
                  title="Add Balance"
                  className={styles.actionButtonGreen}
                  style={{ flex: 1, fontSize: "0.8rem" }}
                >
                  <FiDollarSign size={14} /> Balance
                </button>
                <button
                  onClick={() => handleOpenStatusModal(row)}
                  title="Update Status"
                  className={styles.actionButtonOrange}
                  style={{ flex: 1, fontSize: "0.8rem" }}
                >
                  <FiUserCheck size={14} /> Status
                </button>
              </div>
            </>
          )}
        />
      )}

      {showModal && (
        <AddAdminModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            refetchProfiles();
            setShowModal(false);
          }}
        />
      )}

      {showProfileModal && (
        <AdminProfileModal
          isOpen={showProfileModal}
          onClose={handleCloseProfileModal}
          profileId={selectedProfileId}
          onUpdate={handleProfileUpdate}
          onDelete={handleProfileDelete}
        />
      )}

      {/* Add Balance Modal */}
      {showAddBalanceModal && selectedUser && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
          onClick={handleCloseAddBalance}
        >
          <div
            style={{
              background: "#141414",
              borderRadius: "12px",
              maxWidth: "500px",
              width: "100%",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
              border: "1px solid #2a2a2a",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1.5rem",
                borderBottom: "1px solid #222",
              }}
            >
              <h2 style={{ color: "#82ea80", fontSize: "1.5rem", margin: 0 }}>
                Add Balance to User
              </h2>
              <button
                onClick={handleCloseAddBalance}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#999",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <FiX />
              </button>
            </div>

            <form
              onSubmit={handleSubmitAddBalance}
              style={{ padding: "1.5rem" }}
            >
              <div style={{ marginBottom: "1rem" }}>
                <p style={{ color: "#aaa", margin: "0 0 1rem 0" }}>
                  User:{" "}
                  <strong style={{ color: "#fff" }}>
                    {selectedUser.username}
                  </strong>{" "}
                  (ID: {selectedUser.id})
                </p>
              </div>

              {balanceError && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.75rem",
                    background: "rgba(255, 64, 64, 0.1)",
                    border: "1px solid rgba(255, 64, 64, 0.3)",
                    borderRadius: "6px",
                    color: "#ff6b6b",
                    marginBottom: "1rem",
                    fontSize: "0.9rem",
                  }}
                >
                  <FiAlertCircle />
                  {balanceError}
                </div>
              )}

              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    color: "#ddd",
                    marginBottom: "0.5rem",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                  }}
                >
                  Amount (NPR) <span style={{ color: "#ff4040" }}>*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  placeholder="Enter amount"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    background: "#1a1a1a",
                    border: "1px solid #2a2a2a",
                    borderRadius: "6px",
                    color: "#fff",
                    fontSize: "0.9rem",
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label
                  style={{
                    display: "block",
                    color: "#ddd",
                    marginBottom: "0.5rem",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                  }}
                >
                  Reason <span style={{ color: "#ff4040" }}>*</span>
                </label>
                <textarea
                  value={balanceReason}
                  onChange={(e) => setBalanceReason(e.target.value)}
                  placeholder="Enter reason for adding balance"
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    background: "#1a1a1a",
                    border: "1px solid #2a2a2a",
                    borderRadius: "6px",
                    color: "#fff",
                    fontSize: "0.9rem",
                    fontFamily: "inherit",
                    resize: "vertical",
                  }}
                  required
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.75rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid #222",
                }}
              >
                <button
                  type="button"
                  onClick={handleCloseAddBalance}
                  disabled={balanceLoading}
                  style={{
                    padding: "0.75rem 1.5rem",
                    background: "transparent",
                    border: "1px solid #2a2a2a",
                    borderRadius: "8px",
                    color: "#ddd",
                    fontSize: "0.9rem",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={balanceLoading}
                  style={{
                    padding: "0.75rem 1.5rem",
                    background: "#47b216",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    cursor: "pointer",
                    opacity: balanceLoading ? 0.7 : 1,
                  }}
                >
                  {balanceLoading ? "Adding..." : "Add Balance"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showStatusModal && statusUser && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
          onClick={handleCloseStatusModal}
        >
          <div
            style={{
              background: "#141414",
              borderRadius: "12px",
              maxWidth: "500px",
              width: "100%",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
              border: "1px solid #2a2a2a",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1.5rem",
                borderBottom: "1px solid #222",
              }}
            >
              <h2 style={{ color: "#ffa500", fontSize: "1.5rem", margin: 0 }}>
                Update User Status
              </h2>
              <button
                onClick={handleCloseStatusModal}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#999",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmitStatus} style={{ padding: "1.5rem" }}>
              <div style={{ marginBottom: "1rem" }}>
                <p style={{ color: "#aaa", margin: "0 0 1rem 0" }}>
                  User:{" "}
                  <strong style={{ color: "#fff" }}>
                    {statusUser.username}
                  </strong>{" "}
                  (ID: {statusUser.id})
                </p>
                <p style={{ color: "#aaa", margin: 0 }}>
                  Current Status:{" "}
                  <strong style={{ color: "#82ea80" }}>
                    {statusUser.status}
                  </strong>
                </p>
              </div>

              {statusError && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.75rem",
                    background: "rgba(255, 64, 64, 0.1)",
                    border: "1px solid rgba(255, 64, 64, 0.3)",
                    borderRadius: "6px",
                    color: "#ff6b6b",
                    marginBottom: "1rem",
                    fontSize: "0.9rem",
                  }}
                >
                  <FiAlertCircle />
                  {statusError}
                </div>
              )}

              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    color: "#ddd",
                    marginBottom: "0.5rem",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                  }}
                >
                  New Status <span style={{ color: "#ff4040" }}>*</span>
                </label>
                <select
                  value={newStatus}
                  onChange={(e) =>
                    setNewStatus(
                      e.target.value as "ACTIVE" | "BANNED" | "INACTIVE",
                    )
                  }
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    background: "#1a1a1a",
                    border: "1px solid #2a2a2a",
                    borderRadius: "6px",
                    color: "#fff",
                    fontSize: "0.9rem",
                    cursor: "pointer",
                  }}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="BANNED">BANNED</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label
                  style={{
                    display: "block",
                    color: "#ddd",
                    marginBottom: "0.5rem",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                  }}
                >
                  Reason <span style={{ color: "#ff4040" }}>*</span>
                </label>
                <textarea
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="Enter reason for status change"
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    background: "#1a1a1a",
                    border: "1px solid #2a2a2a",
                    borderRadius: "6px",
                    color: "#fff",
                    fontSize: "0.9rem",
                    fontFamily: "inherit",
                    resize: "vertical",
                  }}
                  required
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.75rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid #222",
                }}
              >
                <button
                  type="button"
                  onClick={handleCloseStatusModal}
                  disabled={statusLoading}
                  style={{
                    padding: "0.75rem 1.5rem",
                    background: "transparent",
                    border: "1px solid #2a2a2a",
                    borderRadius: "8px",
                    color: "#ddd",
                    fontSize: "0.9rem",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={statusLoading}
                  style={{
                    padding: "0.75rem 1.5rem",
                    background: "#ffa500",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    cursor: "pointer",
                    opacity: statusLoading ? 0.7 : 1,
                  }}
                >
                  {statusLoading ? "Updating..." : "Update Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
