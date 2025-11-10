"use client";

import React, { useState, useEffect } from "react";
import { FiCheck, FiLoader } from "react-icons/fi";
import amenitiesService from "../../lib/api/amenities.service";
import { Amenity } from "../../types/station.types";
import styles from "./AmenitySelector.module.css";

interface AmenitySelectorProps {
  selectedAmenities?: string[];
  onChange?: (amenityIds: string[]) => void;
  label?: string;
  description?: string;
  multiple?: boolean;
  showInactive?: boolean;
}

export const AmenitySelector: React.FC<AmenitySelectorProps> = ({
  selectedAmenities = [],
  onChange,
  label = "Select Amenities",
  description = "Choose amenities available at this station",
  multiple = true,
  showInactive = false,
}) => {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>(selectedAmenities);

  useEffect(() => {
    fetchAmenities();
  }, [showInactive]);

  useEffect(() => {
    setSelected(selectedAmenities);
  }, [selectedAmenities]);

  const fetchAmenities = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await amenitiesService.getAmenities({
        is_active: showInactive ? undefined : true,
        page_size: 100,
      });

      if (response.success) {
        setAmenities(response.data.results);
      } else {
        setError("Failed to load amenities");
      }
    } catch (err: any) {
      console.error("Error fetching amenities:", err);
      setError(err.response?.data?.message || "Failed to load amenities");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (amenityId: string) => {
    let newSelected: string[];

    if (multiple) {
      if (selected.includes(amenityId)) {
        newSelected = selected.filter((id) => id !== amenityId);
      } else {
        newSelected = [...selected, amenityId];
      }
    } else {
      newSelected = selected.includes(amenityId) ? [] : [amenityId];
    }

    setSelected(newSelected);
    onChange?.(newSelected);
  };

  const isSelected = (amenityId: string) => selected.includes(amenityId);

  const getIconComponent = (iconName: string) => {
    // Map icon names to actual icons or use emoji/text
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

  if (loading) {
    return (
      <div className={styles.amenitySelectorContainer}>
        <label className={styles.label}>{label}</label>
        <div className={styles.loadingState}>
          <FiLoader className={styles.spinner} />
          <p>Loading amenities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.amenitySelectorContainer}>
        <label className={styles.label}>{label}</label>
        <div className={styles.errorState}>
          <p>{error}</p>
          <button className={styles.retryButton} onClick={fetchAmenities}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (amenities.length === 0) {
    return (
      <div className={styles.amenitySelectorContainer}>
        <label className={styles.label}>{label}</label>
        <div className={styles.emptyState}>
          <p>No amenities available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.amenitySelectorContainer}>
      <label className={styles.label}>{label}</label>
      {description && <p className={styles.description}>{description}</p>}

      <div className={styles.amenitiesGrid}>
        {amenities.map((amenity) => (
          <button
            key={amenity.id}
            type="button"
            className={`${styles.amenityCard} ${
              isSelected(amenity.id) ? styles.selected : ""
            } ${!amenity.is_active ? styles.inactive : ""}`}
            onClick={() => handleToggle(amenity.id)}
            disabled={!amenity.is_active && !showInactive}
          >
            {isSelected(amenity.id) && (
              <div className={styles.checkmark}>
                <FiCheck />
              </div>
            )}
            <div className={styles.amenityIcon}>
              {getIconComponent(amenity.icon)}
            </div>
            <div className={styles.amenityName}>{amenity.name}</div>
            {amenity.description && (
              <div className={styles.amenityDescription}>
                {amenity.description}
              </div>
            )}
            {!amenity.is_active && (
              <div className={styles.inactiveBadge}>Inactive</div>
            )}
          </button>
        ))}
      </div>

      {selected.length > 0 && (
        <div className={styles.selectedInfo}>
          <span>
            {selected.length} amenity{selected.length !== 1 ? "ies" : ""} selected
          </span>
          <button
            type="button"
            className={styles.clearButton}
            onClick={() => {
              setSelected([]);
              onChange?.([]);
            }}
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};

export default AmenitySelector;
