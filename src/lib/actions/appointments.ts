"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
export async function getAppointments() {
    try {
        const appointments = await prisma.appointment.findMany({
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true
                    },
                }, 
                doctor: {
                    select: {
                        name: true,
                        imageUrl: true

                    }
                }
            },
            orderBy: { createdAt: "desc" }
        })
        return appointments;
    } catch (error) {
        console.error("Error fetching appointments:", error);
        throw new Error("Failed to fetch appointments");
    }
}

interface CreateAppointmentInput {
  date: string;
  time: string;
  type: string;
  userId: string;
  doctorId: string;
}



export async function createAppointment(input: CreateAppointmentInput) {
    try{
        // Basic validation
        if (!input.date || !input.time || !input.type) {
            throw new Error("Date, time, and type are required");
        }

        if (!input.userId || !input.doctorId) {
            throw new Error("User ID and Doctor ID are required");
        }
        // Create appointment
        const appointment = await prisma.appointment.create({
        data: {
            date: input.date,
            time: input.time,
            type: input.type,
            userId: input.userId,
            doctorId: input.doctorId
        }
        });

        // Revalidate dashboard
        revalidatePath("/admin");

        return appointment;
    } catch (error: any) {
        console.error("Error creating appointment:", error);
        throw new Error("Failed to create appointment");
    }
}