import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError } from "axios";

interface RouteParams {
    params: Promise<{ powerbank_id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
    try {
        const authorization = req.headers.get("Authorization");
        const { powerbank_id } = await params;

        if (!authorization) {
            return NextResponse.json(
                { message: "Authorization header is required" },
                { status: 401 }
            );
        }

        // Get form data from request
        const formData = await req.formData();
        const status = formData.get("status");
        const reason = formData.get("reason");

        if (!status) {
            return NextResponse.json(
                { message: "Status is required" },
                { status: 400 }
            );
        }

        // Create form data for backend
        const backendFormData = new FormData();
        backendFormData.append("status", status.toString());
        if (reason) {
            backendFormData.append("reason", reason.toString());
        }

        const url = `${process.env.BASE_URL}/admin/powerbanks/${powerbank_id}/status`;

        const response = await axios.post(url, backendFormData, {
            headers: {
                Authorization: authorization,
                "Content-Type": "multipart/form-data",
            },
        });

        return NextResponse.json(response.data);
    } catch (error: unknown) {
        console.error("Admin powerbank status POST route error:", error);
        const axiosError = error as AxiosError;
        if (axiosError.response) {
            return NextResponse.json(axiosError.response.data, {
                status: axiosError.response.status,
            });
        }
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
