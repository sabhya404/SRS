import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/verificationEmail";

export async function sendVerificationEmail(email, username, verifyCode) {
  try {
    console.log(email);

    const { data, error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: email, // Use dynamic email
      subject: "SRS | Verification Code",
      react: VerificationEmail({ username, otp: verifyCode }),
    });

    console.log(`Username ===> ${username}, OTP: ${verifyCode}`);

    if (error) {
      console.log(error);
      return { success: false, message: "Failed to send verification email" };
    }

    console.log(data);
    return { success: true, message: "Verification Email Sent Successfully" };
  } catch (emailError) {
    console.error("Error sending verification Email:", emailError);
    return { success: false, message: "Failed to send verification email" };
  }
}
