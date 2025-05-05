import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    ScrollView, 
    Image, 
    KeyboardAvoidingView, 
    Platform,
    StatusBar
} from 'react-native';
import Toast from 'react-native-toast-message';
// import { useNavigation } from '@react-navigation/native';
import Input from '../component/input';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Signup = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // const navigation = useNavigation();

    const handleSignup = async () => {
        if (!fullName.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please enter your full name',
                position: 'bottom'
            });
            return;
        }

        if (!email.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please enter your email',
                position: 'bottom'
            });
            return;
        }

        if (!phone.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please enter your phone number',
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

        if (password !== confirmPassword) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Passwords do not match',
                position: 'bottom'
            });
            return;
        }

        setLoading(true);
        
        try {
            // Mô phỏng API đăng ký
            setTimeout(() => {
                // Chuyển hướng đến màn hình OTP để xác thực
                // navigation.navigate('OTP' as never, { email, phone } as never);
                setLoading(false);
            }, 1500);
        } catch (error: any) {
            console.error('Signup error:', error);
            
            if (error.response) {
                const statusCode = error.response.status;
                const errorData = error.response.data;
                
                Toast.show({
                    type: 'error',
                    text1: 'Registration Error',
                    text2: errorData?.message || `Server error (${statusCode})`,
                    position: 'bottom'
                });
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
                    text1: 'Registration Error',
                    text2: error.message || 'Registration failed',
                    position: 'bottom'
                });
            }
            setLoading(false);
        }
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const toggleShowConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const navigateToLogin = () => {
        // navigation.navigate('Login' as never);
    };

    return (
        <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <TouchableOpacity 
                    style={styles.backButton} 
                    // onPress={navigateToLogin}
                >
                    <Icon name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>

                <View style={styles.header}>
                    <Image 
                        source={require('../assets/images/bus.png')} 
                        style={styles.logo}
                    />
                    <Text style={styles.appName}>Pet Care</Text>
                </View>

                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>
                        Please fill in the details below to create your account.
                    </Text>
                </View>

                <View style={styles.formContainer}>
                    <Input 
                        label="Full Name" 
                        placeholder="Enter your full name" 
                        value={fullName} 
                        onChangeText={setFullName}
                    />
                    
                    <Input 
                        label="Email" 
                        placeholder="Enter your email" 
                        value={email} 
                        onChangeText={setEmail}
                    />
                    
                    <Input 
                        label="Phone Number" 
                        placeholder="Enter your phone number" 
                        value={phone} 
                        onChangeText={setPhone}
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
                            onPress={toggleShowPassword}
                        >
                            <Icon 
                                name={showPassword ? 'visibility' : 'visibility-off'} 
                                size={24} 
                                color="#757575"
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.passwordContainer}>
                        <Input 
                            label="Confirm Password" 
                            placeholder="Re-enter your password" 
                            value={confirmPassword} 
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showConfirmPassword}
                        />
                        <TouchableOpacity 
                            style={styles.eyeIcon} 
                            onPress={toggleShowConfirmPassword}
                        >
                            <Icon 
                                name={showConfirmPassword ? 'visibility' : 'visibility-off'} 
                                size={24} 
                                color="#757575"
                            />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity 
                        style={[styles.signupButton, loading && styles.signupButtonDisabled]} 
                        onPress={handleSignup}
                        disabled={loading}
                    >
                        <Text style={styles.signupButtonText}>
                            {loading ? 'Registering...' : 'Register'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.haveAccountText}>Do you have an account yet? </Text>
                    <TouchableOpacity 
                    // onPress={navigateToLogin}
                    >
                        <Text style={styles.loginText}>Login</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    backButton: {
        marginTop: Platform.OS === 'ios' ? 50 : 20,
        marginBottom: 10,
        alignSelf: 'flex-start',
        padding: 5,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    logo: {
        width: 70,
        height: 70,
        borderRadius: 35,
    },
    appName: {
        marginTop: 10,
        fontSize: 22,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    titleContainer: {
        marginBottom: 25,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: '#757575',
        lineHeight: 22,
    },
    formContainer: {
        marginBottom: 20,
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
    signupButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 10,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 15,
    },
    signupButtonDisabled: {
        backgroundColor: '#A5D6A7',
    },
    signupButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
    },
    haveAccountText: {
        color: '#757575',
        fontSize: 16,
    },
    loginText: {
        color: '#4CAF50',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default Signup;


