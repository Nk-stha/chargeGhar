import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { AxiosError } from "axios";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ issue_id: string }> },
) {
  try {
    const authorization = req.headers.get("Authorization");

    if (!authorization) {
      return NextResponse.json(
        { message: "Authorization header is required" },
        { status: 401 },
      );
    }

    const { issue_id } = await params;
    const url = `${process.env.BASE_URL}/admin/stations/issues/${issue_id}`;

    const response = await axios.get(url, {
      headers: {
        Authorization: authorization,
        Accept: "application/json",
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Admin station issue detail GET route error:", error);
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
  { params }: { params: Promise<{ issue_id: string }> },
) {
  try {
    const authorization = req.headers.get("Authorization");

    if (!authorization) {
      return NextResponse.json(
        { message: "Authorization header is required" },
        { status: 401 },
      );
    }

    const { issue_id } = await params;
    const body = await req.json();

    // Convert JSON to FormData
    const formData = new FormData();
    if (body.status) {
      formData.append("status", body.status);
    }
    if (body.priority) {
      formData.append("priority", body.priority);
    }
    if (body.assigned_to_id) {
      // Validate UUID format
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(body.assigned_to_id)) {
        formData.append("assigned_to_id", body.assigned_to_id);
      }
    }
    if (body.notes) {
      formData.append("notes", body.notes);
    }

    const url = `${process.env.BASE_URL}/admin/stations/issues/${issue_id}`;

    const response = await axios.patch(url, formData, {
      headers: {
        Authorization: authorization,
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Admin station issue PATCH route error:", error);
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
  { params }: { params: Promise<{ issue_id: string }> },
) {
  try {
    const authorization = req.headers.get("Authorization");

    if (!authorization) {
      return NextResponse.json(
        { message: "Authorization header is required" },
        { status: 401 },
      );
    }

    const { issue_id } = await params;
    const url = `${process.env.BASE_URL}/admin/stations/issues/${issue_id}`;

    const response = await axios.delete(url, {
      headers: {
        Authorization: authorization,
        Accept: "application/json",
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Admin station issue DELETE route error:", error);
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
