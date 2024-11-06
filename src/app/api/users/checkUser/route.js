import { NextResponse } from 'next/server';
import { dbConnect } from '@/dbConfig/dbConfig';
import User from '@/models/userModel';
import jwt from 'jsonwebtoken';

export async function GET(req) {
    const cookies = req.cookies;  


  if (!cookies) {
    return NextResponse.json({
      success: false,
      message: "No token provided"
    }, { status: 401 });
  }

  const token = cookies.get('token')?.value;
 if(!token){
  return NextResponse.json({
    success: false,
    message: "No token provided"
  }, { status: 401 });
 }

  try {
    await dbConnect();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return NextResponse.json({
        success: false,
        message: "Invalid Token"
      }, { status: 401 });
    }

    const user = await User.findById(decoded.id).select('fullName avatar username');

    if (!user) {
      return NextResponse.json({
        success: true,
        message: "User not found"
      }, { status: 200 });
    }

    return NextResponse.json({
      success: true,
      message: "User found",
      userData: user,
    }, { status: 200 });

  } catch (error) {
    console.log("Error in user check backend:", error);
    return NextResponse.json({
      success: false,
      message: "Error checking user"
    }, { status: 500 });
  }
}
