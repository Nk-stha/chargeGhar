import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { AxiosError } from 'axios';
import FormData from 'form-data';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('page_size') || '20'; // Default to 20 if not provided

    const response = await axios.get(
      `${process.env.BASE_URL}/admin/coupons?page=${page}&page_size=${pageSize}`,
      {
        headers: {
          'Authorization': req.headers.get('Authorization'),
        },
      }
    );

    const data = response.data;
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Coupons route error (GET):', error);
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      return NextResponse.json(axiosError.response.data, { status: axiosError.response.status });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const code = formData.get('code');
    const name = formData.get('name');
    const points_value = formData.get('points_value');
    const max_uses_per_user = formData.get('max_uses_per_user');
    const valid_from = formData.get('valid_from');
    const valid_until = formData.get('valid_until');

    const apiFormData = new FormData();
    if (code) apiFormData.append('code', code as string);
    if (name) apiFormData.append('name', name as string);
    if (points_value) apiFormData.append('points_value', points_value as string);
    if (max_uses_per_user) apiFormData.append('max_uses_per_user', max_uses_per_user as string);
    if (valid_from) apiFormData.append('valid_from', valid_from as string);
    if (valid_until) apiFormData.append('valid_until', valid_until as string);

    const response = await axios.post(
      `${process.env.BASE_URL}/admin/coupons`,
      apiFormData,
      {
        headers: {
          ...apiFormData.getHeaders(),
          'Authorization': req.headers.get('Authorization'),
          'X-CSRFTOKEN': req.headers.get('X-CSRFTOKEN') || '',
        },
      }
    );

    const data = response.data;
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Coupons route error:', error);
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      return NextResponse.json(axiosError.response.data, { status: axiosError.response.status });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
