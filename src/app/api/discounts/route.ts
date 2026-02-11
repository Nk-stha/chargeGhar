import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.BASE_URL || "https://main.chargeghar.com/api";

export async function GET(request: NextRequest) {
  try {
    console.log("=== DISCOUNTS GET ROUTE ===");
    const authHeader = request.headers.get("Authorization");
    console.log("Auth header present:", !!authHeader);

    if (!authHeader) {
      console.log("No auth header, returning 401");
      return NextResponse.json(
        { success: false, message: "Authorization header missing" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page") || "1";
    const pageSize = searchParams.get("page_size") || "20";

    const url = `${BASE_URL}/admin/discounts?page=${page}&page_size=${pageSize}`;
    console.log("BASE_URL:", BASE_URL);
    console.log("Fetching discounts from:", url);
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    });

    console.log("Backend response status:", response.status);
    console.log("Backend response ok:", response.ok);

    const data = await response.json();
    console.log("Backend response data:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.log("Backend returned error, forwarding");
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to fetch discounts",
        },
        { status: response.status }
      );
    }

    console.log("Returning success response");
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("=== ERROR IN DISCOUNTS ROUTE ===");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal server error",
        error: error.toString(),
      },
      { status: 500 }
    );
  }
}

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

    const response = await fetch(`${BASE_URL}/admin/discounts`, {
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
          message: data.message || "Failed to create discount",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("Error creating discount:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
