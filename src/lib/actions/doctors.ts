"use server";

import { Gender } from "@/generated";
import { prisma } from "../prisma";
import { generateAvatar } from "../utils";
import { revalidatePath } from "next/cache";
export async function getDoctors() {
  try {
    const doctors = await prisma.doctor.findMany({
      include: {
        _count: { select: { appointments: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return doctors.map((doctor) => ({
      ...doctor,
      appointmentCount: doctor._count.appointments,
    }));
  } catch (error) {
    console.error("Error fetching doctors:", error);
    throw new Error("Failed to fetch doctors");
  }
}

interface CreateDoctorInput {
  name: string;
  email: string;
  phone?: string;
  speciality: string;
  gender: Gender;
  imageUrl?: string;
  isActive: boolean;
}

interface UpdateDoctorInput extends Partial<CreateDoctorInput> {
  id: string;
}

export async function createDoctor(input: CreateDoctorInput) {
  try {
    if (!input.name || !input.email)
      throw new Error("Name and email are required");
    const doctor = await prisma.doctor.create({
      data: {
        ...input,
        phone: input.phone ?? "",
        imageUrl: generateAvatar(input.gender),
      },
    });
    // revalidate doctor list on dashboard after creating new doctor
    // this will trigger a refetch in useGetDoctors hook and remove cache for doctor list
    revalidatePath("/admin");
    return doctor;
  } catch (error: any) {
    console.error("Error creating doctor:", error);
    if (error?.code === "P2002") {
      throw new Error("A doctor with this email already exists");
    }
    throw new Error("Failed to create doctor");
  }
}

export async function updateDoctor(input: UpdateDoctorInput) {
  try {
    //validate doctor
    if (!input.name || !input.email)
      throw new Error("Name and email are required");

    //find the doctor
    const currentDoctor = await prisma.doctor.findUnique({
      where: { id: input.id },
      select: { email: true },
    });

    //if no doc found throw error
    if (!currentDoctor) throw new Error("Doctor not found");

    //if email is being updated check if new email is already taken by another doctor
    if (input.email !== currentDoctor.email) {
      const existingDoctor = await prisma.doctor.findUnique({
        where: { email: input.email },
        select: { id: true },
      });
      if (existingDoctor) {
        throw new Error("Another doctor with this email already exists");
      }
    }

    const doctor = await prisma.doctor.update({
      where: { id: input.id },
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        speciality: input.speciality,
        gender: input.gender,
        isActive: input.isActive,
      },
    });
    return doctor;
  } catch (error) {
    console.error("Error updating doctor:", error);
    throw new Error("Failed to update doctor");
  }
}

export async function getAvailableDoctors() {
  try {
    const doctors = await prisma.doctor.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { appointments: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return doctors.map((doctor) => ({
      ...doctor,
      appointmentCount: doctor._count.appointments,
    }));
  } catch (error) {
    console.error("Error fetching available doctors:", error);
    throw new Error("Failed to fetch available doctors");
  }
}
