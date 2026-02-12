"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FiSearch, FiPlus, FiEdit, FiRefreshCw, FiChevronLeft, FiChevronRight, FiAlertCircle, FiLoader } from "react-icons/fi";
import { useRouter } from "next/navigation";
import styles from "./PartnerManagement.module.css";
import { getPartners } from "../../lib/api/partners";
import { Partner } from "../../types/partner";
import { extractApiError } from "../../lib/apiErrors";
import { toast } from "sonner";

const PartnerList: React.FC = () => {
  const router = useRouter();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Changed to 10 for better UI on smaller screens
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1); // Reset to page 1 on new search
  }, [debouncedSearch]);

  const fetchPartners = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPartners({
        page,
        page_size: pageSize,
        search: debouncedSearch,
      });

      if (response.success) {
        setPartners(response.data.results);
        setTotalCount(response.data.count);
      } else {
        toast.error(response.message || "Failed to fetch partners");
      }
    } catch (err: unknown) {
      console.error("Error fetching partners:", err);
      const apiError = extractApiError(err, "An error occurred while fetching partners");
      toast.error(apiError.message);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch]);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= Math.ceil(totalCount / pageSize)) {
      setPage(newPage);
    }
  };

    const handleAddVendor = () => {
      router.push("/dashboard/partners/add");
    };

  const handleRowClick = (partner: Partner) => {
    router.push(`/dashboard/partners/${partner.id}`);
  };

  const handleEditVendor = (e: React.MouseEvent, partner: Partner) => {
    e.stopPropagation(); // Prevent row click
    // TODO: Implement edit vendor modal
    console.log("Edit vendor:", partner);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  if (loading && partners.length === 0) { // Only show full-page loader if no data is loaded yet
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-gray-400">
        <FiLoader className="text-4xl text-[#54bc28] animate-spin" />
        <p>Loading partners...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Search & Add Section */}
        <div className={styles.searchSection}>
          <div className={styles.searchWrapper}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search vendors by name, code or email..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <button 
              className={styles.secondaryButton} 
              onClick={() => fetchPartners()}
              disabled={loading}
              title="Refresh List"
            >
              <FiRefreshCw className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button className={styles.addButton} onClick={handleAddVendor}>
              <FiPlus />
              <span>Add New Vendor</span>
            </button>
          </div>
        </div>

      {/* Desktop Table View */}
      <div className={`${styles.tableContainer} ${styles.desktopOnly}`}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Partner Code</th>
                <th>Business Name</th>
                <th>Contact Info</th>
                <th>Type</th>
                <th>Balance</th>
                <th>Total Earnings</th>
                <th>Status</th>
                <th>Created At</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && partners.length === 0 ? ( // Show skeleton loader only if no data and loading
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={9} className="py-6">
                      <div className="h-4 bg-white/5 rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : partners.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-3xl">🔍</span>
                        <p>No vendors found matching your search</p>
                    </div>
                  </td>
                </tr>
              ) : (
                partners.map((partner) => (
                  <tr 
                    key={partner.id} 
                    className={styles.tableRow}
                    onClick={() => handleRowClick(partner)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <span className={styles.partnerCode}>
                        {partner.code}
                      </span>
                    </td>
                    <td>
                      <span className={styles.businessName}>
                        {partner.business_name}
                      </span>
                    </td>
                    <td>
                      <div className={styles.contactInfo}>
                        <span className={styles.email}>{partner.contact_email}</span>
                        <span className={styles.phone}>{partner.contact_phone}</span>
                      </div>
                    </td>
                    <td>
                      <span className={styles.typeBadge}>
                        {partner.partner_type.replace("_", " ")}
                        {partner.vendor_type ? ` • ${partner.vendor_type}` : ""}
                      </span>
                    </td>
                    <td>
                      <span className={styles.currencyValue}>
                        <span className="text-xs text-gray-500 mr-1">NPR</span>
                        {Number(partner.balance).toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <span className={styles.currencyValue}>
                        <span className="text-xs text-gray-500 mr-1">NPR</span>
                        {Number(partner.total_earnings).toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${
                          partner.status === "ACTIVE"
                            ? styles.statusActive
                            : styles.statusInactive
                        }`}
                      >
                        <span className={styles.statusDot}></span>
                        {partner.status}
                      </span>
                    </td>
                    <td>
                      <span className={styles.dateText}>
                        {new Date(partner.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </td>
                    <td className={styles.actionsCell}>
                      <button
                        className={styles.actionButton}
                        onClick={(e) => handleEditVendor(e, partner)}
                        title="Edit Vendor"
                      >
                        <FiEdit />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalCount > 0 && (
          <div className={styles.paginationFooter}>
            <span className={styles.paginationInfo}>
              Showing <strong>{partners.length}</strong> of <strong>{totalCount}</strong> vendors
              {totalPages > 1 && <span className="ml-2 text-xs opacity-60">Page {page} of {totalPages}</span>}
            </span>
            <div className={styles.paginationControls}>
              <button 
                className={styles.paginationButton} 
                disabled={page === 1 || loading}
                onClick={() => handlePageChange(page - 1)}
              >
                <FiChevronLeft />
              </button>
              
              <div className="flex items-center px-2 font-bold text-primary">
                {page}
              </div>

              <button 
                className={styles.paginationButton} 
                disabled={page >= totalPages || loading}
                onClick={() => handlePageChange(page + 1)}
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className={styles.mobileOnly}>
        {loading && partners.length === 0 ? ( // Show skeleton loader only if no data and loading
          <div className={styles.cardGrid}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={`${styles.partnerCard} animate-pulse`}>
                <div className="h-4 bg-white/5 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-white/5 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-white/5 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : partners.length === 0 ? (
          <div className={styles.emptyState}>
            <span className="text-4xl">🔍</span>
            <p className="text-gray-500">No vendors found matching your search</p>
          </div>
        ) : (
          <>
            <div className={styles.cardGrid}>
              {partners.map((partner) => (
                <div 
                  key={partner.id} 
                  className={styles.partnerCard}
                  onClick={() => handleRowClick(partner)}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitle}>
                      <h3>{partner.business_name}</h3>
                      <span className={styles.partnerCode}>{partner.code}</span>
                    </div>
                    <span
                      className={`${styles.statusBadge} ${
                        partner.status === "ACTIVE"
                          ? styles.statusActive
                          : styles.statusInactive
                      }`}
                    >
                      <span className={styles.statusDot}></span>
                      {partner.status}
                    </span>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.cardRow}>
                      <span className={styles.cardLabel}>Type</span>
                      <span className={styles.cardValue}>
                        {partner.partner_type.replace("_", " ")}
                        {partner.vendor_type && ` • ${partner.vendor_type}`}
                      </span>
                    </div>

                    <div className={styles.cardRow}>
                      <span className={styles.cardLabel}>Balance</span>
                      <span className={styles.cardValueHighlight}>
                        NPR {Number(partner.balance).toLocaleString()}
                      </span>
                    </div>

                    <div className={styles.cardRow}>
                      <span className={styles.cardLabel}>Total Earnings</span>
                      <span className={styles.cardValue}>
                        NPR {Number(partner.total_earnings).toLocaleString()}
                      </span>
                    </div>

                    <div className={styles.cardRow}>
                      <span className={styles.cardLabel}>Contact</span>
                      <div className={styles.cardContact}>
                        <span>{partner.contact_email}</span>
                        <span>{partner.contact_phone}</span>
                      </div>
                    </div>

                    <div className={styles.cardRow}>
                      <span className={styles.cardLabel}>Created</span>
                      <span className={styles.cardValue}>
                        {new Date(partner.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  <div className={styles.cardFooter}>
                    <button
                      className={styles.cardButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(partner);
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Pagination */}
            {totalCount > 0 && (
              <div className={styles.mobilePagination}>
                <span className={styles.paginationInfo}>
                  Showing <strong>{partners.length}</strong> of <strong>{totalCount}</strong>
                </span>
                <div className={styles.paginationControls}>
                  <button 
                    className={styles.paginationButton} 
                    disabled={page === 1 || loading}
                    onClick={() => handlePageChange(page - 1)}
                  >
                    <FiChevronLeft />
                  </button>
                  
                  <div className="flex items-center px-3 font-bold text-primary">
                    {page} / {totalPages}
                  </div>

                  <button 
                    className={styles.paginationButton} 
                    disabled={page >= totalPages || loading}
                    onClick={() => handlePageChange(page + 1)}
                  >
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PartnerList;
