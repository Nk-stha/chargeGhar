"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { FiRefreshCw, FiUser, FiCalendar, FiImage, FiMapPin, FiCreditCard, FiChevronRight, FiEye } from "react-icons/fi";
import { MdEvStation } from "react-icons/md";
import adsService from "@/lib/api/ads.service";
import { AdRequestDetail } from "@/types/ads.types";
import ReviewAdModal from "@/app/dashboard/ads/components/ReviewAdModal";
import ActionModal from "@/app/dashboard/ads/components/ActionModal";
import UpdateScheduleModal from "@/app/dashboard/ads/components/UpdateScheduleModal";
import styles from "./adDetail.module.css";

function AdDetailPage() {
  const router = useRouter();
  const params = useParams();
  const adId = params.id as string;

  const [ad, setAd] = useState<AdRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err: unknown) {
      console.error("Error fetching ad detail:", err);
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message 
        : "Failed to fetch ad details";
      setError(errorMessage || "Failed to fetch ad details");
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

  const getTimelineProgress = (): number => {
    if (!ad) return 0;
    let completed = 0;
    if (ad.submitted_at) completed++;
    if (ad.reviewed_at) completed++;
    if (ad.approved_at) completed++;
    if (ad.paid_at) completed++;
    return (completed / 4) * 100;
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
      <header className={styles.stickyHeader}>
        <div className={styles.headerInner}>
          <nav className={styles.breadcrumb}>
            <Link href="/dashboard/ads">Ads</Link>
            <FiChevronRight className={styles.breadcrumbSeparator} />
            <Link href="/dashboard/ads">Ad Requests</Link>
            <FiChevronRight className={styles.breadcrumbSeparator} />
            <span className={styles.breadcrumbCurrent}>{ad.title || "Untitled Ad"}</span>
          </nav>
        </div>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.pageHeader}>
          <div className={styles.titleSection}>
            <h1>{ad.title || "Untitled Ad"}</h1>
            <div className={styles.titleMeta}>
              <span className={`${styles.statusBadge} ${getStatusBadgeClass(ad.status)}`}>
                {ad.status.replace(/_/g, " ")}
              </span>
              <span className={styles.adId}>ID: {ad.id}</span>
            </div>
          </div>
          <div className={styles.actionButtons}>
            {adsService.canReview(ad.status) && (
              <button onClick={() => setShowReviewModal(true)} className={styles.primaryBtn}>
                Review & Configure
              </button>
            )}
            {adsService.getAvailableActions(ad.status).length > 0 && (
              <button onClick={() => setShowActionModal(true)} className={styles.actionBtn}>
                Execute Action
              </button>
            )}
            {adsService.canUpdateSchedule(ad.status) && (
              <button onClick={() => setShowScheduleModal(true)} className={styles.secondaryBtn}>
                Update Schedule
              </button>
            )}
            <button onClick={handleRefresh} className={styles.refreshBtn} title="Refresh">
              <FiRefreshCw className={loading ? styles.spinning : ""} />
            </button>
          </div>
        </div>

        <section className={styles.timelineCard}>
          <h2 className={styles.sectionTitle}>Progress Timeline</h2>
          <div className={styles.timeline}>
            <div className={styles.timelineLine}>
              <div className={styles.timelineProgress} style={{ width: `${getTimelineProgress()}%` }}></div>
            </div>
            
            <div className={`${styles.timelineItem} ${ad.submitted_at ? styles.completed : styles.pending}`}>
              <div className={styles.timelineDot}>
                {ad.submitted_at ? (
                  <span className={styles.timelineCheck}>✓</span>
                ) : (
                  <span className={styles.timelineDotInner}></span>
                )}
              </div>
              <div className={styles.timelineContent}>
                <p className={styles.timelineLabel}>Submitted</p>
                <p className={styles.timelineDate}>
                  {ad.submitted_at ? adsService.formatDateTime(ad.submitted_at) : "Pending"}
                </p>
              </div>
            </div>

            <div className={`${styles.timelineItem} ${ad.reviewed_at ? styles.completed : styles.pending}`}>
              <div className={styles.timelineDot}>
                {ad.reviewed_at ? (
                  <span className={styles.timelineCheck}>✓</span>
                ) : (
                  <span className={styles.timelineDotInner}></span>
                )}
              </div>
              <div className={styles.timelineContent}>
                <p className={styles.timelineLabel}>Reviewed</p>
                <p className={styles.timelineDate}>
                  {ad.reviewed_at ? adsService.formatDateTime(ad.reviewed_at) : "Pending"}
                </p>
                {ad.reviewed_by && <span className={styles.timelineBy}>by {ad.reviewed_by.username}</span>}
              </div>
            </div>

            <div className={`${styles.timelineItem} ${ad.approved_at ? styles.completed : styles.pending}`}>
              <div className={styles.timelineDot}>
                {ad.approved_at ? (
                  <span className={styles.timelineCheck}>✓</span>
                ) : (
                  <span className={styles.timelineDotInner}></span>
                )}
              </div>
              <div className={styles.timelineContent}>
                <p className={styles.timelineLabel}>Approved</p>
                <p className={styles.timelineDate}>
                  {ad.approved_at ? adsService.formatDateTime(ad.approved_at) : "Pending"}
                </p>
                {ad.approved_by && <span className={styles.timelineBy}>by {ad.approved_by.username}</span>}
              </div>
            </div>

            <div className={`${styles.timelineItem} ${ad.paid_at ? styles.completed : styles.pending}`}>
              <div className={styles.timelineDot}>
                {ad.paid_at ? (
                  <span className={styles.timelineCheck}>✓</span>
                ) : (
                  <span className={styles.timelineDotInner}></span>
                )}
              </div>
              <div className={styles.timelineContent}>
                <p className={styles.timelineLabel}>Paid</p>
                <p className={styles.timelineDate}>
                  {ad.paid_at ? adsService.formatDateTime(ad.paid_at) : "Pending"}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className={styles.contentGrid}>
          <section className={styles.card}>
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
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <FiCalendar className={styles.cardIcon} />
              <h3>Ad Campaign Details</h3>
            </div>
            <div className={styles.cardBody}>
              {ad.description && (
                <div className={styles.descriptionBlock}>
                  <span className={styles.descriptionLabel}>Description</span>
                  <p className={styles.descriptionValue}>{ad.description}</p>
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
              {ad.rejection_reason && (
                <div className={`${styles.infoRow} ${styles.errorRow}`}>
                  <span className={styles.label}>Rejection Reason</span>
                  <span className={styles.value}>{ad.rejection_reason}</span>
                </div>
              )}
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <FiImage className={styles.cardIcon} />
              <h3>Ad Content</h3>
            </div>
            <div className={styles.cardBody}>
              {ad.ad_content ? (
                <>
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
                    <div className={styles.mediaOverlay}>
                      <button className={styles.viewBtn}>
                        <FiEye size={20} />
                      </button>
                    </div>
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
                      <span className={styles.label}>File Name</span>
                      <span className={styles.value}>{ad.ad_content.media_upload.original_name}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.label}>Status</span>
                      <span className={`${styles.value} ${styles.priceValue}`}>
                        {ad.ad_content.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <p className={styles.emptyStations}>No content uploaded</p>
              )}
            </div>
          </section>
        </div>

        <section className={styles.fullWidthCard}>
          <div className={styles.cardHeader}>
            <FiMapPin className={styles.cardIcon} />
            <h3>Assigned Stations ({ad.stations.length})</h3>
          </div>
          <div className={styles.stationsGrid}>
            {ad.stations.length > 0 ? (
              ad.stations.map((station) => (
                <div key={station.id} className={styles.stationCard}>
                  <div className={styles.stationInfo}>
                    <div className={styles.stationIcon}>
                      <MdEvStation size={24} />
                    </div>
                    <div className={styles.stationDetails}>
                      <h4>{station.station_name}</h4>
                      <p className={styles.stationAddress}>{station.address}</p>
                      <p className={styles.stationSerial}>SN: {station.serial_number}</p>
                    </div>
                  </div>
                  <span className={`${styles.stationStatus} ${station.status === "ONLINE" ? styles.online : styles.offline}`}>
                    {station.status}
                  </span>
                </div>
              ))
            ) : (
              <p className={styles.emptyStations}>No stations assigned yet</p>
            )}
          </div>
        </section>

        {ad.transaction && (
          <section className={styles.transactionCard}>
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
          </section>
        )}
      </main>

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
}

export default AdDetailPage;
