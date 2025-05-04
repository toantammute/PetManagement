import { API } from "@env";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {User} from "../models/models";
import { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import messaging from "@react-native-firebase/messaging";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    accessToken: string | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (username: string, password: string, email: string) => Promise<void>;
    isLoggedIn: () => Promise<void>;

}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({children}: {children: React.ReactNode}) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);

    const login = async (username: string, password: string): Promise<void> => {
        const deviceToken = await messaging().getToken();
        console.log("Device Token:", deviceToken);
        try {
            setIsLoading(true);
            console.log("Attempting login with API URL:", API);
            
            const response = await axios.post(`${API}/user/login`, {
                username,
                password,
                token: deviceToken.toString(),
            });

            // console.log("Login response status:", response.status);
            console.log("Login response data:", response.data);
            

            if (response.status === 200 && response.data.data) {
                const userData = response.data.data.user;
                const tokenData = response.data.data;

                console.log("Login access_token:", tokenData.access_token);

                if (!userData || !tokenData.access_token || !tokenData.refresh_token) {
                    throw new Error("Invalid response data structure");
                }

                setAccessToken(tokenData.access_token);
                console.log("Login access_token2:", tokenData.access_token);
                setUser(userData);
                setRefreshToken(tokenData.refresh_token);
                
                await AsyncStorage.multiSet([
                    ['user', JSON.stringify(userData)],
                    ['accessToken', tokenData.access_token],
                    ['refreshToken', tokenData.refresh_token]
                ]);
                console.log("Login access_token3:", tokenData.access_token);

                console.log("Login successful, user data saved");
            } else {
                throw new Error(response.data.message || "Login failed");
            }
        } catch (error: any) {
            console.error("Login error details:", error);
            const errorMessage = error.response?.data?.message || error.message || "Đăng nhập thất bại";
            Alert.alert("Lỗi đăng nhập", errorMessage);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            const deviceToken = await messaging().getToken();
            console.log("Device Token:", deviceToken);
            console.log("Access Token:", accessToken);
            const response = await axios.post(`${API}/user/logout`, {
                "token": deviceToken.toString(),
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });
            console.log("Logout response: ", response.data);
            await AsyncStorage.multiRemove(['user', 'accessToken', 'refreshToken']);
            setUser(null);
            setAccessToken(null);
            setRefreshToken(null);
        } catch (error) {
            console.error("Logout error: ", error);
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (username: string, password: string, email: string) => {
        try {
            const response = await axios.post(`${API}/user/register`, {
                username,
                password,
                email,
            });
            console.log("Register response: ", response.data);
        } catch (error) {
            console.error("Register error: ", error);
        }
    };

    const isLoggedIn = async () => {
        try {
            setIsLoading(true);
            const [user, accessToken, refreshToken] = await Promise.all([
                AsyncStorage.getItem('user'),
                AsyncStorage.getItem('accessToken'),
                AsyncStorage.getItem('refreshToken')
            ]);

            if (user && accessToken && refreshToken) {
                setUser(JSON.parse(user));
                setAccessToken(accessToken);
                setRefreshToken(refreshToken);
            }
        } catch (error) {
            console.error("Check auth error: ", error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        isLoggedIn();
    }, []);

    return (
        <AuthContext.Provider value={{user, isLoading, accessToken, login, logout, register, isLoggedIn}}>
            {children}
        </AuthContext.Provider>
    );
};
    
