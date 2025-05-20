import { getAppointments, getDoctorTimeSlots, getDoctors, createAppointment, getHistoryAppointmentsByPetID } from "../services/appointmentService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Appointment, Doctor, TimeSlot } from "../models/models";

export const useAppointments = () => {
    return useQuery<Appointment[], Error>({
        queryKey: ['appointments'],
        queryFn: getAppointments,
        staleTime: 0,
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

export const useDoctor = (doctorId: string) => {
    const { data: doctors } = useDoctors();
    return useQuery<Doctor | undefined, Error>({
        queryKey: ['doctor', doctorId],
        queryFn: () => doctors?.find(d => d.doctor_id === doctorId),
        enabled: !!doctors && !!doctorId,
    });
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

export const useGetAppointmentHistory = (pet_id: string) => {
    const queryClient = useQueryClient();
    return useQuery<Appointment[], Error>({
        queryKey: ['appointmentHistory', pet_id],
        queryFn: () => {
            // Make sure pet_id is valid before making the API call
            if (!pet_id) {
                console.log('No pet ID provided for appointment history');
                return Promise.resolve([]);
            }
            return getHistoryAppointmentsByPetID(pet_id);
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: true,
        retry: 3,
        // Only run the query if we have a valid pet_id
        enabled: Boolean(pet_id && typeof pet_id === 'string' && pet_id.trim() !== ''),
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        throwOnError: (error: Error, query) => {
            console.error('Failed to fetch appointment history:', error);
            return false;
        },
    })
}