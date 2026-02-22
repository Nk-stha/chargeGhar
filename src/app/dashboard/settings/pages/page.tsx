"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [selectedPage, setSelectedPage] = useState<ContentPage | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    page_type: "" as PageType,
    title: "",
    content: "",
    is_active: true,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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

  const handleOpenModal = (page: ContentPage) => {
    setSelectedPage(page);
    setFormData({
      page_type: page.page_type,
      title: page.title ?? "",
      content: page.content ?? "",
      is_active: page.is_active ?? true,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPage(null);
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = "Title is required";
    }

    if (!formData.content.trim()) {
      errors.content = "Content is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setModalLoading(true);

      const payload = {
        page_type: formData.page_type,
        title: formData.title.trim(),
        content: formData.content.trim(),
        is_active: formData.is_active,
      };

      const response = await contentPageService.updateContentPage(
        formData.page_type,
        payload,
      );

      if (response.success) {
        toast.success("Content page updated successfully");
        handleCloseModal();
        fetchPages();
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Failed to update content page";
      toast.error(errorMsg);
    } finally {
      setModalLoading(false);
    }
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
                    onClick={() => handleOpenModal(page)}
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
      )}

      {/* Edit Modal */}
      {isModalOpen && selectedPage && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleSection}>
                <span className={styles.modalIcon}>
                  {contentPageService.getPageTypeIcon(selectedPage.page_type)}
                </span>
                <h2>
                  Edit {contentPageService.getPageTypeLabel(selectedPage.page_type)}
                </h2>
              </div>
              <button
                onClick={handleCloseModal}
                className={styles.closeBtn}
                aria-label="Close"
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Page Type <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  className={styles.inputDisabled}
                  value={contentPageService.getPageTypeLabel(formData.page_type)}
                  disabled
                />
                <span className={styles.helpText}>Page type cannot be changed</span>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Title <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  className={`${styles.input} ${formErrors.title ? styles.inputError : ""}`}
                  placeholder="Enter page title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
                {formErrors.title && (
                  <span className={styles.errorMessage}>{formErrors.title}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Content <span className={styles.required}>*</span>
                </label>
                <textarea
                  className={`${styles.textarea} ${formErrors.content ? styles.inputError : ""}`}
                  placeholder="Enter page content (Markdown supported)"
                  rows={18}
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                />
                {formErrors.content && (
                  <span className={styles.errorMessage}>{formErrors.content}</span>
                )}
                <div className={styles.contentInfo}>
                  <span className={styles.helpText}>
                    Markdown formatting is supported
                  </span>
                  <span className={styles.charCount}>
                    {formData.content.length} characters
                  </span>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                  />
                  <span>Active (Display this page to users)</span>
                </label>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className={styles.cancelBtn}
                  disabled={modalLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={modalLoading}
                >
                  {modalLoading ? "Updating..." : "Update Page"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
