import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { AxiosError } from 'axios';
import FormData from 'form-data';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authorization = req.headers.get('Authorization');

    if (!authorization) {
      return NextResponse.json({ message: 'Authorization header is required' }, { status: 401 });
    }

    const { id } = await params;
    const formData = await req.formData();

    const action = formData.get('action') as string;
    const adminNotes = formData.get('admin_notes') as string;

    if (!action || !['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json({ message: 'Valid action (APPROVE or REJECT) is required' }, { status: 400 });
    }

    const form = new FormData();
    form.append('action', action);
    if (adminNotes) {
      form.append('admin_notes', adminNotes);
    }

    const csrfToken = req.cookies.get('csrftoken')?.value;

    const response = await axios.post(
      `${process.env.BASE_URL}/admin/refunds/${id}/process`,
      form,
      {
        headers: {
          'Authorization': authorization,
          ...(csrfToken && { 'X-CSRFTOKEN': csrfToken }),
          ...form.getHeaders(),
        },
      }
    );

    const data = response.data;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Admin refund process route error:', error);
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      return NextResponse.json(axiosError.response.data, { status: axiosError.response.status });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
