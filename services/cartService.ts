import axios from 'axios';
import { API_URL } from "@env";
import { Cart, QRRequest } from '../models/models';
import AsyncStorage from '@react-native-async-storage/async-storage';
console.log('Cart API_URL', API_URL);

export const getCart = async (): Promise<Cart[]> => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    if (!accessToken) {
        throw new Error('No access token found');
    }
    console.log('accessToken', accessToken);
    
    console.log('get to cart request:', {
        url: `${API_URL}/cart`
    });
            
    const response = await axios.get(`${API_URL}/cart`, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    });
    console.log('response', response);
    console.log('response.data.data', response.data.data);
    console.log('response.data', response.data);
            
    // Return empty array if data is null
    if (!response.data || !response.data.data) {
        console.log('Cart is empty or invalid response structure');
        return [];
    }
    
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
        url: `${API_URL}/cart`
    });
    const response = await axios.post(`${API_URL}/cart`, {
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
        url: `${API_URL}/cart/${product_id}`
    });
    const response = await axios.delete(`${API_URL}/cart/product/${product_id}`, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    });
    return response.data;
}

// export const createOrder = async () => {
//     console.log('create order request:', {
//         url: `${API_URL}/order/`
//     });
//     const accessToken = await AsyncStorage.getItem('accessToken');
//     if (!accessToken) {
//         throw new Error('No access token found');
//     }
//     console.log('accessToken trong cart', accessToken);
//     try {
//         const response = await axios.post(`${API_URL}/order/`, {
//             headers: {
//             'Authorization': `Bearer ${accessToken}`,
//             'Content-Type': 'application/json',
//             'Accept': 'application/json',
//             }
//         });
//         return response.data;
//     } catch (error: any) {
//         throw error;
//     }
// }

export const createOrder = async () => {
    console.log('create order request:', {
        url: `${API_URL}/order/`
    });
    const accessToken = await AsyncStorage.getItem('accessToken');
    if (!accessToken) {
        throw new Error('No access token found');
    }
    console.log('accessToken trong cart', accessToken);
    try {
        const response = await axios.post(
            `${API_URL}/order/`, 
            {}, // empty body since the endpoint doesn't require any data
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            }
        );
        return response.data.data;
    } catch (error: any) {
        throw error;
    }
}

export const getOrdersById = async (order_id: string) => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    if (!accessToken) {
        throw new Error('No access token found');
    }
    const response = await axios.get(`${API_URL}/order/${order_id}`, {
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
    const response = await axios.get(`${API_URL}/order`, {
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
        
//         const response = await axios.put(`${API_URL}/cart/${cartId}`, {
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
        
        const response = await axios.get(`${API_URL}/order-history`, {
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

export const generateQRCode = async (qrData: QRRequest) => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('No access token found');
      }
  
      const response = await axios.post(
        `${API_URL}/payment/generate-qr`,
        qrData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        }
      );
  
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };