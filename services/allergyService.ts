import { API_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
console.log('Allergy API', API_URL);

export type CreateAllergyRequest = {
    type: string
    detail: string
}

export type Allergy = {
    id: string
    type: string
    detail: string
    pet_id: string
}

export const createAllergy = async (request: CreateAllergyRequest) => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    try {
        const response = await axios.post(`${API_URL}/allergy`, request, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (response.status < 200 || response.status >= 300) {
            throw new Error('Kết nối lỗi khi tạo dị ứng');
        }

        const data = response.data;
        return data;
    } catch (error) {
        throw error;
    }
}
// authRoute.GET("/pet/:pet_id/allergies", diseaseApi.controller.GetAllergiesByPetID)
export const getAllergiesByPetId = async (pet_id: string) => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    try {
        const response = await axios.get(`${API_URL}/pet/${pet_id}/allergies`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (response.status < 200 || response.status >= 300) {
            throw new Error('Kết nối lỗi khi lấy danh sách dị ứng');
        }

        console.log('response.data of allergies', response.data);

        const data = response.data;
        return data;
    } catch (error) {
        throw error;
    }
}