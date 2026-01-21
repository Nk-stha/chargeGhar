"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/modal/modal";
import { ValidatedInput, ValidatedTextArea, ValidatedSelect } from "@/components/ValidatedInput/ValidatedInput";
import adsService from "@/lib/api/ads.service";
import stationsService from "@/lib/api/stations.service";
import { AdRequestDetail, ReviewAdInput } from "@/types/ads.types";
import { Station } from "@/types/station.types";
import styles from "./ReviewAdModal.module.css";

interface ReviewAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  adId: string;
  currentData: AdRequestDetail;
  onSuccess: () => void;
}

const ReviewAdModal: React.FC<ReviewAdModalProps> = ({
  isOpen,
  onClose,
  adId,
  currentData,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [loadingStations, setLoadingStations] = useState(false);

  // Form state
  const [title, setTitle] = useState(currentData.title || "");
  const [description, setDescription] = useState(currentData.description || "");
  const [durationDays, setDurationDays] = useState(currentData.duration_days?.toString() || "");
  const [adminPrice, setAdminPrice] = useState(currentData.admin_price || "");
  const [adminNotes, setAdminNotes] = useState(currentData.admin_notes || "");
  const [startDate, setStartDate] = useState(currentData.start_date || "");
  const [durationSeconds, setDurationSeconds] = useState(
    currentData.ad_content?.duration_seconds?.toString() || "5"
  );
  const [displayOrder, setDisplayOrder] = useState(
    currentData.ad_content?.display_order?.toString() || "0"
  );
  const [selectedStations, setSelectedStations] = useState<string[]>(
    currentData.stations.map((s) => s.id)
  );

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Fetch stations
  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoadingStations(true);
        const response = await stationsService.getStations({ page_size: 100 });
        if (response.success) {
          setStations(response.data.results);
        }
      } catch (err) {
        console.error("Error fetching stations:", err);
      } finally {
        setLoadingStations(false);
      }
    };

    if (isOpen) {
      fetchStations();
    }
  }, [isOpen]);

  // Calculate end date
  const calculateEndDate = () => {
    if (startDate && durationDays) {
      const start = new Date(startDate);
      const days = parseInt(durationDays);
      if (!isNaN(days)) {
        const end = new Date(start);
        end.setDate(end.getDate() + days);
        return end.toISOString().split("T")[0];
      }
    }
    return "";
  };

  const endDate = calculateEndDate();

  // Validation
  const validateField = (field: string, value: any) => {
    const newErrors = { ...errors };

    switch (field) {
      case "title":
        if (value && value.length < 5) {
          newErrors.title = "Title must be at least 5 characters";
        } else {
          delete newErrors.title;
        }
        break;
      case "description":
        if (value && value.length < 10) {
          newErrors.description = "Description must be at least 10 characters";
        } else {
          delete newErrors.description;
        }
        break;
      case "durationDays":
        const days = parseInt(value);
        if (value && (isNaN(days) || days < 1 || days > 365)) {
          newErrors.durationDays = "Duration must be between 1 and 365 days";
        } else {
          delete newErrors.durationDays;
        }
        break;
      case "adminPrice":
        const price = parseFloat(value);
        if (value && (isNaN(price) || price < 0)) {
          newErrors.adminPrice = "Price must be a valid positive number";
        } else {
          delete newErrors.adminPrice;
        }
        break;
      case "startDate":
        if (value) {
          const date = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (date < today) {
            newErrors.startDate = "Start date cannot be in the past";
          } else {
            delete newErrors.startDate;
          }
        } else {
          delete newErrors.startDate;
        }
        break;
      case "durationSeconds":
        const seconds = parseInt(value);
        if (value && (isNaN(seconds) || seconds < 3 || seconds > 30)) {
          newErrors.durationSeconds = "Display duration must be between 3 and 30 seconds";
        } else {
          delete newErrors.durationSeconds;
        }
        break;
      case "displayOrder":
        const order = parseInt(value);
        if (value && (isNaN(order) || order < 0)) {
          newErrors.displayOrder = "Display order must be 0 or greater";
        } else {
          delete newErrors.displayOrder;
        }
        break;
      case "selectedStations":
        if (value && value.length === 0) {
          newErrors.selectedStations = "At least one station must be selected";
        } else {
          delete newErrors.selectedStations;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const allFields = {
      title,
      description,
      durationDays,
      adminPrice,
      startDate,
      durationSeconds,
      displayOrder,
      selectedStations,
    };

    Object.keys(allFields).forEach((field) => {
      validateField(field, allFields[field as keyof typeof allFields]);
    });

    // Mark all as touched
    const allTouched: Record<string, boolean> = {};
    Object.keys(allFields).forEach((field) => {
      allTouched[field] = true;
    });
    setTouched(allTouched);

    // Check for errors
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data: ReviewAdInput = {};

      if (title) data.title = title;
      if (description) data.description = description;
      if (durationDays) data.duration_days = parseInt(durationDays);
      if (adminPrice) data.admin_price = adminPrice;
      if (adminNotes) data.admin_notes = adminNotes;
      if (startDate) data.start_date = startDate;
      if (durationSeconds) data.duration_seconds = parseInt(durationSeconds);
      if (displayOrder) data.display_order = parseInt(displayOrder);
      if (selectedStations.length > 0) data.station_ids = selectedStations;

      const response = await adsService.reviewAdRequest(adId, data);

      if (response.success) {
        onSuccess();
        onClose();
      } else {
        setError("Failed to review ad request");
      }
    } catch (err: any) {
      console.error("Error reviewing ad:", err);
      setError(err.response?.data?.message || "Failed to review ad request");
    } finally {
      setLoading(false);
    }
  };

  const toggleStation = (stationId: string) => {
    setSelectedStations((prev) => {
      const newSelection = prev.includes(stationId)
        ? prev.filter((id) => id !== stationId)
        : [...prev, stationId];
      validateField("selectedStations", newSelection);
      return newSelection;
    });
  };

  return (
    <Modal title="Review & Configure Ad" isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        <ValidatedInput
          label="Title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            validateField("title", e.target.value);
          }}
          onBlur={() => handleBlur("title")}
          error={errors.title}
          touched={touched.title}
          placeholder="Enter ad title"
        />

        <ValidatedTextArea
          label="Description"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            validateField("description", e.target.value);
          }}
          onBlur={() => handleBlur("description")}
          error={errors.description}
          touched={touched.description}
          placeholder="Enter ad description"
          rows={4}
        />

        <div className={styles.row}>
          <ValidatedInput
            label="Duration (days)"
            type="number"
            value={durationDays}
            onChange={(e) => {
              setDurationDays(e.target.value);
              validateField("durationDays", e.target.value);
            }}
            onBlur={() => handleBlur("durationDays")}
            error={errors.durationDays}
            touched={touched.durationDays}
            placeholder="1-365"
            min="1"
            max="365"
          />

          <ValidatedInput
            label="Price (NPR)"
            type="number"
            step="0.01"
            value={adminPrice}
            onChange={(e) => {
              setAdminPrice(e.target.value);
              validateField("adminPrice", e.target.value);
            }}
            onBlur={() => handleBlur("adminPrice")}
            error={errors.adminPrice}
            touched={touched.adminPrice}
            placeholder="0.00"
            min="0"
          />
        </div>

        <ValidatedInput
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value);
            validateField("startDate", e.target.value);
          }}
          onBlur={() => handleBlur("startDate")}
          error={errors.startDate}
          touched={touched.startDate}
          helperText={endDate ? `End date will be: ${endDate}` : undefined}
        />

        <div className={styles.row}>
          <ValidatedInput
            label="Display Duration (seconds)"
            type="number"
            value={durationSeconds}
            onChange={(e) => {
              setDurationSeconds(e.target.value);
              validateField("durationSeconds", e.target.value);
            }}
            onBlur={() => handleBlur("durationSeconds")}
            error={errors.durationSeconds}
            touched={touched.durationSeconds}
            placeholder="3-30"
            min="3"
            max="30"
          />

          <ValidatedInput
            label="Display Order"
            type="number"
            value={displayOrder}
            onChange={(e) => {
              setDisplayOrder(e.target.value);
              validateField("displayOrder", e.target.value);
            }}
            onBlur={() => handleBlur("displayOrder")}
            error={errors.displayOrder}
            touched={touched.displayOrder}
            placeholder="0"
            min="0"
          />
        </div>

        <ValidatedTextArea
          label="Admin Notes"
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          placeholder="Internal notes (optional)"
          rows={3}
        />

        <div className={styles.stationsSection}>
          <label className={styles.label}>
            Assign Stations <span className={styles.required}>*</span>
          </label>
          {loadingStations ? (
            <p className={styles.loadingText}>Loading stations...</p>
          ) : (
            <div className={styles.stationsList}>
              {stations.map((station) => (
                <div
                  key={station.id}
                  className={`${styles.stationItem} ${
                    selectedStations.includes(station.id) ? styles.selected : ""
                  }`}
                  onClick={() => toggleStation(station.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedStations.includes(station.id)}
                    onChange={() => {}}
                    className={styles.checkbox}
                  />
                  <div className={styles.stationInfo}>
                    <span className={styles.stationName}>{station.station_name}</span>
                    <span className={styles.stationAddress}>{station.address}</span>
                    <span
                      className={`${styles.stationStatus} ${
                        station.status === "ONLINE" ? styles.online : styles.offline
                      }`}
                    >
                      {station.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {touched.selectedStations && errors.selectedStations && (
            <span className={styles.errorText}>{errors.selectedStations}</span>
          )}
          <p className={styles.helperText}>
            Selected: {selectedStations.length} station{selectedStations.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className={styles.actions}>
          <button type="button" onClick={onClose} className={styles.cancelBtn} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Saving..." : "Save Configuration"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ReviewAdModal;
