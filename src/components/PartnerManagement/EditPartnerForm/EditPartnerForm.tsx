"use client";

import React, { useState, useEffect } from "react";
import { 
  FiBriefcase, FiMail, FiPhone, FiMapPin, 
  FiDollarSign, FiInfo, FiLoader, FiX
} from "react-icons/fi";
import { useRouter, useParams } from "next/navigation";
import styles from "./EditPartnerForm.module.css";
import { getPartnerDetail, updatePartner } from "@/lib/api/partners";
import { PartnerDetail } from "@/types/partner";

const EditPartnerForm: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const partnerId = params.id as string;

  const [partner, setPartner] = useState<PartnerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    business_name: "",
    contact_phone: "",
    contact_email: "",
    address: "",
    upfront_amount: "",
    revenue_share_percent: "",
    notes: "",
  });

  // Load partner data
  useEffect(() => {
    const fetchPartnerDetail = async () => {
      try {
        setLoading(true);
        const response = await getPartnerDetail(partnerId);
        
        if (response.success) {
          const partnerData = response.data;
          setPartner(partnerData);
          
          // Populate form
          setFormData({
            business_name: partnerData.business_name || "",
            contact_phone: partnerData.contact_phone || "",
            contact_email: partnerData.contact_email || "",
            address: partnerData.address || "",
            upfront_amount: partnerData.upfront_amount || "",
            revenue_share_percent: partnerData.revenue_share_percent || "",
            notes: partnerData.notes || "",
          });
        } else {
          setError(response.message || "Failed to load partner details");
        }
      } catch (err: any) {
        console.error("Error fetching partner:", err);
        setError(err.message || "Failed to load partner details");
      } finally {
        setLoading(false);
      }
    };

    if (partnerId) {
      fetchPartnerDetail();
    }
  }, [partnerId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Validation
      if (!formData.business_name.trim()) {
        setError("Business name is required");
        setSubmitting(false);
        return;
      }

      if (!formData.contact_phone.trim()) {
        setError("Contact phone is required");
        setSubmitting(false);
        return;
      }

      // TODO: Implement update API call
      const response = await updatePartner(partnerId, {
        business_name: formData.business_name,
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email || undefined,
        address: formData.address || undefined,
        upfront_amount: formData.upfront_amount ? parseFloat(formData.upfront_amount) : undefined,
        revenue_share_percent: formData.revenue_share_percent ? parseFloat(formData.revenue_share_percent) : undefined,
        notes: formData.notes || undefined,
      });
      
      if (response.success) {
        // Success - redirect to partner detail
        router.push(`/dashboard/partners/${partnerId}`);
      } else {
        throw new Error(response.message || "Failed to update partner");
      }
    } catch (err: any) {
      console.error("Partner update error:", err);
      
      let errorMessage = "Failed to update partner. Please check your details.";
      
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <FiLoader className={styles.spinner} />
        <p>Loading partner details...</p>
      </div>
    );
  }

  if (error && !partner) {
    return (
      <div className={styles.errorContainer}>
        <FiInfo className={styles.errorIcon} />
        <p>{error}</p>
        <button onClick={() => router.back()} className={styles.backBtn}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Update Partner Profile</h1>
        <p className={styles.pageSubtitle}>
          Managing profile for <span className={styles.highlight}>{partner?.business_name}</span>
        </p>
      </div>

      {/* Form Card */}
      <div className={styles.formCard}>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.errorAlert}>
              <FiInfo />
              <span>{error}</span>
              <button 
                type="button" 
                onClick={() => setError(null)}
                className={styles.closeAlert}
              >
                <FiX />
              </button>
            </div>
          )}

          {/* Business Details Section */}
          <section className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <FiBriefcase className={styles.sectionIcon} />
              <h2 className={styles.sectionTitle}>Business Details</h2>
            </div>
            
            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="business_name">
                  Business Name
                </label>
                <input 
                  className={styles.input} 
                  id="business_name" 
                  type="text" 
                  value={formData.business_name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="contact_phone">
                  Contact Phone
                </label>
                <input 
                  className={styles.input} 
                  id="contact_phone" 
                  type="text" 
                  value={formData.contact_phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="contact_email">
                  Contact Email
                </label>
                <input 
                  className={styles.input} 
                  id="contact_email" 
                  type="email" 
                  value={formData.contact_email}
                  onChange={handleInputChange}
                />
              </div>

              <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <label className={styles.label} htmlFor="address">
                  Address
                </label>
                <textarea 
                  className={styles.textarea} 
                  id="address" 
                  rows={3}
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </section>

          {/* Divider */}
          <hr className={styles.divider} />

          {/* Financial & Agreement Section */}
          <section className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <FiDollarSign className={styles.sectionIcon} />
              <h2 className={styles.sectionTitle}>Financial & Agreement</h2>
            </div>
            
            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="upfront_amount">
                  Upfront Amount
                </label>
                <div className={styles.inputWithPrefix}>
                  <span className={styles.inputPrefix}>NPR</span>
                  <input 
                    className={`${styles.input} ${styles.inputWithPrefixField}`}
                    id="upfront_amount" 
                    type="number" 
                    step="0.01"
                    value={formData.upfront_amount}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="revenue_share_percent">
                  Revenue Share %
                </label>
                <div className={styles.inputWithSuffix}>
                  <input 
                    className={`${styles.input} ${styles.inputWithSuffixField}`}
                    id="revenue_share_percent" 
                    type="number" 
                    step="0.1"
                    value={formData.revenue_share_percent}
                    onChange={handleInputChange}
                  />
                  <span className={styles.inputSuffix}>%</span>
                </div>
              </div>
            </div>
          </section>

          {/* Divider */}
          <hr className={styles.divider} />

          {/* Additional Info Section */}
          <section className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <FiInfo className={styles.sectionIcon} />
              <h2 className={styles.sectionTitle}>Additional Info</h2>
            </div>
            
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="notes">
                Internal Remarks / Notes
              </label>
              <textarea 
                className={styles.textarea} 
                id="notes" 
                rows={4}
                placeholder="Enter internal notes about this partner..."
                value={formData.notes}
                onChange={handleInputChange}
              />
            </div>
          </section>

          {/* Form Actions */}
          <div className={styles.formActions}>
            <button 
              type="button" 
              className={styles.cancelButton}
              onClick={() => router.back()}
              disabled={submitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <FiLoader className={styles.buttonSpinner} />
                  Updating...
                </>
              ) : (
                'Update Profile'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPartnerForm;
