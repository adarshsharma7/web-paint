import {NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken'; // Ensure you have the jwt library installed


// Configure the routes to apply this middleware
export const config = {
  matcher: [ '/sign-in', '/sign-up', '/verify/:path*', '/forgetpassword'],
};

export async function middleware(request) {

 
  const path=request.nextUrl.pathname
  const isPublicPath= path==='/sign-in' || path==='/sign-up' || path==='/verify' || path==='/forgetpassword'
  
  const token=request.cookies.get("token")?.value || ""
  if(token && isPublicPath){
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Allow the request to proceed if authenticated or accessing a public path
  return NextResponse.next();
}
