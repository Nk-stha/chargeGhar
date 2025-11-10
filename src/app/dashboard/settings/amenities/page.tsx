"use client";

import React, { useState, useEffect } from "react";
import styles from "./amenities.module.css";
import {
  FiGrid,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiLoader,
  FiAlertCircle,
  FiCheckCircle,
  FiX,
} from "react-icons/fi";
import AmenityModal from "./AmenityModal";
import amenitiesService from "@/lib/api/amenities.service";
import { Amenity } from "@/types/station.types";

interface AmenitiesResponse {
  success: boolean;
  message: string;
  data: {
    results: Amenity[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_count: number;
      page_size: number;
      has_next: boolean;
      has_previous: boolean;
    };
  };
}

export default function AmenitiesPage() {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [filterIsActive, setFilterIsActive] = useState<string>("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchAmenities = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: any = {
        page: currentPage,
        page_size: 20,
      };

      if (search) filters.search = search;
      if (filterIsActive) filters.is_active = filterIsActive === "true";

      const response = await amenitiesService.getAmenities(filters);

      if (response.success) {
        setAmenities(response.data.results);
        setTotalPages(response.data.pagination.total_pages);
        setTotalCount(response.data.pagination.total_count);
      } else {
        setError("Failed to fetch amenities");
      }
    } catch (err: any) {
      console.error("Error fetching amenities:", err);
      setError(err.message || "Failed to fetch amenities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmenities();
  }, [currentPage, search, filterIsActive]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      setDeleteLoading(id);
      const response = await amenitiesService.deleteAmenity(id);

      if (response.success) {
        setSuccessMessage(`Amenity "${name}" deleted successfully`);
        fetchAmenities();
      } else {
        setError("Failed to delete amenity");
      }
    } catch (err: any) {
      console.error("Error deleting amenity:", err);
      setError(err.message || "Failed to delete amenity");
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEdit = (amenity: Amenity) => {
    setEditingAmenity(amenity);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingAmenity(null);
  };

  const handleModalSuccess = () => {
    setSuccessMessage(
      editingAmenity
        ? "Amenity updated successfully"
        : "Amenity created successfully"
    );
    fetchAmenities();
  };

  const clearFilters = () => {
    setFilterIsActive("");
    setSearch("");
    setCurrentPage(1);
  };

  const hasActiveFilters = search || filterIsActive;

  const getIconEmoji = (iconName: string) => {
    const iconMap: { [key: string]: string } = {
      wifi: "📶",
      parking: "🅿️",
      clock: "🕐",
      coffee: "☕",
      restroom: "🚻",
      store: "🏪",
      lounge: "🛋️",
      restaurant: "🍽️",
      charging: "⚡",
      security: "🔒",
      accessibility: "♿",
      atm: "🏧",
    };
    return iconMap[iconName.toLowerCase()] || "📍";
  };

  const activeCount = amenities.filter((a) => a.is_active).length;
  const inactiveCount = amenities.filter((a) => !a.is_active).length;

  if (loading && amenities.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <FiLoader className={styles.spinner} size={40} />
          <p>Loading amenities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Amenities</h1>
          <p className={styles.subtitle}>
            Manage station amenities and features
          </p>
        </div>
        <button
          className={styles.addButton}
          onClick={() => {
            setEditingAmenity(null);
            setShowModal(true);
          }}
        >
          <FiPlus /> Add Amenity
        </button>
      </div>

      {successMessage && (
        <div className={styles.successBanner}>
          <FiCheckCircle />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className={styles.errorBanner}>
          <FiAlertCircle />
          <span>{error}</span>
          <button onClick={() => setError(null)} className={styles.closeBanner}>
            <FiX />
          </button>
        </div>
      )}

      <div className={styles.controls}>
        <div className={styles.searchWrapper}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search amenities..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className={styles.search}
          />
          {search && (
            <button
              className={styles.clearSearch}
              onClick={() => {
                setSearch("");
                setCurrentPage(1);
              }}
            >
              ×
            </button>
          )}
        </div>

        <div className={styles.filterSection}>
          <select
            value={filterIsActive}
            onChange={(e) => {
              setFilterIsActive(e.target.value);
              setCurrentPage(1);
            }}
            className={styles.filterSelect}
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          {hasActiveFilters && (
            <button className={styles.clearFiltersButton} onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          Total: <strong>{totalCount}</strong>
        </div>
        <div className={styles.statItem}>
          Active: <strong className={styles.activeCount}>{activeCount}</strong>
        </div>
        <div className={styles.statItem}>
          Inactive: <strong>{inactiveCount}</strong>
        </div>
      </div>

      {amenities.length === 0 ? (
        <div className={styles.card}>
          <div className={styles.emptyState}>
            <FiGrid className={styles.emptyIcon} />
            <p>No amenities found</p>
            {hasActiveFilters ? (
              <button className={styles.emptyButton} onClick={clearFilters}>
                Clear Filters
              </button>
            ) : (
              <button
                className={styles.emptyButton}
                onClick={() => setShowModal(true)}
              >
                <FiPlus /> Create First Amenity
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <FiGrid className={styles.icon} />
                Amenities List
              </div>
              <p className={styles.cardSubText}>
                Showing {amenities.length} of {totalCount} amenities
              </p>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Icon</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Icon Key</th>
                    <th>Status</th>
                    <th>Stations</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {amenities.map((amenity) => (
                    <tr key={amenity.id}>
                      <td>
                        <div className={styles.iconCell}>
                          {getIconEmoji(amenity.icon)}
                        </div>
                      </td>
                      <td>
                        <div className={styles.nameCell}>
                          <div className={styles.amenityName}>
                            {amenity.name}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={styles.description}>
                          {amenity.description}
                        </div>
                      </td>
                      <td>
                        <span className={styles.iconKey}>{amenity.icon}</span>
                      </td>
                      <td>
                        <span
                          className={
                            amenity.is_active
                              ? styles.statusActive
                              : styles.statusInactive
                          }
                        >
                          {amenity.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <span className={styles.stationsCount}>
                          {amenity.stations_count || 0} stations
                        </span>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            className={styles.editBtn}
                            onClick={() => handleEdit(amenity)}
                            title="Edit amenity"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            className={styles.deleteBtn}
                            onClick={() =>
                              handleDelete(amenity.id, amenity.name)
                            }
                            disabled={deleteLoading === amenity.id}
                            title="Delete amenity"
                          >
                            {deleteLoading === amenity.id ? (
                              <FiLoader className={styles.spinner} />
                            ) : (
                              <FiTrash2 />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.paginationButton}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className={styles.paginationInfo}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                className={styles.paginationButton}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <AmenityModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        amenity={editingAmenity}
      />
    </div>
  );
}
