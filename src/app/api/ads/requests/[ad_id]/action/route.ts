import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(
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
    const formData = await req.formData();

    const url = `${process.env.BASE_URL}/ads/requests/${ad_id}/action`;

    const response = await axios.post(url, formData, {
      headers: {
        Authorization: token,
        "Content-Type": "multipart/form-data",
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error executing ad action:", error.response?.data || error.message);
    return NextResponse.json(
      { message: error.response?.data?.message || "Failed to execute ad action" },
      { status: error.response?.status || 500 }
    );
  }
}
