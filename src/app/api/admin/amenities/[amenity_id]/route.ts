import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { AxiosError } from "axios";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ amenity_id: string }> },
) {
  try {
    const authorization = req.headers.get("Authorization");

    if (!authorization) {
      return NextResponse.json(
        { message: "Authorization header is required" },
        { status: 401 },
      );
    }

    const { amenity_id } = await params;

    const response = await axios.get(
      `${process.env.BASE_URL}/admin/amenities/${amenity_id}`,
      {
        headers: {
          Authorization: authorization,
        },
      },
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Admin amenity GET route error:", error);
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
  { params }: { params: Promise<{ amenity_id: string }> },
) {
  try {
    const authorization = req.headers.get("Authorization");

    if (!authorization) {
      return NextResponse.json(
        { message: "Authorization header is required" },
        { status: 401 },
      );
    }

    const { amenity_id } = await params;

    // Get form data from request
    const formData = await req.formData();

    // Forward the form data to the backend
    const response = await axios.patch(
      `${process.env.BASE_URL}/admin/amenities/${amenity_id}`,
      formData,
      {
        headers: {
          Authorization: authorization,
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Admin amenity PATCH route error:", error);
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
  { params }: { params: Promise<{ amenity_id: string }> },
) {
  try {
    const authorization = req.headers.get("Authorization");

    if (!authorization) {
      return NextResponse.json(
        { message: "Authorization header is required" },
        { status: 401 },
      );
    }

    const { amenity_id } = await params;

    const response = await axios.delete(
      `${process.env.BASE_URL}/admin/amenities/${amenity_id}`,
      {
        headers: {
          Authorization: authorization,
        },
      },
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Admin amenity DELETE route error:", error);
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
