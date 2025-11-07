"use client";

import { useState } from "react";
import Modal from "../../../components/modal/modal";
import styles from "./settings.module.css";
import { FiEdit, FiUser, FiLock } from "react-icons/fi";

export default function SettingsPage() {
  // ================= STATE =================
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");

  const [admin, setAdmin] = useState({
    userId: "A1029",
    name: "Admin User",
    email: "mah******60@gmail.com",
    phone: "98******51",
  });

  // ================= HANDLERS =================
  const handleOpenModal = (title: string) => {
    setModalTitle(title);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleEdit = (field: keyof typeof admin) => {
    const newValue = prompt(`Enter new ${field}:`, admin[field]);
    if (newValue) {
      setAdmin({ ...admin, [field]: newValue });
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const current = form.current.value;
    const newPass = form.new.value;
    const confirm = form.confirm.value;

    if (newPass !== confirm) {
      alert("New passwords do not match!");
      return;
    }

    alert("Password updated successfully!");
    handleCloseModal();
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Settings</h1>
      <p className={styles.subtitle}>Manage your account settings</p>

      {/* ================= ADMIN PROFILE SECTION ================= */}
      <section className={styles.profileSection}>
        <div className={styles.twoColumnGrid}>
          {/* LEFT CARD */}
          <div className={styles.leftCard}>
            <div className={styles.profileTop}>
              <div className={styles.avatar}>
                <FiUser className={styles.profileIcon} />
              </div>
              <div className={styles.profileHeader}>
                <h3>{admin.name}</h3>
                <button className={styles.editProfileBtn}>
                  <FiEdit /> Edit Profile
                </button>
              </div>
            </div>

            <div className={styles.profileDetails}>
              <div className={styles.profileRow}>
                <span>User ID:</span>
                <span>{admin.userId}</span>
              </div>

              <div className={styles.profileRow}>
                <span>Username:</span>
                <span>{admin.name}</span>
                <button
                  className={styles.inlineEdit}
                  onClick={() => handleEdit("name")}
                >
                  <FiEdit />
                </button>
              </div>

              <div className={styles.profileRow}>
                <span>Email:</span>
                <span>{admin.email}</span>
                <button
                  className={styles.inlineEdit}
                  onClick={() => handleEdit("email")}
                >
                  <FiEdit />
                </button>
              </div>

              <div className={styles.profileRow}>
                <span>Phone:</span>
                <span>{admin.phone}</span>
                <button
                  className={styles.inlineEdit}
                  onClick={() => handleEdit("phone")}
                >
                  <FiEdit />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT CARD */}
          <div className={styles.rightCard}>
            <h3 className={styles.authTitle}>
              <FiLock /> Password and Authentication
            </h3>
            <button
              className={styles.changePassBtn}
              onClick={() => handleOpenModal("Change Password")}
            >
              Change Password
            </button>

            <div className={styles.authBox}>
              <h4>Email Authentication</h4>
              <p>
                Verify your authentication using Gmail. Your current email
                account is: <span className={styles.bold}>{admin.email}</span>
              </p>
              <p className={styles.infoText}>
                Keep your account secure by using a strong password and enabling
                two-factor authentication when available.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= MODAL ================= */}
      <Modal title={modalTitle} isOpen={isModalOpen} onClose={handleCloseModal}>
        <form onSubmit={handlePasswordChange} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Current Password</label>
            <input
              type="password"
              name="current"
              required
              className={styles.input}
              placeholder="Enter current password"
            />
          </div>

          <div className={styles.formGroup}>
            <label>New Password</label>
            <input
              type="password"
              name="new"
              required
              className={styles.input}
              placeholder="Enter new password"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Confirm New Password</label>
            <input
              type="password"
              name="confirm"
              required
              className={styles.input}
              placeholder="Confirm new password"
            />
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={handleCloseModal}
              className={styles.cancelBtn}
            >
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn}>
              Update Password
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
