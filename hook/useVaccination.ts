import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getVaccinationsbyPetId, createVaccination} from '../services/vaccinationService';
import { Vaccination } from '../models/models';

export const useVaccinations = (petId: string) => {
    return useQuery<Vaccination[], Error>({
        queryKey: ['vaccinations', petId],
        queryFn: () => getVaccinationsbyPetId(petId),
    });
}

export const useCreateVaccination = (petID:string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createVaccination,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vaccination',petID] });
        },
        onError: (error: Error) => {
            console.error('Failed to create diary:', error);
        }
    });
}