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
                    <Image 
                        source={require('../assets/images/bus.png')} 
                        style={styles.logo}
                    />
                    <Text style={styles.appName}>Pet Care</Text>
                </View>

                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Login</Text>
                    <Text style={styles.subtitle}>
                        Welcome back! Please sign in to continue
                    </Text>
                </View>

                <View style={styles.formContainer}>
                    <Input 
                        label="Username" 
                        placeholder="Enter your username" 
                        value={username} 
                        onChangeText={setusername}
                    />
                    
                    <View style={styles.passwordContainer}>
                        <Input 
                            label="Password" 
                            placeholder="Enter your password" 
                            value={password} 
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity 
                            style={styles.eyeIcon} 
                            onPress={togglePasswordVisibility}
                        >
                            <Icon 
                                name={showPassword ? 'visibility' : 'visibility-off'} 
                                size={24} 
                                color="#757575"
                            />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity 
                        style={styles.forgotPassword} 
                        onPress={() => navigation.navigate('ForgotPassword')}
                    >
                        <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} 
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        <Text style={styles.loginButtonText}>
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.noAccountText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                        <Text style={styles.signupText}>Sign up now</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.socialLoginContainer}>
                    <Text style={styles.orText}>Or sign in with</Text>
                    
                    <View style={styles.socialButtons}>
                        <TouchableOpacity style={styles.socialButton}>
                            <Icon name="facebook" size={24} color="#4267B2" />
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.socialButton}>
                            <Icon name="username" size={24} color="#DB4437" />
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.socialButton}>
                            <Icon name="phone" size={24} color="#4CAF50" />
                        </TouchableOpacity>
                    </View>
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
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 50 : 30,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    appName: {
        marginTop: 10,
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    titleContainer: {
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 10,
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
        position: 'relative',
    },
    eyeIcon: {
        position: 'absolute',
        right: 10,
        top: 45,
        padding: 5,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginTop: 10,
        marginBottom: 25,
    },
    forgotPasswordText: {
        color: '#4CAF50',
        fontWeight: '500',
    },
    loginButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 10,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 10,
    },
    loginButtonDisabled: {
        backgroundColor: '#A5D6A7',
    },
    loginButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 30,
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
    socialLoginContainer: {
        alignItems: 'center',
    },
    orText: {
        color: '#757575',
        fontSize: 14,
        marginBottom: 20,
    },
    socialButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    socialButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 10,
    },
});

export default Login;
