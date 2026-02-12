import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.BASE_URL || "https://main.chargeghar.com/api";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: "Authorization header missing" },
        { status: 401 }
      );
    }

    const formData = await request.formData();

    const response = await fetch(`${BASE_URL}/internal/iot/wifi/scan`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to scan WiFi networks",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Failed to scan WiFi networks" },
      { status: 500 }
    );
  }
}
