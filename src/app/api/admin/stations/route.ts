import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { AxiosError } from 'axios';

export async function GET(req: NextRequest) {
  try {
    const authorization = req.headers.get('Authorization');

    if (!authorization) {
      return NextResponse.json({ message: 'Authorization header is required' }, { status: 401 });
    }

    const response = await axios.get(
      `${process.env.BASE_URL}/admin/stations`,
      {
        headers: {
          'Authorization': authorization,
        },
      }
    );

    const data = response.data;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Admin stations route error:', error);
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      return NextResponse.json(axiosError.response.data, { status: axiosError.response.status });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
