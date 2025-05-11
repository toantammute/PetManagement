import axios from 'axios';
import { API } from "@env";
import { Cart } from '../models/models';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getCart = async (): Promise<Cart[]> => {
    
        const accessToken = await AsyncStorage.getItem('accessToken');
        if (!accessToken) {
            throw new Error('No access token found');
        }
        console.log('accessToken', accessToken);
        
        console.log('get to cart request:', {
            url: `${API}/cart`
        });
                
        const response = await axios.get(`${API}/cart`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });
                
        // Check if the response has the expected structure
        if (!response.data || !response.data.data) {
            console.error('Invalid cart response structure:', response.data);
            throw new Error('Invalid response structure from server');
        }
        console.log('response', response);
        console.log('response.data.data', response.data.data);
        
    return response.data.data;
};

export const addToCart = async (product_id: string, quantity: number) => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    if (!accessToken) {
        throw new Error('No access token found');
    }
    console.log('add to cart request:', {
        product_id: product_id,
        quantity: quantity,
        url: `${API}/cart`
    });
    const response = await axios.post(`${API}/cart`, {
        product_id: product_id,
        quantity: quantity
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    });
    return response.data;
}

export const removeFromCart = async (product_id: string) => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    if (!accessToken) {
        throw new Error('No access token found');
    }
    console.log('remove from cart request:', {
        product_id: product_id,
        url: `${API}/cart/${product_id}`
    });
    const response = await axios.delete(`${API}/cart/product/${product_id}`, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    });
    return response.data;
}

export const createOrder = async () => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    if (!accessToken) {
        throw new Error('No access token found');
    }
    console.log('create order request:', {
        url: `${API}/order`
    });
    const response = await axios.post(`${API}/order`, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    }); 

    console.log('create order response:', response.data);
    return response.data;
}

export const getOrdersById = async (order_id: string) => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    if (!accessToken) {
        throw new Error('No access token found');
    }
    const response = await axios.get(`${API}/order/${order_id}`, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    });
    console.log('get orders by id response:', response.data);
    return response.data.data;
}

export const getOrdersByUser = async () => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    if (!accessToken) {
        throw new Error('No access token found');
    }
    const response = await axios.get(`${API}/order`, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    });
    console.log('get orders by user response:', response.data);
    return response.data.data;
}

// export const updateCart = async (cartId: string, quantity: number) => {
//     try {
//         const accessToken = await AsyncStorage.getItem('accessToken');
//         if (!accessToken) {
//             throw new Error('No access token found');
//         }
        
//         const response = await axios.put(`${API}/cart/${cartId}`, {
//             quantity: quantity
//         }, {
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Accept': 'application/json',
//                 'Authorization': `Bearer ${accessToken}`
//             }
//         });
        
//         return response.data;
//     } catch (error: any) {
//         throw error;
//     }
// }


export const getOrderHistory = async () => {
    try {
        const accessToken = await AsyncStorage.getItem('accessToken');
        if (!accessToken) {
            throw new Error('No access token found');
        }
        
        const response = await axios.get(`${API}/order-history`, {
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