import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ distribution_id: string }> }
) {
    try {
        const authorization = request.headers.get("Authorization");

        if (!authorization) {
            return NextResponse.json(
                { success: false, message: "Authorization header is required" },
                { status: 401 }
            );
        }

        const { distribution_id } = await params;

        const response = await fetch(
            `${process.env.BASE_URL}/admin/partners/stations/${distribution_id}`,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: authorization,
                },
            }
        );

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Error deactivating station distribution:", error);
        return NextResponse.json(
            { success: false, message: "Failed to deactivate station distribution" },
            { status: 500 }
        );
    }
}
