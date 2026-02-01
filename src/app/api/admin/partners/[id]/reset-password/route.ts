import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authorization = request.headers.get("Authorization");

    if (!authorization) {
      return NextResponse.json(
        { success: false, message: "Authorization header is required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const formData = await request.formData();

    const response = await fetch(
      `${process.env.BASE_URL}/admin/partners/${id}/reset-password`,
      {
        method: "PATCH",
        headers: {
          Authorization: authorization,
        },
        body: formData,
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error resetting partner password:", error);
    return NextResponse.json(
      { success: false, message: "Failed to reset partner password" },
      { status: 500 }
    );
  }
}
