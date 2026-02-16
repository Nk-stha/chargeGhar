import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { AxiosError } from "axios";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ rental_id: string }> }
) {
  try {
    const { rental_id } = await context.params;
    const authorization = request.headers.get("Authorization");

    if (!authorization) {
      return NextResponse.json(
        { success: false, message: "Authorization header missing" },
        { status: 401 }
      );
    }

    const url = `${process.env.BASE_URL}/admin/rentals/${rental_id}`;

    const response = await axios.get(url, {
      headers: {
        Authorization: authorization,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      return NextResponse.json(axiosError.response.data, {
        status: axiosError.response.status,
      });
    }
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
