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
    const period = searchParams.get("period") || "daily";
    const start_date = searchParams.get("start_date");
    const end_date = searchParams.get("end_date");
    const transaction_type = searchParams.get("transaction_type");

    // Build query string
    const params = new URLSearchParams();
    params.append("period", period);
    if (start_date) params.append("start_date", start_date);
    if (end_date) params.append("end_date", end_date);
    if (transaction_type) params.append("transaction_type", transaction_type);

    const queryString = params.toString();
    const url = `${process.env.BASE_URL}/admin/analytics/revenue-over-time?${queryString}`;

    const response = await axios.get(url, {
      headers: {
        Authorization: authorization,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Admin revenue analytics GET route error:", error);
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
