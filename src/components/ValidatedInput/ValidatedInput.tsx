import React, { forwardRef } from "react";
import { FiAlertCircle } from "react-icons/fi";
import styles from "./ValidatedInput.module.css";

export interface ValidatedInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  error?: string;
  touched?: boolean;
  helperText?: string;
  required?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  containerClassName?: string;
  showError?: boolean;
}

export interface ValidatedTextAreaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> {
  label?: string;
  error?: string;
  touched?: boolean;
  helperText?: string;
  required?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: () => void;
  containerClassName?: string;
  showError?: boolean;
}

export interface ValidatedSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  label?: string;
  error?: string;
  touched?: boolean;
  helperText?: string;
  required?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: () => void;
  containerClassName?: string;
  showError?: boolean;
  options: Array<{ value: string | number; label: string }>;
  placeholder?: string;
}

export const ValidatedInput = forwardRef<HTMLInputElement, ValidatedInputProps>(
  (
    {
      label,
      error,
      touched,
      helperText,
      required,
      containerClassName,
      className,
      showError = true,
      ...props
    },
    ref,
  ) => {
    const hasError = touched && error && showError;

    return (
      <div className={`${styles.container} ${containerClassName || ""}`}>
        {label && (
          <label htmlFor={props.id || props.name} className={styles.label}>
            {label}
            {required && <span className={styles.required}>*</span>}
          </label>
        )}
        <div className={styles.inputWrapper}>
          <input
            ref={ref}
            className={`${styles.input} ${hasError ? styles.inputError : ""} ${className || ""}`}
            aria-invalid={hasError ? "true" : undefined}
            aria-describedby={
              hasError
                ? `${props.id || props.name}-error`
                : helperText
                  ? `${props.id || props.name}-helper`
                  : undefined
            }
            {...props}
          />
        </div>
        {hasError && (
          <div
            id={`${props.id || props.name}-error`}
            className={styles.errorMessage}
            role="alert"
          >
            <FiAlertCircle className={styles.errorIcon} />
            <span>{error}</span>
          </div>
        )}
        {!hasError && helperText && (
          <div
            id={`${props.id || props.name}-helper`}
            className={styles.helperText}
          >
            {helperText}
          </div>
        )}
      </div>
    );
  },
);

ValidatedInput.displayName = "ValidatedInput";

export const ValidatedTextArea = forwardRef<
  HTMLTextAreaElement,
  ValidatedTextAreaProps
>(
  (
    {
      label,
      error,
      touched,
      helperText,
      required,
      containerClassName,
      className,
      showError = true,
      ...props
    },
    ref,
  ) => {
    const hasError = touched && error && showError;

    return (
      <div className={`${styles.container} ${containerClassName || ""}`}>
        {label && (
          <label htmlFor={props.id || props.name} className={styles.label}>
            {label}
            {required && <span className={styles.required}>*</span>}
          </label>
        )}
        <div className={styles.inputWrapper}>
          <textarea
            ref={ref}
            className={`${styles.textarea} ${hasError ? styles.inputError : ""} ${className || ""}`}
            aria-invalid={hasError ? "true" : undefined}
            aria-describedby={
              hasError
                ? `${props.id || props.name}-error`
                : helperText
                  ? `${props.id || props.name}-helper`
                  : undefined
            }
            {...props}
          />
        </div>
        {hasError && (
          <div
            id={`${props.id || props.name}-error`}
            className={styles.errorMessage}
            role="alert"
          >
            <FiAlertCircle className={styles.errorIcon} />
            <span>{error}</span>
          </div>
        )}
        {!hasError && helperText && (
          <div
            id={`${props.id || props.name}-helper`}
            className={styles.helperText}
          >
            {helperText}
          </div>
        )}
      </div>
    );
  },
);

ValidatedTextArea.displayName = "ValidatedTextArea";

export const ValidatedSelect = forwardRef<
  HTMLSelectElement,
  ValidatedSelectProps
>(
  (
    {
      label,
      error,
      touched,
      helperText,
      required,
      containerClassName,
      className,
      showError = true,
      options,
      placeholder,
      ...props
    },
    ref,
  ) => {
    const hasError = touched && error && showError;

    return (
      <div className={`${styles.container} ${containerClassName || ""}`}>
        {label && (
          <label htmlFor={props.id || props.name} className={styles.label}>
            {label}
            {required && <span className={styles.required}>*</span>}
          </label>
        )}
        <div className={styles.inputWrapper}>
          <select
            ref={ref}
            className={`${styles.select} ${hasError ? styles.inputError : ""} ${className || ""}`}
            aria-invalid={hasError ? "true" : undefined}
            aria-describedby={
              hasError
                ? `${props.id || props.name}-error`
                : helperText
                  ? `${props.id || props.name}-helper`
                  : undefined
            }
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {hasError && (
          <div
            id={`${props.id || props.name}-error`}
            className={styles.errorMessage}
            role="alert"
          >
            <FiAlertCircle className={styles.errorIcon} />
            <span>{error}</span>
          </div>
        )}
        {!hasError && helperText && (
          <div
            id={`${props.id || props.name}-helper`}
            className={styles.helperText}
          >
            {helperText}
          </div>
        )}
      </div>
    );
  },
);

ValidatedSelect.displayName = "ValidatedSelect";

export default ValidatedInput;
