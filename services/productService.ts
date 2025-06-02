import axios from 'axios';
import { API_URL} from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Product, ProductDetail } from '../models/models';
console.log('Product API_URL', API_URL);

export const getProducts = async (): Promise<Product[]> => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const response = await axios.get(`${API_URL}/products/`, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    });
    return response.data;
}

export const getProductById = async (productId: string): Promise<ProductDetail> => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const response = await axios.get(`${API_URL}/products/${productId}`, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    });
    return response.data;
}
