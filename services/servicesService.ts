import axios from 'axios';
import { API_URL } from '@env';
import { Service } from '../models/models';
import AsyncStorage from '@react-native-async-storage/async-storage';
console.log('Services API_URL', API_URL);

export const getServices = async (): Promise<Service[]> => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const response = await axios.get(`${API_URL}/services`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });
    return response.data;
}
