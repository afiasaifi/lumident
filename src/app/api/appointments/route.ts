import { NextResponse } from "next/server";
import { createAppointment } from "@/lib/actions/appointments";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const appointment = await createAppointment(body);

    return NextResponse.json({
      success: true,
      appointment
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create appointment" },
      { status: 500 }
    );
  }
}
