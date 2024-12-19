// import {
//   Html,
//   Head,
//   Font,
//   Preview,
//   Heading,
//   Row,
//   Section,
//   Text,
//   Link,
//   Button,
// } from '@react-email/components';



// export default function ForgetPassword({ username, otp }) {
//   return (
//     <Html lang="en" dir="ltr">
//       <Head>
//         <title>Forget Password Link</title>
//         <Font
//           fontFamily="Roboto"
//           fallbackFontFamily="Verdana"
//           webFont={{
//             url: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
//             format: 'woff2',
//           }}
//           fontWeight={400}
//           fontStyle="normal"
//         />
//       </Head>
//       <Preview>Here&apos;s your Password change link : {`https://youtube-clone-iota-ecru-26.vercel.app/forgetpassword?token=${otp}`}</Preview>
//       <Section>
//         <Row>
//           <Heading as="h2">Hello {username},</Heading>
//         </Row>
//         <Row>
//           <Text>
//             Thank you for registering. Please use the following verification
//             code to complete your registration:
//           </Text>
//         </Row>
//         <Row>
//           <Text>
//             Here&apos;s your Password change link:
//             <Link
//               href={`https://youtube-clone-iota-ecru-26.vercel.app/forgetpassword?token=${otp}`}
//               style={{ color: 'blue', textDecoration: 'underline', marginLeft: '5px' }}
//             >
//               Click here
//             </Link>
//           </Text>
//         </Row>
//         <Row>
//           <Text>
//             If you did not request this code, please ignore this email.
//           </Text>
//         </Row>
//         {/* <Row>
//             <Button
//               href={`http://localhost:3000/verify/${username}`}
//               style={{ color: '#61dafb' }}
//             >
//               Verify here
//             </Button>
//           </Row> */}
//       </Section>
//     </Html>
//   );
// }
// ForgetPasswordTemplate.js
const forgetPasswordHtml = (username, resetLink) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto;">
    <img src="/sync-draw-logo.png" alt="SyncDraw Logo" style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 20px;">
    <div style="background-color: #ffffff; border-radius: 8px; padding: 20px;">
      <h2 style="color: #333333; text-align: center;">Reset Your Password</h2>
      <p style="color: #666666; text-align: center;">Hello ${username},</p>
      <p style="color: #666666; text-align: center;">We received a request to reset your password. To complete the process, click the link below:</p>
      <div style="text-align: center; margin-top: 30px;">
        <a href="${resetLink}" style="display: inline-block; background-color: #007bff; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 5px;">Reset Password</a>
      </div>
      <p style="color: #666666; text-align: center; margin-top: 20px;">If you did not request a password reset, you can safely ignore this email.</p>
    </div>
  </div>
</body>
</html>
`;

export default forgetPasswordHtml;
