import axios from 'axios';
import { API} from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Product } from '../models/models';

export const getProducts = async (): Promise<Product[]> => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const response = await axios.get(`${API}/products/`, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    });
    console.log('response.data of products', response.data);
    return response.data;
}

export const getProductById = async (productId: string): Promise<Product> => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const response = await axios.get(`${API}/products/${productId}`, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    });
    console.log('response.data of product', response.data);
    return response.data;
}
