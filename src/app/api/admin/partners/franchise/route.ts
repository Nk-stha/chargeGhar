import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("Authorization");

    if (!authorization) {
      return NextResponse.json(
        { success: false, message: "Authorization header is required" },
        { status: 401 }
      );
    }

    const formData = await request.formData();

    const response = await fetch(
      `${process.env.BASE_URL}/admin/partners/franchise`,
      {
        method: "POST",
        headers: {
          Authorization: authorization,
        },
        body: formData,
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error creating franchise:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create franchise" },
      { status: 500 }
    );
  }
}
