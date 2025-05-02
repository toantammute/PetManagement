import { getDiarybyUser, createDiary } from "../services/diaryService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Diary } from "../models/models";

export const useDiarybyUser = () => {
    return useQuery<Diary[], Error>({
        queryKey: ['allDiaries'],
        queryFn: getDiarybyUser,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: true,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        throwOnError: (error: Error, query) => {
            console.error('Failed to fetch diary:', error);
            return false;
        },
        select: (data) => {
            return data.sort((a, b) => a.date_time.localeCompare(b.date_time));
        }
    });
}

export const useCreateDiary = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: createDiary,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allDiaries'] });
        },
        onError: (error: Error) => {
            console.error('Failed to create diary:', error);
        }
    });
}
