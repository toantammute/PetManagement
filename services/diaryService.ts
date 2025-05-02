import axios from 'axios';
import { API} from "@env";
import { Diary } from '../models/models';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getDiarybyUser = async (): Promise<Diary[]> => {
    console.log('getDiarybyUser');
    const accessToken = await AsyncStorage.getItem('accessToken');
    const response = await axios.get(`${API}/pet/logs`,{
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    });
    console.log('response.data.rows', response.data.rows);
    return response.data.rows;
}

export const createDiary = async(data:any) => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const response = await axios.post(`${API}/pet/logs`, data, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    return response.data;
}
