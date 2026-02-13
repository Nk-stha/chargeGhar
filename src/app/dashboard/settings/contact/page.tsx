"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import styles from "./contact.module.css";
import {
  FiPhone,
  FiMail,
  FiMapPin,
  FiClock,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiRefreshCw,
  FiAlertCircle,
  FiX,
  FiEye,
  FiEyeOff,
  FiSearch,
  FiAlertTriangle,
} from "react-icons/fi";
import {
  contactService,
  ContactInfo,
} from "../../../../lib/api/contact.service";

export default function ContactManagementPage() {
  const [contacts, setContacts] = useState<ContactInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [selectedContact, setSelectedContact] = useState<ContactInfo | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [contactToDelete, setContactToDelete] = useState<ContactInfo | null>(
    null,
  );
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  // Form state
  const [formData, setFormData] = useState({
    info_type: "phone" as "phone" | "email" | "address" | "support_hours",
    label: "",
    value: "",
    description: "",
    is_active: true,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await contactService.getContacts();

      if (response.success) {
        setContacts(response.data ?? []);
      } else {
        const errorMsg = "Failed to fetch contacts";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Unable to load contacts. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleRefresh = () => {
    fetchContacts();
  };

  const handleOpenModal = (contact?: ContactInfo) => {
    if (contact) {
      setIsEditMode(true);
      setSelectedContact(contact);
      setFormData({
        info_type: contact.info_type,
        label: contact.label,
        value: contact.value,
        description: contact.description || "",
        is_active: contact.is_active,
      });
    } else {
      setIsEditMode(false);
      setSelectedContact(null);
      setFormData({
        info_type: "phone",
        label: "",
        value: "",
        description: "",
        is_active: true,
      });
    }
    setFormErrors({});
    setError(null); // Clear any existing errors
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedContact(null);
    setFormErrors({});
  };

  const handleOpenDeleteModal = (contact: ContactInfo) => {
    setContactToDelete(contact);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setContactToDelete(null);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.label.trim()) {
      errors.label = "Label is required";
    }

    if (!formData.value.trim()) {
      errors.value = "Value is required";
    }

    // Validate email format
    if (formData.info_type === "email" && formData.value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.value)) {
        errors.value = "Invalid email format";
      }
    }

    // Validate phone format (basic)
    if (formData.info_type === "phone" && formData.value) {
      const phoneRegex = /^[+]?[\d\s\-()]+$/;
      if (!phoneRegex.test(formData.value)) {
        errors.value = "Invalid phone format";
      }
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

      const response = await contactService.createContact({
        info_type: formData.info_type,
        label: formData.label.trim(),
        value: formData.value.trim(),
        description: formData.description.trim() || undefined,
        is_active: formData.is_active,
      });

      if (response.success) {
        toast.success("Contact information saved successfully");
        await fetchContacts();
        handleCloseModal();
      } else {
        const errorMsg = "Failed to save contact information";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err: any) {
      const errorData = err?.response?.data;
      let errorMessage = "Failed to save contact information";

      if (errorData?.error?.message) {
        errorMessage = errorData.error.message;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setModalLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!contactToDelete) return;

    try {
      setDeleteLoading(true);
      const response = await contactService.deleteContact(contactToDelete.id);

      if (response.success) {
        toast.success("Contact deleted successfully");
        await fetchContacts();
        handleCloseDeleteModal();
      } else {
        const errorMsg = "Failed to delete contact";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Failed to delete contact information";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setDeleteLoading(false);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "phone":
        return <FiPhone />;
      case "email":
        return <FiMail />;
      case "address":
        return <FiMapPin />;
      case "support_hours":
        return <FiClock />;
      default:
        return <FiPhone />;
    }
  };

  const getTypeLabel = (type: string): string => {
    switch (type) {
      case "phone":
        return "Phone";
      case "email":
        return "Email";
      case "address":
        return "Address";
      case "support_hours":
        return "Support Hours";
      default:
        return type;
    }
  };

  const isTypeInUse = (type: string): boolean => {
    return contacts.some((contact) => contact.info_type === type);
  };

  const getExistingTypesMessage = (): string => {
    const existingTypes = contacts.map((c) => getTypeLabel(c.info_type));
    if (existingTypes.length === 0) return "";
    if (existingTypes.length === 1) return `Existing: ${existingTypes[0]}`;
    return `Existing: ${existingTypes.join(", ")}`;
  };

  const filteredContacts = contacts.filter(
    (contact) =>
      contact?.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact?.value?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact?.info_type?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.headerSection}>
        <div>
          <h1 className={styles.title}>Contact Information</h1>
          <p className={styles.subtitle}>
            Manage contact information displayed on your website
            {contacts.length > 0 && ` (${contacts.length} total)`}
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
          <button className={styles.addBtn} onClick={() => handleOpenModal()}>
            <FiPlus /> Add Contact
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
            <FiPhone className={styles.icon} /> Contact List
          </h2>
          <div className={styles.searchContainer}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by label, value, or type..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
            <div className={styles.spinner}></div>
            <p>Loading contact information...</p>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className={styles.noData}>
            <FiPhone className={styles.noDataIcon} />
            <p>
              {searchTerm
                ? "No contacts match your search criteria"
                : "No contact information found"}
            </p>
            {!searchTerm && (
              <button
                className={styles.addFirstBtn}
                onClick={() => handleOpenModal()}
              >
                <FiPlus /> Create Your First Contact
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Label</th>
                    <th>Value</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Updated By</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map((contact) => (
                  <tr key={contact?.id ?? Math.random()}>
                    <td>
                      <div className={styles.typeCell}>
                        <span className={styles.typeIcon}>
                          {getIconForType(contact?.info_type ?? "phone")}
                        </span>
                        <span className={styles.typeLabel}>
                          {getTypeLabel(contact?.info_type ?? "phone")}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={styles.contactLabel}>
                        {contact?.label ?? "N/A"}
                      </span>
                    </td>
                    <td>
                      <span className={styles.contactValue}>
                        {contact?.value ?? "N/A"}
                      </span>
                    </td>
                    <td>
                      <span className={styles.contactDescription}>
                        {contact?.description || "-"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`${styles.status} ${
                          contact?.is_active
                            ? styles.statusActive
                            : styles.statusInactive
                        }`}
                      >
                        {contact?.is_active ? (
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
                        {contact?.updated_by_username ?? "N/A"}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button
                          className={styles.editBtn}
                          onClick={() => handleOpenModal(contact)}
                          title="Edit"
                        >
                          <FiEdit />
                        </button>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleOpenDeleteModal(contact)}
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

          {/* Mobile Card View */}
          <div className={styles.mobileCards}>
            {filteredContacts.map((contact) => (
              <div key={contact?.id ?? Math.random()} className={styles.mobileCard}>
                <div className={styles.mobileCardHeader}>
                  <div className={styles.mobileCardTitle}>
                    <h3>
                      {getIconForType(contact?.info_type ?? "phone")}
                      {contact?.label ?? "N/A"}
                    </h3>
                    <p>{getTypeLabel(contact?.info_type ?? "phone")}</p>
                  </div>
                  <div className={styles.mobileCardActions}>
                    <button
                      className={styles.editBtn}
                      onClick={() => handleOpenModal(contact)}
                      title="Edit"
                    >
                      <FiEdit />
                    </button>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleOpenDeleteModal(contact)}
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>

                <div className={styles.mobileCardBody}>
                  <div className={styles.mobileCardRow}>
                    <span className={styles.mobileCardLabel}>Value</span>
                    <span className={styles.mobileCardValue}>
                      {contact?.value ?? "N/A"}
                    </span>
                  </div>

                  {contact?.description && (
                    <div className={styles.mobileCardRow}>
                      <span className={styles.mobileCardLabel}>Description</span>
                      <span className={styles.mobileCardValue}>
                        {contact.description}
                      </span>
                    </div>
                  )}

                  <div className={styles.mobileCardRow}>
                    <span className={styles.mobileCardLabel}>Status</span>
                    <span
                      className={`${styles.status} ${
                        contact?.is_active
                          ? styles.statusActive
                          : styles.statusInactive
                      }`}
                    >
                      {contact?.is_active ? (
                        <>
                          <FiEye size={12} /> Active
                        </>
                      ) : (
                        <>
                          <FiEyeOff size={12} /> Inactive
                        </>
                      )}
                    </span>
                  </div>

                  <div className={styles.mobileCardRow}>
                    <span className={styles.mobileCardLabel}>Updated By</span>
                    <span className={styles.mobileCardValue}>
                      {contact?.updated_by_username ?? "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </>
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
                {isEditMode
                  ? "Edit Contact Information"
                  : "Create New Contact Information"}
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
                    Type <span className={styles.required}>*</span>
                  </label>
                  <select
                    value={formData.info_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        info_type: e.target.value as any,
                      })
                    }
                    className={styles.input}
                    disabled={isEditMode}
                  >
                    <option value="phone">
                      Phone{" "}
                      {!isEditMode && isTypeInUse("phone")
                        ? "(Already exists)"
                        : ""}
                    </option>
                    <option value="email">
                      Email{" "}
                      {!isEditMode && isTypeInUse("email")
                        ? "(Already exists)"
                        : ""}
                    </option>
                    <option value="address">
                      Address{" "}
                      {!isEditMode && isTypeInUse("address")
                        ? "(Already exists)"
                        : ""}
                    </option>
                    <option value="support_hours">
                      Support Hours{" "}
                      {!isEditMode && isTypeInUse("support_hours")
                        ? "(Already exists)"
                        : ""}
                    </option>
                  </select>
                  {isEditMode && (
                    <span className={styles.helpText}>
                      Type cannot be changed when editing
                    </span>
                  )}
                  {!isEditMode && (
                    <>
                      <span className={styles.helpText}>
                        Note: Only one contact per type is allowed
                      </span>
                      {getExistingTypesMessage() && (
                        <span className={styles.warningText}>
                          {getExistingTypesMessage()}
                        </span>
                      )}
                      {isTypeInUse(formData.info_type) && (
                        <span className={styles.errorText}>
                          ⚠️ A {getTypeLabel(formData.info_type)} contact
                          already exists. Please edit the existing one or delete
                          it first.
                        </span>
                      )}
                    </>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Label <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) =>
                      setFormData({ ...formData, label: e.target.value })
                    }
                    className={`${styles.input} ${
                      formErrors.label ? styles.inputError : ""
                    }`}
                    placeholder="e.g., Customer Support"
                  />
                  {formErrors.label && (
                    <span className={styles.errorMessage}>
                      {formErrors.label}
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Value <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({ ...formData, value: e.target.value })
                  }
                  className={`${styles.input} ${
                    formErrors.value ? styles.inputError : ""
                  }`}
                  placeholder={
                    formData.info_type === "phone"
                      ? "+977-9861234567"
                      : formData.info_type === "email"
                        ? "support@example.com"
                        : formData.info_type === "address"
                          ? "Kathmandu, Nepal"
                          : "24/7"
                  }
                />
                {formErrors.value && (
                  <span className={styles.errorMessage}>
                    {formErrors.value}
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className={styles.textarea}
                  placeholder="Additional information about this contact"
                  rows={3}
                />
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
                  disabled={
                    modalLoading ||
                    (!isEditMode && isTypeInUse(formData.info_type))
                  }
                >
                  {modalLoading
                    ? "Saving..."
                    : isEditMode
                      ? "Update Contact"
                      : !isEditMode && isTypeInUse(formData.info_type)
                        ? "Type Already Exists"
                        : "Create Contact"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && contactToDelete && (
        <div className={styles.modalOverlay} onClick={handleCloseDeleteModal}>
          <div
            className={styles.deleteModalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.deleteModalHeader}>
              <div className={styles.deleteIconWrapper}>
                <FiAlertTriangle className={styles.deleteIcon} />
              </div>
              <h2>Delete Contact Information</h2>
              <p>Are you sure you want to delete this contact information?</p>
            </div>

            <div className={styles.deleteModalBody}>
              <div className={styles.deleteContactDetails}>
                <div className={styles.deleteDetailRow}>
                  <span className={styles.deleteDetailLabel}>Type:</span>
                  <span className={styles.deleteDetailValue}>
                    {getTypeLabel(contactToDelete.info_type)}
                  </span>
                </div>
                <div className={styles.deleteDetailRow}>
                  <span className={styles.deleteDetailLabel}>Label:</span>
                  <span className={styles.deleteDetailValue}>
                    {contactToDelete.label}
                  </span>
                </div>
                <div className={styles.deleteDetailRow}>
                  <span className={styles.deleteDetailLabel}>Value:</span>
                  <span className={styles.deleteDetailValue}>
                    {contactToDelete.value}
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
                {deleteLoading ? "Deleting..." : "Delete Contact"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
