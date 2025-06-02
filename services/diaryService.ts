import axios from 'axios';
import { API_URL} from "@env";
import { Diary } from '../models/models';
import AsyncStorage from '@react-native-async-storage/async-storage';
console.log('Diary API_URL', API_URL);

export const getDiarybyUser = async (): Promise<Diary[]> => {
    console.log('getDiarybyUser');
    const accessToken = await AsyncStorage.getItem('accessToken');
    const response = await axios.get(`${API_URL}/pet/logs`,{
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    });
    console.log('response.data.rows', response.data.rows);
    if(response.data.rows === null){
        return [];
    }
    return response.data.rows;
}

export const createDiary = async(data:any) => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const response = await axios.post(`${API_URL}/pet/logs`, data, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    return response.data;
}

export const deleteDiary = async(id: string) => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const response = await axios.delete(`${API_URL}/pet/logs/${id}`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    return response.data;
}

export const updateDiary = async(id: string, data: any) => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const response = await axios.put(`${API_URL}/pet/logs/${id}`, data, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    return response.data;
}

export const getDiaryDetail = async (id: string): Promise<Diary> => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const response = await axios.get(`${API_URL}/pet/log/${id}/details`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    return response.data;
}