"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FiChevronRight,
  FiChevronLeft,
  FiCheckCircle,
  FiAlertCircle,
  FiMapPin,
  FiArrowLeft,
} from "react-icons/fi";
import styles from "./edit.module.css";
import stationsService from "../../../../../lib/api/stations.service";
import ImageUpload from "../../../../../components/StationManagement/ImageUpload";
import AmenitySelector from "../../../../../components/StationManagement/AmenitySelector";
import LocationPicker from "../../../../../components/StationManagement/LocationPicker";
import {
  UpdateStationInput,
  StationStatus,
  Media,
  StationDetail,
} from "../../../../../types/station.types";

const EditStationPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const stationSn = Array.isArray(params.station_sn)
    ? params.station_sn[0]
    : params.station_sn;

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState<Media[]>([]);
  const [originalStation, setOriginalStation] = useState<StationDetail | null>(
    null,
  );

  // Form data
  const [formData, setFormData] = useState<Partial<UpdateStationInput>>({
    station_name: "",
    latitude: 27.7172,
    longitude: 85.324,
    address: "",
    landmark: "",
    status: "OFFLINE" as StationStatus,
    is_maintenance: false,
    hardware_info: {
      firmware_version: "",
      hardware_version: "",
    },
    amenity_ids: [],
    media_uploads: [],
  });

  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const totalSteps = 4;

  // Fetch existing station data
  useEffect(() => {
    const fetchStationData = async () => {
      if (!stationSn) {
        setError("Station ID not provided");
        setFetchLoading(false);
        return;
      }

      try {
        setFetchLoading(true);
        const response = await stationsService.getStation(stationSn);

        if (response.success && response.data) {
          const station = response.data;
          setOriginalStation(station);

          // Pre-populate form data
          setFormData({
            station_name: station.station_name,
            latitude: parseFloat(station.latitude),
            longitude: parseFloat(station.longitude),
            address: station.address,
            landmark: station.landmark || "",
            status: station.status,
            is_maintenance: station.is_maintenance,
            hardware_info: station.hardware_info || {
              firmware_version: "",
              hardware_version: "",
            },
            amenity_ids:
              station.amenities?.map((a) =>
                typeof a === "string" ? a : a.id,
              ) || [],
            media_uploads:
              station.media?.map((m) => ({
                media_upload_id: m.media_upload_id,
                media_type: m.media_type,
                title: m.title,
                is_primary: m.is_primary,
              })) || [],
          });

          // Populate existing media
          if (station.media && station.media.length > 0) {
            setUploadedMedia(station.media);
          }
        } else {
          setError("Failed to load station data");
        }
      } catch (err: any) {
        console.error("Error fetching station:", err);
        setError(err.response?.data?.message || "Failed to load station data");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchStationData();
  }, [stationSn]);

  const handleInputChange = (field: keyof UpdateStationInput, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    const errors: { [key: string]: string } = {};

    if (step === 1) {
      if (!formData.station_name?.trim()) {
        errors.station_name = "Station name is required";
      } else if (formData.station_name.trim().length < 3) {
        errors.station_name = "Station name must be at least 3 characters";
      }

      if (!formData.address?.trim()) {
        errors.address = "Address is required";
      } else if (formData.address.trim().length < 5) {
        errors.address = "Address must be at least 5 characters";
      }
    }

    if (step === 2) {
      const lat = Number(formData.latitude);
      const lng = Number(formData.longitude);

      if (isNaN(lat) || lat < -90 || lat > 90) {
        errors.latitude = "Latitude must be between -90 and 90";
      }

      if (isNaN(lng) || lng < -180 || lng > 180) {
        errors.longitude = "Longitude must be between -180 and 180";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep((s) => s + 1);
        setError(null);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
      setError(null);
    }
  };

  const handleStepClick = (step: number) => {
    if (step <= currentStep || step === currentStep + 1) {
      if (validateStep(currentStep) || step < currentStep) {
        setCurrentStep(step);
        setError(null);
      }
    }
  };

  const handleMediaUpload = (media: Media) => {
    setUploadedMedia((prev) => [...prev, media]);
    const mediaUploads = [
      ...(formData.media_uploads || []),
      {
        media_upload_id: media.id,
        media_type: media.file_type,
        title: media.original_name,
        is_primary: (formData.media_uploads || []).length === 0, // First image is primary
      },
    ];
    handleInputChange("media_uploads", mediaUploads);
  };

  const handleMediaRemove = (mediaId: string) => {
    setUploadedMedia((prev) => prev.filter((m) => m.id !== mediaId));
    const mediaUploads = (formData.media_uploads || []).filter(
      (upload) => upload.media_upload_id !== mediaId,
    );
    handleInputChange("media_uploads", mediaUploads);
  };

  const handleAmenityChange = (amenityIds: string[]) => {
    handleInputChange("amenity_ids", amenityIds);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    if (!stationSn) {
      setError("Station ID not found");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Update station
      const response = await stationsService.updateStation(
        stationSn,
        formData as UpdateStationInput,
      );

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/dashboard/stations/${stationSn}`);
        }, 2000);
      } else {
        setError("Failed to update station");
      }
    } catch (err: any) {
      console.error("Error updating station:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update station",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(`/dashboard/stations/${stationSn}`);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className={styles.formSection}>
            <h2>Basic Information</h2>
            <p className={styles.stepDescription}>
              Update the basic details of the charging station
            </p>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Station Name <span className={styles.required}>*</span>
                </label>
                <input
                  className={`${styles.input} ${validationErrors.station_name ? styles.inputError : ""}`}
                  type="text"
                  placeholder="e.g., Kathmandu Mall Station"
                  value={formData.station_name || ""}
                  onChange={(e) =>
                    handleInputChange("station_name", e.target.value)
                  }
                />
                {validationErrors.station_name && (
                  <span className={styles.errorText}>
                    {validationErrors.station_name}
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Serial Number</label>
                <input
                  className={`${styles.input} ${styles.disabled}`}
                  type="text"
                  value={originalStation?.serial_number || ""}
                  disabled
                  readOnly
                />
                <span className={styles.helperText}>
                  Serial number cannot be changed
                </span>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>IMEI</label>
                <input
                  className={`${styles.input} ${styles.disabled}`}
                  type="text"
                  value={originalStation?.imei || ""}
                  disabled
                  readOnly
                />
                <span className={styles.helperText}>
                  IMEI cannot be changed
                </span>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Total Slots</label>
                <input
                  className={`${styles.input} ${styles.disabled}`}
                  type="number"
                  value={originalStation?.total_slots || 0}
                  disabled
                  readOnly
                />
                <span className={styles.helperText}>
                  Total slots cannot be changed
                </span>
              </div>

              <div
                className={styles.formGroup}
                style={{ gridColumn: "1 / -1" }}
              >
                <label className={styles.label}>
                  Address <span className={styles.required}>*</span>
                </label>
                <input
                  className={`${styles.input} ${validationErrors.address ? styles.inputError : ""}`}
                  type="text"
                  placeholder="e.g., Kathmandu Mall, New Baneshwor"
                  value={formData.address || ""}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                />
                {validationErrors.address && (
                  <span className={styles.errorText}>
                    {validationErrors.address}
                  </span>
                )}
              </div>

              <div
                className={styles.formGroup}
                style={{ gridColumn: "1 / -1" }}
              >
                <label className={styles.label}>Landmark</label>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="e.g., Near main entrance"
                  value={formData.landmark || ""}
                  onChange={(e) =>
                    handleInputChange("landmark", e.target.value)
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Status</label>
                <select
                  className={styles.select}
                  value={formData.status}
                  onChange={(e) =>
                    handleInputChange("status", e.target.value as StationStatus)
                  }
                >
                  <option value="OFFLINE">OFFLINE</option>
                  <option value="ONLINE">ONLINE</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.is_maintenance || false}
                    onChange={(e) =>
                      handleInputChange("is_maintenance", e.target.checked)
                    }
                  />
                  <span>Maintenance Mode</span>
                </label>
              </div>
            </div>

            <div className={styles.infoBox}>
              <FiAlertCircle />
              <div>
                <strong>Note:</strong>
                <p>
                  Serial number, IMEI, and total slots cannot be modified after
                  creation.
                </p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className={styles.formSection}>
            <h2>Location Details</h2>
            <p className={styles.stepDescription}>
              Update the geographical location of the station
            </p>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Latitude <span className={styles.required}>*</span>
                </label>
                <input
                  className={`${styles.input} ${validationErrors.latitude ? styles.inputError : ""}`}
                  type="number"
                  step="0.000001"
                  placeholder="e.g., 27.7172"
                  value={formData.latitude || ""}
                  onChange={(e) =>
                    handleInputChange("latitude", parseFloat(e.target.value))
                  }
                />
                {validationErrors.latitude && (
                  <span className={styles.errorText}>
                    {validationErrors.latitude}
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Longitude <span className={styles.required}>*</span>
                </label>
                <input
                  className={`${styles.input} ${validationErrors.longitude ? styles.inputError : ""}`}
                  type="number"
                  step="0.000001"
                  placeholder="e.g., 85.324"
                  value={formData.longitude || ""}
                  onChange={(e) =>
                    handleInputChange("longitude", parseFloat(e.target.value))
                  }
                />
                {validationErrors.longitude && (
                  <span className={styles.errorText}>
                    {validationErrors.longitude}
                  </span>
                )}
              </div>
            </div>

            <LocationPicker
              latitude={Number(formData.latitude) || 27.7172}
              longitude={Number(formData.longitude) || 85.324}
              onLocationChange={(lat, lng) => {
                handleInputChange("latitude", lat);
                handleInputChange("longitude", lng);
              }}
              height="400px"
            />

            <div className={styles.infoBox}>
              <FiMapPin />
              <div>
                <strong>Location Preview</strong>
                <p>
                  {formData.address || "Address not set"} ({formData.latitude},{" "}
                  {formData.longitude})
                </p>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className={styles.formSection}>
            <h2>Media & Amenities</h2>
            <p className={styles.stepDescription}>
              Update station images and available amenities
            </p>

            <ImageUpload
              onUploadComplete={handleMediaUpload}
              onRemove={handleMediaRemove}
              existingImages={uploadedMedia}
              maxFiles={5}
              maxSizeMB={10}
              label="Station Images"
              description="Upload images of the charging station (max 5 images, 10MB each)"
            />

            <AmenitySelector
              selectedAmenities={formData.amenity_ids || []}
              onChange={handleAmenityChange}
              label="Available Amenities"
              description="Select amenities available at this station"
            />
          </div>
        );

      case 4:
        return (
          <div className={styles.formSection}>
            <h2>Review & Update</h2>
            <p className={styles.stepDescription}>
              Review all changes before updating the station
            </p>

            <div className={styles.reviewSection}>
              <div className={styles.reviewCard}>
                <h3>Basic Information</h3>
                <div className={styles.reviewGrid}>
                  <div className={styles.reviewItem}>
                    <span className={styles.reviewLabel}>Station Name:</span>
                    <span className={styles.reviewValue}>
                      {formData.station_name}
                    </span>
                  </div>
                  <div className={styles.reviewItem}>
                    <span className={styles.reviewLabel}>Serial Number:</span>
                    <span className={styles.reviewValue}>
                      {originalStation?.serial_number}
                    </span>
                  </div>
                  <div className={styles.reviewItem}>
                    <span className={styles.reviewLabel}>IMEI:</span>
                    <span className={styles.reviewValue}>
                      {originalStation?.imei}
                    </span>
                  </div>
                  <div className={styles.reviewItem}>
                    <span className={styles.reviewLabel}>Total Slots:</span>
                    <span className={styles.reviewValue}>
                      {originalStation?.total_slots}
                    </span>
                  </div>
                  <div className={styles.reviewItem}>
                    <span className={styles.reviewLabel}>Address:</span>
                    <span className={styles.reviewValue}>
                      {formData.address}
                    </span>
                  </div>
                  {formData.landmark && (
                    <div className={styles.reviewItem}>
                      <span className={styles.reviewLabel}>Landmark:</span>
                      <span className={styles.reviewValue}>
                        {formData.landmark}
                      </span>
                    </div>
                  )}
                  <div className={styles.reviewItem}>
                    <span className={styles.reviewLabel}>Status:</span>
                    <span
                      className={`${styles.statusBadge} ${styles[formData.status?.toLowerCase() || ""]}`}
                    >
                      {formData.status}
                    </span>
                  </div>
                  <div className={styles.reviewItem}>
                    <span className={styles.reviewLabel}>Maintenance:</span>
                    <span className={styles.reviewValue}>
                      {formData.is_maintenance ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.reviewCard}>
                <h3>Location</h3>
                <div className={styles.reviewGrid}>
                  <div className={styles.reviewItem}>
                    <span className={styles.reviewLabel}>Latitude:</span>
                    <span className={styles.reviewValue}>
                      {formData.latitude}
                    </span>
                  </div>
                  <div className={styles.reviewItem}>
                    <span className={styles.reviewLabel}>Longitude:</span>
                    <span className={styles.reviewValue}>
                      {formData.longitude}
                    </span>
                  </div>
                </div>
                <div className={styles.miniMapContainer}>
                  <iframe
                    title="Station Location Preview"
                    width="100%"
                    height="200"
                    style={{ border: 0, borderRadius: "8px" }}
                    loading="lazy"
                    src={`https://www.google.com/maps?q=${formData.latitude},${formData.longitude}&z=15&output=embed`}
                  />
                </div>
              </div>

              <div className={styles.reviewCard}>
                <h3>Media & Amenities</h3>
                <div className={styles.reviewItem}>
                  <span className={styles.reviewLabel}>Images:</span>
                  <span className={styles.reviewValue}>
                    {uploadedMedia.length} image(s) uploaded
                  </span>
                </div>
                {uploadedMedia.length > 0 && (
                  <div className={styles.imagePreviewGrid}>
                    {uploadedMedia.map((media) => (
                      <img
                        key={media.id}
                        src={media.file_url}
                        alt={media.original_name}
                        className={styles.thumbnailImage}
                      />
                    ))}
                  </div>
                )}
                <div className={styles.reviewItem}>
                  <span className={styles.reviewLabel}>Amenities:</span>
                  <span className={styles.reviewValue}>
                    {formData.amenity_ids?.length || 0} amenity(ies) selected
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (fetchLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading station data...</p>
        </div>
      </div>
    );
  }

  if (error && !originalStation) {
    return (
      <div className={styles.container}>
        <button className={styles.backBtn} onClick={handleCancel}>
          <FiArrowLeft /> Back
        </button>
        <div className={styles.errorContainer}>
          <FiAlertCircle className={styles.errorIcon} />
          <h2>Error Loading Station</h2>
          <p>{error}</p>
          <button
            className={styles.retryBtn}
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.successContainer}>
          <FiCheckCircle className={styles.successIcon} />
          <h2>Station Updated Successfully!</h2>
          <p>Redirecting to station details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={handleCancel}>
        <FiArrowLeft /> Cancel and Go Back
      </button>

      <div className={styles.header}>
        <h1>Edit Station</h1>
        <p className={styles.breadcrumb}>
          Stations / {originalStation?.station_name} / Edit
        </p>
      </div>

      {/* Progress Steps */}
      <div className={styles.progressContainer}>
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNum = index + 1;
          const stepLabels = [
            "Basic Info",
            "Location",
            "Media & Amenities",
            "Review",
          ];
          return (
            <div
              key={stepNum}
              className={`${styles.progressStep} ${currentStep >= stepNum ? styles.active : ""} ${
                currentStep === stepNum ? styles.current : ""
              }`}
              onClick={() => handleStepClick(stepNum)}
            >
              <div className={styles.stepNumber}>{stepNum}</div>
              <div className={styles.stepLabel}>{stepLabels[index]}</div>
            </div>
          );
        })}
      </div>

      {/* Error Message */}
      {error && (
        <div className={styles.errorAlert}>
          <FiAlertCircle />
          <span>{error}</span>
        </div>
      )}

      {/* Form Content */}
      {renderStepContent()}

      {/* Navigation Buttons */}
      <div className={styles.navigationButtons}>
        {currentStep > 1 && (
          <button
            className={styles.prevButton}
            onClick={handlePrevious}
            disabled={loading}
          >
            <FiChevronLeft /> Previous
          </button>
        )}
        <div className={styles.rightButtons}>
          <button
            className={styles.cancelButton}
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </button>
          {currentStep < totalSteps ? (
            <button
              className={styles.nextButton}
              onClick={handleNext}
              disabled={loading}
            >
              Next <FiChevronRight />
            </button>
          ) : (
            <button
              className={styles.submitButton}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Updating Station..." : "Update Station"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditStationPage;
