import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createAllergy, CreateAllergyRequest, getAllergiesByPetId } from "../services/allergyService";

export interface Allergy {
    id: number;
    pet_id: number;
    type: string;
    detail: string;
}

export interface AllergiesResponse {
    data: Allergy[];
    message: string;
    success: boolean;
}

export const useCreateAllergy = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createAllergy,
        onSuccess: () => {
            // Invalidate appointments query to refetch the updated list
            queryClient.invalidateQueries({ queryKey: ['allergy'] });
        },
    });
}

export const useGetAllergiesByPetId = (pet_id :string) => {
    return useQuery<AllergiesResponse, Error>({
        queryKey: ['allergues', pet_id],
        queryFn: () => getAllergiesByPetId(pet_id),
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: true,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        throwOnError: (error: Error, query) => {
            return false;
        }
    });
}