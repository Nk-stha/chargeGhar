import { NextRequest, NextResponse } from "next/server";

export async function GET(
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

    const response = await fetch(
      `${process.env.BASE_URL}/admin/partners/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorization,
        },
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error fetching partner detail:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch partner detail" },
      { status: 500 }
    );
  }
}

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
      `${process.env.BASE_URL}/admin/partners/${id}`,
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
    console.error("Error updating partner:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update partner" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const response = await fetch(
      `${process.env.BASE_URL}/admin/partners/${id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorization,
        },
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error deleting partner:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete partner" },
      { status: 500 }
    );
  }
}
