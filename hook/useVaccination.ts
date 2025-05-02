import { useQuery } from '@tanstack/react-query';
import { getVaccinationsbyPetId } from '../services/vaccinationService';
import { Vaccination } from '../models/models';

export const useVaccinations = (petId: string) => {
    return useQuery<Vaccination[], Error>({
        queryKey: ['vaccinations', petId],
        queryFn: () => getVaccinationsbyPetId(petId),
    });
}