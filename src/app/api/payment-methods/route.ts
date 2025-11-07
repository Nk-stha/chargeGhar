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
    console.error("Get payment methods error:", error);
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

    const body = await req.json();

    const formData = new FormData();
    formData.append("name", String(body.name));
    formData.append("gateway", String(body.gateway));
    formData.append("is_active", String(body.is_active));
    formData.append("configuration", JSON.stringify(body.configuration));
    formData.append("min_amount", String(body.min_amount));

    if (body.max_amount) {
      formData.append("max_amount", String(body.max_amount));
    }


    if (body.supported_currencies && Array.isArray(body.supported_currencies)) {
      body.supported_currencies.forEach((currency: string) => {
        formData.append("supported_currencies", currency);
      });
    }

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
    console.error("Create payment method error:", error);
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
