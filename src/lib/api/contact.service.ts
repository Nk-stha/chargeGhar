import instance from "../axios";

/**
 * Contact Information Interface
 */
export interface ContactInfo {
  id: string;
  info_type: "phone" | "email" | "address" | "support_hours";
  label: string;
  value: string;
  description?: string;
  is_active: boolean;
  updated_at: string;
  updated_by_username: string;
}

/**
 * API Response Types
 */
export interface ContactListResponse {
  success: boolean;
  message: string;
  data: ContactInfo[];
}

export interface ContactDetailResponse {
  success: boolean;
  message: string;
  data: ContactInfo;
}

export interface ContactDeleteResponse {
  success: boolean;
  message: string;
  data: {
    deleted: boolean;
  };
}

/**
 * Create/Update Contact Request
 */
export interface CreateContactRequest {
  info_type: "phone" | "email" | "address" | "support_hours";
  label: string;
  value: string;
  description?: string;
  is_active: boolean;
}

/**
 * Contact Service
 * Handles all API calls related to contact information management
 */
class ContactService {
  private baseUrl = "/api/admin/content/contact";

  /**
   * Get list of all contact information
   * @returns Contact information list
   */
  async getContacts(): Promise<ContactListResponse> {
    const response = await instance.get<ContactListResponse>(this.baseUrl);
    return response.data;
  }

  /**
   * Get detailed information about a specific contact
   * @param contactId - Contact ID (UUID)
   * @returns Detailed contact information
   */
  async getContactDetail(contactId: string): Promise<ContactDetailResponse> {
    const response = await instance.get<ContactDetailResponse>(
      `${this.baseUrl}/${contactId}`,
    );
    return response.data;
  }

  /**
   * Create or update contact information
   * @param data - Contact creation/update data
   * @returns Created/Updated contact information
   */
  async createContact(
    data: CreateContactRequest,
  ): Promise<ContactDetailResponse> {
    try {
      const formData = new FormData();
      formData.append("info_type", data.info_type);
      formData.append("label", data.label);
      formData.append("value", data.value);
      formData.append("is_active", data.is_active ? "true" : "false");

      if (data.description) {
        formData.append("description", data.description);
      }

      // Send FormData - axios will automatically set Content-Type with boundary
      const response = await instance.post<ContactDetailResponse>(
        this.baseUrl,
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
   * Delete a contact information entry
   * @param contactId - Contact ID (UUID)
   * @returns Deletion confirmation
   */
  async deleteContact(contactId: string): Promise<ContactDeleteResponse> {
    const response = await instance.delete<ContactDeleteResponse>(
      `${this.baseUrl}/${contactId}`,
    );
    return response.data;
  }

  /**
   * Download contact information as CSV
   * @param contacts - Array of contacts
   * @param filename - Output filename
   */
  downloadCSV(contacts: ContactInfo[], filename: string): void {
    const headers = [
      "ID",
      "Type",
      "Label",
      "Value",
      "Description",
      "Active",
      "Updated At",
      "Updated By",
    ];

    const rows = contacts.map((contact) => [
      contact.id,
      contact.info_type,
      contact.label,
      contact.value,
      contact.description || "",
      contact.is_active ? "Yes" : "No",
      contact.updated_at,
      contact.updated_by_username,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const contactService = new ContactService();
