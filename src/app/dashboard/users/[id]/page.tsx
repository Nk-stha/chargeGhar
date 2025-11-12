"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./userDetails.module.css";
import Navbar from "../../../../components/Navbar/Navbar";
import Link from "next/link";
import {
  FiArrowLeft,
  FiAward,
  FiUsers,
  FiTrendingUp,
  FiClock,
  FiCheckCircle,
  FiRefreshCw,
  FiAlertCircle,
  FiExternalLink,
} from "react-icons/fi";

interface UserDetailsPageProps {
  params: { id: string };
}

const UserDetailsPage: React.FC<UserDetailsPageProps> = ({ params }) => {
  const userId = params.id;
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <div className={styles.userDetailsPage}>
      <Navbar />
      <main className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <Link href="/dashboard/users" className={styles.backButton}>
              <FiArrowLeft /> Back to Users
            </Link>
          </div>
          <div className={styles.headerMain}>
            <div>
              <h1 className={styles.title}>User Details</h1>
              <p className={styles.subtitle}>User ID: {userId}</p>
            </div>
          </div>
        </header>

        {/* Quick Links Section */}
        <div className={styles.quickLinksGrid}>
          <Link
            href={`/dashboard/users/${userId}/points-history`}
            className={styles.quickLinkCard}
          >
            <div className={styles.quickLinkIcon}>
              <FiAward />
            </div>
            <div className={styles.quickLinkContent}>
              <h3>Points History</h3>
              <p>View all points transactions</p>
            </div>
            <FiExternalLink className={styles.externalIcon} />
          </Link>

          <div className={styles.quickLinkCard} style={{ opacity: 0.6, cursor: "not-allowed" }}>
            <div className={styles.quickLinkIcon}>
              <FiUsers />
            </div>
            <div className={styles.quickLinkContent}>
              <h3>Referrals</h3>
              <p>View user referrals (Coming soon)</p>
            </div>
          </div>

          <div className={styles.quickLinkCard} style={{ opacity: 0.6, cursor: "not-allowed" }}>
            <div className={styles.quickLinkIcon}>
              <FiTrendingUp />
            </div>
            <div className={styles.quickLinkContent}>
              <h3>Achievements</h3>
              <p>View unlocked achievements (Coming soon)</p>
            </div>
          </div>

          <div className={styles.quickLinkCard} style={{ opacity: 0.6, cursor: "not-allowed" }}>
            <div className={styles.quickLinkIcon}>
              <FiClock />
            </div>
            <div className={styles.quickLinkContent}>
              <h3>Rental History</h3>
              <p>View rental transactions (Coming soon)</p>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <section className={styles.infoCard}>
          <FiAlertCircle className={styles.infoIcon} />
          <div className={styles.infoContent}>
            <h4>User Management</h4>
            <p>
              This page provides quick access to user-specific data including points
              history, referrals, achievements, and rental history. Additional features
              will be added progressively.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default UserDetailsPage;
