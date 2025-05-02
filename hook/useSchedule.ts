import { getSchedulebyUser, createSchedule, updateSchedule, deleteSchedule } from "../services/scheduleService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Schedule } from "../models/models";

export const useSchedulebyUser = () => {
    return useQuery<Schedule[], Error>({
        queryKey: ['allSchedules'],
        queryFn: getSchedulebyUser,
    });
}

export const useCreateSchedule = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: createSchedule,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allSchedules'] });
        },
    });
}

export const useUpdateSchedule = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: updateSchedule,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allSchedules'] });
        },
    });
}

export const useDeleteSchedule = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: deleteSchedule,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allSchedules'] });
        },
    });
}
