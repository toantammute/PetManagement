import axios from 'axios';
import { API, PUSH_NOTI} from "@env";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Schedule } from '../models/models';


export const getSchedulebyUser = async (): Promise<Schedule[]> => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const response = await axios.get(`${API}/schedules`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    const allSchedules = response.data.data.flatMap((pet: any) => pet.schedules);
    return allSchedules;
}

export const createSchedule = async (schedule: Schedule) => {
    console.log(schedule);
    const accessToken = await AsyncStorage.getItem('accessToken');
    const response = await axios.post(`${API}/schedules`, schedule, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    console.log(response.data);
    console.log(response.status);
    console.log(response.data.message);
    return response.data;
}

export const updateSchedule = async (schedule: Schedule & { id: string }) => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const response = await axios.put(`${API}/schedules/${schedule.id}`, schedule, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    return response.data;
}

export const deleteSchedule = async (id: string) => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const response = await axios.delete(`${API}/schedules/${id}`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    return response.data;
}


