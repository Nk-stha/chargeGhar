import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { AxiosError } from "axios";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ rental_id: string }> },
) {
  try {
    const authorization = req.headers.get("Authorization");

    if (!authorization) {
      return NextResponse.json(
        { message: "Authorization header is required" },
        { status: 401 },
      );
    }

    const { rental_id } = await params;

    if (!rental_id) {
      return NextResponse.json(
        { message: "Rental ID is required" },
        { status: 400 },
      );
    }

    const response = await axios.get(
      `${process.env.BASE_URL}/admin/rentals/${rental_id}`,
      {
        headers: {
          Authorization: authorization,
        },
      },
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Admin rental detail GET route error:", error);
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
