import { API_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
console.log('Treatment API_URL', API_URL);

export const getPatientTreatments = async (patient_id: string) => {
    try {
        const accessToken = await AsyncStorage.getItem('accessToken');
        console.log(`Fetching treatments for pet ID: ${patient_id}`);
        
        const response = await axios.get(`${API_URL}/pet/${patient_id}/treatments`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        console.log(`Treatment data for pet ${patient_id}:`, response.data);
        return response.data;
    } catch (error: any) {
        console.error(`Error fetching treatments for pet ${patient_id}:`, error.response?.data || error.message);
        throw error;
    }
};

export const getTreatmentPhasesByTreatmentId = async (treatment_id: string) => {
    try {
        const accessToken = await AsyncStorage.getItem('accessToken');
        console.log(`Fetching phases for treatment ID: ${treatment_id}`);
        
        const response = await axios.get(`${API_URL}/treatment/${treatment_id}/phases`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        console.log(`Phases data for treatment ${treatment_id}:`, response.data);
        return response.data;
    } catch (error: any) {
        console.error(`Error fetching phases for treatment ${treatment_id}:`, error.response?.data || error.message);
        throw error;
    }
};

export const getMedicationByPhaseId = async (
    treatment_id: string,
    phase_id: string
) => {
    try {
        const accessToken = await AsyncStorage.getItem('accessToken');
        console.log(`Fetching medications for treatment ID: ${treatment_id}, phase ID: ${phase_id}`);

        const response = await axios.get(
            `${API_URL}/treatment/${treatment_id}/phases/${phase_id}/medicines`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        console.log(`Medications data for phase ${phase_id}:`, response.data);
        return response.data;
    } catch (error: any) {
        console.error(`Error fetching medications for phase ${phase_id}:`, error.response?.data || error.message);
        throw error;
    }
};
