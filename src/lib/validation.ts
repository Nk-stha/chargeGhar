/**
 * Validation Utilities for ChargeGhar Dashboard
 * Based on backend API validation rules
 */

// ============================================================================
// Type Definitions
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => ValidationResult;
}

// ============================================================================
// Enums matching backend choices
// ============================================================================

export const AdminRoles = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  MODERATOR: "MODERATOR",
} as const;

export const UserStatus = {
  ACTIVE: "ACTIVE",
  BANNED: "BANNED",
  INACTIVE: "INACTIVE",
} as const;

export const KYCStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export const StationStatus = {
  ONLINE: "ONLINE",
  OFFLINE: "OFFLINE",
  MAINTENANCE: "MAINTENANCE",
} as const;

export const RentalStatus = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  OVERDUE: "OVERDUE",
} as const;

export const TransactionType = {
  TOPUP: "TOPUP",
  RENTAL: "RENTAL",
  RENTAL_DUE: "RENTAL_DUE",
  REFUND: "REFUND",
  FINE: "FINE",
} as const;

export const CouponStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  EXPIRED: "EXPIRED",
} as const;

export const PackageType = {
  HOURLY: "HOURLY",
  DAILY: "DAILY",
  WEEKLY: "WEEKLY",
  MONTHLY: "MONTHLY",
} as const;

export const PaymentModel = {
  PREPAID: "PREPAID",
  POSTPAID: "POSTPAID",
} as const;

export const IssuePriority = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
} as const;

export const IssueStatus = {
  REPORTED: "REPORTED",
  ACKNOWLEDGED: "ACKNOWLEDGED",
  IN_PROGRESS: "IN_PROGRESS",
  RESOLVED: "RESOLVED",
} as const;

export const WithdrawalStatus = {
  REQUESTED: "REQUESTED",
  APPROVED: "APPROVED",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
} as const;

export const TargetAudience = {
  ALL: "ALL",
  ACTIVE: "ACTIVE",
  PREMIUM: "PREMIUM",
  NEW: "NEW",
  INACTIVE: "INACTIVE",
} as const;

export const RemoteCommand = {
  REBOOT: "REBOOT",
  UNLOCK_SLOT: "UNLOCK_SLOT",
  LOCK_SLOT: "LOCK_SLOT",
  UPDATE_FIRMWARE: "UPDATE_FIRMWARE",
  SYNC_TIME: "SYNC_TIME",
  CLEAR_CACHE: "CLEAR_CACHE",
  RESET_HARDWARE: "RESET_HARDWARE",
} as const;

export const AnalyticsPeriod = {
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
} as const;

// ============================================================================
// Basic Validators
// ============================================================================

export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim() === "") {
    return { isValid: false, error: "Email is required" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Invalid email format" };
  }

  return { isValid: true };
};

export const validatePassword = (
  password: string,
  minLength: number = 8,
  maxLength: number = 128,
): ValidationResult => {
  if (!password || password.trim() === "") {
    return { isValid: false, error: "Password is required" };
  }

  if (password.length < minLength) {
    return {
      isValid: false,
      error: `Password must be at least ${minLength} characters`,
    };
  }

  if (password.length > maxLength) {
    return {
      isValid: false,
      error: `Password must not exceed ${maxLength} characters`,
    };
  }

  return { isValid: true };
};

export const validateRequired = (
  value: any,
  fieldName: string = "This field",
): ValidationResult => {
  if (value === null || value === undefined || value === "") {
    return { isValid: false, error: `${fieldName} is required` };
  }

  if (typeof value === "string" && value.trim() === "") {
    return { isValid: false, error: `${fieldName} is required` };
  }

  return { isValid: true };
};

