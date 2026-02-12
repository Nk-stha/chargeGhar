"use client";

import React, { useState, useEffect } from "react";
import { 
  FiUser, FiBriefcase, FiMail, FiPhone, FiMapPin, 
  FiLock, FiShield, FiCpu, FiPlus, FiX, FiCheck,
  FiTrendingUp, FiDollarSign, FiInfo, FiEye, FiEyeOff, FiLoader
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import styles from "./AddPartnerForm.module.css";
import { createVendor, createFranchise } from "../../../lib/api/partners";
import { extractApiError } from "../../../lib/apiErrors";
import { toast } from "sonner";

type PartnerType = "VENDOR" | "FRANCHISE";
type VendorType = "REVENUE" | "NON_REVENUE";
type RevenueModel = "PERCENTAGE" | "FIXED";

const AddPartnerForm: React.FC = () => {
  const router = useRouter();
  const [partnerType, setPartnerType] = useState<PartnerType>("VENDOR");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // Removed top-level error state in favor of toast
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Refs for click outside detection
  const userDropdownRef = React.useRef<HTMLDivElement>(null);
  const stationDropdownRef = React.useRef<HTMLDivElement>(null);

  // Search States
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [isSearchingUser, setIsSearchingUser] = useState(false);
  const [allUsers, setAllUsers] = useState<import("../../../lib/api/user.service").User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<import("../../../lib/api/user.service").User[]>([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [selectedUserDisplay, setSelectedUserDisplay] = useState("");
  const [userLoadError, setUserLoadError] = useState<string | null>(null);

  const [stationSearchQuery, setStationSearchQuery] = useState("");
  const [isSearchingStation, setIsSearchingStation] = useState(false);
  const [allStations, setAllStations] = useState<import("../../../lib/api/availableStations.service").AvailableStation[]>([]);
  const [filteredStations, setFilteredStations] = useState<import("../../../lib/api/availableStations.service").AvailableStation[]>([]);
  const [showStationDropdown, setShowStationDropdown] = useState(false);
  const [selectedStationDisplay, setSelectedStationDisplay] = useState("");
  const [stationLoadError, setStationLoadError] = useState<string | null>(null);

  // Function to refresh available stations
  const refreshAvailableStations = async () => {
    setIsSearchingStation(true);
    setStationLoadError(null);
    try {
      const { availableStationsService } = await import("../../../lib/api/availableStations.service");
      const response = await availableStationsService.getAvailableStations();
      
      if (response.success && response.data) {
        if (response.data.length === 0) {
          setStationLoadError("No available stations. All stations are already assigned to partners.");
        }
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
    user_id: "",
    business_name: "",
    contact_phone: "",
    contact_email: "",
    address: "",
    password: "",
    notes: "",
    // Vendor Specific
    vendor_type: "REVENUE" as VendorType,
    revenue_model: "PERCENTAGE" as RevenueModel,
    revenue_value: "25",
    station_id: "",
    // Franchise Specific
    upfront_amount: "",
    revenue_share_percent: "25",
    station_ids: [] as string[],
  });

  // Load all users on component mount
  useEffect(() => {
    const loadAllUsers = async () => {
      setIsSearchingUser(true);
      setUserLoadError(null);
      try {
        const { userService } = await import("../../../lib/api/user.service");
        const response = await userService.getUsers({ page: 1, page_size: 100 });
        
        // Handle wrapped response structure
        const users = (response as any).data?.data?.results || response.data?.results || [];
        
        if (users.length === 0) {
          setUserLoadError("No users available in the system. Please create users first from the Users page.");
        }
        
        setAllUsers(users);
        setFilteredUsers(users);
      } catch (err: any) {
        console.error("Failed to load users:", err);
        const errorMsg = err.response?.data?.message || err.message || "Failed to load users. Please check your connection.";
        setUserLoadError(errorMsg);
        setAllUsers([]);
        setFilteredUsers([]);
      } finally {
        setIsSearchingUser(false);
      }
    };
    loadAllUsers();
  }, []);

  // Load available stations on component mount
  useEffect(() => {
    // Load stations immediately when component mounts
    refreshAvailableStations();
    
    // Also refresh every 30 seconds to keep data fresh
    const interval = setInterval(refreshAvailableStations, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Filter users based on search query
  useEffect(() => {
    if (userSearchQuery.trim() === "") {
      setFilteredUsers(allUsers);
    } else {
      const query = userSearchQuery.toLowerCase();
      const filtered = allUsers.filter(user => 
        user.first_name?.toLowerCase().includes(query) ||
        user.last_name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.username?.toLowerCase().includes(query) ||
        user.id.toString().includes(query)
      );
      setFilteredUsers(filtered);
    }
  }, [userSearchQuery, allUsers]);

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

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
        setUserSearchQuery("");
      }
      if (stationDropdownRef.current && !stationDropdownRef.current.contains(event.target as Node)) {
        setShowStationDropdown(false);
        setStationSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    // Clear field-specific error when user starts typing
    if (fieldErrors[id]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const selectUser = (user: import("../../../lib/api/user.service").User) => {
    setFormData(prev => ({ ...prev, user_id: user.id.toString() }));
    
    // Get display name with fallback priority: full_name > first_name + last_name > username
    let displayName = '';
    if (user.full_name && user.full_name.trim()) {
      displayName = user.full_name.trim();
    } else if (user.first_name || user.last_name) {
      displayName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    } else {
      displayName = user.username;
    }
    
    setSelectedUserDisplay(`${displayName} (ID: ${user.id})`);
    setShowUserDropdown(false);
    setUserSearchQuery("");
  };

  const selectStation = (station: import("../../../lib/api/availableStations.service").AvailableStation) => {
    if (partnerType === "VENDOR") {
      setFormData(prev => ({ ...prev, station_id: station.id }));
      setSelectedStationDisplay(`${station.station_name} (ID: ${station.id.substring(0, 8)}...)`);
      setShowStationDropdown(false);
      setStationSearchQuery("");
    } else {
      // Franchise - Add to list
      if (!formData.station_ids.includes(station.id)) {
        setFormData(prev => ({
          ...prev,
          station_ids: [...prev.station_ids, station.id]
        }));
      }
      setStationSearchQuery("");
    }
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
    e.preventDefault(); // Prevent default form submission
    setLoading(true);
    setFieldErrors({});

    try {
      // Validation
      if (!formData.user_id) {
        toast.error("Please select a user");
        setLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (!formData.business_name.trim()) {
        toast.error("Business name is required");
        setLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (!formData.contact_phone.trim()) {
        toast.error("Contact phone is required");
        setLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (partnerType === "VENDOR") {
        if (!formData.station_id) {
          toast.error("Please select a station for the vendor");
          setLoading(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }

        if (formData.vendor_type === "REVENUE" && !formData.password) {
          toast.error("Password is required for revenue vendors");
          setLoading(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }

        const payload: import("../../../types/partner").CreateVendorRequest = {
          user_id: parseInt(formData.user_id),
          business_name: formData.business_name,
          contact_phone: formData.contact_phone,
          contact_email: formData.contact_email || undefined,
          address: formData.address || undefined,
          vendor_type: formData.vendor_type,
          notes: formData.notes || undefined,
          station_id: formData.station_id,
          ...(formData.vendor_type === "REVENUE" && {
            password: formData.password,
            revenue_model: formData.revenue_model,
            ...(formData.revenue_model === "PERCENTAGE" 
              ? { partner_percent: parseFloat(formData.revenue_value) }
              : { fixed_amount: parseFloat(formData.revenue_value) }
            )
          })
        };
        await createVendor(payload);
      } else {
        // Franchise validation
        if (!formData.password) {
          toast.error("Password is required for franchise partners");
          setLoading(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }

        const payload: import("../../../types/partner").CreateFranchiseRequest = {
          user_id: parseInt(formData.user_id),
          business_name: formData.business_name,
          contact_phone: formData.contact_phone,
          contact_email: formData.contact_email || undefined,
          address: formData.address || undefined,
          password: formData.password,
          upfront_amount: formData.upfront_amount ? parseFloat(formData.upfront_amount) : 0,
          revenue_share_percent: parseFloat(formData.revenue_share_percent),
          station_ids: formData.station_ids,
          notes: formData.notes || undefined,
        };
        await createFranchise(payload);
      }
      
      toast.success("Partner created successfully!");
      // Success - redirect to partners list
      router.push("/dashboard/partners");
    } catch (err: unknown) {
      const apiError = extractApiError(err, "Failed to create partner. Please check your details.");
      
      // Show toast notification
      toast.error(apiError.message);
      
      // Set field errors silently (no additional toast)
      if (apiError.fieldErrors) {
        setFieldErrors(apiError.fieldErrors);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Sticky Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <h1 className={styles.pageTitle}>
              New Partner Registration
            </h1>
            <p className={styles.pageSubtitle}>
              Onboard new franchises and vendors to the Charge Ghar network
            </p>
          </div>
          <div className={styles.headerRight}>
            <button 
              type="button"
              className={styles.backButton}
              onClick={() => router.back()}
            >
              <FiX /> Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className={styles.formContainer}>
        <div className={styles.formCard}>
          <div className={styles.formContent}>
            {/* Partner Type Tabs */}
            <div className={styles.tabContainer}>
              <button 
                type="button"
                className={`${styles.tabButton} ${partnerType === "VENDOR" ? styles.tabActive : ""}`}
                onClick={() => {
                    setPartnerType("VENDOR");
                    setStationSearchQuery("");
                    setSelectedStationDisplay("");
                    setFormData(prev => ({ ...prev, station_id: "", station_ids: [] }));
                }}
              >
                VENDOR PARTNER
              </button>
              <button 
                type="button"
                className={`${styles.tabButton} ${partnerType === "FRANCHISE" ? styles.tabActive : ""}`}
                onClick={() => {
                    setPartnerType("FRANCHISE");
                    setStationSearchQuery("");
                    setSelectedStationDisplay("");
                    setFormData(prev => ({ ...prev, station_id: "", station_ids: [] }));
                }}
              >
                FRANCHISE PARTNER
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>

          {/* Authentication & User Section */}
          <section className={styles.formSection} style={{ overflow: 'visible', position: 'relative', zIndex: 100 }}>
            <div className={styles.sectionHeader}>
              <FiShield className={styles.sectionIcon} />
              <h2 className={styles.sectionTitle}>Partner Authentication</h2>
            </div>
            <div className={styles.formGrid} style={{ overflow: 'visible' }}>
              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="user_id">
                  Assigned User <span className={styles.required}>*</span>
                </label>
                <div className={styles.searchWrapper} ref={userDropdownRef}>
                  <input 
                    className={styles.input} 
                    id="user_display" 
                    type="text" 
                    placeholder="Click to select user..." 
                    value={selectedUserDisplay}
                    onClick={() => setShowUserDropdown(true)}
                    onFocus={() => setShowUserDropdown(true)}
                    readOnly
                    required={!formData.user_id}
                  />
                  {formData.user_id && <FiCheck className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" />}
                  
                  {showUserDropdown && (
                    <div className={styles.dropdownContainer}>
                      <div className={styles.dropdownSearch}>
                        <FiUser className={styles.dropdownSearchIcon} />
                        <input
                          type="text"
                          placeholder="Search users..."
                          value={userSearchQuery}
                          onChange={(e) => setUserSearchQuery(e.target.value)}
                          className={styles.dropdownSearchInput}
                          autoFocus
                        />
                        {userSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setUserSearchQuery("")}
                            className={styles.dropdownSearchClear}
                          >
                            <FiX />
                          </button>
                        )}
                      </div>
                      <div className={styles.dropdownList}>
                        {allUsers.length === 0 && isSearchingUser ? (
                          <div className={styles.dropdownEmpty}> <FiLoader className="animate-spin inline mr-2"/> Loading users... </div>
                        ) : userLoadError ? (
                          <div className={styles.dropdownEmpty} style={{ color: '#EF4444' }}>
                            <FiInfo className="inline mr-2" />
                            {userLoadError}
                          </div>
                        ) : filteredUsers.length > 0 ? (
                          filteredUsers.map(user => {
                            // Get display name with same logic as selectUser
                            let displayName = '';
                            if (user.full_name && user.full_name.trim()) {
                              displayName = user.full_name.trim();
                            } else if (user.first_name || user.last_name) {
                              displayName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
                            } else {
                              displayName = user.username;
                            }
                            
                            return (
                              <div 
                                key={user.id} 
                                className={`${styles.dropdownItem} ${formData.user_id === user.id.toString() ? styles.selectedItem : ''}`}
                                onClick={() => selectUser(user)}
                              >
                                <div className="font-bold">{displayName}</div>
                                <div className="text-xs text-gray-400">
                                  {user.email || user.phone_number || user.username} • ID: {user.id}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className={styles.dropdownEmpty}>
                            {userSearchQuery ? "No users found matching your search" : "No users available"}
                          </div>
                        )}
                      </div>
                      <div className={styles.dropdownFooter}>
                        <span className="text-xs text-gray-400 mr-3">
                          Showing {filteredUsers.length} of {allUsers.length} users
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setShowUserDropdown(false);
                            setUserSearchQuery("");
                          }}
                          className={styles.dropdownCloseBtn}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                  {/* Hidden input to store actual ID */}
                  <input type="hidden" id="user_id" value={formData.user_id} />
                </div>
              </div>
              
              {(partnerType === "FRANCHISE" || (partnerType === "VENDOR" && formData.vendor_type === "REVENUE")) && (
                <div className={styles.inputGroup}>
                  <label className={styles.label} htmlFor="password">
                    Initial Password <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.passwordWrapper}>
                    <input 
                      className={`${styles.input} ${fieldErrors.password ? styles.inputError : ''}`} 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      value={formData.password}
                      onChange={handleInputChange}
                      required 
                    />
                    <button 
                      type="button" 
                      className={styles.passwordToggle}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <span className={styles.fieldError}>{fieldErrors.password[0]}</span>
                  )}
                </div>
              )}
            </div>
          </section>


        {/* Business Details Section */}
        <section className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <FiBriefcase className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>Business Details</h2>
          </div>
          <div className={styles.formGrid}>
            <div className={styles.fullWidth}>
              <label className={styles.label} htmlFor="business_name">
                Business Name <span className={styles.required}>*</span>
              </label>
              <input 
                className={`${styles.input} ${fieldErrors.business_name ? styles.inputError : ''}`} 
                id="business_name" 
                placeholder="Registered Company Name" 
                value={formData.business_name}
                onChange={handleInputChange}
                required 
              />
              {fieldErrors.business_name && (
                <span className={styles.fieldError}>{fieldErrors.business_name[0]}</span>
              )}
            </div>
            <div>
              <label className={styles.label} htmlFor="contact_phone">
                Contact Phone <span className={styles.required}>*</span>
              </label>
              <input 
                className={`${styles.input} ${fieldErrors.contact_phone ? styles.inputError : ''}`} 
                id="contact_phone" 
                placeholder="+977-98XXXXXXXX" 
                value={formData.contact_phone}
                onChange={handleInputChange}
                required 
              />
              {fieldErrors.contact_phone && (
                <span className={styles.fieldError}>{fieldErrors.contact_phone[0]}</span>
              )}
            </div>
            <div>
              <label className={styles.label} htmlFor="contact_email">
                Contact Email
              </label>
              <input 
                className={`${styles.input} ${fieldErrors.contact_email ? styles.inputError : ''}`} 
                id="contact_email" 
                type="email" 
                placeholder="contact@business.com" 
                value={formData.contact_email}
                onChange={handleInputChange}
              />
              {fieldErrors.contact_email && (
                <span className={styles.fieldError}>{fieldErrors.contact_email[0]}</span>
              )}
            </div>
            <div className="md:col-span-2">
              <label className={styles.label} htmlFor="address">
                Business Address
              </label>
              <textarea 
                className={styles.textarea} 
                id="address" 
                rows={3} 
                placeholder="Full legal address..."
                value={formData.address}
                onChange={handleInputChange}
              ></textarea>
            </div>
          </div>
        </section>

        {/* Financial / Vendor Configuration */}
        {partnerType === "VENDOR" ? (
          <section className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <FiTrendingUp className={styles.sectionIcon} />
              <h2 className={styles.sectionTitle}>Vendor Configuration</h2>
            </div>
            <div className={styles.formGrid}>
              <div>
                <label className={styles.label}>Vendor Type</label>
                <div className={styles.tabContainer} style={{ marginBottom: 0 }}>
                  <button 
                    type="button"
                    className={`${styles.tabButton} ${formData.vendor_type === "REVENUE" ? styles.tabActive : ""}`}
                    onClick={() => setFormData(p => ({ ...p, vendor_type: "REVENUE" }))}
                  >
                    REVENUE
                  </button>
                  <button 
                    type="button"
                    className={`${styles.tabButton} ${formData.vendor_type === "NON_REVENUE" ? styles.tabActive : ""}`}
                    onClick={() => setFormData(p => ({ ...p, vendor_type: "NON_REVENUE" }))}
                  >
                    NON-REVENUE
                  </button>
                </div>
              </div>

              {formData.vendor_type === "REVENUE" && (
                <div>
                  <label className={styles.label}>Revenue Model</label>
                  <select 
                    id="revenue_model" 
                    className={styles.select}
                    value={formData.revenue_model}
                    onChange={handleInputChange}
                  >
                    <option value="PERCENTAGE">PERCENTAGE SHARE</option>
                    <option value="FIXED">FIXED AMOUNT</option>
                  </select>
                </div>
              )}

              {formData.vendor_type === "REVENUE" && (
                <div className="md:col-span-2">
                  <div className={styles.rangeGroup}>
                    <div className={styles.rangeHeader}>
                      <label className={styles.label}>
                        {formData.revenue_model === "PERCENTAGE" ? "Partner Share Percentage" : "Fixed Amount per Rental"}
                      </label>
                      <span className={styles.rangeValue}>
                        {formData.revenue_model === "PERCENTAGE" ? `${formData.revenue_value}%` : `NPR ${formData.revenue_value}`}
                      </span>
                    </div>
                    {formData.revenue_model === "PERCENTAGE" ? (
                      <input 
                        type="range" 
                        id="revenue_value"
                        className={styles.rangeInput}
                        min="0" max="100"
                        value={formData.revenue_value}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <div className={styles.amountWrapper}>
                        <span className={styles.currencyPrefix}>NPR</span>
                        <input 
                          type="number" 
                          id="revenue_value"
                          className={`${styles.input} ${styles.amountInput}`}
                          placeholder="0.00"
                          value={formData.revenue_value}
                          onChange={handleInputChange}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        ) : (
          <section className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <FiDollarSign className={styles.sectionIcon} />
              <h2 className={styles.sectionTitle}>Franchise Agreement</h2>
            </div>
            <div className={styles.formGrid}>
              <div>
                <label className={styles.label} htmlFor="upfront_amount">Upfront Amount</label>
                <div className={styles.amountWrapper}>
                  <span className={styles.currencyPrefix}>NPR</span>
                  <input 
                    className={`${styles.input} ${styles.amountInput}`} 
                    id="upfront_amount" 
                    type="number" 
                    placeholder="0.00" 
                    value={formData.upfront_amount}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div>
                <div className={styles.rangeHeader}>
                   <label className={styles.label}>Revenue Share % <span className={styles.required}>*</span></label>
                   <span className={styles.rangeValue}>{formData.revenue_share_percent}%</span>
                </div>
                <input 
                  type="range" 
                  id="revenue_share_percent"
                  className={styles.rangeInput}
                  min="0" max="100"
                  value={formData.revenue_share_percent}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </section>
        )}

        {/* Hardware Assignment */}
        <section className={styles.formSection} style={{ overflow: 'visible', position: 'relative', zIndex: 99 }}>
          <div className={styles.sectionHeader}>
            <FiCpu className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>Hardware Assignment</h2>
          </div>
          <div>
            <label className={styles.label}>
              {partnerType === "VENDOR" ? "Assigned Station *" : "Assigned Stations"}
            </label>
            
            <div className={styles.searchWrapper} ref={stationDropdownRef}>
                {partnerType === "FRANCHISE" && formData.station_ids.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2">
                        {formData.station_ids.map(id => (
                            <div key={id} className={styles.tag}>
                                {getStationNameById(id)}
                                <FiX className={styles.removeTag} onClick={() => removeStation(id)} />
                            </div>
                        ))}
                    </div>
                )}
                
                <input 
                    className={styles.input} 
                    id="station_display" 
                    placeholder={partnerType === "VENDOR" ? "Click to select station..." : "Click to add stations..."}
                    value={selectedStationDisplay}
                    onClick={() => setShowStationDropdown(true)}
                    onFocus={() => setShowStationDropdown(true)}
                    readOnly
                    required={partnerType === "VENDOR" && !formData.station_id}
                />
                {partnerType === "VENDOR" && formData.station_id && <FiCheck className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" />}

                {showStationDropdown && (
                    <div className={styles.dropdownContainer}>
                        <div className={styles.dropdownSearch}>
                          <FiMapPin className={styles.dropdownSearchIcon} />
                          <input
                            type="text"
                            placeholder="Search stations..."
                            value={stationSearchQuery}
                            onChange={(e) => setStationSearchQuery(e.target.value)}
                            className={styles.dropdownSearchInput}
                            autoFocus
                          />
                          {stationSearchQuery && (
                            <button
                              type="button"
                              onClick={() => setStationSearchQuery("")}
                              className={styles.dropdownSearchClear}
                            >
                              <FiX />
                            </button>
                          )}
                        </div>
                        <div className={styles.dropdownList}>
                          {allStations.length === 0 && isSearchingStation ? (
                            <div className={styles.dropdownEmpty}> <FiLoader className="animate-spin inline mr-2"/> Loading stations... </div>
                          ) : stationLoadError ? (
                            <div className={styles.dropdownEmpty} style={{ color: '#EF4444' }}>
                              <FiInfo className="inline mr-2" />
                              {stationLoadError}
                            </div>
                          ) : filteredStations.length > 0 ? (
                            filteredStations.map(station => (
                              <div 
                                key={station.id} 
                                className={`${styles.dropdownItem} ${
                                  partnerType === "VENDOR" 
                                    ? (formData.station_id === station.id ? styles.selectedItem : '')
                                    : (formData.station_ids.includes(station.id) ? styles.selectedItem : '')
                                }`}
                                onClick={() => selectStation(station)}
                              >
                                <div className="font-bold">{station.station_name}</div>
                                <div className="text-xs text-gray-400">SN: {station.serial_number} • {station.status}</div>
                              </div>
                            ))
                          ) : (
                            <div className={styles.dropdownEmpty}>
                              {stationSearchQuery ? "No stations found matching your search" : "No stations available"}
                            </div>
                          )}
                        </div>
                        <div className={styles.dropdownFooter}>
                          <span className="text-xs text-gray-400 mr-3">
                            Showing {filteredStations.length} of {allStations.length} stations
                          </span>
                          <button
                            type="button"
                            onClick={refreshAvailableStations}
                            className={styles.dropdownCloseBtn}
                            title="Refresh station list"
                            disabled={isSearchingStation}
                          >
                            {isSearchingStation ? "Refreshing..." : "Refresh"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowStationDropdown(false);
                              setStationSearchQuery("");
                            }}
                            className={styles.dropdownCloseBtn}
                          >
                            Close
                          </button>
                        </div>
                    </div>
                )}
            </div>
            {partnerType === "FRANCHISE" && <p className="text-[10px] text-gray-500 mt-2 italic">Search and select stations to assign to this franchise.</p>}
          </div>
        </section>

        {/* Additional Info */}
        <section className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <FiInfo className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>Additional Information</h2>
          </div>
          <div>
            <label className={styles.label} htmlFor="notes">Internal Remarks</label>
            <textarea 
              className={styles.textarea} 
              id="notes" 
              rows={3} 
              placeholder="Add any specific agreement terms..."
              value={formData.notes}
              onChange={handleInputChange}
            ></textarea>
          </div>
        </section>

        <div className={styles.submitActions}>
          <button 
            type="button" 
            className={styles.cancelButton}
            onClick={() => router.back()}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? <FiLoader className={styles.buttonSpinner} /> : <FiPlus />}
            {loading ? "Processing..." : `Create ${partnerType.charAt(0) + partnerType.slice(1).toLowerCase()}`}
          </button>
        </div>
      </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPartnerForm;
