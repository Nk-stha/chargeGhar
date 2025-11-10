import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { AxiosError } from "axios";
import FormData from "form-data";

export async function GET(req: NextRequest) {
  try {
    const authorization = req.headers.get("Authorization");

    if (!authorization) {
      return NextResponse.json(
        { message: "Authorization header is required" },
        { status: 401 },
      );
    }

    const url = `${process.env.BASE_URL}/admin/config`;

    const response = await axios.get(url, {
      headers: {
        Authorization: authorization,
        Accept: "application/json",
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Admin config GET route error:", error);
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

export async function POST(req: NextRequest) {
  try {
    const authorization = req.headers.get("Authorization");

    if (!authorization) {
      return NextResponse.json(
        { message: "Authorization header is required" },
        { status: 401 },
      );
    }

    const requestFormData = await req.formData();

    // Convert Next.js FormData to node form-data
    const formData = new FormData();

    // Extract and append all form fields
    for (const [key, value] of requestFormData.entries()) {
      formData.append(key, value.toString());
    }

    const url = `${process.env.BASE_URL}/admin/config`;

    const response = await axios.post(url, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: authorization,
        Accept: "application/json",
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Admin config POST route error:", error);
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

export async function PUT(req: NextRequest) {
  try {
    const authorization = req.headers.get("Authorization");

    if (!authorization) {
      return NextResponse.json(
        { message: "Authorization header is required" },
        { status: 401 },
      );
    }

    const requestFormData = await req.formData();

    // Convert Next.js FormData to node form-data
    const formData = new FormData();

    // Extract and append all form fields
    for (const [key, value] of requestFormData.entries()) {
      formData.append(key, value.toString());
    }

    const url = `${process.env.BASE_URL}/admin/config`;

    const response = await axios.put(url, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: authorization,
        Accept: "application/json",
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Admin config PUT route error:", error);
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

export async function DELETE(req: NextRequest) {
  try {
    const authorization = req.headers.get("Authorization");

    if (!authorization) {
      return NextResponse.json(
        { message: "Authorization header is required" },
        { status: 401 },
      );
    }

    // Get query parameters (config_id or key)
    const searchParams = req.nextUrl.searchParams;
    const config_id = searchParams.get("config_id");
    const key = searchParams.get("key");

    if (!config_id && !key) {
      return NextResponse.json(
        { message: "Either config_id or key is required" },
        { status: 400 },
      );
    }

    const params = new URLSearchParams();
    if (config_id) {
      params.append("config_id", config_id);
    } else if (key) {
      params.append("key", key);
    }

    const url = `${process.env.BASE_URL}/admin/config?${params.toString()}`;

    const response = await axios.delete(url, {
      headers: {
        Authorization: authorization,
        Accept: "application/json",
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Admin config DELETE route error:", error);
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
