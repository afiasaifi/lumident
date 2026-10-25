"use client";

import {
  bookAppointment,
  createAppointment,
  getAppointments,
  getBookedTimeslots,
  getUserAppointments,
  updateAppointmentStatus,
} from "@/lib/actions/appointments";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
export function useGetAppointments() {
  const result = useQuery({
    queryKey: ["getAppointments"],
    queryFn: getAppointments,
  });
  return result;
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  const result = useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getAppointments"] });
    },
    onError: (error: any) =>
      console.error("Failed to create appointment", error),
  });
  return result;
}

export function useBookedTimeSlots(doctorId: string, date: string) {
  return useQuery({
    queryKey: ["getBookedTimeSlots", doctorId, date],
    queryFn: () => getBookedTimeslots(doctorId, date),
    enabled: !!doctorId && !!date, //if these two aren't provided, this fn wont run
  });
}

export function useBookAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bookAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getUserAppointments"] });
    },
    onError: (error) => console.error("Failed to book appointment:", error),
  });
}

export function useUserAppointments() {
  const result = useQuery({
    queryKey: ["getUserAppointments"],
    queryFn: getUserAppointments,
  });
  return result;
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAppointmentStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getAppointments"] });
    },
    onError: (error) => console.error("Failed to update appointment:", error),
  });
}
