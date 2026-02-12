"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/modal/modal";
import { FiCheckCircle, FiX } from "react-icons/fi";
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

function ReviewAdModal({
  isOpen,
  onClose,
  adId,
  currentData,
  onSuccess,
}: ReviewAdModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [loadingStations, setLoadingStations] = useState(false);

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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoadingStations(true);
        const response = await stationsService.getStations({ page_size: 100 });
        if (response.success) {
          setStations(response.data.results);
        }
      } catch (err) {
        // Silent error - stations are optional
      } finally {
        setLoadingStations(false);
      }
    };

    if (isOpen) {
      fetchStations();
    }
  }, [isOpen]);

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

  const validateField = (field: string, value: unknown) => {
    const newErrors = { ...errors };

    switch (field) {
      case "title":
        if (value && (value as string).length < 5) {
          newErrors.title = "Title must be at least 5 characters";
        } else {
          delete newErrors.title;
        }
        break;
      case "description":
        if (value && (value as string).length < 10) {
          newErrors.description = "Description must be at least 10 characters";
        } else {
          delete newErrors.description;
        }
        break;
      case "durationDays":
        const days = parseInt(value as string);
        if (value && (isNaN(days) || days < 1 || days > 365)) {
          newErrors.durationDays = "Duration must be between 1 and 365 days";
        } else {
          delete newErrors.durationDays;
        }
        break;
      case "adminPrice":
        const price = parseFloat(value as string);
        if (value && (isNaN(price) || price < 0)) {
          newErrors.adminPrice = "Price must be a valid positive number";
        } else {
          delete newErrors.adminPrice;
        }
        break;
      case "startDate":
        if (value) {
          const date = new Date(value as string);
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
        const seconds = parseInt(value as string);
        if (value && (isNaN(seconds) || seconds < 3 || seconds > 30)) {
          newErrors.durationSeconds = "Display duration must be between 3 and 30 seconds";
        } else {
          delete newErrors.durationSeconds;
        }
        break;
      case "displayOrder":
        const order = parseInt(value as string);
        if (value && (isNaN(order) || order < 0)) {
          newErrors.displayOrder = "Display order must be 0 or greater";
        } else {
          delete newErrors.displayOrder;
        }
        break;
      case "selectedStations":
        if (value && (value as string[]).length === 0) {
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

    const allTouched: Record<string, boolean> = {};
    Object.keys(allFields).forEach((field) => {
      allTouched[field] = true;
    });
    setTouched(allTouched);

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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message 
        : "Failed to review ad request";
      setError(errorMessage || "Failed to review ad request");
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

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Title</label>
          <input
            type="text"
            className={styles.input}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              validateField("title", e.target.value);
            }}
            onBlur={() => handleBlur("title")}
            placeholder="Enter ad title"
          />
          {touched.title && errors.title && (
            <span className={styles.errorText}>{errors.title}</span>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Description</label>
          <textarea
            className={styles.textarea}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              validateField("description", e.target.value);
            }}
            onBlur={() => handleBlur("description")}
            placeholder="Enter ad description"
            rows={4}
          />
          {touched.description && errors.description && (
            <span className={styles.errorText}>{errors.description}</span>
          )}
        </div>

        <div className={styles.row}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Duration (days)</label>
            <input
              type="number"
              className={styles.input}
              value={durationDays}
              onChange={(e) => {
                setDurationDays(e.target.value);
                validateField("durationDays", e.target.value);
              }}
              onBlur={() => handleBlur("durationDays")}
              placeholder="1-365"
              min="1"
              max="365"
            />
            {touched.durationDays && errors.durationDays && (
              <span className={styles.errorText}>{errors.durationDays}</span>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Price (NPR)</label>
            <input
              type="number"
              className={styles.input}
              value={adminPrice}
              onChange={(e) => {
                setAdminPrice(e.target.value);
                validateField("adminPrice", e.target.value);
              }}
              onBlur={() => handleBlur("adminPrice")}
              placeholder="0.00"
              step="0.01"
              min="0"
            />
            {touched.adminPrice && errors.adminPrice && (
              <span className={styles.errorText}>{errors.adminPrice}</span>
            )}
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Start Date</label>
          <input
            type="date"
            className={styles.input}
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              validateField("startDate", e.target.value);
            }}
            onBlur={() => handleBlur("startDate")}
          />
          {endDate && (
            <span className={styles.helperText}>End date will be: {endDate}</span>
          )}
          {touched.startDate && errors.startDate && (
            <span className={styles.errorText}>{errors.startDate}</span>
          )}
        </div>

        <div className={styles.row}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Display Duration (sec)</label>
            <input
              type="number"
              className={styles.input}
              value={durationSeconds}
              onChange={(e) => {
                setDurationSeconds(e.target.value);
                validateField("durationSeconds", e.target.value);
              }}
              onBlur={() => handleBlur("durationSeconds")}
              placeholder="3-30"
              min="3"
              max="30"
            />
            {touched.durationSeconds && errors.durationSeconds && (
              <span className={styles.errorText}>{errors.durationSeconds}</span>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Display Order</label>
            <input
              type="number"
              className={styles.input}
              value={displayOrder}
              onChange={(e) => {
                setDisplayOrder(e.target.value);
                validateField("displayOrder", e.target.value);
              }}
              onBlur={() => handleBlur("displayOrder")}
              placeholder="0"
              min="0"
            />
            {touched.displayOrder && errors.displayOrder && (
              <span className={styles.errorText}>{errors.displayOrder}</span>
            )}
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Admin Notes</label>
          <textarea
            className={styles.textarea}
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Internal notes (optional)"
            rows={3}
          />
        </div>

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
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            <FiCheckCircle />
            {loading ? "Saving..." : "Execute Action"}
          </button>
          <button type="button" onClick={onClose} className={styles.cancelBtn} disabled={loading}>
            <FiX />
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default ReviewAdModal;
