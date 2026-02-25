"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import styles from "./edit.module.css";
import { FiArrowLeft, FiSave } from "react-icons/fi";
import { contentPageService } from "../../../../../lib/api/content-page.service";
import { PageType } from "../../../../../types/content-page.types";

const RichTextEditor = dynamic(
  () => import("../../../../../components/RichTextEditor/RichTextEditor"),
  {
    ssr: false,
    loading: () => (
      <div style={{ padding: "2rem", background: "#1a1a1a", borderRadius: "8px", color: "#999", textAlign: "center" }}>
        Loading editor...
      </div>
    ),
  }
);

export default function EditContentPagePage() {
  const params = useParams();
  const router = useRouter();
  const pageType = params.page_type as PageType;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    is_active: true,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        const response = await contentPageService.getContentPageByType(pageType);
        
        if (response.success && response.data) {
          setFormData({
            title: response.data.title,
            content: response.data.content,
            is_active: response.data.is_active,
          });
        }
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to load page");
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [pageType]);

  const stripHtmlTags = (html: string): string => {
    return html.replace(/<[^>]*>/g, "").trim();
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = "Title is required";
    }

    if (!stripHtmlTags(formData.content)) {
      errors.content = "Content is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      const response = await contentPageService.updateContentPage(pageType, {
        page_type: pageType,
        title: formData.title.trim(),
        content: formData.content.trim(),
        is_active: formData.is_active,
      });

      if (response.success) {
        toast.success("Page updated successfully");
        router.push("/dashboard/settings/pages");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update page");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p>Loading page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={() => router.back()} className={styles.backBtn}>
          <FiArrowLeft /> Back
        </button>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>
            {contentPageService.getPageTypeIcon(pageType)} Edit{" "}
            {contentPageService.getPageTypeLabel(pageType)}
          </h1>
          <p className={styles.subtitle}>Update page content and settings</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Page Type <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            className={styles.inputDisabled}
            value={contentPageService.getPageTypeLabel(pageType)}
            disabled
          />
          <span className={styles.helpText}>Page type cannot be changed</span>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Title <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            className={`${styles.input} ${formErrors.title ? styles.inputError : ""}`}
            placeholder="Enter page title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          {formErrors.title && (
            <span className={styles.errorMessage}>{formErrors.title}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Content <span className={styles.required}>*</span>
          </label>
          <RichTextEditor
            content={formData.content}
            onChange={(html) => setFormData({ ...formData, content: html })}
            placeholder="Write your page content here..."
            error={!!formErrors.content}
          />
          {formErrors.content && (
            <span className={styles.errorMessage}>{formErrors.content}</span>
          )}
          <div className={styles.contentInfo}>
            <span className={styles.charCount}>{formData.content.length} characters</span>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            />
            <span>Active (Display this page to users)</span>
          </label>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => router.back()}
            className={styles.cancelBtn}
            disabled={saving}
          >
            Cancel
          </button>
          <button type="submit" className={styles.submitBtn} disabled={saving}>
            <FiSave /> {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
