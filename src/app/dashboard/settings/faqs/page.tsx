"use client";

import React, { useState, useEffect, useCallback } from "react";
import styles from "./faqs.module.css";
import {
  FiHelpCircle,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiRefreshCw,
  FiAlertCircle,
  FiDownload,
  FiX,
  FiEye,
  FiEyeOff,
  FiSearch,
  FiAlertTriangle,
  FiList,
} from "react-icons/fi";
import { faqService, FAQ } from "../../../../lib/api/faq.service";

export default function FAQManagementPage() {
  const [faqs, setFAQs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [faqToDelete, setFAQToDelete] = useState<FAQ | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  // Form state
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "",
    sort_order: 1,
    is_active: true,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchFAQs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await faqService.getFAQs();

      if (response.success) {
        // Sort by sort_order and then by created_at
        const sortedFAQs = response.data.sort((a, b) => {
          if (a.sort_order !== b.sort_order) {
            return a.sort_order - b.sort_order;
          }
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        setFAQs(sortedFAQs);
      } else {
        setError("Failed to fetch FAQs");
      }
    } catch (err: any) {
      console.error("Error fetching FAQs:", err);
      setError("Unable to load FAQs. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFAQs();
  }, [fetchFAQs]);

  const handleRefresh = () => {
    fetchFAQs();
  };

  const handleExportCSV = () => {
    if (faqs.length === 0) {
      alert("No data to export");
      return;
    }
    const timestamp = new Date().toISOString().split("T")[0];
    faqService.downloadCSV(faqs, `faqs_${timestamp}.csv`);
  };

  const handleOpenModal = (faq?: FAQ) => {
    if (faq) {
      setIsEditMode(true);
      setSelectedFAQ(faq);
      setFormData({
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        sort_order: faq.sort_order,
        is_active: faq.is_active,
      });
    } else {
      setIsEditMode(false);
      setSelectedFAQ(null);
      setFormData({
        question: "",
        answer: "",
        category: "",
        sort_order: faqs.length + 1,
        is_active: true,
      });
    }
    setFormErrors({});
    setError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFAQ(null);
    setFormErrors({});
  };

  const handleOpenDeleteModal = (faq: FAQ) => {
    setFAQToDelete(faq);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setFAQToDelete(null);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.question.trim()) {
      errors.question = "Question is required";
    } else if (formData.question.trim().length < 5) {
      errors.question = "Question must be at least 5 characters";
    }

    if (!formData.answer.trim()) {
      errors.answer = "Answer is required";
    } else if (formData.answer.trim().length < 10) {
      errors.answer = "Answer must be at least 10 characters";
    }

    if (!formData.category.trim()) {
      errors.category = "Category is required";
    }

    if (formData.sort_order < 1) {
      errors.sort_order = "Sort order must be at least 1";
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
        question: formData.question.trim(),
        answer: formData.answer.trim(),
        category: formData.category.trim(),
        sort_order: formData.sort_order,
        is_active: formData.is_active,
      };

      if (isEditMode && selectedFAQ) {
        const response = await faqService.updateFAQ(selectedFAQ.id, payload);
        if (response.success) {
          await fetchFAQs();
          handleCloseModal();
        } else {
          setError("Failed to update FAQ");
        }
      } else {
        const response = await faqService.createFAQ(payload);
        if (response.success) {
          await fetchFAQs();
          handleCloseModal();
        } else {
          setError("Failed to create FAQ");
        }
      }
    } catch (err: any) {
      console.error("Error saving FAQ:", err);
      const errorData = err.response?.data;
      let errorMessage = "Failed to save FAQ";

      if (errorData?.error?.message) {
        errorMessage = errorData.error.message;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      }

      setError(errorMessage);
    } finally {
      setModalLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!faqToDelete) return;

    try {
      setDeleteLoading(true);
      const response = await faqService.deleteFAQ(faqToDelete.id);

      if (response.success) {
        await fetchFAQs();
        handleCloseDeleteModal();
      } else {
        setError("Failed to delete FAQ");
      }
    } catch (err: any) {
      console.error("Error deleting FAQ:", err);
      setError("Failed to delete FAQ");
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredFAQs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Group FAQs by category
  const groupedFAQs = filteredFAQs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, FAQ[]>);

  const categories = Object.keys(groupedFAQs).sort();

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.headerSection}>
        <div>
          <h1 className={styles.title}>FAQs Management</h1>
          <p className={styles.subtitle}>
            Manage frequently asked questions for your website
            {faqs.length > 0 && ` (${faqs.length} total)`}
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.refreshBtn}
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh"
          >
            <FiRefreshCw className={loading ? styles.spinning : ""} />
          </button>
          <button onClick={handleExportCSV} className={styles.exportBtn}>
            <FiDownload /> Export CSV
          </button>
          <button className={styles.addBtn} onClick={() => handleOpenModal()}>
            <FiPlus /> Add FAQ
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className={styles.errorBanner}>
          <FiAlertCircle />
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <FiX />
          </button>
        </div>
      )}

      {/* Main Content Card */}
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <FiHelpCircle className={styles.icon} /> FAQ List
          </h2>
          <div className={styles.searchContainer}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by question, answer, or category..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading FAQs...</p>
          </div>
        ) : filteredFAQs.length === 0 ? (
          <div className={styles.noData}>
            <FiHelpCircle className={styles.noDataIcon} />
            <p>
              {searchTerm
                ? "No FAQs match your search criteria"
                : "No FAQs found"}
            </p>
            {!searchTerm && (
              <button
                className={styles.addFirstBtn}
                onClick={() => handleOpenModal()}
              >
                <FiPlus /> Create Your First FAQ
              </button>
            )}
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Category</th>
                  <th>Question</th>
                  <th>Answer</th>
                  <th>Status</th>
                  <th>Updated By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFAQs.map((faq) => (
                  <tr key={faq.id}>
                    <td>
                      <span className={styles.sortOrder}>#{faq.sort_order}</span>
                    </td>
                    <td>
                      <div className={styles.categoryCell}>
                        <FiList className={styles.categoryIcon} />
                        <span className={styles.categoryLabel}>
                          {faq.category}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={styles.questionText}>
                        {faq.question}
                      </span>
                    </td>
                    <td>
                      <span className={styles.answerText}>
                        {faq.answer.length > 100
                          ? `${faq.answer.substring(0, 100)}...`
                          : faq.answer}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`${styles.status} ${
                          faq.is_active
                            ? styles.statusActive
                            : styles.statusInactive
                        }`}
                      >
                        {faq.is_active ? (
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
                      <span className={styles.updatedBy}>
                        {faq.updated_by_username}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button
                          className={styles.editBtn}
                          onClick={() => handleOpenModal(faq)}
                          title="Edit"
                        >
                          <FiEdit />
                        </button>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleOpenDeleteModal(faq)}
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>
                {isEditMode ? "Edit FAQ" : "Create New FAQ"}
              </h2>
              <button
                className={styles.closeBtn}
                onClick={handleCloseModal}
                aria-label="Close"
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Category <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className={`${styles.input} ${
                      formErrors.category ? styles.inputError : ""
                    }`}
                    placeholder="e.g., General, Account, Billing"
                  />
                  {formErrors.category && (
                    <span className={styles.errorMessage}>
                      {formErrors.category}
                    </span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Sort Order</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.sort_order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sort_order: parseInt(e.target.value) || 1,
                      })
                    }
                    className={`${styles.input} ${
                      formErrors.sort_order ? styles.inputError : ""
                    }`}
                  />
                  {formErrors.sort_order && (
                    <span className={styles.errorMessage}>
                      {formErrors.sort_order}
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Question <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) =>
                    setFormData({ ...formData, question: e.target.value })
                  }
                  className={`${styles.input} ${
                    formErrors.question ? styles.inputError : ""
                  }`}
                  placeholder="Enter the question"
                />
                {formErrors.question && (
                  <span className={styles.errorMessage}>
                    {formErrors.question}
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Answer <span className={styles.required}>*</span>
                </label>
                <textarea
                  value={formData.answer}
                  onChange={(e) =>
                    setFormData({ ...formData, answer: e.target.value })
                  }
                  className={`${styles.textarea} ${
                    formErrors.answer ? styles.inputError : ""
                  }`}
                  placeholder="Enter the detailed answer"
                  rows={5}
                />
                {formErrors.answer && (
                  <span className={styles.errorMessage}>
                    {formErrors.answer}
                  </span>
                )}
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
                  <span>Active (Display on website)</span>
                </label>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={handleCloseModal}
                  disabled={modalLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={modalLoading}
                >
                  {modalLoading
                    ? "Saving..."
                    : isEditMode
                      ? "Update FAQ"
                      : "Create FAQ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && faqToDelete && (
        <div className={styles.modalOverlay} onClick={handleCloseDeleteModal}>
          <div
            className={styles.deleteModalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.deleteModalHeader}>
              <div className={styles.deleteIconWrapper}>
                <FiAlertTriangle className={styles.deleteIcon} />
              </div>
              <h2>Delete FAQ</h2>
              <p>Are you sure you want to delete this FAQ?</p>
            </div>

            <div className={styles.deleteModalBody}>
              <div className={styles.deleteContactDetails}>
                <div className={styles.deleteDetailRow}>
                  <span className={styles.deleteDetailLabel}>Category:</span>
                  <span className={styles.deleteDetailValue}>
                    {faqToDelete.category}
                  </span>
                </div>
                <div className={styles.deleteDetailRow}>
                  <span className={styles.deleteDetailLabel}>Question:</span>
                  <span className={styles.deleteDetailValue}>
                    {faqToDelete.question}
                  </span>
                </div>
              </div>
              <div className={styles.deleteWarning}>
                <FiAlertCircle />
                <span>This action cannot be undone.</span>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={handleCloseDeleteModal}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.deleteBtnPrimary}
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete FAQ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
