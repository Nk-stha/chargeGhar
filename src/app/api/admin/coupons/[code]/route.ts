import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { AxiosError } from "axios";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const authorization = req.headers.get("Authorization");

    if (!authorization) {
      return NextResponse.json(
        { message: "Authorization header is required" },
        { status: 401 },
      );
    }

    const { code } = await params;

    const response = await axios.get(
      `${process.env.BASE_URL}/admin/coupons/${code}`,
      {
        headers: {
          Authorization: authorization,
        },
      },
    );

    const data = response.data;
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Coupons route error (GET):", error);
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const authorization = req.headers.get("Authorization");

    if (!authorization) {
      return NextResponse.json(
        { message: "Authorization header is required" },
        { status: 401 },
      );
    }

    const { code } = await params;
    const formData = await req.formData();

    const status = formData.get("status") as string;

    if (!status) {
      return NextResponse.json(
        { message: "Status is required" },
        { status: 400 },
      );
    }

    const FormData = (await import("form-data")).default;
    const form = new FormData();
    form.append("status", status);

    const csrfToken = req.cookies.get("csrftoken")?.value;

    const response = await axios.patch(
      `${process.env.BASE_URL}/admin/coupons/${code}`,
      form,
      {
        headers: {
          Authorization: authorization,
          ...(csrfToken && { "X-CSRFTOKEN": csrfToken }),
          ...form.getHeaders(),
        },
      },
    );

    const data = response.data;
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Coupons route error (PATCH):", error);
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
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;

    const response = await axios.delete(
      `${process.env.BASE_URL}/admin/coupons/${code}`,
      {
        headers: {
          Authorization: req.headers.get("Authorization"),
          "X-CSRFTOKEN": req.headers.get("X-CSRFTOKEN") || "",
        },
      },
    );

    const data = response.data;
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Coupons route error (DELETE):", error);
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
