import axios from "axios";
import { API_URL} from "@env";
import { Appointment, Doctor, TimeSlot } from "../models/models";
import AsyncStorage from "@react-native-async-storage/async-storage";
console.log('Appointment API_URL', API_URL);


export const getAppointments = async (): Promise<Appointment[]> => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const response = await axios.get(`${API_URL}/appointment/user`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });
    console.log('getAppointments', response.data);
    return response.data.data;
}

export const getDoctors = async (): Promise<Doctor[]> => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const response = await axios.get(`${API_URL}/doctors`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });
    return response.data.data;
}

export const getDoctorTimeSlots = async (doctorId: string, date: string): Promise<TimeSlot[]> => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const response = await axios.get(`${API_URL}/doctor/${doctorId}/time-slot`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        params: {
            date: date // format: YYYY-MM-DD
        }
    });

    return response.data.data;
}

interface AppointmentCreate {
    pet_id: number;
    doctor_id: number;
    date: string;
    time_slot_id: number;
    service_id: number;
    reason: string;
}

export const createAppointment = async (appointment: AppointmentCreate): Promise<Appointment> => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const response = await axios.post(`${API_URL}/appointment`, appointment, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });
    return response.data.data;
}


// authRoute.GET("appointments/pet/:pet_id/history", appointmentAPI_URL.controller.getHistoryAppointmentsByPetID)

export const getHistoryAppointmentsByPetID = async (petId: string): Promise<Appointment[]> => {
    try {
        const accessToken = await AsyncStorage.getItem('accessToken');
        const response = await axios.get(`${API_URL}/appointments/pet/${petId}/history`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        console.log('getHistoryAppointmentsByPetID', response.data);
        // Make sure response.data exists and has a data property, otherwise return an empty array
        return response.data?.data || [];
    } catch (error) {
        console.error(`Error getting appointment history for pet ${petId}:`, error);
        return []; // Return an empty array instead of throwing an error
    }
}

