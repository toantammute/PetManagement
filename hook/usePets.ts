import { getPets, getPetById, createPet, deletePet, updatePet, updatePetAvatar, petWeightHistory } from "../services/petService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pet, Image } from "../models/models";
import { queryClient } from "../utils/queryClient";

export const usePets = () => {
    return useQuery<Pet[], Error>({
        queryKey: ['pets'],
        queryFn: getPets,
        staleTime: 5 * 60 * 1000, // Data được coi là "fresh" trong 5 phút
        gcTime: 30 * 60 * 1000, // Cache được giữ trong 30 phút
        refetchOnWindowFocus: true, // Không tự động fetch lại khi focus window
        retry: 3, // Số lần thử lại khi request thất bại
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        throwOnError: (error: Error, query) => {
            console.error('Failed to fetch pets:', error);
            return false; // Không throw error
        },
        select: (data) => {
            // Có thể transform data trước khi trả về
            return data.sort((a, b) => a.name.localeCompare(b.name));
        }
    });
}

export const usePetById = (id: string) => {
    return useQuery<Pet, Error>({
        queryKey: ['pet', id],
        queryFn: () => getPetById(id),
        enabled: !!id,
    });
}

export const useCreatePet = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ pet, image }: { pet: Omit<Pet, 'id'>; image: Image }) => createPet(pet, image),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pets'] });
        },
    });
}

export const useDeletePet = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (id: string) => deletePet(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pets'] });
        },
    });
}

export const useUpdatePet = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ pet, id }: { pet: Pet; id: string }) => updatePet(pet, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pets'] });
            queryClient.invalidateQueries({ queryKey: ['pet'] });
        },
    });
}

export const useUpdatePetAvatar = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ image, id }: { image: Image; id: string }) => updatePetAvatar(id, image),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pets'] });
            queryClient.invalidateQueries({ queryKey: ['pet'] });
        },
    });
}

interface WeightRecord {
    id: number;
    pet_id: number;
    weight_kg: number;
    weight_lb: number;
    recorded_at: string;
    created_at: string;
}

interface WeightHistory {
    pet_id: number;
    pet_name: string;
    current_weight: WeightRecord;
    weight_history: WeightRecord[];
    total_records: number;
    default_unit_type: string;
}

export const usePetWeightHistory = (petId: string) => {
    return useQuery<WeightHistory, Error>({
        queryKey: ['petWeightHistory', petId],
        queryFn: () => petWeightHistory(petId),
    });
}






