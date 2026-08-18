import AppointmentConfirmationEmail from "@/components/emails/AppointmentConfirmationEmail";
import resend from "@/lib/resend";
import { NextResponse } from "next/server";
export async function POST(request: Request){
    try {
      //destructure user data we get from frontend into json for backend
      const body = await request.json();
      const {
        userEmail,
        doctorName,
        appointmentDate,
        appointmentTime,
        appointmentType,
        duration,
        price,
      } = body;
      // validate required fields
      if (!userEmail || !doctorName || !appointmentDate || !appointmentTime) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 },
        );
      }

      //send email
      const {data, error} = await resend.emails.send({
        from:"LumiDent <no-reply@resend.dev>", //dont use in production, only testing
        to: [userEmail],
        subject: "Appointment Confirmation - LumiDent",
        react: AppointmentConfirmationEmail({
            doctorName,
            appointmentDate,
            appointmentTime,
            appointmentType,
            duration,
            price
        }),
      });
      
      if (error) {
        console.error("Resend error:", error);
        return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
       }

        return NextResponse.json(
            { message: "Email sent successfully", emailId: data?.id },
            { status: 200 }
        )
    } catch (error) {
        
    }
}