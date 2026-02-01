import React from "react";
import PartnerStats from "@/components/PartnerManagement/PartnerStats";
import PartnerList from "@/components/PartnerManagement/PartnerList";
import styles from "./partners.module.css";

export default function PartnersPage() {
  return (
    <div className={styles.pageContainer}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          Partner Management
        </h1>
        <p className={styles.pageSubtitle}>
          Overview of all registered vendors and their financial performance
        </p>
      </div>

      {/* Stats Section */}
      <div className={styles.statsSection}>
        <PartnerStats />
      </div>

      {/* Partners List */}
      <div className={styles.listSection}>
        <PartnerList />
      </div>
    </div>
  );
}
