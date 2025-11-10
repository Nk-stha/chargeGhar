"use client";

import React, { useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { FiImage, FiPhone, FiHelpCircle } from "react-icons/fi";
import styles from "./content-management.module.css";

// Dynamic imports for tab content
const BannerContent = dynamic(() => import("../banner/page"), {
  loading: () => (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p>Loading Banner Management...</p>
    </div>
  ),
  ssr: false,
});

const ContactContent = dynamic(() => import("../contact/page"), {
  loading: () => (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p>Loading Contact Management...</p>
    </div>
  ),
  ssr: false,
});

const FAQsContent = dynamic(() => import("../faqs/page"), {
  loading: () => (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p>Loading FAQs Management...</p>
    </div>
  ),
  ssr: false,
});

type TabType = "banner" | "contact" | "faqs";

export default function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState<TabType>("banner");

  const tabs = [
    {
      id: "banner" as TabType,
      label: "Banner",
      icon: <FiImage />,
      description: "Manage website banners and promotional images",
    },
    {
      id: "contact" as TabType,
      label: "Contact",
      icon: <FiPhone />,
      description: "Manage contact information",
    },
    {
      id: "faqs" as TabType,
      label: "FAQs",
      icon: <FiHelpCircle />,
      description: "Manage frequently asked questions",
    },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.headerSection}>
        <div>
          <h1 className={styles.title}>Content Management</h1>
          <p className={styles.subtitle}>
            Manage your website content, banners, and contact information
          </p>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className={styles.tabsContainer}>
        <div className={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              <div className={styles.tabContent}>
                <span className={styles.tabLabel}>{tab.label}</span>
                <span className={styles.tabDescription}>{tab.description}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className={styles.tabPanel}>
        <Suspense
          fallback={
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>Loading...</p>
            </div>
          }
        >
          {activeTab === "banner" && <BannerContent />}
          {activeTab === "contact" && <ContactContent />}
          {activeTab === "faqs" && <FAQsContent />}
        </Suspense>
      </div>
    </div>
  );
}
