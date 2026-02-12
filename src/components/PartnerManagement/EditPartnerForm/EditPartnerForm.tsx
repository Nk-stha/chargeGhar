"use client";

import React, { useState, useEffect } from "react";
import { 
  FiBriefcase, FiMail, FiPhone, FiMapPin, 
  FiDollarSign, FiInfo, FiLoader, FiX, FiCheck, FiCpu
} from "react-icons/fi";
import { useRouter, useParams } from "next/navigation";
import styles from "./EditPartnerForm.module.css";
import { getPartnerDetail, updatePartner } from "@/lib/api/partners";
import { PartnerDetail } from "@/types/partner";
import { extractApiError } from "@/lib/apiErrors";
import { toast } from "sonner";

const EditPartnerForm: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const partnerId = params.id as string;

  const [partner, setPartner] = useState<PartnerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Station management states
  const [stationSearchQuery, setStationSearchQuery] = useState("");
  const [isSearchingStation, setIsSearchingStation] = useState(false);
  const [allStations, setAllStations] = useState<import("../../../lib/api/availableStations.service").AvailableStation[]>([]);
  const [filteredStations, setFilteredStations] = useState<import("../../../lib/api/availableStations.service").AvailableStation[]>([]);
  const [showStationDropdown, setShowStationDropdown] = useState(false);
  const [stationLoadError, setStationLoadError] = useState<string | null>(null);
  const stationDropdownRef = React.useRef<HTMLDivElement>(null);

  // Function to refresh available stations
  const refreshAvailableStations = async () => {
    setIsSearchingStation(true);
    setStationLoadError(null);
    try {
      const { availableStationsService } = await import("../../../lib/api/availableStations.service");
      const response = await availableStationsService.getAvailableStations();
      
      if (response.success && response.data) {
        setAllStations(response.data);
        setFilteredStations(response.data);
      } else {
        setStationLoadError("Failed to load available stations. Please try again.");
        setAllStations([]);
        setFilteredStations([]);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to load available stations. Please check your connection.";
      setStationLoadError(errorMsg);
      setAllStations([]);
      setFilteredStations([]);
    } finally {
      setIsSearchingStation(false);
    }
  };

  // Form State
  const [formData, setFormData] = useState({
    business_name: "",
    contact_phone: "",
    contact_email: "",
    address: "",
    upfront_amount: "",
    revenue_share_percent: "",
    notes: "",
    station_ids: [] as string[],
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
            station_ids: partnerData.station_ids || [],
          });
        } else {
          toast.error(response.message || "Failed to load partner details");
        }
      } catch (err: unknown) {
        const apiError = extractApiError(err, "Failed to load partner details");
        toast.error(apiError.message);
      } finally {
        setLoading(false);
      }
    };

    if (partnerId) {
      fetchPartnerDetail();
    }
  }, [partnerId]);

  // Load available stations on component mount
  useEffect(() => {
    // Load stations immediately when component mounts
    refreshAvailableStations();
    
    // Also refresh every 30 seconds to keep data fresh
    const interval = setInterval(refreshAvailableStations, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Filter stations based on search query
  useEffect(() => {
    if (stationSearchQuery.trim() === "") {
      setFilteredStations(allStations);
    } else {
      const query = stationSearchQuery.toLowerCase();
      const filtered = allStations.filter(station => 
        station.station_name?.toLowerCase().includes(query) ||
        station.serial_number?.toLowerCase().includes(query) ||
        station.address?.toLowerCase().includes(query) ||
        station.id.toLowerCase().includes(query)
      );
      setFilteredStations(filtered);
    }
  }, [stationSearchQuery, allStations]);

  // Click outside handler for station dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (stationDropdownRef.current && !stationDropdownRef.current.contains(event.target as Node)) {
        setShowStationDropdown(false);
        setStationSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (fieldErrors[id]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const addStation = (station: import("../../../lib/api/availableStations.service").AvailableStation) => {
    if (!formData.station_ids.includes(station.id)) {
      setFormData(prev => ({
        ...prev,
        station_ids: [...prev.station_ids, station.id]
      }));
    }
    setStationSearchQuery("");
  };

  const removeStation = (id: string) => {
    setFormData(prev => ({
      ...prev,
      station_ids: prev.station_ids.filter(s => s !== id)
    }));
  };

  const getStationNameById = (id: string): string => {
    const station = allStations.find(s => s.id === id);
    return station ? `${station.station_name} (ID: ${id.substring(0, 8)}...)` : `ID: ${id.substring(0, 8)}...`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFieldErrors({});

    try {
      // Validation
      if (!formData.business_name.trim()) {
        toast.error("Business name is required");
        setSubmitting(false);
        return;
      }

      if (!formData.contact_phone.trim()) {
        toast.error("Contact phone is required");
        setSubmitting(false);
        return;
      }

      const response = await updatePartner(partnerId, {
        business_name: formData.business_name,
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email || undefined,
        address: formData.address || undefined,
        upfront_amount: formData.upfront_amount ? parseFloat(formData.upfront_amount) : undefined,
        revenue_share_percent: formData.revenue_share_percent ? parseFloat(formData.revenue_share_percent) : undefined,
        notes: formData.notes || undefined,
        station_ids: formData.station_ids.length > 0 ? formData.station_ids : undefined,
      });
      
      if (response.success) {
        toast.success("Partner updated successfully!");
        router.push(`/dashboard/partners/${partnerId}`);
      } else {
        throw new Error(response.message || "Failed to update partner");
      }
    } catch (err: unknown) {
      const apiError = extractApiError(err, "Failed to update partner. Please check your details.");
      
      toast.error(apiError.message);
      
      if (apiError.fieldErrors) {
        setFieldErrors(apiError.fieldErrors);
      }
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

  if (!partner) {
    return (
      <div className={styles.errorContainer}>
        <FiInfo className={styles.errorIcon} />
        <p>Partner details could not be loaded.</p>
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
          {/* Removed error banner */}

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
                  className={`${styles.input} ${fieldErrors.business_name ? styles.inputError : ''}`} 
                  id="business_name" 
                  type="text" 
                  value={formData.business_name}
                  onChange={handleInputChange}
                  required
                />
                {fieldErrors.business_name && (
                  <span className={styles.fieldError}>{fieldErrors.business_name[0]}</span>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="contact_phone">
                  Contact Phone
                </label>
                <input 
                  className={`${styles.input} ${fieldErrors.contact_phone ? styles.inputError : ''}`} 
                  id="contact_phone" 
                  type="text" 
                  value={formData.contact_phone}
                  onChange={handleInputChange}
                  required
                />
                {fieldErrors.contact_phone && (
                  <span className={styles.fieldError}>{fieldErrors.contact_phone[0]}</span>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="contact_email">
                  Contact Email
                </label>
                <input 
                  className={`${styles.input} ${fieldErrors.contact_email ? styles.inputError : ''}`} 
                  id="contact_email" 
                  type="email" 
                  value={formData.contact_email}
                  onChange={handleInputChange}
                />
                {fieldErrors.contact_email && (
                  <span className={styles.fieldError}>{fieldErrors.contact_email[0]}</span>
                )}
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

          {/* Hardware Assignment Section */}
          <section className={styles.formSection} style={{ overflow: 'visible', position: 'relative', zIndex: 99 }}>
            <div className={styles.sectionHeader}>
              <FiCpu className={styles.sectionIcon} />
              <h2 className={styles.sectionTitle}>Assigned Stations</h2>
            </div>
            
            <div>
              <label className={styles.label}>
                Manage Assigned Stations
              </label>
              
              <div className={styles.searchWrapper} ref={stationDropdownRef}>
                {formData.station_ids.length > 0 && (
                  <div style={{ marginBottom: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {formData.station_ids.map(id => (
                      <div key={id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        background: '#1a1a1a',
                        border: '1px solid #82ea80',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        color: '#82ea80'
                      }}>
                        {getStationNameById(id)}
                        <button
                          type="button"
                          onClick={() => removeStation(id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#82ea80',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0.25rem'
                          }}
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <input 
                  className={styles.input} 
                  id="station_display" 
                  placeholder="Click to add stations..."
                  onClick={() => setShowStationDropdown(true)}
                  onFocus={() => setShowStationDropdown(true)}
                  readOnly
                />

                {showStationDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '0.5rem',
                    background: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '0.5rem',
                    zIndex: 1000,
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)'
                  }}>
                    <div style={{
                      padding: '0.75rem',
                      borderBottom: '1px solid #333',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <FiMapPin style={{ color: '#82ea80' }} />
                      <input
                        type="text"
                        placeholder="Search stations..."
                        value={stationSearchQuery}
                        onChange={(e) => setStationSearchQuery(e.target.value)}
                        style={{
                          flex: 1,
                          background: 'transparent',
                          border: 'none',
                          color: '#fff',
                          outline: 'none',
                          fontSize: '0.875rem'
                        }}
                        autoFocus
                      />
                      {stationSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setStationSearchQuery("")}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#9ca3af',
                            cursor: 'pointer'
                          }}
                        >
                          <FiX />
                        </button>
                      )}
                    </div>
                    <div style={{
                      maxHeight: '300px',
                      overflowY: 'auto'
                    }}>
                      {allStations.length === 0 && isSearchingStation ? (
                        <div style={{
                          padding: '1.5rem',
                          textAlign: 'center',
                          color: '#9ca3af'
                        }}>
                          <FiLoader style={{ display: 'inline', marginRight: '0.5rem', animation: 'spin 0.8s linear infinite' }} />
                          Loading stations...
                        </div>
                      ) : stationLoadError ? (
                        <div style={{
                          padding: '1.5rem',
                          textAlign: 'center',
                          color: '#EF4444'
                        }}>
                          <FiInfo style={{ display: 'inline', marginRight: '0.5rem' }} />
                          {stationLoadError}
                        </div>
                      ) : filteredStations.length > 0 ? (
                        filteredStations.map(station => (
                          <div 
                            key={station.id} 
                            onClick={() => addStation(station)}
                            style={{
                              padding: '0.75rem',
                              borderBottom: '1px solid #2a2a2a',
                              cursor: 'pointer',
                              transition: 'background 0.2s',
                              background: formData.station_ids.includes(station.id) ? '#1f1f1f' : 'transparent',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#1f1f1f'}
                            onMouseLeave={(e) => e.currentTarget.style.background = formData.station_ids.includes(station.id) ? '#1f1f1f' : 'transparent'}
                          >
                            <div>
                              <div style={{ fontWeight: 'bold', color: '#fff' }}>{station.station_name}</div>
                              <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>SN: {station.serial_number} • {station.status}</div>
                            </div>
                            {formData.station_ids.includes(station.id) && (
                              <FiCheck style={{ color: '#82ea80' }} />
                            )}
                          </div>
                        ))
                      ) : (
                        <div style={{
                          padding: '1.5rem',
                          textAlign: 'center',
                          color: '#9ca3af'
                        }}>
                          {stationSearchQuery ? "No stations found matching your search" : "No available stations"}
                        </div>
                      )}
                    </div>
                    <div style={{
                      padding: '0.75rem',
                      borderTop: '1px solid #333',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.75rem',
                      color: '#9ca3af',
                      gap: '0.5rem'
                    }}>
                      <span>
                        Showing {filteredStations.length} of {allStations.length} stations
                      </span>
                      <button
                        type="button"
                        onClick={refreshAvailableStations}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#82ea80',
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                        disabled={isSearchingStation}
                        title="Refresh station list"
                      >
                        {isSearchingStation ? "Refreshing..." : "Refresh"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowStationDropdown(false);
                          setStationSearchQuery("");
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#82ea80',
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem', fontStyle: 'italic' }}>
                Search and select stations to assign to this partner.
              </p>
            </div>
          </section>
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
