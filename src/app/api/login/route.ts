import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { AxiosError } from 'axios';
import FormData from 'form-data';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const csrfToken = req.headers.get('X-CSRFTOKEN') || '';

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    const response = await axios.post(
      `${process.env.BASE_URL}/admin/login`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'X-CSRFTOKEN': csrfToken,
        },
      }
    );

    const data = response.data;
    console.log(data)

    if (data.data?.access_token) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json({ message: 'Access token not found' }, { status: 401 });
    }
  } catch (error: any) {
    console.error('Login route error:', error);
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      return NextResponse.json(axiosError.response.data, { status: axiosError.response.status });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
