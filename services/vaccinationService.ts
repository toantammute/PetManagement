import axios from 'axios';
import { API } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Vaccination } from '../models/models';

export const getVaccinationsbyPetId = async (petId: string): Promise<Vaccination[]> => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const response = await axios.get(`${API}/vaccinations/pet/${petId}`, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
    });
    return response.data;
}

export const createVaccination = async (data:any) => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const response = await axios.post(`${API}/vaccinations`, data, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`, 
        }  
    }) ;
    return response.data;
}
