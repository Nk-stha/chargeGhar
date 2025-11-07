import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { AxiosError } from "axios";
import FormData from "form-data";

// GET - Fetch specific rental package
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ package_id: string }> },
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
    const { package_id } = resolvedParams;

    const response = await axios.get(
      `${process.env.BASE_URL}/admin/rental-packages/${package_id}`,
      {
        headers: {
          Authorization: token,
        },
      },
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Get rental package error:", error);
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

// PATCH - Update rental package
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ package_id: string }> },
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
    const { package_id } = resolvedParams;
    const body = await req.json();

    const formData = new FormData();

    if (body.name !== undefined) formData.append("name", String(body.name));
    if (body.description !== undefined)
      formData.append("description", String(body.description));
    if (body.duration_minutes !== undefined)
      formData.append("duration_minutes", String(body.duration_minutes));
    if (body.price !== undefined) formData.append("price", String(body.price));
    if (body.package_type !== undefined)
      formData.append("package_type", String(body.package_type));
    if (body.payment_model !== undefined)
      formData.append("payment_model", String(body.payment_model));
    if (body.is_active !== undefined)
      formData.append("is_active", String(body.is_active));
    if (body.package_metadata !== undefined)
      formData.append("package_metadata", JSON.stringify(body.package_metadata));

    const response = await axios.patch(
      `${process.env.BASE_URL}/admin/rental-packages/${package_id}`,
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
    console.error("Update rental package error:", error);
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

// DELETE - Delete rental package
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ package_id: string }> },
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
    const { package_id } = resolvedParams;

    const response = await axios.delete(
      `${process.env.BASE_URL}/admin/rental-packages/${package_id}`,
      {
        headers: {
          Authorization: token,
          "X-CSRFTOKEN": csrfToken,
        },
      },
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Delete rental package error:", error);
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
