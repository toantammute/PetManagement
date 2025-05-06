import axios from "axios";

import { API } from "@env";
import { Pet, Image } from "../models/models";
import AsyncStorage from "@react-native-async-storage/async-storage";



export const getPets = async (): Promise<Pet[]> => {
    console.log('getPets');
    const accessToken = await AsyncStorage.getItem('accessToken');
    // const accessToken = await AsyncStorage.getItem('accessToken');
    const response = await axios.get(`${API}/pet/`, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    });
    console.log('response.data of pets', response.data);
    return response.data;
}

export const getPetById = async (id: string): Promise<Pet> => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    // const access_token = await AsyncStorage.getItem('access_token');
    const response = await axios.get(`${API}/pet/${id}`, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    });
    return response.data;
}

export const createPet = async (pet: Pet, image: Image): Promise<Pet> => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const formData = new FormData();
    formData.append('data', JSON.stringify({
        name: pet.name,
        type: pet.type,
        breed: pet.breed,
        age: pet.age,
        weight: pet.weight,
        gender: pet.gender,
        healthnotes: pet.healthnotes,
        birth_date: pet.birth_date,
        microchip_number: pet.microchip_number,
    }));
    formData.append('image', {
        name: image.name,
        type: image.type,
        uri: image.uri,
    });

    try {
        const response = await axios.post(`${API}/pet/create`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });
        console.log('Response from server:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('Error creating pet:', error.response?.data || error.message);
        throw error;
    }
}

export const deletePet = async (id: string): Promise<Pet> => {
    console.log('deletePet', id);
    const accessToken = await AsyncStorage.getItem('accessToken');
    try {
        const response = await axios.delete(`${API}/pet/${id}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        return response.data;
    } catch (error: any) {
        console.error('Error deleting pet:', error.response?.data || error.message);
        throw error;
    }
}

export const updatePet = async (pet: Pet, id: string): Promise<Pet> => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    // Ensure numeric values are properly parsed as numbers
    const petData = {
        name: pet.name,
        type: pet.type,
        breed: pet.breed,
        age: pet.age ? Number(pet.age) : undefined,
        weight: pet.weight ? Number(pet.weight) : undefined,
        gender: pet.gender,
        healthnotes: pet.healthnotes,
        birth_date: pet.birth_date,
        microchip_number: pet.microchip_number,
    };

    try {
        const response = await axios.put(`${API}/pet/${id}`, petData, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });
        return response.data;
    } catch (error: any) {
        console.error('Error updating pet:', error.response?.data || error.message);
        throw error;
    }
}



export const updatePetAvatar = async (petId: string, image: Image): Promise<Pet> => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const formData = new FormData();
    formData.append('image', {
        name: image.name,
        type: image.type,
        uri: image.uri,
    });

    try {
        const response = await axios.put(`${API}/pet/${petId}/avatar`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });
        return response.data;
    } catch (error: any) {
        console.error('Error updating pet avatar:', error.response?.data || error.message);
        throw error;
    }
}