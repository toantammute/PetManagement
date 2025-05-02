import axios from "axios";
import { API} from "@env";
import { Appointment, Doctor, TimeSlot } from "../models/models";
import AsyncStorage from "@react-native-async-storage/async-storage";


export const getAppointments = async (): Promise<Appointment[]> => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const response = await axios.get(`${API}/appointment/user`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });
    console.log('response.data of appointments', response.data.data);
    return response.data.data;
}

export const getDoctors = async (): Promise<Doctor[]> => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const response = await axios.get(`${API}/doctors`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });
    console.log('response.data of doctors', response.data.data);
    return response.data.data;
}

export const getDoctorTimeSlots = async (doctorId: string, date: string): Promise<TimeSlot[]> => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const response = await axios.get(`${API}/doctor/${doctorId}/time-slot`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        params: {
            date: date // format: YYYY-MM-DD
        }
    });
    console.log('response.data of time slots', response.data.data);
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
    const response = await axios.post(`${API}/appointment`, appointment, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });
    console.log('response.data of create appointment', response.data.data);
    return response.data.data;
}

