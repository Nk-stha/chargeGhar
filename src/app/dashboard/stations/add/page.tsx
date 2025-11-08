"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FiChevronRight,
  FiChevronLeft,
  FiCheckCircle,
  FiAlertCircle,
  FiMapPin,
} from "react-icons/fi";
import styles from "./add.module.css";
import stationsService from "../../../../lib/api/stations.service";
import ImageUpload from "../../../../components/StationManagement/ImageUpload";
import AmenitySelector from "../../../../components/StationManagement/AmenitySelector";
import LocationPicker from "../../../../components/StationManagement/LocationPicker";
import {
  CreateStationInput,
  StationStatus,
  Media,
} from "../../../../types/station.types";

const AddStationPage: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState<Media[]>([]);

  // Form data
  const [formData, setFormData] = useState<Partial<CreateStationInput>>({
    station_name: "",
    serial_number: "",
    imei: "",
    latitude: 27.7172,
    longitude: 85.324,
    address: "",
    landmark: "",
    total_slots: 8,
    status: "OFFLINE" as StationStatus,
    is_maintenance: false,
    hardware_info: {
      firmware_version: "1.0.0",
      hardware_version: "1.0",
    },
    amenity_ids: [],
    media_ids: [],
  });

  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const totalSteps = 4;

  const handleInputChange = (field: keyof CreateStationInput, value: any) => {
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

      if (!formData.serial_number?.trim()) {
        errors.serial_number = "Serial number is required";
      }

      if (!formData.imei?.trim()) {
        errors.imei = "IMEI is required";
      }

      if (!formData.address?.trim()) {
        errors.address = "Address is required";
      } else if (formData.address.trim().length < 5) {
        errors.address = "Address must be at least 5 characters";
      }

      if (!formData.total_slots || formData.total_slots < 1) {
        errors.total_slots = "Total slots must be at least 1";
      } else if (formData.total_slots > 100) {
        errors.total_slots = "Total slots cannot exceed 100";
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
    const mediaIds = [...(formData.media_ids || []), media.id];
    handleInputChange("media_ids", mediaIds);
  };

  const handleMediaRemove = (mediaId: string) => {
    setUploadedMedia((prev) => prev.filter((m) => m.id !== mediaId));
    const mediaIds = (formData.media_ids || []).filter((id) => id !== mediaId);
    handleInputChange("media_ids", mediaIds);
  };

  const handleAmenityChange = (amenityIds: string[]) => {
    handleInputChange("amenity_ids", amenityIds);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Validate all required fields
      const validation = stationsService.validateStationData(
        formData as CreateStationInput,
      );
      if (!validation.valid) {
        setError(validation.errors.join(", "));
        setLoading(false);
        return;
      }

      // Create station
      const response = await stationsService.createStation(
        formData as CreateStationInput,
      );

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/dashboard/stations");
        }, 2000);
      } else {
        setError("Failed to create station");
      }
    } catch (err: any) {
      console.error("Error creating station:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create station",
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className={styles.formSection}>
            <h2>Basic Information</h2>
            <p className={styles.stepDescription}>
              Enter the basic details of the charging station
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
                <label className={styles.label}>
                  Serial Number <span className={styles.required}>*</span>
                </label>
                <input
                  className={`${styles.input} ${validationErrors.serial_number ? styles.inputError : ""}`}
                  type="text"
                  placeholder="e.g., STN-001"
                  value={formData.serial_number || ""}
                  onChange={(e) =>
                    handleInputChange("serial_number", e.target.value)
                  }
                />
                {validationErrors.serial_number && (
                  <span className={styles.errorText}>
                    {validationErrors.serial_number}
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  IMEI <span className={styles.required}>*</span>
                </label>
                <input
                  className={`${styles.input} ${validationErrors.imei ? styles.inputError : ""}`}
                  type="text"
                  placeholder="e.g., 123456789012345"
                  value={formData.imei || ""}
                  onChange={(e) => handleInputChange("imei", e.target.value)}
                />
                {validationErrors.imei && (
                  <span className={styles.errorText}>
                    {validationErrors.imei}
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Total Slots <span className={styles.required}>*</span>
                </label>
                <input
                  className={`${styles.input} ${validationErrors.total_slots ? styles.inputError : ""}`}
                  type="number"
                  placeholder="e.g., 8"
                  min="1"
                  max="100"
                  value={formData.total_slots || ""}
                  onChange={(e) =>
                    handleInputChange("total_slots", parseInt(e.target.value))
                  }
                />
                {validationErrors.total_slots && (
                  <span className={styles.errorText}>
                    {validationErrors.total_slots}
                  </span>
                )}
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
          </div>
        );

      case 2:
        return (
          <div className={styles.formSection}>
            <h2>Location Details</h2>
            <p className={styles.stepDescription}>
              Set the geographical location of the station
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
              latitude={formData.latitude || 27.7172}
              longitude={formData.longitude || 85.324}
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
              Upload station images and select available amenities
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
            <h2>Review & Submit</h2>
            <p className={styles.stepDescription}>
              Review all information before creating the station
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
                      {formData.serial_number}
                    </span>
                  </div>
                  <div className={styles.reviewItem}>
                    <span className={styles.reviewLabel}>IMEI:</span>
                    <span className={styles.reviewValue}>{formData.imei}</span>
                  </div>
                  <div className={styles.reviewItem}>
                    <span className={styles.reviewLabel}>Total Slots:</span>
                    <span className={styles.reviewValue}>
                      {formData.total_slots}
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

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.successContainer}>
          <FiCheckCircle className={styles.successIcon} />
          <h2>Station Created Successfully!</h2>
          <p>Redirecting to stations list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Add New Station</h1>
        <p className={styles.breadcrumb}>Stations / Add New Station</p>
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
              {loading ? "Creating Station..." : "Create Station"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddStationPage;
