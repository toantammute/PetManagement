import axios from 'axios';
import { API } from '@env';
import { Service } from '../models/models';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getServices = async (): Promise<Service[]> => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const response = await axios.get(`${API}/services`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });
    return response.data;
}
