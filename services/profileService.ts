// authRoute.GET("/user", userApi.controller.getUserDetails)

import { API_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Image } from "../models/models";
import { Platform } from 'react-native';

export const getUserDetails = async () => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    if (!accessToken) {
        throw new Error('No access token found');
    }

    try {
        const response = await axios.get(`${API_URL}/user`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        return response.data;
    }
    catch (error) {
        console.error('Error fetching user details:', error);
        throw new Error('Failed to fetch user details');
    }
}


// authRoute.PUT("/user", userApi.controller.updatetUser)
interface UpdateUserParams {
    username: string;
    full_name: string;
    email: string;
    phone_umber: string;
    address: string;
}

export const updateUser = async (params: UpdateUserParams) => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    if (!accessToken) {
        throw new Error('No access token found');
    }

    try {
        const response = await axios.put(`${API_URL}/user`, params, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        return response.data;
    }
    catch (error) {
        console.error('Error updating user:', error);
        throw new Error('Failed to update user');
    }
}


// authRoute.PUT("/user/avatar", userApi.controller.updatetUserAvatar)

export const updateUserAvatar = async (image: Image) => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    if (!accessToken) {
        throw new Error('No access token found');
    }

    const formData = new FormData();
    formData.append('image', {
        name: image.name,
        type: image.type,
        uri: Platform.OS === 'android' ? image.uri : image.uri.replace('file://', ''),
    } as any);

    try {
        const response = await axios.put(`${API_URL}/user/avatar`, formData, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/json',
            },
        });

        return response.data;
    }
    catch (error) {
        console.error('Error updating user avatar:', error);
        throw error;
    }
}
// authRoute.DELETE("/user", userApi.controller.deleteUser)