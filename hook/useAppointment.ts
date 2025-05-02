import { getAppointments, getDoctorTimeSlots, getDoctors, createAppointment } from "../services/appointmentService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Appointment, Doctor, TimeSlot } from "../models/models";

export const useAppointments = () => {
    return useQuery<Appointment[], Error>({
        queryKey: ['appointments'],
        queryFn: getAppointments,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: true,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        throwOnError: (error: Error, query) => {
            console.error('Failed to fetch appointments:', error);
            return false;
        },

    })
}

export const useDoctors = () => {
    return useQuery<Doctor[], Error>({
        queryKey: ['doctors'],
        queryFn: getDoctors,
    })
}

export const useDoctorTimeSlots = (doctorId: string, date: string) => {
    return useQuery<TimeSlot[], Error>({
        queryKey: ['doctorTimeSlots', doctorId, date],
        queryFn: () => getDoctorTimeSlots(doctorId, date),
    })
}

export const useCreateAppointment = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: createAppointment,
        onSuccess: () => {
            // Invalidate appointments query to refetch the updated list
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
        },
    });
}
