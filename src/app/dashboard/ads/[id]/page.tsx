"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { FiRefreshCw, FiUser, FiCalendar, FiDollarSign, FiImage, FiMapPin, FiCreditCard } from "react-icons/fi";
import adsService from "@/lib/api/ads.service";
import { AdRequestDetail } from "@/types/ads.types";
import ReviewAdModal from "@/app/dashboard/ads/components/ReviewAdModal";
import ActionModal from "@/app/dashboard/ads/components/ActionModal";
import UpdateScheduleModal from "@/app/dashboard/ads/components/UpdateScheduleModal";
import styles from "./adDetail.module.css";

const AdDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const adId = params.id as string;

  const [ad, setAd] = useState<AdRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const fetchAdDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adsService.getAdRequestDetail(adId);

      if (response.success) {
        setAd(response.data);
      } else {
        setError("Failed to fetch ad details");
      }
    } catch (err: any) {
      console.error("Error fetching ad detail:", err);
      setError(err.response?.data?.message || "Failed to fetch ad details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adId) {
      fetchAdDetail();
    }
  }, [adId]);

  const handleRefresh = () => {
    fetchAdDetail();
  };

  const getStatusBadgeClass = (status: string): string => {
    const statusMap: Record<string, string> = {
      SUBMITTED: styles.statusBlue,
      UNDER_REVIEW: styles.statusOrange,
      PENDING_PAYMENT: styles.statusPurple,
      PAID: styles.statusGreen,
      SCHEDULED: styles.statusCyan,
      RUNNING: styles.statusGreenPulse,
      PAUSED: styles.statusGray,
      COMPLETED: styles.statusGreenCheck,
      REJECTED: styles.statusRed,
      CANCELLED: styles.statusGrayStrike,
    };
    return statusMap[status] || styles.statusGray;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading ad details...</p>
        </div>
      </div>
    );
  }

  if (error || !ad) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <p>{error || "Ad not found"}</p>
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
      <div className={styles.header}>
        <button onClick={() => router.back()} className={styles.backBtn}>
          ← Back to Ads
        </button>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <h1>{ad.title || "Untitled Ad"}</h1>
            <div className={styles.headerMeta}>
              <span className={`${styles.statusBadge} ${getStatusBadgeClass(ad.status)}`}>
                {ad.status.replace(/_/g, " ")}
              </span>
              <span className={styles.adId}>ID: {ad.id}</span>
            </div>
          </div>
          <div className={styles.headerActions}>
            {adsService.canReview(ad.status) && (
              <button
                onClick={() => setShowReviewModal(true)}
                className={styles.primaryBtn}
              >
                Review & Configure
              </button>
            )}
            {adsService.getAvailableActions(ad.status).length > 0 && (
              <button
                onClick={() => setShowActionModal(true)}
                className={styles.actionBtn}
              >
                Execute Action
              </button>
            )}
            {adsService.canUpdateSchedule(ad.status) && (
              <button
                onClick={() => setShowScheduleModal(true)}
                className={styles.secondaryBtn}
              >
                Update Schedule
              </button>
            )}
            <button onClick={handleRefresh} className={styles.refreshBtn} title="Refresh">
              <FiRefreshCw className={loading ? styles.spinning : ""} />
            </button>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className={styles.timelineCard}>
        <h3 className={styles.cardTitle}>Progress Timeline</h3>
        <div className={styles.timeline}>
          <div className={`${styles.timelineItem} ${ad.submitted_at ? styles.completed : ""}`}>
            <div className={styles.timelineDot}></div>
            <div className={styles.timelineContent}>
              <h4>Submitted</h4>
              <p>{adsService.formatDateTime(ad.submitted_at)}</p>
            </div>
          </div>
          <div className={`${styles.timelineItem} ${ad.reviewed_at ? styles.completed : ""}`}>
            <div className={styles.timelineDot}></div>
            <div className={styles.timelineContent}>
              <h4>Reviewed</h4>
              <p>{ad.reviewed_at ? adsService.formatDateTime(ad.reviewed_at) : "Pending"}</p>
              {ad.reviewed_by && <span className={styles.timelineBy}>by {ad.reviewed_by.username}</span>}
            </div>
          </div>
          <div className={`${styles.timelineItem} ${ad.approved_at ? styles.completed : ""}`}>
            <div className={styles.timelineDot}></div>
            <div className={styles.timelineContent}>
              <h4>Approved</h4>
              <p>{ad.approved_at ? adsService.formatDateTime(ad.approved_at) : "Pending"}</p>
              {ad.approved_by && <span className={styles.timelineBy}>by {ad.approved_by.username}</span>}
            </div>
          </div>
          <div className={`${styles.timelineItem} ${ad.paid_at ? styles.completed : ""}`}>
            <div className={styles.timelineDot}></div>
            <div className={styles.timelineContent}>
              <h4>Paid</h4>
              <p>{ad.paid_at ? adsService.formatDateTime(ad.paid_at) : "Pending"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className={styles.contentGrid}>
        {/* Left Column */}
        <div className={styles.leftColumn}>
          {/* Requester Information */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <FiUser className={styles.cardIcon} />
              <h3>Requester Information</h3>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.infoRow}>
                <span className={styles.label}>Full Name</span>
                <span className={styles.value}>{ad.full_name}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Contact Number</span>
                <span className={styles.value}>{ad.contact_number}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Email</span>
                <span className={styles.value}>{ad.user.email}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Username</span>
                <span className={styles.value}>{ad.user.username}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>User ID</span>
                <span className={styles.value}>{ad.user.id}</span>
              </div>
            </div>
          </div>

          {/* Ad Details */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <FiCalendar className={styles.cardIcon} />
              <h3>Ad Campaign Details</h3>
            </div>
            <div className={styles.cardBody}>
              {ad.description && (
                <div className={styles.infoRow}>
                  <span className={styles.label}>Description</span>
                  <span className={styles.value}>{ad.description}</span>
                </div>
              )}
              {ad.duration_days !== null && (
                <div className={styles.infoRow}>
                  <span className={styles.label}>Duration</span>
                  <span className={styles.value}>{ad.duration_days} days</span>
                </div>
              )}
              {ad.admin_price && (
                <div className={styles.infoRow}>
                  <span className={styles.label}>Price</span>
                  <span className={`${styles.value} ${styles.priceValue}`}>
                    {adsService.formatAmount(ad.admin_price)}
                  </span>
                </div>
              )}
              {ad.start_date && (
                <div className={styles.infoRow}>
                  <span className={styles.label}>Start Date</span>
                  <span className={styles.value}>{adsService.formatDate(ad.start_date)}</span>
                </div>
              )}
              {ad.end_date && (
                <div className={styles.infoRow}>
                  <span className={styles.label}>End Date</span>
                  <span className={styles.value}>{adsService.formatDate(ad.end_date)}</span>
                </div>
              )}
              {ad.admin_notes && (
                <div className={styles.infoRow}>
                  <span className={styles.label}>Admin Notes</span>
                  <span className={styles.value}>{ad.admin_notes}</span>
                </div>
              )}
              {ad.rejection_reason && (
                <div className={`${styles.infoRow} ${styles.errorRow}`}>
                  <span className={styles.label}>Rejection Reason</span>
                  <span className={styles.value}>{ad.rejection_reason}</span>
                </div>
              )}
            </div>
          </div>

          {/* Transaction Details */}
          {ad.transaction && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <FiCreditCard className={styles.cardIcon} />
                <h3>Transaction Details</h3>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Transaction ID</span>
                  <span className={styles.value}>{ad.transaction.transaction_id}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Amount</span>
                  <span className={`${styles.value} ${styles.priceValue}`}>
                    {ad.transaction.currency} {ad.transaction.amount}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Payment Method</span>
                  <span className={styles.value}>{ad.transaction.payment_method_type}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Status</span>
                  <span className={styles.value}>{ad.transaction.status}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Date</span>
                  <span className={styles.value}>
                    {adsService.formatDateTime(ad.transaction.created_at)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className={styles.rightColumn}>
          {/* Ad Content Preview */}
          {ad.ad_content && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <FiImage className={styles.cardIcon} />
                <h3>Ad Content</h3>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.mediaPreview}>
                  {ad.ad_content.content_type === "IMAGE" ? (
                    <img
                      src={ad.ad_content.media_upload.file_url}
                      alt="Ad content"
                      className={styles.previewImage}
                    />
                  ) : (
                    <video
                      src={ad.ad_content.media_upload.file_url}
                      controls
                      className={styles.previewVideo}
                    />
                  )}
                </div>
                <div className={styles.mediaInfo}>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Content Type</span>
                    <span className={styles.value}>{ad.ad_content.content_type}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Display Duration</span>
                    <span className={styles.value}>{ad.ad_content.duration_seconds} seconds</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Display Order</span>
                    <span className={styles.value}>{ad.ad_content.display_order}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>File Name</span>
                    <span className={styles.value}>{ad.ad_content.media_upload.original_name}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>File Size</span>
                    <span className={styles.value}>
                      {(ad.ad_content.media_upload.file_size / 1024).toFixed(2)} KB
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Status</span>
                    <span className={styles.value}>
                      {ad.ad_content.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Assigned Stations */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <FiMapPin className={styles.cardIcon} />
              <h3>Assigned Stations ({ad.stations.length})</h3>
            </div>
            <div className={styles.cardBody}>
              {ad.stations.length > 0 ? (
                <div className={styles.stationsList}>
                  {ad.stations.map((station) => (
                    <div key={station.id} className={styles.stationCard}>
                      <div className={styles.stationHeader}>
                        <h4>{station.station_name}</h4>
                        <span className={`${styles.stationStatus} ${station.status === "ONLINE" ? styles.online : styles.offline}`}>
                          {station.status}
                        </span>
                      </div>
                      <p className={styles.stationAddress}>{station.address}</p>
                      <p className={styles.stationSerial}>SN: {station.serial_number}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.emptyText}>No stations assigned yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showReviewModal && (
        <ReviewAdModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          adId={adId}
          currentData={ad}
          onSuccess={handleRefresh}
        />
      )}

      {showActionModal && (
        <ActionModal
          isOpen={showActionModal}
          onClose={() => setShowActionModal(false)}
          adId={adId}
          currentStatus={ad.status}
          onSuccess={handleRefresh}
        />
      )}

      {showScheduleModal && (
        <UpdateScheduleModal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          adId={adId}
          currentStartDate={ad.start_date}
          currentEndDate={ad.end_date}
          onSuccess={handleRefresh}
        />
      )}
    </div>
  );
};

export default AdDetailPage;
