import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { AxiosError } from 'axios';

export async function GET(req: NextRequest) {
  try {
    const authorization = req.headers.get('Authorization');

    if (!authorization) {
      return NextResponse.json({ message: 'Authorization header is required' }, { status: 401 });
    }

    const headers = { 'Authorization': authorization };

    const [dashboardRes, profilesRes, stationsRes] = await Promise.all([
      axios.get(`${process.env.BASE_URL}/admin/dashboard`, { headers }),
      axios.get(`${process.env.BASE_URL}/admin/profiles`, { headers }),
      axios.get(`${process.env.BASE_URL}/admin/stations`, { headers }),
    ]);

    const data = {
      dashboard: dashboardRes.data.data,
      profiles: profilesRes.data.data,
      stations: stationsRes.data.data,
    };

    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    console.error('Dashboard data route error:', error);
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      return NextResponse.json(axiosError.response.data, { status: axiosError.response.status });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
