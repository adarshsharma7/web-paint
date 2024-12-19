// import {
//     Html,
//     Head,
//     Font,
//     Preview,
//     Heading,
//     Row,
//     Section,
//     Text,
//     Button,
//   } from '@react-email/components';
  
 
//   export default function VerifverifyEmailHtmlicationEmail({ username, otp }) {
//     return (
//       <Html lang="en" dir="ltr">
//         <Head>
//           <title>Verification Code</title>
//           <Font
//             fontFamily="Roboto"
//             fallbackFontFamily="Verdana"
//             webFont={{
//               url: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
//               format: 'woff2',
//             }}
//             fontWeight={400}
//             fontStyle="normal"
//           />
//         </Head>
//         <Preview>Here&apos;s your verification code: {otp}</Preview>
//         <Section>
//           <Row>
//             <Heading as="h2">Hello {username},</Heading>
//           </Row>
//           <Row>
//             <Text>
//               Thank you for registering. Please use the following verification
//               code to complete your registration:
//             </Text>
//           </Row>
//           <Row>
//             <Text>{otp}</Text> 
//           </Row>
//           <Row>
//             <Text>
//               If you did not request this code, please ignore this email.
//             </Text>
//           </Row>
//           {/* <Row>
//             <Button
//               href={`http://localhost:3000/verify/${username}`}
//               style={{ color: '#61dafb' }}
//             >
//               Verify here
//             </Button>
//           </Row> */}
//         </Section>
//       </Html>
//     );
//   }
  

const verifyEmailHtml = (userName, otp) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Email Verification</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0;">

<div style="max-width: 600px; margin: 0 auto;">
    <!-- Correct Image Path -->
    <img src="/sync-draw-logo.png" alt="SyncDraw Logo" style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 20px;">
    
    <div style="background-color: #ffffff; border-radius: 8px; padding: 20px;">
        <h2 style="color: #333333; text-align: center;">Verify Your Email Address</h2>
        <p style="color: #666666; text-align: center;">Hello ${userName},</p>
        <p style="color: #666666; text-align: center;">Thank you for signing up! To complete your registration, please enter the OTP below to verify your email address:</p>
        
        <!-- OTP Code Display -->
        <div style="text-align: center; margin-top: 30px;">
            <h3 style="color: #007bff;">Your OTP: <strong>${otp}</strong></h3>
        </div>
        
        <p style="color: #666666; text-align: center; margin-top: 20px;">If you did not sign up for an account, you can safely ignore this email.</p>
    </div>
</div>

</body>
</html>
`;
export default verifyEmailHtml;