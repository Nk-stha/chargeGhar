import React, { useState, useRef } from "react";
import { FiUploadCloud, FiX, FiImage, FiVideo } from "react-icons/fi";
import { Media, MediaFileType } from "../../types/station.types";
import styles from "./ImageUpload.module.css";
import mediaService from "../../lib/api/media.service";

interface ImageUploadProps {
  onUploadComplete: (media: Media) => void;
  onRemove: (mediaId: string) => void;
  existingImages: Media[];
  maxFiles?: number;
  maxSizeMB?: number;
  label?: string;
  description?: string;
  accept?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onUploadComplete,
  onRemove,
  existingImages,
  maxFiles = 5,
  maxSizeMB = 10,
  label = "Station Media",
  description = "Upload images or videos of the charging station",
  accept = "image/jpeg,image/png,image/webp,video/mp4,video/webm"
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file type
    const validImageTypes = ["image/jpeg", "image/png", "image/webp"];
    const validVideoTypes = ["video/mp4", "video/webm"];
    
    if (!validImageTypes.includes(file.type) && !validVideoTypes.includes(file.type)) {
      return {
        valid: false,
        error: "Invalid file type. Please upload JPEG, PNG, WebP images or MP4, WebM videos.",
      };
    }

    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      return {
        valid: false,
        error: `File size exceeds ${maxSizeMB}MB limit.`,
      };
    }

    // Check max files limit
    if (existingImages.length >= maxFiles) {
      return {
        valid: false,
        error: `Maximum ${maxFiles} files allowed.`,
      };
    }

    return { valid: true };
  };

  const getFileType = (mimeType: string): MediaFileType => {
    if (mimeType.startsWith("video/")) return "VIDEO";
    return "IMAGE";
  };

  const handleFiles = async (fileList: FileList) => {
    setError(null);
    const file = fileList[0]; // Handle one file at a time for now

    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error || "Invalid file");
      return;
    }

    setIsUploading(true);

    try {
      const fileType = getFileType(file.type);
      
      const response = await mediaService.uploadMedia({
        file,
        file_type: fileType,
      });

      if (response && response.data) {
        onUploadComplete(response.data);
      } else {
         throw new Error("Invalid response from server");
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const renderPreview = (media: Media) => {
    const isVideo =
      media.media_type?.toUpperCase() === "VIDEO" ||
      media.file_type?.toUpperCase() === "VIDEO";

    if (isVideo) {
      return (
        <div className={styles.videoPreview}>
          <video src={media.file_url} controls className={styles.thumbnail} />
          <div className={styles.videoIconOverlay}>
            <FiVideo />
          </div>
        </div>
      );
    }
    return (
      <img
        src={media.thumbnail_url || media.file_url}
        alt={media.title}
        className={styles.thumbnail}
      />
    );
  };

  return (
    <div className={styles.container}>
      <label className={styles.label}>{label}</label>
      <p className={styles.description}>{description}</p>

      {/* Upload Area */}
      <div
        className={`${styles.dropZone} ${isDragging ? styles.dragging : ""} ${
          error ? styles.hasError : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className={styles.hiddenInput}
          accept={accept}
          onChange={handleFileInputChange}
          disabled={isUploading || existingImages.length >= maxFiles}
        />

        {isUploading ? (
          <div className={styles.uploadingContent}>
            <div className={styles.spinner}></div>
            <p>Uploading...</p>
          </div>
        ) : (
          <div className={styles.dropContent}>
            <FiUploadCloud className={styles.uploadIcon} />
            <p className={styles.dropText}>
              Click to upload or drag and drop
            </p>
            <p className={styles.supportText}>
              Images or Video (max {maxSizeMB}MB)
            </p>
          </div>
        )}
      </div>

      {error && <p className={styles.errorText}>{error}</p>}

      {/* Preview Grid */}
      {existingImages.length > 0 && (
        <div className={styles.previewGrid}>
          {existingImages.map((media) => (
            <div key={media.id} className={styles.previewItem}>
              {renderPreview(media)}
              
              <button
                className={styles.removeButton}
                onClick={() => onRemove(media.id)}
                aria-label="Remove media"
              >
                <FiX />
              </button>
              
              {media.is_primary && (
                <span className={styles.primaryBadge}>Primary</span>
              )}
            </div>
          ))}
        </div>
      )}
      
      <p className={styles.countText}>
        {existingImages.length} of {maxFiles} files uploaded
      </p>
    </div>
  );
};

export default ImageUpload;
