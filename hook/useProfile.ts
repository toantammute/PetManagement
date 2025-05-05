import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserDetails, updateUser, updateUserAvatar } from "../services/profileService";

export interface ProfileResponse {
    code: string;
    message: string;
    data: UserProfileData;
}

export interface UserProfileData {
    user_id: number;
    username: string;
    full_name: string;
    email: string;
    phone_number: string;
    address: string;
    role: string;
    data_image: string;
    original_image: string;
    removed_at: string;
}

export const useProfile = () => {
    return useQuery<ProfileResponse, Error>({
        queryKey: ['profile'],
        queryFn: getUserDetails,
    });
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: updateUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
    });
}

export const useUpdateAvatar = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: updateUserAvatar,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
    });
}
