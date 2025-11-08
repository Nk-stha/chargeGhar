import instance from "../axios";

/**
 * Admin Me Response Types
 */
export interface AdminPermissions {
  can_manage_users: boolean;
  can_manage_stations: boolean;
  can_manage_content: boolean;
  can_view_analytics: boolean;
  can_manage_finances: boolean;
  can_manage_admins: boolean;
}

export interface CurrentAdminProfile {
  user_id: string;
  email: string;
  username: string;
  role: "super_admin" | "admin" | "moderator";
  is_active: boolean;
  is_super_admin: boolean;
  created_at: string;
  permissions: AdminPermissions;
}

export interface AdminMeResponse {
  success: boolean;
  message: string;
  data: CurrentAdminProfile;
}

/**
 * Admin Me Service
 * Handles fetching and managing current admin profile information
 */
class AdminMeService {
  private baseUrl = "/api/admin/me";

  /**
   * Get current logged-in admin profile with permissions
   * @returns Current admin profile data
   */
  async getCurrentProfile(): Promise<AdminMeResponse> {
    const response = await instance.get<AdminMeResponse>(this.baseUrl);
    return response.data;
  }

  /**
   * Get role display label
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
   * @param isSuperAdmin - Is super admin flag
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
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  }

  /**
   * Format date and time for display
   * @param dateString - ISO date string
   * @returns Formatted date and time string
   */
  formatDateTime(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  }

  /**
   * Get time since creation/update
   * @param dateString - ISO date string
   * @returns Human-readable time since string
   */
  getTimeSince(dateString: string): string {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "1 day ago";
      if (diffDays < 30) return `${diffDays} days ago`;
      if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return months === 1 ? "1 month ago" : `${months} months ago`;
      }
      const years = Math.floor(diffDays / 365);
      return years === 1 ? "1 year ago" : `${years} years ago`;
    } catch {
      return "—";
    }
  }

  /**
   * Get permission display label
   * @param permissionKey - Permission key
   * @returns Human-readable permission label
   */
  getPermissionLabel(permissionKey: keyof AdminPermissions): string {
    const labels: Record<keyof AdminPermissions, string> = {
      can_manage_users: "Manage Users",
      can_manage_stations: "Manage Stations",
      can_manage_content: "Manage Content",
      can_view_analytics: "View Analytics",
      can_manage_finances: "Manage Finances",
      can_manage_admins: "Manage Admins",
    };
    return labels[permissionKey] || permissionKey;
  }

  /**
   * Get permission icon
   * @param permissionKey - Permission key
   * @returns Icon name string (for react-icons/fi)
   */
  getPermissionIcon(permissionKey: keyof AdminPermissions): string {
    const icons: Record<keyof AdminPermissions, string> = {
      can_manage_users: "FiUsers",
      can_manage_stations: "FiMapPin",
      can_manage_content: "FiFileText",
      can_view_analytics: "FiBarChart2",
      can_manage_finances: "FiDollarSign",
      can_manage_admins: "FiShield",
    };
    return icons[permissionKey] || "FiCheck";
  }

  /**
   * Count enabled permissions
   * @param permissions - Admin permissions object
   * @returns Number of enabled permissions
   */
  countEnabledPermissions(permissions: AdminPermissions): number {
    return Object.values(permissions).filter((value) => value === true).length;
  }

  /**
   * Get enabled permissions list
   * @param permissions - Admin permissions object
   * @returns Array of enabled permission keys
   */
  getEnabledPermissions(
    permissions: AdminPermissions
  ): (keyof AdminPermissions)[] {
    return (Object.keys(permissions) as (keyof AdminPermissions)[]).filter(
      (key) => permissions[key] === true
    );
  }

  /**
   * Get disabled permissions list
   * @param permissions - Admin permissions object
   * @returns Array of disabled permission keys
   */
  getDisabledPermissions(
    permissions: AdminPermissions
  ): (keyof AdminPermissions)[] {
    return (Object.keys(permissions) as (keyof AdminPermissions)[]).filter(
      (key) => permissions[key] === false
    );
  }

  /**
   * Check if admin has all permissions
   * @param permissions - Admin permissions object
   * @returns True if all permissions are enabled
   */
  hasAllPermissions(permissions: AdminPermissions): boolean {
    return Object.values(permissions).every((value) => value === true);
  }

  /**
   * Check if admin has specific permission
   * @param permissions - Admin permissions object
   * @param permissionKey - Permission key to check
   * @returns True if permission is enabled
   */
  hasPermission(
    permissions: AdminPermissions,
    permissionKey: keyof AdminPermissions
  ): boolean {
    return permissions[permissionKey] === true;
  }

  /**
   * Get account status color
   * @param isActive - Is active flag
   * @returns Hex color code
   */
  getStatusColor(isActive: boolean): string {
    return isActive ? "#47b216" : "#ff4040";
  }

  /**
   * Get account status label
   * @param isActive - Is active flag
   * @returns Status label
   */
  getStatusLabel(isActive: boolean): string {
    return isActive ? "Active" : "Inactive";
  }
}

// Export singleton instance
export const adminMeService = new AdminMeService();
export default adminMeService;
