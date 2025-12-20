import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { AxiosError } from "axios";

export async function GET(req: NextRequest) {
    try {
        const authorization = req.headers.get("Authorization");

        if (!authorization) {
            return NextResponse.json(
                { message: "Authorization header is required" },
                { status: 401 }
            );
        }

        if (!process.env.BASE_URL) {
            console.error("BASE_URL environment variable is not defined");
            return NextResponse.json(
                { message: "Server configuration error" },
                { status: 500 }
            );
        }

        const url = `${process.env.BASE_URL}/admin/analytics/users`;

        const response = await axios.get(url, {
            headers: {
                Authorization: authorization,
            },
            timeout: 10000, // 10s timeout
        });

        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error("Admin user analytics GET route error:", error);

        if (axios.isAxiosError(error) && error.response) {
            return NextResponse.json(error.response.data, {
                status: error.response.status,
            });
        }

        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
