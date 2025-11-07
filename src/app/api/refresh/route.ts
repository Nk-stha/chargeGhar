import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  const { refresh: refreshToken } = await req.json();
  const csrfToken = req.headers.get('X-CSRFTOKEN');

  if (!refreshToken) {
    return NextResponse.json({ message: 'Refresh token not found' }, { status: 401 });
  }

  if (!csrfToken) {
    return NextResponse.json({ message: 'CSRF token not found' }, { status: 401 });
  }

  try {
    const formData = new FormData();
    formData.append('refresh', refreshToken);

    const response = await axios.post(`${process.env.BASE_URL}/auth/refresh`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-CSRFTOKEN': csrfToken,
      },
    });

    const { access: newAccessToken } = response.data;

    if (!newAccessToken) {
      return NextResponse.json({ message: 'New access token not found in response' }, { status: 500 });
    }

    return NextResponse.json({ accessToken: newAccessToken });

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json({ message: 'Invalid refresh token' }, { status: 401 });
  }
}
