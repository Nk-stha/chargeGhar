"use client";

import React, { useState, useEffect } from "react";
import styles from "./add.module.css";
import { FaCoffee, FaRestroom, FaStore, FaParking, FaCouch } from "react-icons/fa";
import { FiChevronRight, FiChevronLeft } from "react-icons/fi";
import { FaImage, FaCheckCircle } from "react-icons/fa";

const AddStationPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [stationName, setStationName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [location, setLocation] = useState("");
  const [powerbanks, setPowerbanks] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [longitude, setLongitude] = useState("");
  const [latitude, setLatitude] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const totalSteps = 4;

  const amenityOptions = [
    { name: "Cafe", icon: <FaCoffee /> },
    { name: "Toilet", icon: <FaRestroom /> },
    { name: "Lounge", icon: <FaCouch /> },
    { name: "Store", icon: <FaStore /> },
    { name: "Parking", icon: <FaParking /> },
  ];

  const handleAmenityToggle = (amenity: string) => {
    setAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
  };

  // Revoke previously created object URL before creating a new one to avoid leaks
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    // revoke previous preview if exists
    if (imagePreview) {
      try {
        URL.revokeObjectURL(imagePreview);
      } catch (err) {
        // ignore
      }
    }

    setImage(file);

    if (file) {
      const newPreview = URL.createObjectURL(file);
      setImagePreview(newPreview);
    } else {
      setImagePreview(null);
    }
  };

  const handleConfirmStation = () => {
    setShowConfirmModal(true);
  };

  const handleFinalConfirm = () => {
    // Optionally you can send API request here
    setShowConfirmModal(false);
    alert("Station added successfully!");
    // if you reset the form, always reset to empty strings (not undefined)
    // setStationName(""); setCapacity(""); etc.
  };

  const handleCancelConfirm = () => {
    setShowConfirmModal(false);
  };

  // Cleanup on unmount or when imagePreview changes
  useEffect(() => {
    return () => {
      if (imagePreview) {
        try {
          URL.revokeObjectURL(imagePreview);
        } catch (err) {
          // ignore
        }
      }
    };
  }, [imagePreview]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <h2>General Information</h2>
            <div className={styles.formGrid}>
              <div>
                <label className={styles.label}>Station Name</label>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Enter station name"
                  value={stationName}
                  onChange={(e) => setStationName(e.target.value || "")}
                />
              </div>
              <div>
                <label className={styles.label}>Capacity</label>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="e.g. 8 Powerbanks"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value || "")}
                />
              </div>
              <div>
                <label className={styles.label}>Location</label>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Enter station location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value || "")}
                />
              </div>
              <div>
                <label className={styles.label}>Powerbanks Available</label>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="e.g. 4 Powerbanks"
                  value={powerbanks}
                  onChange={(e) => setPowerbanks(e.target.value || "")}
                />
              </div>
            </div>

            <div className={styles.amenities}>
              <label className={styles.label}>Nearby Amenities</label>
              <div className={styles.amenityButtons}>
                {amenityOptions.map((a) => (
                  <button
                    key={a.name}
                    type="button"
                    className={`${styles.amenityButton} ${amenities.includes(a.name) ? styles.activeAmenity : ""
                      }`}
                    onClick={() => handleAmenityToggle(a.name)}
                  >
                    {a.icon}
                    <span>{a.name}</span>
                  </button>
                ))}
              </div>
              <div className={styles.actions}>
                <button className={styles.nextButton} onClick={handleNext}>
                  Next <FiChevronRight />
                </button>
              </div>
            </div>
          </>
        );

      case 2:
        return (
          <>
            <h2>Station Location</h2>
            <div className={styles.locationInputs}>
              <div>
                <label className={styles.label}>Longitude</label>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Enter longitude"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value || "")}
                />
              </div>
              <div>
                <label className={styles.label}>Latitude</label>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Enter latitude"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value || "")}
                />
              </div>
            </div>

            <div className={styles.mapPlaceholder}>
              <iframe
                title="Station Map"
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: "10px" }}
                loading="lazy"
                allowFullScreen
                src={`https://www.google.com/maps?q=${latitude || 27.7172},${longitude || 85.324}&z=14&output=embed`}
              />
            </div>
          </>
        );

      case 3:
        return (
          <>
            <h2>Location Image</h2>
            <div className={styles.formGrid}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label className={styles.label}>Upload Station Location Image</label>
                <input
                  className={styles.input}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />

                {imagePreview && typeof imagePreview === "string" && (
                  <div className={styles.imagePreview}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        width: "100%",
                        borderRadius: "8px",
                        marginTop: "10px",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </>
        );

      case 4:
        return (
          <>
            <h2>Review & Complete</h2>
            <div className={styles.summary}>
              <h3>Station Summary</h3>
              <p>
                <strong>Name:</strong> {stationName || "Not set"}
              </p>
              <p>
                <strong>Location:</strong> {location || "Not set"}
              </p>
              <p>
                <strong>Capacity:</strong> {capacity || "Not set"}
              </p>
              <p>
                <strong>Powerbanks:</strong> {powerbanks || "Not set"}
              </p>
              <p>
                <strong>Amenities:</strong>{" "}
                {amenities.length > 0 ? amenities.join(", ") : "None"}
              </p>
              <p>
                <strong>Coordinates:</strong> Lat: {latitude || "Not set"}, Lng:{" "}
                {longitude || "Not set"}
              </p>
              {imagePreview && typeof imagePreview === "string" && (
                <img
                  src={imagePreview}
                  alt="Location"
                  style={{
                    width: "100%",
                    borderRadius: "8px",
                    marginTop: "10px",
                    objectFit: "cover",
                  }}
                />
              )}
              <div className={styles.actions}>
                <button className={styles.confirmButton} onClick={handleConfirmStation}>
                  Confirm <FiChevronRight />
                </button>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const renderPreviewContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <div className={styles.previewBox}></div>
            <div className={styles.previewDetails}>
              <h3>{stationName || "Station Preview"}</h3>
              <p>{location || "Station location will appear here"}</p>
            </div>
          </>
        );

      case 2:
        return (
          <>
            <div className={styles.previewBox}>
              <iframe
                title="Location Preview Map"
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: "8px" }}
                loading="lazy"
                src={`https://www.google.com/maps?q=${latitude || 27.7172},${longitude || 85.3240}&z=15&output=embed`}
              />
            </div>
            <div className={styles.previewDetails}>
              <h3>Station Coordinates</h3>
              <p>Lat: {latitude || "Not set"} | Lng: {longitude || "Not set"}</p>
            </div>
          </>
        );

      case 3:
        return (
          <>
            <div className={styles.previewBox}>
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Location Preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    color: "#aaa",
                  }}
                >
                  <FaImage size={40} />
                  <p style={{ marginLeft: "10px" }}>Upload image to preview</p>
                </div>
              )}
            </div>
            <div className={styles.previewDetails}>
              <h3>Location Image</h3>
              <p>Preview of uploaded station image</p>
            </div>
          </>
        );

      case 4:
        return (
          <>
            <div className={styles.previewBox}>
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Final Preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
              ) : (
                <div
                  style={{
                    background: "#2f2f2f",
                    borderRadius: "8px",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#39ff14",
                  }}
                >
                  <FaCheckCircle size={50} />
                </div>
              )}
            </div>
            <div className={styles.previewDetails}>
              <h3>{stationName || "Station Ready"}</h3>
              <p>Review complete - ready to add station</p>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <div className={styles.header}>
          <h1>Station Details</h1>
          <p>Station / Add Station Details</p>
        </div>

        <div className={styles.progress}>
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNum = index + 1;
            return (
              <div
                key={stepNum}
                className={`${styles.progressStep} ${currentStep === stepNum ? styles.active : ""}`}
                onClick={() => handleStepClick(stepNum)}
                style={{ cursor: "pointer", userSelect: "none" }}
              >
                <span>{stepNum}</span>
                {stepNum === 1 && "Station Details"}
                {stepNum === 2 && "Station Location"}
                {stepNum === 3 && "Location Image"}
                {stepNum === 4 && "Completed"}
              </div>
            );
          })}
        </div>

        <div className={styles.formSection}>{renderStepContent()}</div>

        <div className={styles.navigationActions}>
          {currentStep > 1 && currentStep !== 4 && (
            <button className={styles.prevButton} onClick={handlePrevious}>
              <FiChevronLeft /> Previous
            </button>
          )}
          <div className={styles.rightNav}>
            {currentStep < totalSteps && currentStep !== 1 && currentStep !== 4 ? (
              <button className={styles.nextButton} onClick={handleNext}>
                Next <FiChevronRight />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className={styles.preview}>{renderPreviewContent()}</div>

      {showConfirmModal && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmPopup}>
            <h2>Confirm Station Addition</h2>
            <p>Are you sure you want to add this station? This action cannot be undone.</p>
            <div className={styles.confirmActions}>
              <button className={styles.cancelButton} onClick={handleCancelConfirm}>
                Cancel
              </button>
              <button className={styles.finalConfirmButton} onClick={handleFinalConfirm}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddStationPage;