export const validateStringLength = (
  value: string,
  minLength?: number,
  maxLength?: number,
  fieldName: string = "This field",
): ValidationResult => {
  if (minLength && value.length < minLength) {
    return {
      isValid: false,
      error: `${fieldName} must be at least ${minLength} characters`,
    };
  }

  if (maxLength && value.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} must not exceed ${maxLength} characters`,
    };
  }

  return { isValid: true };
};

export const validateNumber = (
  value: number,
  min?: number,
  max?: number,
  fieldName: string = "This field",
): ValidationResult => {
  if (isNaN(value)) {
    return { isValid: false, error: `${fieldName} must be a valid number` };
  }

  if (min !== undefined && value < min) {
    return {
      isValid: false,
      error: `${fieldName} must be at least ${min}`,
    };
  }

  if (max !== undefined && value > max) {
    return {
      isValid: false,
      error: `${fieldName} must not exceed ${max}`,
    };
  }

  return { isValid: true };
};

export const validateDecimal = (
  value: number,
  min?: number,
  max?: number,
  fieldName: string = "Amount",
): ValidationResult => {
  if (isNaN(value)) {
    return { isValid: false, error: `${fieldName} must be a valid number` };
  }

  if (min !== undefined && value < min) {
    return {
      isValid: false,
      error: `${fieldName} must be at least ${min}`,
    };
  }

  if (max !== undefined && value > max) {
    return {
      isValid: false,
      error: `${fieldName} must not exceed ${max}`,
    };
  }

  return { isValid: true };
};

export const validateChoice = (
  value: string,
  choices: readonly string[],
  fieldName: string = "This field",
): ValidationResult => {
  if (!choices.includes(value)) {
    return {
      isValid: false,
      error: `${fieldName} must be one of: ${choices.join(", ")}`,
    };
  }

  return { isValid: true };
};

export const validateDate = (
  value: string | Date,
  fieldName: string = "Date",
): ValidationResult => {
  const date = typeof value === "string" ? new Date(value) : value;

  if (isNaN(date.getTime())) {
    return { isValid: false, error: `${fieldName} must be a valid date` };
  }

  return { isValid: true };
};

export const validateDateRange = (
  startDate: string | Date,
  endDate: string | Date,
): ValidationResult => {
  const start = typeof startDate === "string" ? new Date(startDate) : startDate;
  const end = typeof endDate === "string" ? new Date(endDate) : endDate;

  if (start >= end) {
    return {
      isValid: false,
      error: "End date must be after start date",
    };
  }

  return { isValid: true };
};

export const validateAlphanumeric = (
  value: string,
  allowDash: boolean = true,
  allowUnderscore: boolean = true,
  fieldName: string = "This field",
): ValidationResult => {
  let pattern = "a-zA-Z0-9";
  if (allowDash) pattern += "-";
  if (allowUnderscore) pattern += "_";

  const regex = new RegExp(`^[${pattern}]+$`);

  if (!regex.test(value)) {
    return {
      isValid: false,
      error: `${fieldName} must contain only alphanumeric characters${allowDash ? ", dashes" : ""}${allowUnderscore ? ", and underscores" : ""}`,
    };
  }

  return { isValid: true };
};

export const validateLatitude = (lat: number): ValidationResult => {
  if (isNaN(lat)) {
    return { isValid: false, error: "Latitude must be a valid number" };
  }

  if (lat < -90 || lat > 90) {
    return {
      isValid: false,
      error: "Latitude must be between -90 and 90",
    };
  }

  return { isValid: true };
};

export const validateLongitude = (lng: number): ValidationResult => {
  if (isNaN(lng)) {
    return { isValid: false, error: "Longitude must be a valid number" };
  }

  if (lng < -180 || lng > 180) {
    return {
      isValid: false,
      error: "Longitude must be between -180 and 180",
    };
  }

  return { isValid: true };
};

export const validateUUID = (
  value: string,
  fieldName: string = "ID",
): ValidationResult => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(value)) {
    return { isValid: false, error: `${fieldName} must be a valid UUID` };
  }

  return { isValid: true };
};

// ============================================================================
// Form Validators - Authentication
// ============================================================================

export const validateLoginForm = (data: {
  email: string;
  password: string;
}): Record<string, string> => {
  const errors: Record<string, string> = {};

  const emailResult = validateEmail(data.email);
  if (!emailResult.isValid) {
    errors.email = emailResult.error!;
  }

  const passwordResult = validateRequired(data.password, "Password");
  if (!passwordResult.isValid) {
    errors.password = passwordResult.error!;
  }

  return errors;
};

// ============================================================================
// Form Validators - Admin Profile Management
// ============================================================================

export const validateCreateAdminProfile = (data: {
  user: number;
  role: string;
  password: string;
}): Record<string, string> => {
  const errors: Record<string, string> = {};

  const userResult = validateRequired(data.user, "User");
  if (!userResult.isValid) {
    errors.user = userResult.error!;
  }

  const roleResult = validateChoice(
    data.role,
    Object.values(AdminRoles),
    "Role",
  );
  if (!roleResult.isValid) {
    errors.role = roleResult.error!;
  }

  const passwordResult = validatePassword(data.password);
  if (!passwordResult.isValid) {
    errors.password = passwordResult.error!;
  }

  return errors;
};

export const validateUpdateAdminProfile = (data: {
  role?: string;
  new_password?: string;
  is_active?: boolean;
  reason?: string;
}): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (data.role) {
    const roleResult = validateChoice(
      data.role,
      Object.values(AdminRoles),
      "Role",
    );
    if (!roleResult.isValid) {
      errors.role = roleResult.error!;
    }
  }

  if (data.new_password) {
    const passwordResult = validatePassword(data.new_password);
    if (!passwordResult.isValid) {
      errors.new_password = passwordResult.error!;
    }
  }

  if (data.reason) {
    const reasonResult = validateStringLength(data.reason, 0, 500, "Reason");
    if (!reasonResult.isValid) {
      errors.reason = reasonResult.error!;
    }
  }

  return errors;
};

export const validateUpdatePassword = (data: {
  new_password: string;
}): Record<string, string> => {
  const errors: Record<string, string> = {};

  const passwordResult = validatePassword(data.new_password);
  if (!passwordResult.isValid) {
    errors.new_password = passwordResult.error!;
  }

  return errors;
};

// ============================================================================
// Form Validators - User Management
// ============================================================================

export const validateUpdateUserStatus = (data: {
  status: string;
  reason: string;
}): Record<string, string> => {
  const errors: Record<string, string> = {};

  const statusResult = validateChoice(
    data.status,
    Object.values(UserStatus),
    "Status",
  );
  if (!statusResult.isValid) {
    errors.status = statusResult.error!;
  }

  const reasonResult = validateRequired(data.reason, "Reason");
  if (!reasonResult.isValid) {
    errors.reason = reasonResult.error!;
  } else {
    const lengthResult = validateStringLength(data.reason, 0, 500, "Reason");
    if (!lengthResult.isValid) {
      errors.reason = lengthResult.error!;
    }
  }

  return errors;
};

export const validateAddUserBalance = (data: {
  amount: number;
  reason: string;
}): Record<string, string> => {
  const errors: Record<string, string> = {};

  const amountResult = validateDecimal(data.amount, 0.01, undefined, "Amount");
  if (!amountResult.isValid) {
    errors.amount = amountResult.error!;
  }

  const reasonResult = validateRequired(data.reason, "Reason");
  if (!reasonResult.isValid) {
    errors.reason = reasonResult.error!;
  } else {
    const lengthResult = validateStringLength(data.reason, 0, 500, "Reason");
    if (!lengthResult.isValid) {
      errors.reason = lengthResult.error!;
    }
  }

  return errors;
};

// ============================================================================
// Form Validators - KYC Management
// ============================================================================

export const validateUpdateKYCStatus = (data: {
  status: string;
  rejection_reason?: string;
}): Record<string, string> => {
  const errors: Record<string, string> = {};

  const validStatuses = [KYCStatus.APPROVED, KYCStatus.REJECTED];
  const statusResult = validateChoice(data.status, validStatuses, "Status");
  if (!statusResult.isValid) {
    errors.status = statusResult.error!;
  }

  if (data.status === KYCStatus.REJECTED) {
    const reasonResult = validateRequired(
      data.rejection_reason,
      "Rejection reason",
    );
    if (!reasonResult.isValid) {
      errors.rejection_reason = reasonResult.error!;
    } else {
      const lengthResult = validateStringLength(
        data.rejection_reason!,
        0,
        500,
        "Rejection reason",
      );
      if (!lengthResult.isValid) {
        errors.rejection_reason = lengthResult.error!;
      }
    }
  }

  return errors;
};

// ============================================================================
// Form Validators - Refund Management
// ============================================================================

export const validateProcessRefund = (data: {
  action: string;
  admin_notes?: string;
}): Record<string, string> => {
  const errors: Record<string, string> = {};

  const actionResult = validateChoice(
    data.action,
    ["APPROVE", "REJECT"],
    "Action",
  );
  if (!actionResult.isValid) {
    errors.action = actionResult.error!;
  }

  if (data.admin_notes) {
    const notesResult = validateStringLength(
      data.admin_notes,
      0,
      1000,
      "Admin notes",
    );
    if (!notesResult.isValid) {
      errors.admin_notes = notesResult.error!;
    }
  }

  return errors;
};

// ============================================================================
// Form Validators - Station Management
// ============================================================================

export const validateToggleMaintenance = (data: {
  is_maintenance: boolean;
  reason: string;
}): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (typeof data.is_maintenance !== "boolean") {
    errors.is_maintenance = "Maintenance status is required";
  }

  const reasonResult = validateRequired(data.reason, "Reason");
  if (!reasonResult.isValid) {
    errors.reason = reasonResult.error!;
  } else {
    const lengthResult = validateStringLength(data.reason, 0, 500, "Reason");
    if (!lengthResult.isValid) {
      errors.reason = lengthResult.error!;
    }
  }

  return errors;
};

export const validateRemoteCommand = (data: {
  command: string;
  parameters?: Record<string, any>;
}): Record<string, string> => {
  const errors: Record<string, string> = {};

  const commandResult = validateChoice(
    data.command,
    Object.values(RemoteCommand),
    "Command",
  );
  if (!commandResult.isValid) {
    errors.command = commandResult.error!;
  }

  return errors;
};

// ============================================================================
// Form Validators - Notification Management
// ============================================================================

export const validateBroadcastNotification = (data: {
  title: string;
  message: string;
  target_audience: string;
  send_push?: boolean;
  send_email?: boolean;
}): Record<string, string> => {
  const errors: Record<string, string> = {};

  const titleResult = validateRequired(data.title, "Title");
  if (!titleResult.isValid) {
    errors.title = titleResult.error!;
  } else {
    const lengthResult = validateStringLength(data.title, 0, 200, "Title");
    if (!lengthResult.isValid) {
      errors.title = lengthResult.error!;
    }
  }

  const messageResult = validateRequired(data.message, "Message");
  if (!messageResult.isValid) {
    errors.message = messageResult.error!;
  } else {
    const lengthResult = validateStringLength(data.message, 0, 1000, "Message");
    if (!lengthResult.isValid) {
      errors.message = lengthResult.error!;
    }
  }

  const audienceResult = validateChoice(
    data.target_audience,
    Object.values(TargetAudience),
    "Target audience",
  );
  if (!audienceResult.isValid) {
    errors.target_audience = audienceResult.error!;
  }

  return errors;
};

// ============================================================================
// Form Validators - Withdrawal Management
// ============================================================================

export const validateProcessWithdrawal = (data: {
  action: string;
  admin_notes?: string;
}): Record<string, string> => {
  const errors: Record<string, string> = {};

  const actionResult = validateChoice(
    data.action,
    ["APPROVE", "REJECT"],
    "Action",
  );
  if (!actionResult.isValid) {
    errors.action = actionResult.error!;
  }

  if (data.action === "REJECT" && data.admin_notes) {
    const notesResult = validateStringLength(
      data.admin_notes,
      5,
      1000,
      "Admin notes",
    );
    if (!notesResult.isValid) {
      errors.admin_notes = notesResult.error!;
    }
  } else if (data.admin_notes) {
    const notesResult = validateStringLength(
      data.admin_notes,
      0,
      1000,
      "Admin notes",
    );
    if (!notesResult.isValid) {
      errors.admin_notes = notesResult.error!;
    }
  }

  return errors;
};

// ============================================================================
// Form Validators - Coupon Management
// ============================================================================

export const validateCreateCoupon = (data: {
  code: string;
  name: string;
  points_value: number;
  max_uses_per_user?: number;
  valid_from: string | Date;
  valid_until: string | Date;
}): Record<string, string> => {
  const errors: Record<string, string> = {};

  const codeResult = validateRequired(data.code, "Code");
  if (!codeResult.isValid) {
    errors.code = codeResult.error!;
  } else {
    const lengthResult = validateStringLength(data.code, 0, 50, "Code");
    if (!lengthResult.isValid) {
      errors.code = lengthResult.error!;
    } else {
      const alphaResult = validateAlphanumeric(data.code, true, true, "Code");
      if (!alphaResult.isValid) {
        errors.code = alphaResult.error!;
      }
    }
  }

  const nameResult = validateRequired(data.name, "Name");
  if (!nameResult.isValid) {
    errors.name = nameResult.error!;
  } else {
    const lengthResult = validateStringLength(data.name, 0, 200, "Name");
    if (!lengthResult.isValid) {
      errors.name = lengthResult.error!;
    }
  }

  const pointsResult = validateNumber(
    data.points_value,
    1,
    undefined,
    "Points value",
  );
  if (!pointsResult.isValid) {
    errors.points_value = pointsResult.error!;
  }

  if (data.max_uses_per_user) {
    const maxUsesResult = validateNumber(
      data.max_uses_per_user,
      1,
      undefined,
      "Max uses per user",
    );
    if (!maxUsesResult.isValid) {
      errors.max_uses_per_user = maxUsesResult.error!;
    }
  }

  const validFromResult = validateDate(data.valid_from, "Valid from");
  if (!validFromResult.isValid) {
    errors.valid_from = validFromResult.error!;
  }

  const validUntilResult = validateDate(data.valid_until, "Valid until");
  if (!validUntilResult.isValid) {
    errors.valid_until = validUntilResult.error!;
  }

  if (validFromResult.isValid && validUntilResult.isValid) {
    const rangeResult = validateDateRange(data.valid_from, data.valid_until);
    if (!rangeResult.isValid) {
      errors.valid_until = rangeResult.error!;
    }
  }

  return errors;
};

export const validateBulkCreateCoupon = (data: {
  name_prefix: string;
  points_value: number;
  max_uses_per_user?: number;
  valid_from: string | Date;
  valid_until: string | Date;
  quantity: number;
  code_length?: number;
}): Record<string, string> => {
  const errors: Record<string, string> = {};

  const prefixResult = validateRequired(data.name_prefix, "Name prefix");
  if (!prefixResult.isValid) {
    errors.name_prefix = prefixResult.error!;
  } else {
    const lengthResult = validateStringLength(
      data.name_prefix,
      0,
      100,
      "Name prefix",
    );
    if (!lengthResult.isValid) {
      errors.name_prefix = lengthResult.error!;
    }
  }

  const pointsResult = validateNumber(
    data.points_value,
    1,
    undefined,
    "Points value",
  );
  if (!pointsResult.isValid) {
    errors.points_value = pointsResult.error!;
  }

  const quantityResult = validateNumber(data.quantity, 1, 1000, "Quantity");
  if (!quantityResult.isValid) {
    errors.quantity = quantityResult.error!;
  }

  if (data.code_length) {
    const codeLengthResult = validateNumber(
      data.code_length,
      6,
      20,
      "Code length",
    );
    if (!codeLengthResult.isValid) {
      errors.code_length = codeLengthResult.error!;
    }
  }

  const validFromResult = validateDate(data.valid_from, "Valid from");
  if (!validFromResult.isValid) {
    errors.valid_from = validFromResult.error!;
  }

  const validUntilResult = validateDate(data.valid_until, "Valid until");
  if (!validUntilResult.isValid) {
    errors.valid_until = validUntilResult.error!;
  }

  if (validFromResult.isValid && validUntilResult.isValid) {
    const rangeResult = validateDateRange(data.valid_from, data.valid_until);
    if (!rangeResult.isValid) {
      errors.valid_until = rangeResult.error!;
    }
  }

  return errors;
};

// ============================================================================
// Form Validators - Payment Method Management
// ============================================================================

export const validateCreatePaymentMethod = (data: {
  name: string;
  gateway: string;
  is_active?: boolean;
  configuration?: Record<string, any>;
  min_amount: number;
  max_amount?: number;
  supported_currencies?: string[];
}): Record<string, string> => {
  const errors: Record<string, string> = {};

  const nameResult = validateRequired(data.name, "Name");
  if (!nameResult.isValid) {
    errors.name = nameResult.error!;
  } else {
    const lengthResult = validateStringLength(data.name, 0, 100, "Name");
    if (!lengthResult.isValid) {
      errors.name = lengthResult.error!;
    }
  }

  const gatewayResult = validateRequired(data.gateway, "Gateway");
  if (!gatewayResult.isValid) {
    errors.gateway = gatewayResult.error!;
  } else {
    const lengthResult = validateStringLength(data.gateway, 0, 255, "Gateway");
    if (!lengthResult.isValid) {
      errors.gateway = lengthResult.error!;
    }
  }

  const minAmountResult = validateDecimal(
    data.min_amount,
    0,
    undefined,
    "Minimum amount",
  );
  if (!minAmountResult.isValid) {
    errors.min_amount = minAmountResult.error!;
  }

  if (data.max_amount !== undefined) {
    if (data.max_amount <= data.min_amount) {
      errors.max_amount = "Maximum amount must be greater than minimum amount";
    }
  }

  if (data.supported_currencies) {
    data.supported_currencies.forEach((currency, index) => {
      if (currency.length > 10) {
        errors[`supported_currencies_${index}`] =
          "Currency code must not exceed 10 characters";
      }
    });
  }

  return errors;
};

// ============================================================================
// Form Validators - Rental Package Management
// ============================================================================

export const validateCreateRentalPackage = (data: {
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  package_type: string;
  payment_model: string;
  is_active?: boolean;
  package_metadata?: Record<string, any>;
}): Record<string, string> => {
  const errors: Record<string, string> = {};

  const nameResult = validateRequired(data.name, "Name");
  if (!nameResult.isValid) {
    errors.name = nameResult.error!;
  } else {
    const lengthResult = validateStringLength(data.name, 0, 100, "Name");
    if (!lengthResult.isValid) {
      errors.name = lengthResult.error!;
    }
  }

  const descResult = validateRequired(data.description, "Description");
  if (!descResult.isValid) {
    errors.description = descResult.error!;
  } else {
    const lengthResult = validateStringLength(
      data.description,
      0,
      255,
      "Description",
    );
    if (!lengthResult.isValid) {
      errors.description = lengthResult.error!;
    }
  }

  const durationResult = validateNumber(
    data.duration_minutes,
    1,
    undefined,
    "Duration",
  );
  if (!durationResult.isValid) {
    errors.duration_minutes = durationResult.error!;
  }

  const priceResult = validateDecimal(data.price, 0, undefined, "Price");
  if (!priceResult.isValid) {
    errors.price = priceResult.error!;
  }

  const typeResult = validateChoice(
    data.package_type,
    Object.values(PackageType),
    "Package type",
  );
  if (!typeResult.isValid) {
    errors.package_type = typeResult.error!;
  }

  const modelResult = validateChoice(
    data.payment_model,
    Object.values(PaymentModel),
    "Payment model",
  );
  if (!modelResult.isValid) {
    errors.payment_model = modelResult.error!;
  }

  return errors;
};

// ============================================================================
// Form Validators - Station Management
// ============================================================================

export const validateCreateStation = (data: {
  station_name: string;
  serial_number: string;
  imei: string;
  latitude: number;
  longitude: number;
  address: string;
  landmark?: string;
  total_slots: number;
  status?: string;
  is_maintenance?: boolean;
  hardware_info?: Record<string, any>;
  amenity_ids?: string[];
}): Record<string, string> => {
  const errors: Record<string, string> = {};

  const nameResult = validateRequired(data.station_name, "Station name");
  if (!nameResult.isValid) {
    errors.station_name = nameResult.error!;
  } else {
    const lengthResult = validateStringLength(
      data.station_name,
      0,
      100,
      "Station name",
    );
    if (!lengthResult.isValid) {
      errors.station_name = lengthResult.error!;
    }
  }

  const serialResult = validateRequired(data.serial_number, "Serial number");
  if (!serialResult.isValid) {
    errors.serial_number = serialResult.error!;
  } else {
    const lengthResult = validateStringLength(
      data.serial_number,
      0,
      255,
      "Serial number",
    );
    if (!lengthResult.isValid) {
      errors.serial_number = lengthResult.error!;
    }
  }

  const imeiResult = validateRequired(data.imei, "IMEI");
  if (!imeiResult.isValid) {
    errors.imei = imeiResult.error!;
  } else {
    const lengthResult = validateStringLength(data.imei, 0, 255, "IMEI");
    if (!lengthResult.isValid) {
      errors.imei = lengthResult.error!;
    }
  }

  const latResult = validateLatitude(data.latitude);
  if (!latResult.isValid) {
    errors.latitude = latResult.error!;
  }

  const lngResult = validateLongitude(data.longitude);
  if (!lngResult.isValid) {
    errors.longitude = lngResult.error!;
  }

  const addressResult = validateRequired(data.address, "Address");
  if (!addressResult.isValid) {
    errors.address = addressResult.error!;
  } else {
    const lengthResult = validateStringLength(data.address, 0, 255, "Address");
    if (!lengthResult.isValid) {
      errors.address = lengthResult.error!;
    }
  }

  if (data.landmark) {
    const landmarkResult = validateStringLength(
      data.landmark,
      0,
      255,
      "Landmark",
    );
    if (!landmarkResult.isValid) {
      errors.landmark = landmarkResult.error!;
    }
  }

  const slotsResult = validateNumber(data.total_slots, 1, 50, "Total slots");
  if (!slotsResult.isValid) {
    errors.total_slots = slotsResult.error!;
  }

  if (data.status) {
    const statusResult = validateChoice(
      data.status,
      Object.values(StationStatus),
      "Status",
    );
    if (!statusResult.isValid) {
      errors.status = statusResult.error!;
    }
  }

  return errors;
};

// ============================================================================
// Form Validators - Station Amenity Management
// ============================================================================

export const validateCreateAmenity = (data: {
  name: string;
  icon?: string;
  description?: string;
}): Record<string, string> => {
  const errors: Record<string, string> = {};

  const nameResult = validateRequired(data.name, "Name");
  if (!nameResult.isValid) {
    errors.name = nameResult.error!;
  } else {
    const lengthResult = validateStringLength(data.name, 0, 100, "Name");
    if (!lengthResult.isValid) {
      errors.name = lengthResult.error!;
    }
  }

  if (data.icon) {
    const iconResult = validateStringLength(data.icon, 0, 50, "Icon");
    if (!iconResult.isValid) {
      errors.icon = iconResult.error!;
    }
  }

  if (data.description) {
    const descResult = validateStringLength(
      data.description,
      0,
      500,
      "Description",
    );
    if (!descResult.isValid) {
      errors.description = descResult.error!;
    }
  }

  return errors;
};

// ============================================================================
// Form Validators - Issue Management
// ============================================================================

export const validateUpdateRentalIssueStatus = (data: {
  status: string;
  notes?: string;
}): Record<string, string> => {
  const errors: Record<string, string> = {};

  const validStatuses = [IssueStatus.REPORTED, IssueStatus.RESOLVED];
  const statusResult = validateChoice(data.status, validStatuses, "Status");
  if (!statusResult.isValid) {
    errors.status = statusResult.error!;
  }

  if (data.notes) {
    const notesResult = validateStringLength(data.notes, 0, 500, "Notes");
    if (!notesResult.isValid) {
      errors.notes = notesResult.error!;
    }
  }

  return errors;
};

export const validateUpdateStationIssue = (data: {
  status?: string;
  priority?: string;
  assigned_to_id?: string;
  notes?: string;
}): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (data.status) {
    const statusResult = validateChoice(
      data.status,
      Object.values(IssueStatus),
      "Status",
    );
    if (!statusResult.isValid) {
      errors.status = statusResult.error!;
    }
  }

  if (data.priority) {
    const priorityResult = validateChoice(
      data.priority,
      Object.values(IssuePriority),
      "Priority",
    );
    if (!priorityResult.isValid) {
      errors.priority = priorityResult.error!;
    }
  }

  if (data.assigned_to_id) {
    const assignedResult = validateUUID(data.assigned_to_id, "Assigned to ID");
    if (!assignedResult.isValid) {
      errors.assigned_to_id = assignedResult.error!;
    }
  }

  if (data.notes) {
    const notesResult = validateStringLength(data.notes, 0, 1000, "Notes");
    if (!notesResult.isValid) {
      errors.notes = notesResult.error!;
    }
  }

  return errors;
};

// ============================================================================
// Query Parameter Validators
// ============================================================================

export const validatePaginationParams = (
  page?: number,
  pageSize?: number,
  maxPageSize: number = 100,
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (page !== undefined) {
    const pageResult = validateNumber(page, 1, undefined, "Page");
    if (!pageResult.isValid) {
      errors.page = pageResult.error!;
    }
  }

  if (pageSize !== undefined) {
    const sizeResult = validateNumber(pageSize, 1, maxPageSize, "Page size");
    if (!sizeResult.isValid) {
      errors.page_size = sizeResult.error!;
    }
  }

  return errors;
};

export const validateSearchParams = (
  search?: string,
  maxLength: number = 200,
): ValidationResult => {
  if (!search) {
    return { isValid: true };
  }

  return validateStringLength(search, 0, maxLength, "Search query");
};

export const validateDateRangeParams = (
  startDate?: string | Date,
  endDate?: string | Date,
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (startDate) {
    const startResult = validateDate(startDate, "Start date");
    if (!startResult.isValid) {
      errors.start_date = startResult.error!;
    }
  }

  if (endDate) {
    const endResult = validateDate(endDate, "End date");
    if (!endResult.isValid) {
      errors.end_date = endResult.error!;
    }
  }

  if (startDate && endDate) {
    const rangeResult = validateDateRange(startDate, endDate);
    if (!rangeResult.isValid) {
      errors.end_date = rangeResult.error!;
    }
  }

  return errors;
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Validates an entire form object based on field definitions
 */
export const validateForm = (
  data: Record<string, any>,
  fields: Record<string, FieldValidation>,
): Record<string, string> => {
  const errors: Record<string, string> = {};

  for (const [fieldName, validation] of Object.entries(fields)) {
    const value = data[fieldName];

    // Check required
    if (validation.required) {
      const requiredResult = validateRequired(value, fieldName);
      if (!requiredResult.isValid) {
        errors[fieldName] = requiredResult.error!;
        continue;
      }
    }

    // Skip further validation if not required and empty
    if (
      !validation.required &&
      (value === undefined || value === null || value === "")
    ) {
      continue;
    }

    // Check string length
    if (
      typeof value === "string" &&
      (validation.minLength || validation.maxLength)
    ) {
      const lengthResult = validateStringLength(
        value,
        validation.minLength,
        validation.maxLength,
        fieldName,
      );
      if (!lengthResult.isValid) {
        errors[fieldName] = lengthResult.error!;
        continue;
      }
    }

    // Check number range
    if (
      typeof value === "number" &&
      (validation.min !== undefined || validation.max !== undefined)
    ) {
      const numberResult = validateNumber(
        value,
        validation.min,
        validation.max,
        fieldName,
      );
      if (!numberResult.isValid) {
        errors[fieldName] = numberResult.error!;
        continue;
      }
    }

    // Check pattern
    if (validation.pattern && typeof value === "string") {
      if (!validation.pattern.test(value)) {
        errors[fieldName] = `${fieldName} format is invalid`;
        continue;
      }
    }

    // Check custom validation
    if (validation.custom) {
      const customResult = validation.custom(value);
      if (!customResult.isValid) {
        errors[fieldName] = customResult.error!;
      }
    }
  }

  return errors;
};

/**
 * Check if a form has any errors
 */
export const hasErrors = (errors: Record<string, string>): boolean => {
  return Object.keys(errors).length > 0;
};

/**
 * Get first error message from errors object
 */
export const getFirstError = (
  errors: Record<string, string>,
): string | null => {
  const keys = Object.keys(errors);
  return keys.length > 0 ? errors[keys[0]] : null;
};

/**
 * Format errors for display
 */
export const formatErrors = (errors: Record<string, string>): string => {
  return Object.entries(errors)
    .map(([field, error]) => `${field}: ${error}`)
    .join(", ");
};

// ============================================================================
// Export all validators
// ============================================================================

export default {
  // Basic validators
  validateEmail,
  validatePassword,
  validateRequired,
  validateStringLength,
  validateNumber,
  validateDecimal,
  validateChoice,
  validateDate,
  validateDateRange,
  validateAlphanumeric,
  validateLatitude,
  validateLongitude,
  validateUUID,

  // Form validators
  validateLoginForm,
  validateCreateAdminProfile,
  validateUpdateAdminProfile,
  validateUpdatePassword,
  validateUpdateUserStatus,
  validateAddUserBalance,
  validateUpdateKYCStatus,
  validateProcessRefund,
  validateToggleMaintenance,
  validateRemoteCommand,
  validateBroadcastNotification,
  validateProcessWithdrawal,
  validateCreateCoupon,
  validateBulkCreateCoupon,
  validateCreatePaymentMethod,
  validateCreateRentalPackage,
  validateCreateStation,
  validateCreateAmenity,
  validateUpdateRentalIssueStatus,
  validateUpdateStationIssue,

  // Query validators
  validatePaginationParams,
  validateSearchParams,
  validateDateRangeParams,

  // Utilities
  validateForm,
  hasErrors,
  getFirstError,
  formatErrors,
};
