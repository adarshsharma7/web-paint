import { NextResponse } from 'next/server';

export async function GET() {
  const response = NextResponse.json({ success: true, message: 'Logout successful' });

  response.headers.set('Set-Cookie', 'token=; HttpOnly; Secure; Path=/; Max-Age=0; SameSite=Strict;');

  return response;
}
