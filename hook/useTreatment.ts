import { useQuery } from "@tanstack/react-query";
import { getMedicationByPhaseId, getPatientTreatments, getTreatmentPhasesByTreatmentId } from "../services/treatmentService";

export const useGetTreatments = (pet_id: string, enabled = true) => {
    return useQuery({
      queryKey: ["treatments", pet_id],
      queryFn: () => getPatientTreatments(pet_id),
      enabled: !!pet_id,
      select: (data) => data.data || [],
    });
  };
  
  export const useGetTreatmentPhases = (
    treatment_id: string,
    enabled = true
  ) => {
    return useQuery({
      queryKey: ["treatmentPhases", treatment_id],
      queryFn: () => getTreatmentPhasesByTreatmentId(treatment_id),
      enabled: !!treatment_id,
      select: (data) => data.data || [],
    });
  };
  
  export const useMedicationByPhaseIdData = (
    treatment_id: string,
    phase_id: string,
    enabled = true
  ) => {
    return useQuery({
      queryKey: ["medicationByPhaseId", treatment_id, phase_id],
      queryFn: () => getMedicationByPhaseId(treatment_id, phase_id),
      enabled: !!treatment_id && !!phase_id,
      select: (data) => data.data || [],
    });
  };