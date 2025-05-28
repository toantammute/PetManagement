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
import { useNavigation } from '@react-navigation/native';
import Input from '../component/input';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import { useAuth } from '../context/AuthContext';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const { forgotPassword } = useAuth();

    const navigation = useNavigation();

    const handleSubmit = async () => {
        if (!email.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please enter your email address',
                position: 'bottom'
            });
            return;
        }

        setLoading(true);
        
        try {
            // Simulate API call
            await forgotPassword(email);
            navigation.navigate('Login' as never);
            setLoading(false);
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to send verification code. Please try again.',
                position: 'bottom'
            });
            setLoading(false);
        }
    };

    const navigateToLogin = () => {
        navigation.navigate('Login' as never);
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
                    onPress={navigateToLogin}
                >
                    <Icon name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>

                <View style={styles.header}>
                    {/* Replace the missing image with an existing one */}
                    <Image 
                        source={require('../assets/images/bus.png')} 
                        style={styles.logo}
                    />
                </View>

                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Forgot Password?</Text>
                    <Text style={styles.subtitle}>
                        Please enter your registered email or phone number to receive a verification code
                    </Text>
                </View>

                <View style={styles.formContainer}>
                    <Input 
                        label="Email or phone number" 
                        placeholder="Enter your email or phone number" 
                        value={email} 
                        onChangeText={setEmail}
                    />

                    <TouchableOpacity 
                        style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        <Text style={styles.submitButtonText}>
                            {loading ? 'Sending...' : 'Send verification code'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.rememberText}>Remember your password? </Text>
                    <TouchableOpacity onPress={navigateToLogin}>
                        <Text style={styles.loginText}>Login</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.helpContainer}>
                    <TouchableOpacity style={styles.helpButton}>
                        <Icon name="help-outline" size={20} color="#4CAF50" />
                        <Text style={styles.helpText}>Need additional help?</Text>
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
        flexGrow: 1,
    },
    backButton: {
        marginTop: Platform.OS === 'ios' ? 50 : 20,
        marginBottom: 20,
        alignSelf: 'flex-start',
        padding: 5,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    titleContainer: {
        marginBottom: 30,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 15,
    },
    subtitle: {
        fontSize: 16,
        color: '#757575',
        textAlign: 'center',
        lineHeight: 24,
    },
    formContainer: {
        marginBottom: 30,
    },
    submitButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 10,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 25,
    },
    submitButtonDisabled: {
        backgroundColor: '#A5D6A7',
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 'auto',
        marginBottom: 20,
    },
    rememberText: {
        color: '#757575',
        fontSize: 16,
    },
    loginText: {
        color: '#4CAF50',
        fontWeight: 'bold',
        fontSize: 16,
    },
    helpContainer: {
        alignItems: 'center',
    },
    helpButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    helpText: {
        color: '#4CAF50',
        marginLeft: 5,
        fontSize: 15,
    },
});

export default ForgotPassword;