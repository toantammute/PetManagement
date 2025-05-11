import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, Platform, ScrollView, Image } from 'react-native';
import Input from '../component/input';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '@env';
import Toast from 'react-native-toast-message';

const Login = () => {
    const navigation = useNavigation<any>();
    const [username, setusername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const {login, isLoading} = useAuth();

    const handleLogin = async () => {
        if (!username.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please enter your username',
                position: 'bottom'
            });
            return;
        }

        if (!password) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please enter your password',
                position: 'bottom'
            });
            return;
        }

        try {
            console.log('Starting login with:', { username, API_URL });
            await login(username, password);
            console.log('Login successful');
        } catch (error: any) {
            console.error('Login error:', error);
            
            // Enhanced error handling with more specific messages
            if (error.response) {
                // The server responded with a status code outside the 2xx range
                const statusCode = error.response.status;
                const errorData = error.response.data;
                
                if (statusCode === 400) {
                    // Handle specific 400 Bad Request errors
                    const message = errorData?.message || 'Invalid login information';
                    Toast.show({
                        type: 'error',
                        text1: 'Login Error',
                        text2: message,
                        position: 'bottom'
                    });
                } else if (statusCode === 401) {
                    Toast.show({
                        type: 'error',
                        text1: 'Login Error',
                        text2: 'Incorrect username or password',
                        position: 'bottom'
                    });
                } else if (statusCode === 404) {
                    Toast.show({
                        type: 'error',
                        text1: 'Login Error',
                        text2: 'Account does not exist',
                        position: 'bottom'
                    });
                } else {
                    Toast.show({
                        type: 'error',
                        text1: 'Login Error',
                        text2: `Server error (${statusCode}): ${errorData?.message || 'Please try again later'}`,
                        position: 'bottom'
                    });
                }
            } else if (error.request) {
                // The request was made but no response was received
                Toast.show({
                    type: 'error',
                    text1: 'Connection Error',
                    text2: 'Unable to connect to the server. Please check your network connection and try again.',
                    position: 'bottom'
                });
            } else {
                // Something happened in setting up the request
                Toast.show({
                    type: 'error',
                    text1: 'Login Error',
                    text2: error.message || 'Login failed',
                    position: 'bottom'
                });
            }
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    {/* <Image 
                        source={require('../assets/images/bus.png')} 
                        style={styles.logo}
                    /> */}
                    <Text style={styles.appName}>Pet Care</Text>
                </View>

                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Đăng nhập</Text>
                    <Text style={styles.subtitle}>
                        Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục
                    </Text>
                </View>

                <View style={styles.formContainer}>
                    <Input 
                        label="Tên đăng nhập" 
                        placeholder="Nhập tên đăng nhập" 
                        value={username} 
                        onChangeText={setusername}
                        rightIcon={
                            <Icon name="person" size={20} color="#BDBDBD" />
                        }
                    />
                    
                    <Input 
                        label="Mật khẩu" 
                        placeholder="Nhập mật khẩu" 
                        value={password} 
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        rightIcon={
                            <TouchableOpacity 
                                onPress={togglePasswordVisibility}
                            >
                                <Icon 
                                    name={showPassword ? 'visibility' : 'visibility-off'} 
                                    size={22} 
                                    color="#757575"
                                />
                            </TouchableOpacity>
                        }
                    />

                    <TouchableOpacity 
                        style={styles.forgotPassword} 
                        onPress={() => navigation.navigate('ForgotPassword')}
                    >
                        <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} 
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Text style={styles.loginButtonText}>Đang đăng nhập...</Text>
                        ) : (
                            <View style={styles.buttonContent}>
                                <Text style={styles.loginButtonText}>Đăng nhập</Text>
                                <Icon name="arrow-forward" size={20} color="#FFF" />
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.orText}>Hoặc đăng nhập với</Text>
                    <View style={styles.dividerLine} />
                </View>

                <View style={styles.socialLoginContainer}>
                    <View style={styles.socialButtons}>
                        <TouchableOpacity style={styles.socialButton}>
                            <Icon name="facebook" size={24} color="#4267B2" />
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={[styles.socialButton, {marginHorizontal: 20}]}>
                            <Icon name="mail" size={24} color="#DB4437" />
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.socialButton}>
                            <Icon name="phone" size={24} color="#4CAF50" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.noAccountText}>Chưa có tài khoản? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                        <Text style={styles.signupText}>Đăng ký ngay</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            <Toast />
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 40,
        flexGrow: 1,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        width: 90,
        height: 90,
        borderRadius: 45,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    appName: {
        marginTop: 12,
        fontSize: 26,
        fontWeight: 'bold',
        color: '#4CAF50',
        letterSpacing: 0.5,
    },
    titleContainer: {
        marginBottom: 32,
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: '#757575',
        lineHeight: 22,
    },
    formContainer: {
        marginBottom: 30,
    },
    passwordContainer: {
        marginBottom: 0,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginTop: 8,
        marginBottom: 25,
        paddingVertical: 4,
    },
    forgotPasswordText: {
        color: '#4CAF50',
        fontWeight: '600',
    },
    loginButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15,
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginButtonDisabled: {
        backgroundColor: '#A5D6A7',
    },
    loginButtonText: {
        color: 'white',
        fontSize: 17,
        fontWeight: 'bold',
        marginRight: 8,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    orText: {
        color: '#9E9E9E',
        fontSize: 14,
        paddingHorizontal: 10,
    },
    socialLoginContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    socialButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
    },
    socialButton: {
        width: 55,
        height: 55,
        borderRadius: 28,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EEEEEE',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
    },
    noAccountText: {
        color: '#757575',
        fontSize: 16,
    },
    signupText: {
        color: '#4CAF50',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default Login;
