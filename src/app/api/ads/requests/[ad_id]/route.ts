import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ad_id: string }> }
) {
  try {
    const token = req.headers.get("authorization");

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { ad_id } = await params;
    const url = `${process.env.BASE_URL}/ads/requests/${ad_id}`;

    const response = await axios.get(url, {
      headers: {
        Authorization: token,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.response?.data?.message || "Failed to fetch ad request detail" },
      { status: error.response?.status || 500 }
    );
  }
}
