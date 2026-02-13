import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { AxiosError } from "axios";
import FormData from "form-data";

// GET - Fetch all payment methods
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization");

    if (!token) {
      return NextResponse.json(
        { message: "Authorization token required" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || "1";
    const page_size = searchParams.get("page_size") || "20";

    const response = await axios.get(
      `${process.env.BASE_URL}/admin/payment-methods`,
      {
        headers: {
          Authorization: token,
        },
        params: {
          page,
          page_size,
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

// POST - Create new payment method
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization");
    const csrfToken = req.headers.get("X-CSRFTOKEN") || "";

    if (!token) {
      return NextResponse.json(
        { message: "Authorization token required" },
        { status: 401 },
      );
    }

    // Get FormData from request
    const formDataFromClient = await req.formData();

    // Create new FormData for backend
    const formData = new FormData();
    
    // Append all fields from client FormData
    formDataFromClient.forEach((value, key) => {
      formData.append(key, String(value));
    });

    const response = await axios.post(
      `${process.env.BASE_URL}/admin/payment-methods`,
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
