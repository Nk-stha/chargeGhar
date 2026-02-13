import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { AxiosError } from "axios";
import FormData from "form-data";

// GET - Fetch specific payment method
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ method_id: string }> },
) {
  try {
    const token = req.headers.get("Authorization");

    if (!token) {
      return NextResponse.json(
        { message: "Authorization token required" },
        { status: 401 },
      );
    }

    const resolvedParams = await context.params;
    const { method_id } = resolvedParams;

    const response = await axios.get(
      `${process.env.BASE_URL}/admin/payment-methods/${method_id}`,
      {
        headers: {
          Authorization: token,
        },
      },
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      return NextResponse.json(axiosError.response.data, {
        status: axiosError.response.status,
      });
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

// PATCH - Update payment method
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ method_id: string }> },
) {
  try {
    const token = req.headers.get("Authorization");
    const csrfToken = req.headers.get("X-CSRFTOKEN") || "";

    if (!token) {
      return NextResponse.json(
        { message: "Authorization token required" },
        { status: 401 },
      );
    }

    const resolvedParams = await context.params;
    const { method_id } = resolvedParams;
    
    // Get FormData from request
    const formDataFromClient = await req.formData();

    // Create new FormData for backend
    const formData = new FormData();
    
    // Append all fields from client FormData
    formDataFromClient.forEach((value, key) => {
      formData.append(key, String(value));
    });

    const response = await axios.patch(
      `${process.env.BASE_URL}/admin/payment-methods/${method_id}`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: token,
          "X-CSRFTOKEN": csrfToken,
        },
      },
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    if (error.response) {
      return NextResponse.json(error.response.data, {
        status: error.response.status,
      });
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE - Delete payment method
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ method_id: string }> },
) {
  try {
    const token = req.headers.get("Authorization");
    const csrfToken = req.headers.get("X-CSRFTOKEN") || "";

    if (!token) {
      return NextResponse.json(
        { message: "Authorization token required" },
        { status: 401 },
      );
    }

    const resolvedParams = await context.params;
    const { method_id } = resolvedParams;

    const response = await axios.delete(
      `${process.env.BASE_URL}/admin/payment-methods/${method_id}`,
      {
        headers: {
          Authorization: token,
          "X-CSRFTOKEN": csrfToken,
        },
      },
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      return NextResponse.json(axiosError.response.data, {
        status: axiosError.response.status,
      });
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
