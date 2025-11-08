import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { AxiosError } from "axios";

export async function GET(req: NextRequest) {
  try {
    const authorization = req.headers.get("Authorization");

    if (!authorization) {
      return NextResponse.json(
        { message: "Authorization header is required" },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const page = searchParams.get("page");
    const page_size = searchParams.get("page_size");
    const status = searchParams.get("status");
    const start_date = searchParams.get("start_date");
    const end_date = searchParams.get("end_date");
    const search = searchParams.get("search");

    // Build query string
    const params = new URLSearchParams();
    if (page) params.append("page", page);
    if (page_size) params.append("page_size", page_size);
    if (status) params.append("status", status);
    if (start_date) params.append("start_date", start_date);
    if (end_date) params.append("end_date", end_date);
    if (search) params.append("search", search);

    const queryString = params.toString();
    const url = `${process.env.BASE_URL}/admin/transactions${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await axios.get(url, {
      headers: {
        Authorization: authorization,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Admin transactions GET route error:", error);
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      return NextResponse.json(axiosError.response.data, {
        status: axiosError.response.status,
      });
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
