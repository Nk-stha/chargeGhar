import instance from "../axios";

/**
 * FAQ Interface
 */
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by_username: string;
  updated_by_username: string;
}

/**
 * API Response Types
 */
export interface FAQListResponse {
  success: boolean;
  message: string;
  data: FAQ[];
}

export interface FAQDetailResponse {
  success: boolean;
  message: string;
  data: FAQ;
}

export interface FAQDeleteResponse {
  success: boolean;
  message: string;
  data: {
    deleted: boolean;
  };
}

/**
 * Create/Update FAQ Request
 */
export interface CreateFAQRequest {
  question: string;
  answer: string;
  category: string;
  sort_order?: number;
  is_active: boolean;
}

export interface UpdateFAQRequest {
  question: string;
  answer: string;
  category: string;
  sort_order?: number;
  is_active: boolean;
}

/**
 * FAQ Service
 * Handles all API calls related to FAQ management
 */
class FAQService {
  private baseUrl = "/api/admin/content/faqs";

  /**
   * Get list of all FAQs
   * @returns FAQs list
   */
  async getFAQs(): Promise<FAQListResponse> {
    const response = await instance.get<FAQListResponse>(this.baseUrl);
    return response.data;
  }

  /**
   * Get detailed information about a specific FAQ
   * @param faqId - FAQ ID (UUID)
   * @returns Detailed FAQ information
   */
  async getFAQDetail(faqId: string): Promise<FAQDetailResponse> {
    const response = await instance.get<FAQDetailResponse>(
      `${this.baseUrl}/${faqId}`,
    );
    return response.data;
  }

  /**
   * Create a new FAQ
   * @param data - FAQ creation data
   * @returns Created FAQ
   */
  async createFAQ(data: CreateFAQRequest): Promise<FAQDetailResponse> {
    try {
      const formData = new FormData();
      formData.append("question", data.question);
      formData.append("answer", data.answer);
      formData.append("category", data.category);
      formData.append("is_active", data.is_active ? "true" : "false");

      if (data.sort_order !== undefined) {
        formData.append("sort_order", data.sort_order.toString());
      }

      const response = await instance.post<FAQDetailResponse>(
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
   * Update an existing FAQ
   * @param faqId - FAQ ID (UUID)
   * @param data - FAQ update data
   * @returns Updated FAQ
   */
  async updateFAQ(
    faqId: string,
    data: UpdateFAQRequest,
  ): Promise<FAQDetailResponse> {
    try {
      const formData = new FormData();
      formData.append("question", data.question);
      formData.append("answer", data.answer);
      formData.append("category", data.category);
      formData.append("is_active", data.is_active ? "true" : "false");

      if (data.sort_order !== undefined) {
        formData.append("sort_order", data.sort_order.toString());
      }

      const response = await instance.put<FAQDetailResponse>(
        `${this.baseUrl}/${faqId}`,
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
   * Delete a FAQ entry
   * @param faqId - FAQ ID (UUID)
   * @returns Deletion confirmation
   */
  async deleteFAQ(faqId: string): Promise<FAQDeleteResponse> {
    const response = await instance.delete<FAQDeleteResponse>(
      `${this.baseUrl}/${faqId}`,
    );
    return response.data;
  }

  /**
   * Download FAQs as CSV
   * @param faqs - Array of FAQs
   * @param filename - Output filename
   */
  downloadCSV(faqs: FAQ[], filename: string): void {
    const headers = [
      "ID",
      "Question",
      "Answer",
      "Category",
      "Sort Order",
      "Active",
      "Created At",
      "Updated At",
      "Created By",
      "Updated By",
    ];

    const rows = faqs.map((faq) => [
      faq.id,
      faq.question,
      faq.answer,
      faq.category,
      faq.sort_order.toString(),
      faq.is_active ? "Yes" : "No",
      faq.created_at,
      faq.updated_at,
      faq.created_by_username,
      faq.updated_by_username,
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

export const faqService = new FAQService();
