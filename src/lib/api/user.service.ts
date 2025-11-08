import instance from "../axios";

export interface User {
  id: number;
  username: string;
  email?: string;
  profile_picture?: string | null;
  referral_code?: string | null;
  status: string;
  date_joined: string;
  profile_complete: boolean;
  kyc_status: string;
  social_provider?: string;
  phone_number?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
}

export interface UserListResponse {
  success: boolean;
  data: {
    results: User[];
    count: number;
    next: string | null;
    previous: string | null;
  };
}

export interface UserDetailResponse {
  success: boolean;
  data: User;
}

export interface AddBalanceResponse {
  success: boolean;
  message: string;
  data: {
    old_balance: {
      balance: number;
      currency: string;
      formatted_balance: string;
    };
    new_balance: {
      balance: number;
      currency: string;
      formatted_balance: string;
    };
    amount_added: number;
    transaction_id: string;
  };
}

export interface UpdateStatusResponse {
  success: boolean;
  message: string;
  data: {
    user_id: string;
    new_status: string;
    message: string;
  };
}

class UserService {
  private baseUrl = "/api/admin/users";

  /**
   * Fetch all users with optional filters
   */
  async getUsers(params?: {
    page?: number;
    page_size?: number;
    search?: string;
    status?: string;
    kyc_status?: string;
  }): Promise<UserListResponse> {
    try {
      const response = await instance.get(this.baseUrl, { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error("Error fetching users:", error);
      throw error;
    }
  }

  /**
   * Fetch a single user by ID
   */
  async getUserById(userId: number | string): Promise<UserDetailResponse> {
    try {
      const response = await instance.get(`${this.baseUrl}/${userId}`);

      // Handle different response structures
      // If backend returns { success: true, data: {...} }
      if (
        response.data &&
        typeof response.data === "object" &&
        "success" in response.data
      ) {
        return {
          success: true,
          data: response.data.data,
        };
      }

      // If backend returns the user object directly
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error(`Error fetching user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Fetch multiple users by IDs in bulk
   * Optimized to fetch all users once instead of individual calls
   */
  async getUsersByIds(
    userIds: (number | string)[],
  ): Promise<Map<string, User>> {
    const userMap = new Map<string, User>();

    if (!userIds || userIds.length === 0) {
      return userMap;
    }

    // Remove duplicates and convert to strings for comparison
    const uniqueIds = Array.from(new Set(userIds.map((id) => id.toString())));

    try {
      // Fetch all users at once
      const response = await this.getUsers({ page_size: 1000 });

      if (response.success && response.data && response.data.results) {
        const allUsers = response.data.results;

        // Create a map of users by ID
        allUsers.forEach((user) => {
          const userId = user.id.toString();
          // Only add users that were requested
          if (uniqueIds.includes(userId)) {
            userMap.set(userId, user);
          }
        });

        // Log how many users were found
        console.log(
          `Fetched ${userMap.size} out of ${uniqueIds.length} requested users`,
        );
      }

      return userMap;
    } catch (error: any) {
      console.error("Error fetching users by IDs:", error);
      // Fallback: try individual calls if bulk fetch fails
      console.log("Attempting individual user fetches as fallback...");

      for (const id of uniqueIds) {
        try {
          const userResponse = await this.getUserById(id);
          if (userResponse.success && userResponse.data) {
            userMap.set(id, userResponse.data);
          }
        } catch (err) {
          console.warn(`Failed to fetch user ${id}:`, err);
        }
      }

      return userMap;
    }
  }

  /**
   * Format user display name with fallbacks
   */
  formatUserName(user: User | null | undefined): string {
    if (!user) {
      return "Unknown User";
    }

    // Try different name fields in order of preference
    if (user.full_name && user.full_name.trim()) {
      return user.full_name.trim();
    }

    if (user.first_name || user.last_name) {
      const firstName = user.first_name || "";
      const lastName = user.last_name || "";
      const fullName = `${firstName} ${lastName}`.trim();
      if (fullName) {
        return fullName;
      }
    }

    if (user.username && user.username.trim()) {
      return user.username.trim();
    }

    if (user.email && user.email.trim()) {
      return user.email.trim();
    }

    return `User #${user.id}`;
  }

  /**
   * Get initials from user name
   */
  getUserInitials(user: User | null | undefined): string {
    const name = this.formatUserName(user);

    if (name.startsWith("User #")) {
      return "U";
    }

    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }

    return name.substring(0, 2).toUpperCase();
  }

  /**
   * Add balance to user wallet
   * @param userId - User ID
   * @param amount - Amount to add
   * @param reason - Reason for adding balance
   */
  async addBalance(
    userId: string | number,
    amount: string | number,
    reason: string,
  ): Promise<AddBalanceResponse> {
    try {
      const formData = new FormData();
      formData.append("amount", amount.toString());
      formData.append("reason", reason);

      const response = await instance.post<AddBalanceResponse>(
        `${this.baseUrl}/${userId}/add-balance`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Update user status
   * @param userId - User ID
   * @param status - New status (ACTIVE, BANNED, INACTIVE)
   * @param reason - Reason for status change
   */
  async updateStatus(
    userId: string | number,
    status: "ACTIVE" | "BANNED" | "INACTIVE",
    reason: string,
  ): Promise<UpdateStatusResponse> {
    try {
      const formData = new FormData();
      formData.append("status", status);
      formData.append("reason", reason);

      const response = await instance.post<UpdateStatusResponse>(
        `${this.baseUrl}/${userId}/status`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return response.data;
    } catch (error: any) {
      throw error;
    }
  }
}

export const userService = new UserService();
