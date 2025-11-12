import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { AxiosError } from "axios";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ referral_id: string }> }
) {
  try {
    const authorization = req.headers.get("Authorization");

    if (!authorization) {
      return NextResponse.json(
        { message: "Authorization header is required" },
        { status: 401 }
      );
    }

    const { referral_id } = await params;
    const body = await req.json();
    const url = `${process.env.BASE_URL}/admin/referrals/${referral_id}/complete`;

    const response = await axios.post(url, body, {
      headers: {
        Authorization: authorization,
        "Content-Type": "application/json",
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Admin referral complete route error:", error);
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
