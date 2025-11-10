import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { AxiosError } from "axios";

export async function GET(req: NextRequest) {
  try {
    const authorization = req.headers.get("Authorization");

    if (!authorization) {
      return NextResponse.json(
        { message: "Authorization header is required" },
        { status: 401 },
      );
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    const issue_type = searchParams.get("issue_type");
    const search = searchParams.get("search");
    const start_date = searchParams.get("start_date");
    const end_date = searchParams.get("end_date");

    // Build query string
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (issue_type) params.append("issue_type", issue_type);
    if (search) params.append("search", search);
    if (start_date) params.append("start_date", start_date);
    if (end_date) params.append("end_date", end_date);

    const queryString = params.toString();
    const url = `${process.env.BASE_URL}/admin/rentals/issues${queryString ? `?${queryString}` : ""}`;

    const response = await axios.get(url, {
      headers: {
        Authorization: authorization,
        Accept: "application/json",
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Admin rental issues GET route error:", error);
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
