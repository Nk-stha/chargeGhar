import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.BASE_URL || "https://main.chargeghar.com/api";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ payout_id: string }> }
) {
  try {
    const { payout_id } = await context.params;
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: "Authorization header missing" },
        { status: 401 }
      );
    }

    const formData = await request.formData();

    const response = await fetch(
      `${BASE_URL}/admin/partners/payouts/${payout_id}/approve`,
      {
        method: "PATCH",
        headers: {
          Authorization: authHeader,
        },
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to approve payout",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Failed to approve payout" },
      { status: 500 }
    );
  }
}
