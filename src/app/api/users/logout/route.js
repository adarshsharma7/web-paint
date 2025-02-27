import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const response = NextResponse.json({ message: 'Logout successful' });

  // Delete the authentication cookie
  cookies().set('token', '', {
    expires: new Date(0), // Expiring the cookie
    path: '/',
  });

  return response;
}
