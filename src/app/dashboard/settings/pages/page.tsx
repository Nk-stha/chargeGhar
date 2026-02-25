"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import styles from "./pages.module.css";
import {
  FiFileText,
  FiEdit,
  FiRefreshCw,
  FiAlertCircle,
  FiX,
  FiEye,
  FiEyeOff,
  FiSearch,
  FiClock,
} from "react-icons/fi";
import { contentPageService } from "../../../../lib/api/content-page.service";
import { ContentPage, PageType } from "../../../../types/content-page.types";

export default function ContentPagesManagementPage() {
  const router = useRouter();
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchPages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await contentPageService.getContentPages();

      if (response.success) {
        setPages(response.data ?? []);
      } else {
        const errorMsg = "Failed to fetch content pages";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Unable to load content pages";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const handleRefresh = () => {
    fetchPages();
  };

  const handleEdit = (pageType: PageType) => {
    router.push(`/dashboard/settings/pages/${pageType}`);
  };

  const filteredPages = pages.filter((page) => {
    if (!searchTerm.trim()) return true;
    const search = searchTerm.toLowerCase();
    return (
      page?.title?.toLowerCase().includes(search) ||
      page?.page_type?.toLowerCase().includes(search) ||
      page?.content?.toLowerCase().includes(search)
    );
  });

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <div>
          <h1 className={styles.title}>Content Pages</h1>
          <p className={styles.subtitle}>
            Manage static content pages for your application
            {pages.length > 0 && ` • ${pages.length} pages`}
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            onClick={handleRefresh}
            className={styles.refreshBtn}
            disabled={loading}
            title="Refresh"
          >
            <FiRefreshCw className={loading ? styles.spinning : ""} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className={styles.searchSection}>
        <div className={styles.searchBar}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search pages by title, type, or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          {searchTerm && (
            <button
              className={styles.clearButton}
              onClick={() => setSearchTerm("")}
              title="Clear search"
            >
              <FiX />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p>Loading content pages...</p>
        </div>
      ) : error ? (
        <div className={styles.errorContainer}>
          <FiAlertCircle className={styles.errorIcon} />
          <p className={styles.errorText}>{error}</p>
          <button onClick={handleRefresh} className={styles.retryButton}>
            <FiRefreshCw /> Retry
          </button>
        </div>
      ) : filteredPages.length === 0 ? (
        <div className={styles.noData}>
          <FiFileText className={styles.noDataIcon} />
          <p>{searchTerm ? "No pages match your search" : "No pages found"}</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Title</th>
                  <th>Content Preview</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPages.map((page) => (
                  <tr key={page?.id ?? Math.random()}>
                    <td>
                      <div className={styles.pageTypeCell}>
                        <span className={styles.pageIconTable}>
                          {contentPageService.getPageTypeIcon(page.page_type)}
                        </span>
                        <span className={styles.pageTypeText}>
                          {contentPageService.getPageTypeLabel(page.page_type)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={styles.pageTitleTable}>{page?.title ?? "N/A"}</span>
                    </td>
                    <td>
                      <span className={styles.contentPreviewTable}>
                        {page?.content
                          ? page.content.substring(0, 100).replace(/[#*_`]/g, "") + "..."
                          : "No content"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${
                          page?.is_active
                            ? styles.statusActive
                            : styles.statusInactive
                        }`}
                      >
                        {page?.is_active ? (
                          <>
                            <FiEye size={12} /> Active
                          </>
                        ) : (
                          <>
                            <FiEyeOff size={12} /> Inactive
                          </>
                        )}
                      </span>
                    </td>
                    <td>
                      <span className={styles.dateText}>
                        {page?.updated_at
                          ? new Date(page.updated_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "N/A"}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleEdit(page.page_type)}
                        className={styles.editBtnTable}
                        title="Edit page"
                      >
                        <FiEdit size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile/Tablet Card View */}
          <div className={styles.pagesGrid}>
          {filteredPages.map((page) => (
            <div key={page?.id ?? Math.random()} className={styles.pageCard}>
              <div className={styles.pageCardHeader}>
                <div className={styles.pageTypeSection}>
                  <span className={styles.pageIcon}>
                    {contentPageService.getPageTypeIcon(page.page_type)}
                  </span>
                  <div className={styles.pageTitleSection}>
                    <h3 className={styles.pageTitle}>{page?.title ?? "N/A"}</h3>
                    <span className={styles.pageTypeLabel}>
                      {contentPageService.getPageTypeLabel(page.page_type)}
                    </span>
                  </div>
                </div>
                <div className={styles.pageActions}>
                  <span
                    className={`${styles.statusBadge} ${
                      page?.is_active
                        ? styles.statusActive
                        : styles.statusInactive
                    }`}
                  >
                    {page?.is_active ? (
                      <>
                        <FiEye size={14} /> Active
                      </>
                    ) : (
                      <>
                        <FiEyeOff size={14} /> Inactive
                      </>
                    )}
                  </span>
                  <button
                    onClick={() => handleEdit(page.page_type)}
                    className={styles.editButton}
                    title="Edit page"
                  >
                    <FiEdit size={16} />
                  </button>
                </div>
              </div>

              <div className={styles.pageCardBody}>
                <p className={styles.contentPreview}>
                  {page?.content
                    ? page.content.substring(0, 200).replace(/[#*_`]/g, "") + "..."
                    : "No content available"}
                </p>
              </div>

              <div className={styles.pageCardFooter}>
                <div className={styles.footerInfo}>
                  <FiClock size={14} />
                  <span>
                    Updated{" "}
                    {page?.updated_at
                      ? new Date(page.updated_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "N/A"}
                  </span>
                </div>
                <div className={styles.contentLength}>
                  {page?.content?.length ?? 0} characters
                </div>
              </div>
            </div>
          ))}
          </div>
        </>
      )}
    </div>
  );
}
