import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError } from "axios";

export async function GET(req: NextRequest) {
    try {
        const authorization = req.headers.get("Authorization");

        if (!authorization) {
            return NextResponse.json(
                { message: "Authorization header is required" },
                { status: 401 }
            );
        }

        // Get query parameters
        const searchParams = req.nextUrl.searchParams;
        const page = searchParams.get("page");
        const page_size = searchParams.get("page_size");
        const status = searchParams.get("status");

        // Build query string
        const params = new URLSearchParams();
        if (page) params.append("page", page);
        if (page_size) params.append("page_size", page_size);
        if (status) params.append("status", status);

        const queryString = params.toString();
        const url = `${process.env.BASE_URL}/admin/powerbanks${queryString ? `?${queryString}` : ""}`;

        const response = await axios.get(url, {
            headers: {
                Authorization: authorization,
            },
        });

        return NextResponse.json(response.data);
    } catch (error: unknown) {
        console.error("Admin powerbanks GET route error:", error);
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
