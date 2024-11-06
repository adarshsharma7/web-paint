import bcrypt from 'bcryptjs';
import { dbConnect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { sendVerificationEmail } from '@/helper/sendVerificationCode';
import jwt from 'jsonwebtoken'; // Import jwt


export async function POST(req) {
    await dbConnect();
    try {
        const { identifier, password } = await req.json();
        const user = await User.findOne({
            $or: [{ email: identifier }, { username: identifier }]
        });
        if (!user) {
            return Response.json({
                success: false,
                message: "User not found"
            }, { status: 400 });
        }
        if (!user.isVerified) {
            let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
            const result = await sendVerificationEmail(user.email, user.username, verifyCode);
            if (!result.success) {
                return Response.json({
                    success: false,
                    message: `Error sending verification code: ${result.message}`
                }, { status: 500 });
            }
            user.verifyCode = verifyCode;
            user.verifyCodeExpiry = new Date(Date.now() + 3600000);
            await user.save();
            return Response.json({
                success: false,
                username: user.username,
                message: "Please verify your account before login"
            }, { status: 400 });
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return Response.json({
                success: false,
                message: "Password is incorrect"
            }, { status: 400 });
        }

        // Create a token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        // Set the token in the cookie
        const res = Response.json({
            success: true,
            message: "Login successfully"
        }, { status: 200 });
        
        // Set cookie options
       // Example for setting the cookie in your API route after creating the token

       res.headers.set('Set-Cookie', `token=${token}; HttpOnly; Secure; Path=/; Max-Age=${24 * 60 * 60}; SameSite=Strict;`);


        return res;

    } catch (error) {
        console.log("kuch galt backend sign-in ", error);

        return Response.json({
            success: false,
            message: "Something error"
        }, { status: 500 });
    }
}
