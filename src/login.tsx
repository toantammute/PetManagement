import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, Platform, ScrollView, Image, Alert } from 'react-native';
import Input from '../component/input';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '@env';

const Login = () => {
    const navigation = useNavigation<any>();
    const [username, setusername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const {login, isLoading} = useAuth();

    const handleLogin = async () => {
        if (!username.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập username');
            return;
        }

        if (!password) {
            Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu');
            return;
        }

        try {
            console.log('Bắt đầu đăng nhập với:', { username, API_URL });
            await login(username, password);
            console.log('Đăng nhập thành công');
        } catch (error: any) {
            console.error('Lỗi đăng nhập:', error);
            Alert.alert('Lỗi đăng nhập', error.message || 'Đăng nhập thất bại');
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
                    <Text style={styles.title}>Đăng nhập</Text>
                    <Text style={styles.subtitle}>
                        Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục
                    </Text>
                </View>

                <View style={styles.formContainer}>
                    <Input 
                        label="Username" 
                        placeholder="Nhập username của bạn" 
                        value={username} 
                        onChangeText={setusername}
                    />
                    
                    <View style={styles.passwordContainer}>
                        <Input 
                            label="Mật khẩu" 
                            placeholder="Nhập mật khẩu của bạn" 
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
                    >
                        <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} 
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        <Text style={styles.loginButtonText}>
                            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.noAccountText}>Chưa có tài khoản? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                        <Text style={styles.signupText}>Đăng ký ngay</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.socialLoginContainer}>
                    <Text style={styles.orText}>Hoặc đăng nhập với</Text>
                    
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
