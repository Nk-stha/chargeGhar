import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { AxiosError } from "axios";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authorization = req.headers.get("Authorization");

    if (!authorization) {
      return NextResponse.json(
        { message: "Authorization header is required" },
        { status: 401 },
      );
    }

    const { id: userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 },
      );
    }

    const response = await axios.get(
      `${process.env.BASE_URL}/admin/users/${userId}`,
      {
        headers: {
          Authorization: authorization,
        },
      },
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Admin user detail route error:", error);
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
