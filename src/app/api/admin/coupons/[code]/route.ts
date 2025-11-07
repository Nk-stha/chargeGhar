import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { AxiosError } from 'axios';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;

    const response = await axios.delete(
      `${process.env.BASE_URL}/admin/coupons/${code}`,
      {
        headers: {
          'Authorization': req.headers.get('Authorization'),
          'X-CSRFTOKEN': req.headers.get('X-CSRFTOKEN') || '',
        },
      }
    );

    const data = response.data;
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Coupons route error (DELETE):', error);
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      return NextResponse.json(axiosError.response.data, { status: axiosError.response.status });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
