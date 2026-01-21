import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization");

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const params = new URLSearchParams();
    
    if (searchParams.get("page")) params.append("page", searchParams.get("page")!);
    if (searchParams.get("page_size")) params.append("page_size", searchParams.get("page_size")!);
    if (searchParams.get("search")) params.append("search", searchParams.get("search")!);
    if (searchParams.get("status")) params.append("status", searchParams.get("status")!);
    if (searchParams.get("user_id")) params.append("user_id", searchParams.get("user_id")!);

    const queryString = params.toString();
    const url = `${process.env.BASE_URL}/ads/requests${queryString ? `?${queryString}` : ""}`;

    const response = await axios.get(url, {
      headers: {
        Authorization: token,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error fetching ad requests:", error.response?.data || error.message);
    return NextResponse.json(
      { message: error.response?.data?.message || "Failed to fetch ad requests" },
      { status: error.response?.status || 500 }
    );
  }
}
