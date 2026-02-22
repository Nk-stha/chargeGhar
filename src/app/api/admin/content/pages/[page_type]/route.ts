import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError } from "axios";
import FormData from "form-data";

interface Context {
  params: Promise<{ page_type: string }>;
}

export async function GET(req: NextRequest, context: Context) {
  try {
    const authorization = req.headers.get("Authorization");

    if (!authorization) {
      return NextResponse.json(
        { message: "Authorization header is required" },
        { status: 401 },
      );
    }

    const { page_type } = await context.params;
    const url = `${process.env.BASE_URL}/admin/content/pages/${page_type}`;

    const response = await axios.get(url, {
      headers: {
        Authorization: authorization,
        Accept: "application/json",
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
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest, context: Context) {
  try {
    const authorization = req.headers.get("Authorization");

    if (!authorization) {
      return NextResponse.json(
        { message: "Authorization header is required" },
        { status: 401 },
      );
    }

    const { page_type } = await context.params;
    const requestFormData = await req.formData();

    const formData = new FormData();
    for (const [key, value] of requestFormData.entries()) {
      formData.append(key, value.toString());
    }

    const url = `${process.env.BASE_URL}/admin/content/pages/${page_type}`;

    const response = await axios.put(url, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: authorization,
        Accept: "application/json",
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
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
