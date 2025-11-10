import instance from "../axios";

/**
 * Admin Profile Response Types
 */
export interface AdminProfile {
  id: string;
  role: "super_admin" | "admin" | "moderator";
  is_active: boolean;
  is_super_admin: boolean;
  created_at: string;
  updated_at: string;
  username: string;
  email: string;
  created_by_username: string;
}

export interface AdminProfileResponse {
  success: boolean;
  message: string;
  data: AdminProfile;
}

export interface DeleteAdminProfileResponse {
  success: boolean;
  message: string;
  data: {
    message: string;
  };
}

/**
 * Update Admin Profile Payload
 */
export interface UpdateAdminProfilePayload {
  role?: "super_admin" | "admin" | "moderator";
  new_password?: string;
  is_active?: boolean;
  reason?: string;
}

/**
 * Admin Profiles Service
 * Handles all API calls related to admin profile management
 */
class AdminProfilesService {
  private baseUrl = "/api/admin/profiles";

  /**
   * Get a specific admin profile by ID
   * @param profileId - Admin profile UUID
   * @returns Admin profile details
   */
  async getAdminProfile(profileId: string): Promise<AdminProfileResponse> {
    const response = await instance.get<AdminProfileResponse>(
      `${this.baseUrl}/${profileId}`
    );
    return response.data;
  }

  /**
   * Update admin profile (role, password, or active status)
   * @param profileId - Admin profile UUID
   * @param payload - Update data
   * @returns Updated admin profile
   */
  async updateAdminProfile(
    profileId: string,
    payload: UpdateAdminProfilePayload
  ): Promise<AdminProfileResponse> {
    const formData = new FormData();

    if (payload.role !== undefined) {
      formData.append("role", payload.role);
    }

    if (payload.new_password !== undefined && payload.new_password.trim()) {
      formData.append("new_password", payload.new_password);
    }

    if (payload.is_active !== undefined) {
      formData.append("is_active", payload.is_active.toString());
    }

    if (payload.reason !== undefined && payload.reason.trim()) {
      formData.append("reason", payload.reason);
    }

    const response = await instance.patch<AdminProfileResponse>(
      `${this.baseUrl}/${profileId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  }

  /**
   * Delete (deactivate) an admin profile
   * @param profileId - Admin profile UUID
   * @returns Deletion confirmation
   */
  async deleteAdminProfile(
    profileId: string
  ): Promise<DeleteAdminProfileResponse> {
    const response = await instance.delete<DeleteAdminProfileResponse>(
      `${this.baseUrl}/${profileId}`
    );
    return response.data;
  }

  /**
   * Get role label for display
   * @param role - Admin role
   * @returns Human-readable role label
   */
  getRoleLabel(role: string): string {
    const roleMap: Record<string, string> = {
      super_admin: "Super Admin",
      admin: "Admin",
      moderator: "Moderator",
    };
    return roleMap[role] || role;
  }

  /**
   * Get role color for UI
   * @param role - Admin role
   * @returns Hex color code
   */
  getRoleColor(role: string, isSuperAdmin: boolean): string {
    if (isSuperAdmin) return "#82ea80"; // Green for super admin
    switch (role) {
      case "admin":
        return "#2196f3"; // Blue for admin
      case "moderator":
        return "#ffc107"; // Yellow for moderator
      default:
        return "#888888"; // Gray default
    }
  }

  /**
   * Format date for display
   * @param dateString - ISO date string
   * @returns Formatted date string
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  /**
   * Format date and time for display
   * @param dateString - ISO date string
   * @returns Formatted date and time string
   */
  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /**
   * Validate password strength
   * @param password - Password to validate
   * @returns Validation result
   */
  validatePassword(password: string): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate update payload
   * @param payload - Update payload
   * @returns Validation result
   */
  validateUpdatePayload(payload: UpdateAdminProfilePayload): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (payload.new_password) {
      const passwordValidation = this.validatePassword(payload.new_password);
      if (!passwordValidation.valid) {
        errors.push(...passwordValidation.errors);
      }
    }

    if (payload.is_active === false && !payload.reason) {
      errors.push("Reason is required when deactivating an admin");
    }

    if (
      !payload.role &&
      !payload.new_password &&
      payload.is_active === undefined
    ) {
      errors.push("At least one field must be provided for update");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const adminProfilesService = new AdminProfilesService();
export default adminProfilesService;
