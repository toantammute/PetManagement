import axios from 'axios';
import { API } from "@env";
import { Cart } from '../models/models';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getCart = async (): Promise<Cart[]> => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const response = await axios.get(`${API}/cart`, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    });
    console.log('response.data of cart', response.data.data);
    return response.data.data;
};


