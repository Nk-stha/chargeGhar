import { AxiosError } from "axios";

/**
 * Structured API error returned by extractApiError.
 */
export interface ApiError {
    /** Human-readable top-level error message */
    message: string;
    /** Per-field validation errors, e.g. { contact_phone: ["This field is required."] } */
    fieldErrors?: Record<string, string[]>;
    /** HTTP status code (undefined for network errors) */
    statusCode?: number;
    /** Raw error code from server, e.g. "NO_DASHBOARD_ACCESS" */
    errorCode?: string;
}

/**
 * Extract a structured error from any Axios error (or generic error).
 * Handles all server response shapes observed in the Partner Management API:
 *
 * - { message: "..." }
 * - { error: "..." } or { error: { message: "...", code: "..." } }
 * - { detail: "..." }              — DRF-style
 * - { errors: { field: ["..."] } } — field-level validation
 * - { field_name: ["..."] }        — flat DRF validation
 * - plain string body
 * - network / timeout errors
 */
export function extractApiError(
    err: unknown,
    fallbackMessage = "An unexpected error occurred. Please try again."
): ApiError {
    // Non-Axios errors
    if (!isAxiosError(err)) {
        if (err instanceof Error) {
            return { message: err.message };
        }
        return { message: fallbackMessage };
    }

    const axiosErr = err as AxiosError<any>;
    const statusCode = axiosErr.response?.status;
    const data = axiosErr.response?.data;

    // Network / timeout (no response)
    if (!axiosErr.response) {
        if (axiosErr.code === "ECONNABORTED") {
            return {
                message: "Request timed out. Please check your connection and try again.",
                statusCode: undefined,
            };
        }
        return {
            message: "Network error. Please check your internet connection.",
            statusCode: undefined,
        };
    }

    // No data in response
    if (!data) {
        return {
            message: getStatusMessage(statusCode) || fallbackMessage,
            statusCode,
        };
    }

    // Plain string body
    if (typeof data === "string") {
        return { message: data || fallbackMessage, statusCode };
    }

    const result: ApiError = {
        message: fallbackMessage,
        statusCode,
    };

    // Extract top-level message from various shapes
    if (data.message && typeof data.message === "string") {
        result.message = data.message;
    } else if (data.detail && typeof data.detail === "string") {
        result.message = data.detail;
    } else if (data.error) {
        if (typeof data.error === "string") {
            result.message = data.error;
        } else if (typeof data.error === "object") {
            if (data.error.message) {
                result.message = data.error.message;
            }
            if (data.error.code) {
                result.errorCode = data.error.code;
            }
        }
    }

    // Extract field-level errors
    const fieldErrors = extractFieldErrors(data);
    if (fieldErrors && Object.keys(fieldErrors).length > 0) {
        result.fieldErrors = fieldErrors;

        // If top-level message is still the fallback, build one from field errors
        if (result.message === fallbackMessage) {
            const firstField = Object.keys(fieldErrors)[0];
            const firstError = fieldErrors[firstField][0];
            result.message = `${formatFieldName(firstField)}: ${firstError}`;
        }
    }

    // If still fallback, use a status-based message
    if (result.message === fallbackMessage) {
        const statusMsg = getStatusMessage(statusCode);
        if (statusMsg) {
            result.message = statusMsg;
        }
    }

    return result;
}

/**
 * Extract field-level errors from the response data.
 * Handles:
 *  - { errors: { field: ["msg", ...] } }
 *  - { field: ["msg", ...] } (flat DRF validation, excluding known top-level keys)
 */
function extractFieldErrors(data: any): Record<string, string[]> | undefined {
    const fieldErrors: Record<string, string[]> = {};

    // Explicit `errors` object
    if (data.errors && typeof data.errors === "object" && !Array.isArray(data.errors)) {
        for (const [key, val] of Object.entries(data.errors)) {
            fieldErrors[key] = normalizeMessages(val);
        }
        return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined;
    }

    // Flat DRF-style: top-level keys whose values are arrays of strings
    const skipKeys = new Set([
        "message", "detail", "error", "errors", "success",
        "status", "code", "data", "non_field_errors",
    ]);

    for (const [key, val] of Object.entries(data)) {
        if (skipKeys.has(key)) continue;
        if (Array.isArray(val) && val.length > 0 && typeof val[0] === "string") {
            fieldErrors[key] = val as string[];
        }
    }

    // Handle non_field_errors (DRF convention)
    if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
        fieldErrors["_general"] = data.non_field_errors;
    }

    return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined;
}

/** Normalize a value to an array of strings */
function normalizeMessages(val: unknown): string[] {
    if (Array.isArray(val)) {
        return val.map((v) => (typeof v === "string" ? v : String(v)));
    }
    if (typeof val === "string") {
        return [val];
    }
    return [String(val)];
}

/** Convert snake_case field name to human-readable */
function formatFieldName(field: string): string {
    return field
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Map HTTP status codes to user-friendly messages */
function getStatusMessage(status?: number): string | null {
    switch (status) {
        case 400:
            return "Invalid request. Please check your input and try again.";
        case 401:
            return "Your session has expired. Please log in again.";
        case 403:
            return "You don't have permission to perform this action.";
        case 404:
            return "The requested resource was not found.";
        case 409:
            return "A conflict occurred. The resource may have been modified.";
        case 422:
            return "Validation failed. Please check your input.";
        case 429:
            return "Too many requests. Please wait a moment and try again.";
        case 500:
            return "Server error. Please try again later.";
        case 502:
        case 503:
            return "Service temporarily unavailable. Please try again later.";
        default:
            return null;
    }
}

/** Type guard for AxiosError */
function isAxiosError(error: unknown): error is AxiosError {
    return (
        typeof error === "object" &&
        error !== null &&
        "isAxiosError" in error &&
        (error as AxiosError).isAxiosError === true
    );
}
