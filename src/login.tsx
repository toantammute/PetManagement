import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, Platform, ScrollView, Image } from 'react-native';
import Input from '../component/input';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '@env';
import Toast from 'react-native-toast-message';
import { COLORS } from '../theme/color';

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
            
            if (error.response) {
                const statusCode = error.response.status;
                const errorData = error.response.data;
                
                if (statusCode === 400) {
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
                Toast.show({
                    type: 'error',
                    text1: 'Connection Error',
                    text2: 'Unable to connect to the server. Please check your network connection and try again.',
                    position: 'bottom'
                });
            } else {
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
                    <Text style={styles.appName}>Pet Care</Text>
                    <Text style={styles.appTagline}>Your Pet's Health Companion</Text>
                </View>

                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Welcome Back!</Text>
                    <Text style={styles.subtitle}>
                        Sign in to continue caring for your pets
                    </Text>
                </View>

                <View style={styles.formContainer}>
                    <Input 
                        label="Username" 
                        placeholder="Enter your username" 
                        value={username} 
                        onChangeText={setusername}
                        rightIcon={
                            <Icon name="person" size={20} color="#BDBDBD" />
                        }
                    />
                    
                    <Input 
                        label="Password" 
                        placeholder="Enter your password" 
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
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} 
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Text style={styles.loginButtonText}>Logging in...</Text>
                        ) : (
                            <View style={styles.buttonContent}>
                                <Text style={styles.loginButtonText}>Sign In</Text>
                                <Icon name="arrow-forward" size={20} color="#FFF" />
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.noAccountText}>New to Pet Care? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                        <Text style={styles.signupText}>Create Account</Text>
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
    appName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.background.mint,
        letterSpacing: 0.5,
    },
    appTagline: {
        fontSize: 16,
        color: '#757575',
        marginTop: 8,
        letterSpacing: 0.3,
    },
    titleContainer: {
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
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
    forgotPassword: {
        alignSelf: 'flex-end',
        marginTop: 8,
        marginBottom: 25,
        paddingVertical: 4,
    },
    forgotPasswordText: {
        color: COLORS.background.mint,
        fontWeight: '600',
        fontSize: 15,
    },
    loginButton: {
        backgroundColor: COLORS.background.mint,
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15,
        shadowColor: COLORS.background.mint,
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
        backgroundColor: '#B2DFDB',
    },
    loginButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 8,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
        paddingVertical: 10,
    },
    noAccountText: {
        color: '#757575',
        fontSize: 16,
    },
    signupText: {
        color: COLORS.background.mint,
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default Login;
