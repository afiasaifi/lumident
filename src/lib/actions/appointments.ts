"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

function transformAppointment(appointment: any) {
  return {
    ...appointment,
    patientName: `${appointment.user.firstName || ""} ${appointment.user.lastName || ""}`.trim(),
    patientEmail: appointment.user.email,
    doctorName: appointment.doctor.name,
    doctorImageUrl: appointment.doctor.imageUrl || "",
    date: appointment.date.toISOString().split("T")[0],
  };
}

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

export async function getUserAppointments(){
    try {
        //get the autherized user id from clerk
        const {userId} = await auth();
        //if user is not authenticated throw an error
        if(!userId){
            throw new Error("User must be logged in to view appointments");
        }
        const user = await prisma.user.findUnique({where: {clerkId: userId}}); 
        if(!user) throw new Error("User not found");

        const appointments = await prisma.appointment.findMany({
            where: {userId: user.id},
            include: {
                user: { select: {firstName: true, lastName: true, email: true} },
                doctor: { select: {name: true, imageUrl: true} }
            },
            orderBy: [{ date: "asc" }, { time: "asc" }]
        });
        return appointments.map(transformAppointment);
    } catch (error) {
        console.error("Error fetching user appointments:", error);
        throw new Error("Failed to fetch user appointments");
    }
}

//get the total number of appointments and completed appointments for the authenticated user
export async function getUserAppointmentStats(){
    try {
        //get the autherized user id from clerk
        const {userId} = await auth();
        //if user is not authenticated throw an error
        if(!userId){
            throw new Error("User not authenticated");
        }
        const user = await prisma.user.findUnique({where: {clerkId: userId}}); 
        if(!user) throw new Error("User not found");

        //get the total number of appointments and completed appointments for the user
        const [totalCount, completedCount] = await Promise.all([
            prisma.appointment.count({
                where: {userId: user.id}
            }),
            prisma.appointment.count({
                where: {userId: user.id, status: "COMPLETED"}
            })
        ]);

        //return an object with the total and completed appointment counts
        return {
            totalAppointments: totalCount,
            completedAppointments: completedCount
         };
    } catch (error) {
        console.error("Error fetching user appointment stats:", error);
        return { totalAppointments: 0, completedAppointments: 0 };
    }
}

export async function getBookedTimeslots(doctorId: string, date: string){
    try {
        const appointments = await prisma.appointment.findMany({
            where: {
                doctorId,
                date: new Date(date),
                status: {
                    in: ["CONFIRMED", "COMPLETED"]
                },
            },
            select: {time: true}
        });
        return appointments.map((appointment) => appointment.time);
    } catch (error) {
        console.error("Error fetching booked time slots");
        return []
    }
}

export async function bookAppointment(input: BookAppointmentinput){
    try {
        const { userId } = await auth();
        if(!userId) throw new Error("You must be logged in to book appointment");

        if(!input.doctorId || !input.date || !input.time){
            throw new Error("Doctor, date, and time are required.")
        }

        const user = await prisma.user.findUnique({where: { clerkId: userId}});
        if(!user) throw new Error("User not found. Please nensure tour account is properyl set up.");
        const appointment = await prisma.appointment.create({
          data: {
            userId: user.id,
            doctorId: input.doctorId,
            date: new Date(input.date),
            time: input.time,
            reason: input.reason || "General consultation",
            status: "CONFIRMED",
          },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            doctor: { select: { name: true, imageUrl: true } },
          },
        });

        return transformAppointment(appointment);
    } catch (error){
        console.error("Error booking appointment:", error);
        throw new Error("Failed to book appointment. Please try again later.");
    }

    

    
}

