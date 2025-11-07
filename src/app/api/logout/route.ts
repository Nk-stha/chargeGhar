import { NextResponse } from 'next/server';

export async function POST() {
  try {
    return NextResponse.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout route error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
