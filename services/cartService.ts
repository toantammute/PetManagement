import axios from 'axios';
import { API } from "@env";
import { Cart } from '../models/models';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getCart = async (): Promise<Cart[]> => {
    try {
        const accessToken = await AsyncStorage.getItem('accessToken');
        if (!accessToken) {
            throw new Error('No access token found');
        }
        
        console.log('Fetching cart with API endpoint:', `${API}/cart`);
        
        const response = await axios.get(`${API}/cart`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        console.log('Cart API response status:', response.status);
        
        // Check if the response has the expected structure
        if (!response.data || !response.data.data) {
            console.error('Invalid cart response structure:', response.data);
            throw new Error('Invalid response structure from server');
        }
        
        console.log('Cart data retrieved successfully:', response.data.data.length, 'items');
        return response.data.data;
    } catch (error: any) {
        console.error('Cart fetch error details:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            headers: error.response?.headers,
            apiUrl: `${API}/cart`
        });
        throw error;
    }
};

export const addToCart = async (productId: string, quantity: number) => {
    try {
        const accessToken = await AsyncStorage.getItem('accessToken');
        if (!accessToken) {
            throw new Error('No access token found');
        }
        
        console.log('Adding to cart:', { productId, quantity });
        
        const response = await axios.post(`${API}/cart`, {
            product_id: productId,
            quantity: quantity
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        console.log('Add to cart response:', response.status);
        return response.data;
    } catch (error: any) {
        console.error('Add to cart error:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            apiUrl: `${API}/cart`
        });
        throw error;
    }
};

export const updateCart = async (cartId: string, quantity: number) => {
    try {
        const accessToken = await AsyncStorage.getItem('accessToken');
        if (!accessToken) {
            throw new Error('No access token found');
        }
        
        const response = await axios.put(`${API}/cart/${cartId}`, {
            quantity: quantity
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        return response.data;
    } catch (error: any) {
        throw error;
    }
}

