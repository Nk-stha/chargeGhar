import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const authorization = request.headers.get("Authorization");

        if (!authorization) {
            return NextResponse.json(
                { success: false, message: "Authorization header is required" },
                { status: 401 }
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const queryString = searchParams.toString();

        const response = await fetch(
            `${process.env.BASE_URL}/admin/partners/stations${queryString ? `?${queryString}` : ""}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: authorization,
                },
            }
        );

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Error fetching station distributions:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch station distributions" },
            { status: 500 }
        );
    }
}
