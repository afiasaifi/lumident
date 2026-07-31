"use client"

import { createAppointment, getAppointments } from "@/lib/actions/appointments";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
export function useGetAppointments() {
    const result = useQuery({
        queryKey: ["getAppointments"],
        queryFn: getAppointments
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
        onError: (error: any) => console.error("Failed to create appointment", error)
    });
    return result;
}