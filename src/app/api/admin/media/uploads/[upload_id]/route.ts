import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { AxiosError } from "axios";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ upload_id: string }> },
) {
  try {
    const authorization = req.headers.get("Authorization");

    if (!authorization) {
      return NextResponse.json(
        { message: "Authorization header is required" },
        { status: 401 },
      );
    }

    const { upload_id } = await params;

    if (!upload_id) {
      return NextResponse.json(
        { message: "Upload ID is required" },
        { status: 400 },
      );
    }

    const response = await axios.delete(
      `${process.env.BASE_URL}/admin/media/uploads/${upload_id}`,
      {
        headers: {
          Authorization: authorization,
        },
      },
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Admin media DELETE route error:", error);
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      return NextResponse.json(axiosError.response.data, {
        status: axiosError.response.status,
      });
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
