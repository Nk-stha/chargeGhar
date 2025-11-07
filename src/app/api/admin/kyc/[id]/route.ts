import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { AxiosError } from 'axios';
import FormData from 'form-data';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authorization = req.headers.get('Authorization');
    const csrfToken = req.headers.get('X-CSRFTOKEN') || '';

    if (!authorization) {
      return NextResponse.json({ message: 'Authorization header is required' }, { status: 401 });
    }

    const body = await req.json();
    const { status, rejection_reason } = body;

    if (!status) {
      return NextResponse.json({ message: 'Status is required' }, { status: 400 });
    }

    if (status === 'REJECTED' && !rejection_reason) {
      return NextResponse.json({ message: 'Rejection reason is required when status is REJECTED' }, { status: 400 });
    }

    const formData = new FormData();
    formData.append('status', status);
    if (rejection_reason) {
      formData.append('rejection_reason', rejection_reason);
    }

    const response = await axios.patch(
      `${process.env.BASE_URL}/admin/kyc/submissions/${params.id}`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': authorization,
          'X-CSRFTOKEN': csrfToken,
        },
      }
    );

    const data = response.data;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Admin KYC update route error:', error);
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      return NextResponse.json(axiosError.response.data, { status: axiosError.response.status });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
