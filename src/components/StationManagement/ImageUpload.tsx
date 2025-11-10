"use client";

import React, { useState, useCallback, useEffect } from "react";
import { FiUpload, FiX, FiImage, FiCheck, FiLoader } from "react-icons/fi";
import mediaService from "../../lib/api/media.service";
import { Media, MediaFileType } from "../../types/station.types";
import styles from "./ImageUpload.module.css";

interface ImageUploadProps {
  onUploadComplete?: (media: Media) => void;
  onRemove?: (mediaId: string) => void;
  existingImages?: Media[];
  maxFiles?: number;
  maxSizeMB?: number;
  accept?: string;
  fileType?: MediaFileType;
  label?: string;
  description?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onUploadComplete,
  onRemove,
  existingImages = [],
  maxFiles = 5,
  maxSizeMB = 10,
  accept = "image/*",
  fileType = "IMAGE",
  label = "Upload Images",
  description = "Click or drag and drop to upload",
}) => {
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<{ file: File; preview: string }[]>(
    [],
  );
  const [uploadedMedia, setUploadedMedia] = useState<Media[]>(existingImages);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [deletingMediaId, setDeletingMediaId] = useState<string | null>(null);

  useEffect(() => {
    setUploadedMedia(existingImages);
  }, [existingImages]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      previews.forEach((p) => {
        try {
          URL.revokeObjectURL(p.preview);
        } catch (err) {
          // ignore
        }
      });
    };
  }, [previews]);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const validation = mediaService.validateFile(file, maxSizeMB);
    if (!validation.valid) {
      return validation;
    }

    // Check file type
    if (accept && !accept.includes("*")) {
      const acceptedTypes = accept.split(",").map((t) => t.trim());
      const fileType = file.type;
      const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;

      const isAccepted =
        acceptedTypes.some((type) => type === fileType) ||
        acceptedTypes.some((type) => type === fileExtension);

      if (!isAccepted) {
        return {
          valid: false,
          error: `File type not accepted. Accepted types: ${accept}`,
        };
      }
    }

    return { valid: true };
  };

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      setError(null);

      const totalFiles = uploadedMedia.length + previews.length + files.length;
      if (totalFiles > maxFiles) {
        setError(`Maximum ${maxFiles} files allowed`);
        return;
      }

      const newPreviews: { file: File; preview: string }[] = [];

      Array.from(files).forEach((file) => {
        const validation = validateFile(file);
        if (!validation.valid) {
          setError(validation.error || "Invalid file");
          return;
        }

        const preview = URL.createObjectURL(file);
        newPreviews.push({ file, preview });
      });

      setPreviews((prev) => [...prev, ...newPreviews]);
    },
    [uploadedMedia.length, previews.length, maxFiles],
  );

  const handleUpload = async () => {
    if (previews.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      for (const { file } of previews) {
        const response = await mediaService.uploadMedia({
          file,
          file_type: fileType,
        });

        if (response.success) {
          setUploadedMedia((prev) => [...prev, response.data]);
          onUploadComplete?.(response.data);
        }
      }

      // Clear previews after successful upload
      previews.forEach((p) => {
        try {
          URL.revokeObjectURL(p.preview);
        } catch (err) {
          // ignore
        }
      });
      setPreviews([]);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.response?.data?.message || "Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePreview = (index: number) => {
    setPreviews((prev) => {
      const newPreviews = [...prev];
      const removed = newPreviews.splice(index, 1)[0];
      try {
        URL.revokeObjectURL(removed.preview);
      } catch (err) {
        // ignore
      }
      return newPreviews;
    });
  };

  const handleRemoveUploaded = async (mediaId: string) => {
    const media = uploadedMedia.find((m) => m.id === mediaId);
    if (!media) return;

    // Confirm deletion
    if (
      !confirm(
        `Are you sure you want to delete "${media.title || "this image"}"?`,
      )
    ) {
      return;
    }

    setDeletingMediaId(mediaId);
    setError(null);

    try {
      // Call API to delete media from server
      await mediaService.deleteMedia(media.media_upload_id);

      // Remove from local state
      setUploadedMedia((prev) => prev.filter((m) => m.id !== mediaId));
      onRemove?.(mediaId);
    } catch (err: any) {
      console.error("Delete media error:", err);
      setError(err.response?.data?.message || "Failed to delete image");
    } finally {
      setDeletingMediaId(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const canUploadMore = uploadedMedia.length + previews.length < maxFiles;

  return (
    <div className={styles.imageUploadContainer}>
      <label className={styles.label}>{label}</label>
      {description && <p className={styles.description}>{description}</p>}

      {/* Upload Area */}
      {canUploadMore && (
        <div
          className={`${styles.uploadArea} ${dragActive ? styles.dragActive : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            className={styles.fileInput}
            multiple
            accept={accept}
            onChange={(e) => handleFileSelect(e.target.files)}
            disabled={uploading || !canUploadMore}
          />
          <label htmlFor="file-upload" className={styles.uploadLabel}>
            <FiUpload className={styles.uploadIcon} />
            <p>Click to upload or drag and drop</p>
            <p className={styles.uploadHint}>
              Max {maxFiles} files, {maxSizeMB}MB each
            </p>
          </label>
        </div>
      )}

      {/* Error Message */}
      {error && <div className={styles.error}>{error}</div>}

      {/* Preview Section */}
      {previews.length > 0 && (
        <div className={styles.previewSection}>
          <div className={styles.previewHeader}>
            <h4>Ready to Upload ({previews.length})</h4>
            <button
              className={styles.uploadButton}
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload All"}
            </button>
          </div>
          <div className={styles.previewGrid}>
            {previews.map((preview, index) => (
              <div key={index} className={styles.previewItem}>
                <img src={preview.preview} alt={`Preview ${index + 1}`} />
                <button
                  className={styles.removeButton}
                  onClick={() => handleRemovePreview(index)}
                  disabled={uploading}
                >
                  <FiX />
                </button>
                <div className={styles.fileName}>{preview.file.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded Images Section */}
      {uploadedMedia.length > 0 && (
        <div className={styles.uploadedSection}>
          <h4>
            <FiCheck className={styles.checkIcon} />
            Uploaded Images ({uploadedMedia.length})
          </h4>
          <div className={styles.uploadedGrid}>
            {uploadedMedia.map((media) => (
              <div key={media.id} className={styles.uploadedItem}>
                <img
                  src={media.thumbnail_url || media.file_url}
                  alt={media.title || media.original_name || "Station image"}
                />
                <button
                  className={styles.removeButton}
                  onClick={() => handleRemoveUploaded(media.id)}
                  disabled={deletingMediaId === media.id}
                >
                  {deletingMediaId === media.id ? (
                    <FiLoader className={styles.spinner} />
                  ) : (
                    <FiX />
                  )}
                </button>
                <div className={styles.fileName}>
                  {media.title || media.original_name || "Untitled"}
                </div>
                {media.is_primary && (
                  <div className={styles.primaryBadge}>Primary</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      {uploadedMedia.length === 0 && previews.length === 0 && (
        <div className={styles.emptyState}>
          <FiImage className={styles.emptyIcon} />
          <p>No images uploaded yet</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
