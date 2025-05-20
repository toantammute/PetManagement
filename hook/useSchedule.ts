import { getSchedulebyUser, createSchedule, updateSchedule, deleteSchedule, toggleSchedule } from "../services/scheduleService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Schedule } from "../models/models";

export const useSchedulebyUser = () => {
    return useQuery<Schedule[], Error>({
        queryKey: ['allSchedules'],
        queryFn: getSchedulebyUser,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        staleTime: 0,
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

export const useToggleSchedule = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (params: { id: string; isActive: boolean }) => 
            toggleSchedule(params.id, params.isActive),
        onMutate: async (variables) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['allSchedules'] });

            // Snapshot the previous value
            const previousSchedules = queryClient.getQueryData(['allSchedules']);

            // Optimistically update to the new value
            queryClient.setQueryData(['allSchedules'], (old: any) => {
                return old?.map((schedule: Schedule) => {
                    if (schedule.id === variables.id) {
                        return { ...schedule, is_active: variables.isActive };
                    }
                    return schedule;
                });
            });

            // Return a context object with the snapshotted value
            return { previousSchedules };
        },
        onError: (err, variables, context: any) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousSchedules) {
                queryClient.setQueryData(['allSchedules'], context.previousSchedules);
            }
        },
        onSettled: () => {
            // Always refetch after error or success
            queryClient.invalidateQueries({ queryKey: ['allSchedules'] });
        },
    });
}
