import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError } from "axios";

interface RouteParams {
    params: Promise<{ powerbank_id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const authorization = req.headers.get("Authorization");
        const { powerbank_id } = await params;

        if (!authorization) {
            return NextResponse.json(
                { message: "Authorization header is required" },
                { status: 401 }
            );
        }

        const url = `${process.env.BASE_URL}/admin/powerbanks/${powerbank_id}`;

        const response = await axios.get(url, {
            headers: {
                Authorization: authorization,
            },
        });

        return NextResponse.json(response.data);
    } catch (error: unknown) {
        console.error("Admin powerbank detail GET route error:", error);
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
