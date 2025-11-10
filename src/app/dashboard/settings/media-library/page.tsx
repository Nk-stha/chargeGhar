"use client";

import React, { useState, useEffect, useCallback } from "react";
import styles from "./media-library.module.css";
import {
  FiImage,
  FiRefreshCw,
  FiDownload,
  FiAlertCircle,
  FiSearch,
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
  FiFile,
  FiVideo,
  FiFileText,
  FiUser,
  FiCopy,
  FiCheck,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import {
  mediaService,
  MediaListResponse,
} from "../../../../lib/api/media.service";
import { Media, MediaFileType } from "../../../../types/station.types";
import { userService, User } from "../../../../lib/api/user.service";

const fileTypeTabs: (MediaFileType | "ALL")[] = [
  "ALL",
  "IMAGE",
  "VIDEO",
  "DOCUMENT",
];

export default function MediaLibraryPage() {
  const [mediaFiles, setMediaFiles] = useState<Media[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<MediaFileType | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [userIdFilter, setUserIdFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pageSize] = useState<number>(20);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [usersMap, setUsersMap] = useState<Map<string, User>>(new Map());
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [deleteModal, setDeleteModal] = useState<{
    show: boolean;
    mediaId: string | null;
    mediaName: string | null;
  }>({ show: false, mediaId: null, mediaName: null });
  const [deleting, setDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchMedia = useCallback(
    async (
      fileType?: MediaFileType | "ALL",
      page: number = 1,
      userId?: string,
    ) => {
      try {
        setLoading(true);
        setError(null);

        const filters: any = {
          page,
          page_size: pageSize,
        };

        if (fileType && fileType !== "ALL") {
          filters.type = fileType;
        }

        if (userId && userId.trim()) {
          filters.user_id = userId.trim();
        }

        const response = await mediaService.getMediaList(filters);

        if (response.success) {
          setMediaFiles(response.data.results);
          setTotalPages(response.data.pagination.total_pages);
          setTotalCount(response.data.pagination.total_count);
          setCurrentPage(response.data.pagination.current_page);

          // Fetch user details for uploaded_by IDs
          await fetchUsersForMedia(response.data.results);
        } else {
          setError("Failed to fetch media files");
        }
      } catch (err: any) {
        console.error("Error fetching media:", err);
        setError("Unable to load media files. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [pageSize],
  );

  const fetchUsersForMedia = async (media: Media[]) => {
    try {
      setLoadingUsers(true);

      // Get unique user IDs
      const userIds = Array.from(
        new Set(
          media
            .map((m) => m.uploaded_by)
            .filter((id): id is number => id !== null && id !== undefined),
        ),
      );

      if (userIds.length === 0) {
        setLoadingUsers(false);
        return;
      }

      // Fetch users
      const fetchedUsers = await userService.getUsersByIds(userIds);

      if (fetchedUsers && fetchedUsers.size > 0) {
        setUsersMap(fetchedUsers);
      } else {
        console.warn("No users were successfully fetched");
      }
    } catch (err) {
      console.error("Error fetching users for media:", err);
      // Continue without user names - will show User #ID fallback
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchMedia(
      activeTab === "ALL" ? undefined : activeTab,
      currentPage,
      userIdFilter,
    );
  }, [activeTab, currentPage, userIdFilter, fetchMedia]);

  const handleTabClick = (tab: MediaFileType | "ALL") => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchMedia(activeTab === "ALL" ? undefined : activeTab, 1, userIdFilter);
  };

  const handleRefresh = () => {
    fetchMedia(
      activeTab === "ALL" ? undefined : activeTab,
      currentPage,
      userIdFilter,
    );
  };

  const handleExportCSV = () => {
    if (mediaFiles.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = [
      "ID",
      "File Name",
      "File Type",
      "File Size",
      "Uploaded By",
      "Cloud Provider",
      "Created At",
      "File URL",
    ];

    const rows = mediaFiles.map((media) => [
      media.id,
      media.original_name,
      media.file_type,
      mediaService.formatFileSize(media.file_size),
      getUserDisplayName(media.uploaded_by),
      media.cloud_provider,
      mediaService.formatDateTime(media.created_at),
      media.file_url,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    const timestamp = new Date().toISOString().split("T")[0];
    link.setAttribute("href", url);
    link.setAttribute("download", `media_library_${timestamp}.csv`);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(id);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const getFileIcon = (fileType: MediaFileType) => {
    switch (fileType) {
      case "IMAGE":
        return <FiImage />;
      case "VIDEO":
        return <FiVideo />;
      case "DOCUMENT":
        return <FiFileText />;
      default:
        return <FiFile />;
    }
  };

  const getFileTypeLabel = (fileType: MediaFileType | "ALL"): string => {
    if (fileType === "ALL") return "All Files";
    return fileType.charAt(0) + fileType.slice(1).toLowerCase();
  };

  const getUserDisplayName = (userId: number | null | undefined): string => {
    if (!userId) return "N/A";

    const user = usersMap.get(userId.toString());

    // If user data was fetched successfully
    if (user) {
      const formattedName = userService.formatUserName(user);
      // Double check the formatted name is valid
      if (
        formattedName &&
        formattedName !== "Unknown User" &&
        formattedName !== `User #${userId}`
      ) {
        return formattedName;
      }
    }

    // Fallback to User ID
    return `User #${userId}`;
  };

  const handleDeleteClick = (mediaId: string, mediaName: string) => {
    setDeleteModal({ show: true, mediaId, mediaName });
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.mediaId) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      const response = await mediaService.deleteMedia(deleteModal.mediaId);

      if (response.success) {
        // Refresh media list
        await fetchMedia(
          activeTab === "ALL" ? undefined : activeTab,
          currentPage,
          userIdFilter,
        );
        // Close modal
        setDeleteModal({ show: false, mediaId: null, mediaName: null });
      } else {
        setDeleteError("Failed to delete media file");
      }
    } catch (err: any) {
      console.error("Error deleting media:", err);
      setDeleteError(
        err.response?.data?.message || "Failed to delete media file",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ show: false, mediaId: null, mediaName: null });
    setDeleteError(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <div>
          <h1 className={styles.title}>
            Media Library
          </h1>
          <p className={styles.subtitle}>
            View and manage all uploaded media files
            {totalCount > 0 && ` (${totalCount} total)`}
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
          <button
            onClick={handleExportCSV}
            className={styles.exportBtn}
            disabled={loading || mediaFiles.length === 0}
          >
            <FiDownload /> Export CSV
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <form onSubmit={handleSearch} className={styles.searchForm}>
        <div className={styles.searchContainer}>
          <FiUser className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Filter by User ID or Name..."
            value={userIdFilter}
            onChange={(e) => setUserIdFilter(e.target.value)}
            className={styles.searchInput}
          />
          {userIdFilter && (
            <button
              type="button"
              onClick={() => {
                setUserIdFilter("");
                setCurrentPage(1);
              }}
              className={styles.clearSearch}
            >
              ×
            </button>
          )}
        </div>
        <button type="submit" className={styles.searchBtn} disabled={loading}>
          Search
        </button>
      </form>

      {/* Tabs */}
      <div className={styles.tabs}>
        {fileTypeTabs.map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ""}`}
            onClick={() => handleTabClick(tab)}
            disabled={loading}
          >
            {getFileTypeLabel(tab)}
          </button>
        ))}
      </div>

      {/* Media Grid */}
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <FiImage className={styles.icon} /> Media Files
          </h2>
        </div>

        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner} />
            <p>Loading media files...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <FiAlertCircle className={styles.errorIcon} />
            <p className={styles.errorText}>{error}</p>
            <button onClick={handleRefresh} className={styles.retryButton}>
              <FiRefreshCw /> Retry
            </button>
          </div>
        ) : mediaFiles.length === 0 ? (
          <div className={styles.noData}>
            <FiImage className={styles.noDataIcon} />
            <p>No media files found</p>
            {(userIdFilter || activeTab !== "ALL") && (
              <button
                onClick={() => {
                  setUserIdFilter("");
                  setActiveTab("ALL");
                  setCurrentPage(1);
                }}
                className={styles.clearFiltersBtn}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className={styles.mediaGrid}>
              {mediaFiles.map((media) => (
                <div key={media.id} className={styles.mediaCard}>
                  <div className={styles.mediaPreview}>
                    {media.file_type === "IMAGE" ? (
                      <img
                        src={media.file_url}
                        alt={media.original_name}
                        className={styles.mediaImage}
                      />
                    ) : (
                      <div className={styles.filePlaceholder}>
                        {getFileIcon(media.file_type)}
                        <span>{media.file_type}</span>
                      </div>
                    )}
                    <div className={styles.fileTypebadge}>
                      {getFileIcon(media.file_type)}
                    </div>
                  </div>
                  <div className={styles.mediaInfo}>
                    <h3 className={styles.fileName} title={media.original_name}>
                      {media.original_name}
                    </h3>
                    <div className={styles.metaInfo}>
                      <span className={styles.metaItem}>
                        <FiFile size={12} />
                        {mediaService.formatFileSize(media.file_size)}
                      </span>
                      <span className={styles.metaItem}>
                        <FiUser size={12} />
                        {loadingUsers ? (
                          <span style={{ opacity: 0.6 }}>Loading...</span>
                        ) : (
                          <span
                            title={`User ID: ${media.uploaded_by || "N/A"}`}
                          >
                            {getUserDisplayName(media.uploaded_by)}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className={styles.metaDate}>
                      {mediaService.formatDateTime(media.created_at, false)}
                    </div>
                    <div className={styles.cardActions}>
                      <button
                        onClick={() => handleCopyUrl(media.file_url, media.id)}
                        className={styles.copyBtn}
                        title="Copy URL"
                      >
                        {copiedUrl === media.id ? (
                          <>
                            <FiCheck /> Copied!
                          </>
                        ) : (
                          <>
                            <FiCopy /> Copy URL
                          </>
                        )}
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteClick(media.id, media.original_name)
                        }
                        className={styles.deleteBtn}
                        title="Delete Media"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1 || loading}
                  className={styles.paginationBtn}
                >
                  <FiChevronLeft /> Previous
                </button>
                <span className={styles.pageInfo}>
                  Page {currentPage} of {totalPages} ({totalCount} total items)
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || loading}
                  className={styles.paginationBtn}
                >
                  Next <FiChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Confirm Delete</h3>
              <button
                className={styles.closeButton}
                onClick={handleDeleteCancel}
                disabled={deleting}
              >
                <FiX />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.warningIcon}>
                <FiAlertCircle />
              </div>
              <p>
                Are you sure you want to delete{" "}
                <strong>{deleteModal.mediaName}</strong>?
              </p>
              <p className={styles.warningText}>
                This action cannot be undone. The media file will be permanently
                removed from the cloud storage.
              </p>
              {deleteError && (
                <div className={styles.errorBox}>
                  <FiAlertCircle />
                  <span>{deleteError}</span>
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.cancelButton}
                onClick={handleDeleteCancel}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className={styles.deleteConfirmButton}
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete Media"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
