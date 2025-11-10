import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError } from "axios";
import FormData from "form-data";

// GET - Fetch all late fee configurations
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: "Authorization header is required" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const queryParams = new URLSearchParams();

    // Add query parameters if they exist
    if (searchParams.get("fee_type")) {
      queryParams.append("fee_type", searchParams.get("fee_type")!);
    }
    if (searchParams.get("is_active")) {
      queryParams.append("is_active", searchParams.get("is_active")!);
    }
    if (searchParams.get("page")) {
      queryParams.append("page", searchParams.get("page")!);
    }
    if (searchParams.get("page_size")) {
      queryParams.append("page_size", searchParams.get("page_size")!);
    }
    if (searchParams.get("search")) {
      queryParams.append("search", searchParams.get("search")!);
    }

    const queryString = queryParams.toString();
    const url = `${process.env.BASE_URL}/admin/late-fee-configs${queryString ? `?${queryString}` : ""}`;

    const response = await axios.get(url, {
      headers: {
        Authorization: authHeader,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(
      "Late fee configs GET error:",
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

// POST - Create new late fee configuration
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: "Authorization header is required" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const formData = new FormData();

    // Add all form fields
    if (body.name) formData.append("name", body.name);
    if (body.fee_type) formData.append("fee_type", body.fee_type);
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
    if (body.metadata) {
      formData.append("metadata", JSON.stringify(body.metadata));
    }

    const response = await axios.post(
      `${process.env.BASE_URL}/admin/late-fee-configs`,
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
      "Late fee config POST error:",
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
