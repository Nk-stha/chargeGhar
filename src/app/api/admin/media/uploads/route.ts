import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { AxiosError } from 'axios';

export async function GET(req: NextRequest) {
  try {
    const authorization = req.headers.get('Authorization');

    if (!authorization) {
      return NextResponse.json({ message: 'Authorization header is required' }, { status: 401 });
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const page = searchParams.get('page');
    const page_size = searchParams.get('page_size');
    const type = searchParams.get('type');
    const user_id = searchParams.get('user_id');

    // Build query string
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (page_size) params.append('page_size', page_size);
    if (type) params.append('type', type);
    if (user_id) params.append('user_id', user_id);

    const queryString = params.toString();
    const url = `${process.env.BASE_URL}/admin/media/uploads${queryString ? `?${queryString}` : ''}`;

    const response = await axios.get(url, {
      headers: {
        'Authorization': authorization,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Admin media uploads GET route error:', error);
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      return NextResponse.json(axiosError.response.data, { status: axiosError.response.status });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authorization = req.headers.get('Authorization');

    if (!authorization) {
      return NextResponse.json({ message: 'Authorization header is required' }, { status: 401 });
    }

    // Get form data from request
    const formData = await req.formData();

    // Forward the form data to the backend
    const response = await axios.post(
      `${process.env.BASE_URL}/admin/media/uploads`,
      formData,
      {
        headers: {
          'Authorization': authorization,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Admin media uploads POST route error:', error);
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      return NextResponse.json(axiosError.response.data, { status: axiosError.response.status });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
