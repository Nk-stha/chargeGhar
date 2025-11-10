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
    const page = searchParams.get("page");
    const page_size = searchParams.get("page_size");
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const is_maintenance = searchParams.get("is_maintenance");
    const start_date = searchParams.get("start_date");
    const end_date = searchParams.get("end_date");

    // Build query string
    const params = new URLSearchParams();
    if (page) params.append("page", page);
    if (page_size) params.append("page_size", page_size);
    if (search) params.append("search", search);
    if (status) params.append("status", status);
    if (is_maintenance !== null)
      params.append("is_maintenance", is_maintenance);
    if (start_date) params.append("start_date", start_date);
    if (end_date) params.append("end_date", end_date);

    const queryString = params.toString();
    const url = `${process.env.BASE_URL}/admin/stations${queryString ? `?${queryString}` : ""}`;

    const response = await axios.get(url, {
      headers: {
        Authorization: authorization,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Admin stations GET route error:", error);
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

export async function POST(req: NextRequest) {
  try {
    const authorization = req.headers.get("Authorization");

    if (!authorization) {
      return NextResponse.json(
        { message: "Authorization header is required" },
        { status: 401 },
      );
    }

    // Get JSON body from request
    const body = await req.json();

    // Forward the JSON data to the backend
    const response = await axios.post(
      `${process.env.BASE_URL}/admin/stations`,
      body,
      {
        headers: {
          Authorization: authorization,
          "Content-Type": "application/json",
        },
      },
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Admin stations POST route error:", error);
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
