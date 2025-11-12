import { useState, useCallback, useEffect } from "react";
import { FieldValidation, validateForm, hasErrors } from "../lib/validation";

interface UseFormValidationOptions<T> {
  initialValues: T;
  validationRules: Record<keyof T, FieldValidation>;
  onSubmit: (values: T) => void | Promise<void>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

interface UseFormValidationReturn<T> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  handleChange: (
    field: keyof T,
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (field: keyof T) => () => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldError: (field: keyof T, error: string) => void;
  setFieldTouched: (field: keyof T, touched: boolean) => void;
  setErrors: (errors: Record<string, string>) => void;
  resetForm: () => void;
  validateField: (field: keyof T) => void;
  validateAllFields: () => boolean;
}

export function useFormValidation<T extends Record<string, any>>({
  initialValues,
  validationRules,
  onSubmit,
  validateOnChange = false,
  validateOnBlur = true,
}: UseFormValidationOptions<T>): UseFormValidationReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate a single field
  const validateField = useCallback(
    (field: keyof T) => {
      const fieldValidation = validationRules[field];
      if (!fieldValidation) return;

      const fieldErrors = validateForm(
        { [field]: values[field] },
        { [field]: fieldValidation },
      );

      setErrors((prev) => {
        const newErrors = { ...prev };
        if (fieldErrors[field as string]) {
          newErrors[field as string] = fieldErrors[field as string];
        } else {
          delete newErrors[field as string];
        }
        return newErrors;
      });
    },
    [values, validationRules],
  );

  // Validate all fields
  const validateAllFields = useCallback((): boolean => {
    const allErrors = validateForm(values, validationRules);
    setErrors(allErrors);
    return !hasErrors(allErrors);
  }, [values, validationRules]);

  // Check if form is valid
  const isValid = !hasErrors(errors);

  // Handle field change
  const handleChange = useCallback(
    (field: keyof T) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { value, type } = e.target;
        let finalValue: any = value;

        // Handle different input types
        if (type === "checkbox") {
          finalValue = (e.target as HTMLInputElement).checked;
        } else if (type === "number") {
          finalValue = value === "" ? "" : parseFloat(value);
        }

        setValues((prev) => ({
          ...prev,
          [field]: finalValue,
        }));

        // Validate on change if enabled
        if (validateOnChange) {
          setTimeout(() => {
            validateField(field);
          }, 0);
        }
      },
    [validateOnChange, validateField],
  );

  // Handle field blur
  const handleBlur = useCallback(
    (field: keyof T) => () => {
      setTouched((prev) => ({
        ...prev,
        [field]: true,
      }));

      // Validate on blur if enabled
      if (validateOnBlur) {
        validateField(field);
      }
    },
    [validateOnBlur, validateField],
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      // Mark all fields as touched
      const allTouched = Object.keys(values).reduce(
        (acc, key) => {
          acc[key] = true;
          return acc;
        },
        {} as Record<string, boolean>,
      );
      setTouched(allTouched);

      // Validate all fields
      const isFormValid = validateAllFields();

      if (!isFormValid) {
        return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (error) {
        console.error("Form submission error:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validateAllFields, onSubmit],
  );

  // Set field value programmatically
  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Set field error programmatically
  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({
      ...prev,
      [field as string]: error,
    }));
  }, []);

  // Set field touched programmatically
  const setFieldTouched = useCallback((field: keyof T, isTouched: boolean) => {
    setTouched((prev) => ({
      ...prev,
      [field as string]: isTouched,
    }));
  }, []);

  // Set multiple errors
  const setErrorsMultiple = useCallback((newErrors: Record<string, string>) => {
    setErrors(newErrors);
  }, []);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    setErrors: setErrorsMultiple,
    resetForm,
    validateField,
    validateAllFields,
  };
}

// Helper hook for simple validation without form management
export function useFieldValidation<T>(
  value: T,
  validation: FieldValidation,
): {
  error: string | null;
  isValid: boolean;
  validate: () => void;
} {
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback(() => {
    const errors = validateForm({ field: value }, { field: validation });
    setError(errors.field || null);
  }, [value, validation]);

  useEffect(() => {
    validate();
  }, [validate]);

  return {
    error,
    isValid: !error,
    validate,
  };
}

export default useFormValidation;
