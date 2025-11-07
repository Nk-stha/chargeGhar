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
} from "react-icons/fi";
import AddAdminModal from "./addadmin/AddAdminModal";
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

      {/* Admin Users Table */}
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <FiShield className={styles.icon} /> Admin Users
          </div>
          <p className={styles.cardSubText}>
            Manage admins and their permissions
          </p>
        </div>

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
                <td
                  colSpan={8}
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                    color: "#888",
                  }}
                >
                  No admins found
                </td>
              </tr>
            ) : (
              admins.map((admin: AdminProfile) => (
                <tr key={admin.id}>
                  <td>{admin.id.slice(0, 8)}...</td>
                  <td>{admin.username}</td>
                  <td>{admin.email}</td>
                  <td>
                    <span
                      style={{
                        textTransform: "capitalize",
                        color: admin.is_super_admin ? "#32cd32" : "#ccc",
                      }}
                    >
                      {admin.role.replace("_", " ")}
                    </span>
                  </td>
                  <td>
                    <span
                      className={
                        admin.is_active
                          ? styles.statusActive
                          : styles.statusInactive
                      }
                    >
                      {admin.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>{new Date(admin.created_at).toLocaleDateString()}</td>
                  <td>{admin.created_by_username}</td>
                  <td>
                    <button className={styles.deleteBtn} title="Delete admin">
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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

      {/* Users Table */}
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <FiUsers className={styles.icon} /> Users
          </div>
          <p className={styles.cardSubText}>Manage users</p>
        </div>

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
                <td
                  colSpan={9}
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                    color: "#888",
                    fontStyle: "italic",
                  }}
                >
                  {search ? "No users match your search." : "No users found."}
                </td>
              </tr>
            ) : (
              displayedUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.referral_code || "—"}</td>
                  <td>
                    <span style={{ textTransform: "capitalize" }}>
                      {user.social_provider.toLowerCase()}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        color: user.profile_complete ? "#32cd32" : "#ff8c00",
                      }}
                    >
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
                  <td>
                    <button className={styles.deleteBtn} title="Delete user">
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
    </main>
  );
}
