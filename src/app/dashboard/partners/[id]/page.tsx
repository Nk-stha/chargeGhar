"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  FiEdit, FiMapPin, FiInfo, FiMail, 
  FiPhone, FiDollarSign, FiFileText, FiUser, FiSettings
} from "react-icons/fi";
import { MdEvStation } from "react-icons/md";
import { getPartnerDetail } from "@/lib/api/partners";
import { PartnerDetail } from "@/types/partner";
import PartnerStatusModal from "@/components/PartnerManagement/PartnerStatusModal/PartnerStatusModal";

import styles from "./partnerDetail.module.css";

export default function PartnerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const partnerId = params.id as string;

  const [partner, setPartner] = useState<PartnerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    const fetchPartnerDetail = async () => {
      try {
        setLoading(true);
        const response = await getPartnerDetail(partnerId);
        
        if (response.success) {
          setPartner(response.data);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  const formatCurrency = (amount: string) => {
    return `NPR ${parseFloat(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const handleStatusUpdate = async (data: any) => {
    try {
      // Data is already updated via API calls in the modal
      // Just refresh partner data
      const response = await getPartnerDetail(partnerId);
      if (response.success) {
        setPartner(response.data);
      }
    } catch (err: any) {
      console.error("Error refreshing partner data:", err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading partner details...</p>
        </div>
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <p>{error || "Partner not found"}</p>
          <button onClick={() => router.back()} className={styles.backBtn}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>{partner.business_name}</h1>
          <span className={`${styles.statusBadge} ${styles[partner.status.toLowerCase()]}`}>
            {partner.status}
          </span>
        </div>
        <div className={styles.headerRight}>
          <button 
            className={styles.editBtn}
            onClick={() => router.push(`/dashboard/partners/${partnerId}/edit`)}
          >
            <FiEdit /> Edit Partner
          </button>
          <button 
            className={styles.primaryBtn}
            onClick={() => setShowStatusModal(true)}
          >
            <FiSettings /> Manage Partner
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.blue}`}>
            <FiDollarSign />
          </div>
          <div>
            <p className={styles.statLabel}>Total Earnings</p>
            <p className={styles.statValue}>{formatCurrency(partner.total_earnings)}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.orange}`}>
            <FiDollarSign />
          </div>
          <div>
            <p className={styles.statLabel}>Balance</p>
            <p className={styles.statValue}>{formatCurrency(partner.balance)}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.green}`}>
            <MdEvStation />
          </div>
          <div>
            <p className={styles.statLabel}>Stations</p>
            <p className={styles.statValue}>{partner.stations_count} Active</p>
          </div>
        </div>

        {partner.partner_type === "FRANCHISE" && (
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.purple}`}>
              <FiUser />
            </div>
            <div>
              <p className={styles.statLabel}>Vendors</p>
              <p className={styles.statValue}>{partner.vendors_count} Managed</p>
            </div>
          </div>
        )}
      </div>

      {/* Info Grid */}
      <div className={styles.infoGrid}>
        {/* Partner Information */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <FiInfo />
            <h3>Partner Information</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Partner ID</span>
              <span className={styles.value}>{partner.code}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Partner Type</span>
              <span className={styles.value}>{partner.partner_type}</span>
            </div>
            {partner.vendor_type && (
              <div className={styles.infoRow}>
                <span className={styles.label}>Vendor Type</span>
                <span className={styles.value}>{partner.vendor_type}</span>
              </div>
            )}
            <div className={styles.infoRow}>
              <span className={styles.label}>User ID</span>
              <span className={styles.value}>{partner.user_id}</span>
            </div>
            {partner.user_email && (
              <div className={styles.infoRow}>
                <span className={styles.label}>User Email</span>
                <span className={styles.value}>{partner.user_email}</span>
              </div>
            )}
            <div className={styles.infoRow}>
              <span className={styles.label}>Joined Date</span>
              <span className={styles.value}>{formatDate(partner.created_at)}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Assigned Date</span>
              <span className={styles.value}>{formatDate(partner.assigned_at)}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Assigned By</span>
              <div className={styles.userInfo}>
                <div className={styles.avatar}>
                  {partner.assigned_by_name?.charAt(0).toUpperCase() || "U"}
                </div>
                <span style={{ color: "#ddd8d8ff" }}>{partner.assigned_by_name || "Unknown"}</span>
              </div>
            </div>
            {partner.parent_id && (
              <div className={styles.infoRow}>
                <span className={styles.label}>Parent Partner</span>
                <span className={styles.value}>{partner.parent_name || partner.parent_id}</span>
              </div>
            )}
          </div>
        </div>

        {/* Contact & Location */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <FiMail />
            <h3>Contact & Location</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.contactRow}>
              <span className={styles.label}>Phone Number</span>
              <div className={styles.contactValue}>
                <FiPhone />
                {partner.contact_phone}
              </div>
            </div>
            <div className={styles.contactRow}>
              <span className={styles.label}>Email Address</span>
              <div className={styles.contactValue}>
                <FiMail />
                {partner.contact_email}
              </div>
            </div>
            {partner.address && (
              <div className={styles.contactRow}>
                <span className={styles.label}>Address</span>
                <div className={styles.contactValue}>
                  <FiMapPin />
                  {partner.address}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Financial Agreement */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <FiDollarSign />
            <h3>Financial Agreement</h3>
          </div>
          <div className={styles.cardBody}>
            {partner.partner_type === "FRANCHISE" ? (
              <>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Upfront Amount</span>
                  <span className={styles.valueHighlight}>
                    {formatCurrency(partner.upfront_amount)}
                  </span>
                </div>
                {partner.revenue_share_percent && (
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Revenue Share</span>
                    <div className={styles.progressWrapper}>
                      <div className={styles.progressBar}>
                        <div 
                          className={styles.progressFill} 
                          style={{ width: `${partner.revenue_share_percent}%` }}
                        ></div>
                      </div>
                      <span className={styles.progressValue}>
                        {partner.revenue_share_percent}%
                      </span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {partner.vendor_type && (
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Vendor Type</span>
                    <span className={styles.value}>{partner.vendor_type}</span>
                  </div>
                )}
                <div className={styles.infoRow}>
                  <span className={styles.label}>Upfront Amount</span>
                  <span className={styles.valueHighlight}>
                    {formatCurrency(partner.upfront_amount)}
                  </span>
                </div>
              </>
            )}
            <div className={`${styles.infoRow} ${styles.borderTop}`}>
              <span className={styles.labelSmall}>Last Updated</span>
              <span className={styles.valueSmall}>{formatDate(partner.updated_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      {partner.notes && (
        <div className={styles.notesSection}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <FiFileText />
              <h3>Administrative Notes</h3>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.notesBox}>
                <p>{partner.notes}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Partner Status Modal */}
      <PartnerStatusModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        partnerId={partnerId}
        partnerName={partner.business_name}
        currentStatus={partner.status as "ACTIVE" | "INACTIVE" | "SUSPENDED"}
        currentVendorType={partner.vendor_type as "REVENUE" | "NON_REVENUE" | null}
        onUpdate={handleStatusUpdate}
      />
    </div>
  );
}
