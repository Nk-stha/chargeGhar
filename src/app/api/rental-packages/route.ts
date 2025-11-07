import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { AxiosError } from "axios";
import FormData from "form-data";

// GET - Fetch all rental packages
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
      `${process.env.BASE_URL}/admin/rental-packages`,
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
    console.error("Get rental packages error:", error);
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

// POST - Create new rental package
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
    formData.append("description", String(body.description));
    formData.append("duration_minutes", String(body.duration_minutes));
    formData.append("price", String(body.price));
    formData.append("package_type", String(body.package_type));
    formData.append("payment_model", String(body.payment_model));

    if (body.is_active !== undefined) {
      formData.append("is_active", String(body.is_active));
    }

    if (body.package_metadata !== undefined) {
      formData.append("package_metadata", JSON.stringify(body.package_metadata));
    }

    const response = await axios.post(
      `${process.env.BASE_URL}/admin/rental-packages`,
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
    console.error("Create rental package error:", error);
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
