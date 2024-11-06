// Import necessary modules
import { NextResponse } from 'next/server';

export async function GET(request) {
  const response = NextResponse.json({ message: 'Logout successful' });

  // Clear the authentication cookie
  response.cookies.set('token', '', { 
    expires: new Date(0), 
    path: '/',         
  });

  return response;
}
