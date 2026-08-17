"use client"
import { createDoctor, getDoctors, updateDoctor } from "@/lib/actions/doctors";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { getAvailableDoctors } from "@/lib/actions/doctors";
export function useGetDoctors() {
    const result = useQuery({
        queryKey: ["getDoctors"],
        queryFn: getDoctors
    });
    return result;
}

export function useCreateDoctor() {
    // get query client instance to refetch doctor list after creating new doctor
    const queryClient = useQueryClient()

    const result =  useMutation({
        mutationFn: createDoctor,
        onSuccess: () => {
            //invalidate doctor list query to refetch updated list of doctors after creating new doctor
            queryClient.invalidateQueries({ queryKey: ["getDoctors"]});
        },
        onError: (error) => console.error("Failed to create doctor", error)
    })

    return result;
}

export function useUpdateDoctor() {
    const queryClient = useQueryClient()

    const result = useMutation({
        mutationFn: updateDoctor,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getDoctors"]});
        },
        onError: (error) => console.error("Failed to update doctor", error)
    })
    return result;
}

export function useAvailableDoctors() {
    const result = useQuery({
        queryKey: ["getAvailableDoctors"],
        queryFn: getAvailableDoctors,
    })
    return result;
}