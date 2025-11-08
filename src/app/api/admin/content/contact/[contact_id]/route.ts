import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { AxiosError } from "axios";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ contact_id: string }> },
) {
  try {
    const authorization = req.headers.get("Authorization");

    if (!authorization) {
      return NextResponse.json(
        { message: "Authorization header is required" },
        { status: 401 },
      );
    }

    const { contact_id } = await params;
    const url = `${process.env.BASE_URL}/admin/content/contact/${contact_id}`;

    const response = await axios.get(url, {
      headers: {
        Authorization: authorization,
        Accept: "application/json",
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Admin contact detail GET route error:", error);
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ contact_id: string }> },
) {
  try {
    const authorization = req.headers.get("Authorization");

    if (!authorization) {
      return NextResponse.json(
        { message: "Authorization header is required" },
        { status: 401 },
      );
    }

    const { contact_id } = await params;
    const url = `${process.env.BASE_URL}/admin/content/contact/${contact_id}`;

    const response = await axios.delete(url, {
      headers: {
        Authorization: authorization,
        Accept: "application/json",
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Admin contact DELETE route error:", error);
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
