"use client";

import React, { useState, useMemo } from "react";
import styles from "./users.module.css";
import {
  FiShield,
  FiUsers,
  FiTrash2,
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

interface User {
  id: number;
  username: string;
  profile_picture: string | null;
  referral_code: string | null;
  status: string;
  date_joined: string;
  profile_complete: boolean;
  kyc_status: string;
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

    // Search: filter by ID, username, status
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (u) =>
          u.id.toString().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          u.status.toLowerCase().includes(q) ||
          (u.referral_code && u.referral_code.toLowerCase().includes(q)),
      );
    }

    // Sort
    return list.sort((a, b) => {
      let aVal: string | number | boolean | null = a[sortKey];
      let bVal: string | number | boolean | null = b[sortKey];

      if (sortKey === "id") {
        aVal = Number(aVal);
        bVal = Number(bVal);
      } else if (sortKey === "date_joined") {
        aVal = new Date(aVal as string).getTime();
        bVal = new Date(bVal as string).getTime();
      } else if (sortKey === "profile_complete") {
        aVal = aVal ? 1 : 0;
        bVal = bVal ? 1 : 0;
      } else {
        aVal = String(aVal || "").toLowerCase();
        bVal = String(bVal || "").toLowerCase();
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

      <div className={styles.addButtonWrapper}>
        <button className={styles.addButton} onClick={() => setShowModal(true)}>
          + Add Admin
        </button>
      </div>
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <FiShield className={styles.icon} /> Admin Users
          </div>
          <p className={styles.cardSubText}>Manage admins and their permissions</p>
        </div>

        {/* 👇 New wrapper for horizontal scroll */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created Date</th>
                <th>Created By</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {admins.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "2rem", color: "#888" }}>
                    No admins found
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin.id} onClick={() => handleAdminClick(admin.id)} className={styles.clickableRow}>
                    <td>{admin.id.slice(0, 8)}...</td>
                    <td>{admin.username}</td>
                    <td>{admin.email}</td>
                    <td>
                      <span
                        style={{
                          textTransform: "capitalize",
                          color: admin.is_super_admin ? "#82ea80" : "#ccc",
                        }}
                      >
                        {admin.role.replace("_", " ")}
                      </span>
                    </td>
                    <td>
                      <span
                        className={
                          admin.is_active ? styles.statusActive : styles.statusInactive
                        }
                      >
                        {admin.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>{new Date(admin.created_at).toLocaleDateString()}</td>
                    <td>{admin.created_by_username}</td>
                    <td>
                      <button className={styles.deleteBtn}>
                        <FiShield />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* USER CONTROLS */}
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
                      {sortDir === "asc" ? <FiChevronUp /> : <FiChevronDown />}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <FiUsers className={styles.icon} /> Users
          </div>
          <p className={styles.cardSubText}>Manage users</p>
        </div>

        {/* 👇 New wrapper for horizontal scroll */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Referral Code</th>
                <th>Provider</th>
                <th>Profile Status</th>
                <th>KYC Status</th>
                <th>Status</th>
                <th>Created Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {displayedUsers.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "2rem", color: "#888" }}>
                    {search ? "No users match your search." : "No users found."}
                  </td>
                </tr>
              ) : (
                displayedUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.referral_code || "—"}</td>
                    <td>{user.social_provider.toLowerCase()}</td>
                    <td>
                      <span style={{ color: user.profile_complete ? "#32cd32" : "#ff8c00" }}>
                        {user.profile_complete ? "Complete" : "Incomplete"}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          color:
                            user.kyc_status === "APPROVED"
                              ? "#32cd32"
                              : user.kyc_status === "PENDING"
                                ? "#ff8c00"
                                : "#888",
                        }}
                      >
                        {user.kyc_status.replace("_", " ")}
                      </span>
                    </td>
                    <td>
                      <span
                        className={
                          user.status === "ACTIVE"
                            ? styles.statusActive
                            : styles.statusInactive
                        }
                      >
                        {user.status}
                      </span>
                    </td>
                    <td>{new Date(user.date_joined).toLocaleDateString()}</td>
                    <td>...</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

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
