import { API } from "@env";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, Image } from "../models/models";
import { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import messaging from "@react-native-firebase/messaging";
import { useNavigation } from "@react-navigation/native";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    accessToken: string | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (username: string, password: string, email: string, image: Image, full_name: string, phone_number: string, address: string) => Promise<void>;
    isLoggedIn: () => Promise<void>;
    verifyEmail: (username: string, secretCode: string) => Promise<void>;
    resendOTP: (username: string) => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    changePassword: (password: string, old_password: string) => Promise<void>;

}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    // const navigation = useNavigation<any>();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);

    const login = async (username: string, password: string): Promise<void> => {
        const deviceToken = await messaging().getToken();
        try {
            setIsLoading(true);
            console.log("Attempting login with API URL:", API);

            const response = await axios.post(`${API}/user/login`, {
                username,
                password,
                token: deviceToken.toString(),
            });


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

    const changePassword = async (password: string, old_password: string) => {
        try {
            const response = await axios.put(`${API}/user/change-password`, {
                password,
                old_password
            },{
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });
            console.log("Change password response: ", response.data);
            return response.data;
        } catch (error: any) {
            console.error("Change password error: ", error);
        }
    }

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

    const register = async (username: string, password: string, email: string, image: Image, full_name: string, phone_number: string, address: string) => {
        try {
            const formData = new FormData();
            formData.append('data', JSON.stringify({
                username,
                password,
                email,
                full_name,
                phone_number,
                address,
                role: 'user'
            }));
            // formData.append('username', username);
            // formData.append('password', password);
            // formData.append('email', email);
            // formData.append('full_name', full_name);
            // formData.append('phone_number', phone_number);
            // formData.append('address', address);
            formData.append('image', {
                name: image.name,
                type: image.type,
                uri: image.uri,
            });
            //formData.append('role', 'user');
            console.log("Register formData: ", formData);

            const response = await axios.post(`${API}/user/create`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Accept': 'application/json',
                },
            });
            console.log("Register response: ", response.data);
            if (response.status === 200) {
                console.log("Register response: ", response.data);
                console.log("Register response.data.data: ", response.data.data);
                Alert.alert("Đăng ký thành công", "Vui lòng kiểm tra email để xác thực tài khoản");
                // await verifyEmail(username, response.data.data.secret_code);
                return response.data;
                // navigation.navigate('OTP', {email: email});
            }
        } catch (error) {

            console.error("Register error: ", error);
        }
    };
    const forgotPassword = async (email: string) => {
        try {
            const response = await axios.put(`${API}/user/reset-password`, {
                email
            });
            console.log("Forgot password response: ", response.data);
            return response.data;
        } catch (error: any) {
            console.error("Forgot password error: ", error);
        }
    }

    const verifyEmail = async (username: string, secretCode: string) => {
        try {
            console.log("Verify email username: ", username);
            console.log("Verify email secretCode: ", secretCode);
            const response = await axios.post(`${API}/user/verify_email`,
                {
                    username,
                    secret_code: secretCode
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                }
            );
            console.log("Verify email response: ", response.data);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                // Server trả về response với status code nằm ngoài range 2xx
                throw new Error(error.response.data.error || 'Failed to verify email');
            } else if (error.request) {
                // Request được gửi nhưng không nhận được response
                throw new Error('No response from server');
            } else {
                // Có lỗi khi setting up request
                throw new Error('Error setting up request');
            }
        }
    }

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
    const resendOTP = async (username: string) => {
        try {
            const response = await axios.post(`${API}/user/resend_otp/${username}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            });
            console.log("Resend OTP response: ", response.data);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                // Server trả về response với status code nằm ngoài range 2xx
                throw new Error(error.response.data.error || 'Failed to resend OTP');
            } else if (error.request) {
                // Request được gửi nhưng không nhận được response
                throw new Error('No response from server');
            } else {
                // Có lỗi khi setting up request
                throw new Error('Error setting up request');
            }
        }
    }

    useEffect(() => {
        isLoggedIn();
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading, accessToken, login, logout, register, isLoggedIn, verifyEmail, resendOTP, forgotPassword, changePassword }}>
            {children}
        </AuthContext.Provider>
    );
};

