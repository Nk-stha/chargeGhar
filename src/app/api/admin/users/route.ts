import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { AxiosError } from 'axios';

export async function GET(req: NextRequest) {
  try {
    const authorization = req.headers.get('Authorization');

    if (!authorization) {
      return NextResponse.json({ message: 'Authorization header is required' }, { status: 401 });
    }

    // Get query parameters from the request URL
    const { searchParams } = new URL(req.url);
    const page = searchParams.get('page');
    const page_size = searchParams.get('page_size');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const kyc_status = searchParams.get('kyc_status');

    // Build query string
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (page_size) params.append('page_size', page_size);
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (kyc_status) params.append('kyc_status', kyc_status);

    const queryString = params.toString();
    const url = `${process.env.BASE_URL}/admin/users${queryString ? `?${queryString}` : ''}`;

    const response = await axios.get(url, {
      headers: {
        'Authorization': authorization,
      },
    });

    const data = response.data;

    return NextResponse.json(data);
  } catch (error: any) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      return NextResponse.json(axiosError.response.data, { status: axiosError.response.status });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
