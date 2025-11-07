import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { AxiosError } from "axios";
import FormData from "form-data";

// GET - Fetch specific payment method
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ method_id: string }> },
) {
  try {
    const token = req.headers.get("Authorization");
    console.log(token);

    if (!token) {
      return NextResponse.json(
        { message: "Authorization token required" },
        { status: 401 },
      );
    }

    const resolvedParams = await context.params;
    const { method_id } = resolvedParams;
    console.log(method_id);

    const response = await axios.get(
      `${process.env.BASE_URL}/admin/payment-methods/${method_id}`,
      {
        headers: {
          Authorization: token,
        },
      },
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Get payment method error:", error);
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

// PATCH - Update payment method
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ method_id: string }> },
) {
  try {
    const token = req.headers.get("Authorization");
    const csrfToken = req.headers.get("X-CSRFTOKEN") || "";

    if (!token) {
      return NextResponse.json(
        { message: "Authorization token required" },
        { status: 401 },
      );
    }

    const resolvedParams = await context.params;
    const { method_id } = resolvedParams;
    const body = await req.json();

    const formData = new FormData();
    console.log(formData);
    console.log(method_id);
    console.log("body", body);

    if (body.name !== undefined) formData.append("name", String(body.name));
    if (body.gateway !== undefined)
      formData.append("gateway", String(body.gateway));
    if (body.is_active !== undefined)
      formData.append("is_active", String(body.is_active));
    if (body.configuration !== undefined)
      formData.append("configuration", JSON.stringify(body.configuration));
    if (body.min_amount !== undefined)
      formData.append("min_amount", String(body.min_amount));
    if (body.max_amount !== undefined)
      formData.append("max_amount", String(body.max_amount));
    if (body.supported_currencies && Array.isArray(body.supported_currencies)) {
      body.supported_currencies.forEach((currency: string) =>
        formData.append("supported_currencies", currency),
      );
    }

    const response = await axios.patch(
      `${process.env.BASE_URL}/admin/payment-methods/${method_id}`,
      formData,
      {
        headers: {
          ...formData.getHeaders(), // ✅ Node FormData requires this
          Authorization: token,
          "X-CSRFTOKEN": csrfToken,
        },
      },
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Update payment method error:", error);
    if (error.response) {
      return NextResponse.json(error.response.data, {
        status: error.response.status,
      });
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE - Delete payment method
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ method_id: string }> },
) {
  try {
    const token = req.headers.get("Authorization");
    const csrfToken = req.headers.get("X-CSRFTOKEN") || "";

    if (!token) {
      return NextResponse.json(
        { message: "Authorization token required" },
        { status: 401 },
      );
    }

    const resolvedParams = await context.params;
    const { method_id } = resolvedParams;

    const response = await axios.delete(
      `${process.env.BASE_URL}/admin/payment-methods/${method_id}`,
      {
        headers: {
          Authorization: token,
          "X-CSRFTOKEN": csrfToken,
        },
      },
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Delete payment method error:", error);
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
