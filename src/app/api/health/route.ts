import { NextResponse } from "next/server";

/**
 * Public health check endpoint — no authentication required.
 * Used by Docker HEALTHCHECK, Nginx, and CI/CD pipeline.
 */
export async function GET() {
    return NextResponse.json(
        {
            status: "ok",
            service: "chargeghar-dashboard",
            timestamp: new Date().toISOString(),
        },
        { status: 200 }
    );
}
