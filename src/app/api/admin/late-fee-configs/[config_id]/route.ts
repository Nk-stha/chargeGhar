import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError } from "axios";
import FormData from "form-data";

// GET - Get details of a specific late fee configuration
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ config_id: string }> },
) {
  try {
    const { config_id } = await params;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: "Authorization header is required" },
        { status: 401 },
      );
    }

    const response = await axios.get(
      `${process.env.BASE_URL}/admin/late-fee-configs/${config_id}`,
      {
        headers: {
          Authorization: authHeader,
        },
      },
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(
      "Late fee config GET error:",
      error.response?.data || error.message,
    );
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      return NextResponse.json(axiosError.response.data, {
        status: axiosError.response.status,
      });
    }
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT - Update an existing late fee configuration
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ config_id: string }> },
) {
  try {
    const { config_id } = await params;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: "Authorization header is required" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const formData = new FormData();

    // Add all form fields if they exist
    if (body.name !== undefined) formData.append("name", body.name);
    if (body.fee_type !== undefined) formData.append("fee_type", body.fee_type);
    if (body.multiplier !== undefined)
      formData.append("multiplier", body.multiplier.toString());
    if (body.flat_rate_per_hour !== undefined)
      formData.append("flat_rate_per_hour", body.flat_rate_per_hour.toString());
    if (body.grace_period_minutes !== undefined)
      formData.append(
        "grace_period_minutes",
        body.grace_period_minutes.toString(),
      );
    if (body.max_daily_rate !== undefined)
      formData.append("max_daily_rate", body.max_daily_rate.toString());
    if (body.is_active !== undefined)
      formData.append("is_active", body.is_active.toString());

    // Handle array field
    if (
      body.applicable_package_types &&
      Array.isArray(body.applicable_package_types)
    ) {
      body.applicable_package_types.forEach((type: string) => {
        formData.append("applicable_package_types", type);
      });
    }

    // Handle metadata object
    if (body.metadata !== undefined) {
      formData.append("metadata", JSON.stringify(body.metadata));
    }

    const response = await axios.put(
      `${process.env.BASE_URL}/admin/late-fee-configs/${config_id}`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: authHeader,
        },
      },
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(
      "Late fee config PUT error:",
      error.response?.data || error.message,
    );
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      return NextResponse.json(axiosError.response.data, {
        status: axiosError.response.status,
      });
    }
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE - Delete a late fee configuration
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ config_id: string }> },
) {
  try {
    const { config_id } = await params;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: "Authorization header is required" },
        { status: 401 },
      );
    }

    const response = await axios.delete(
      `${process.env.BASE_URL}/admin/late-fee-configs/${config_id}`,
      {
        headers: {
          Authorization: authHeader,
        },
      },
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(
      "Late fee config DELETE error:",
      error.response?.data || error.message,
    );
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      return NextResponse.json(axiosError.response.data, {
        status: axiosError.response.status,
      });
    }
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
