import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { AxiosError } from "axios";
import FormData from "form-data";

export async function POST(
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

    const { id } = await params;
    const requestFormData = await req.formData();

    // Convert Next.js FormData to node form-data
    const formData = new FormData();

    // Extract and append all form fields
    for (const [key, value] of requestFormData.entries()) {
      formData.append(key, value.toString());
    }

    const url = `${process.env.BASE_URL}/admin/users/${id}/add-balance`;

    const response = await axios.post(url, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: authorization,
        Accept: "application/json",
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Admin user add-balance POST route error:", error);
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
