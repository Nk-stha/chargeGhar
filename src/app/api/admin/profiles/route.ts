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

    const response = await axios.get(`${process.env.BASE_URL}/admin/profiles`, {
      headers: {
        Authorization: authorization,
      },
    });

    const data = response.data;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Admin profiles route error:", error);
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
    const csrfToken = req.headers.get("X-CSRFTOKEN") || "";

    if (!authorization) {
      return NextResponse.json(
        { message: "Authorization header is required" },
        { status: 401 },
      );
    }

    const { user, role, password } = await req.json();

    const formData = new FormData();
    formData.append("user", user);
    formData.append("role", role);
    formData.append("password", password);

    const response = await axios.post(
      `${process.env.BASE_URL}/admin/profiles`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: authorization,
          "X-CSRFTOKEN": csrfToken,
        },
      },
    );

    const data = response.data;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Add admin route error:", error);
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
