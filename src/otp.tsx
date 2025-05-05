import React, { useState, useEffect, useRef } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView, 
    Platform,
    StatusBar,
    ActivityIndicator 
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';

const OTP = () => {
    const [otp, setOtp] = useState(['', '', '', '']);
    const [timer, setTimer] = useState(60);
    const [loading, setLoading] = useState(false);
    const [resendDisabled, setResendDisabled] = useState(true);

    const inputRefs = useRef<Array<TextInput | null>>([null, null, null, null]);
    const navigation = useNavigation();
    const route = useRoute();
    const params = route.params as { email?: string; phone?: string; forgotPassword?: boolean };

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prevTimer) => {
                if (prevTimer <= 1) {
                    clearInterval(interval);
                    setResendDisabled(false);
                    return 0;
                }
                return prevTimer - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const handleChangeOtp = (text: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = text.replace(/[^0-9]/g, '');
        setOtp(newOtp);

        if (text && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const otpValue = otp.join('');

        if (otpValue.length !== 4) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please enter the complete verification code',
                position: 'bottom'
            });
            return;
        }

        setLoading(true);

        try {
            // Simulate OTP verification
            setTimeout(() => {
                setLoading(false);

                if (params.forgotPassword) {
                    navigation.navigate('ResetPassword' as never);
                } else {
                    Toast.show({
                        type: 'success',
                        text1: 'Success',
                        text2: 'Your account has been verified',
                        position: 'bottom'
                    });
                    navigation.navigate('Login' as never);
                }
            }, 2000);
        } catch (error) {
            console.error('OTP verification error:', error);
            setLoading(false); // Ensure loading is set to false on error
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to verify the code. Please try again.',
                position: 'bottom'
            });
        }
    };

    const handleResendOTP = () => {
        setTimer(60);
        setResendDisabled(true);

        // Simulate resending OTP
        setTimeout(() => {
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'A new verification code has been sent',
                position: 'bottom'
            });
        }, 1500); // Simulate network delay

        const interval = setInterval(() => {
            setTimer((prevTimer) => {
                if (prevTimer <= 1) {
                    clearInterval(interval);
                    setResendDisabled(false);
                    return 0;
                }
                return prevTimer - 1;
            });
        }, 1000);
    };

    const handleGoBack = () => {
        navigation.goBack();
    };

    const maskedContact = params.email
        ? params.email.replace(/(\w{3})[\w.-]+@([\w.]+\w)/, '$1***@$2')
        : params.phone?.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2');

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            <TouchableOpacity
                style={styles.backButton}
                onPress={handleGoBack}
            >
                <Icon name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>

            <View style={styles.content}>
                <View style={styles.header}>
                    <Icon name="mark-email-read" size={70} color="#4CAF50" />
                    <Text style={styles.title}>OTP Verification</Text>
                    <Text style={styles.subtitle}>
                        A verification code has been sent to{'\n'}
                        <Text style={styles.contactText}>{maskedContact}</Text>
                    </Text>
                </View>

                <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => {
                                inputRefs.current[index] = ref;
                            }}
                            style={styles.otpInput}
                            value={digit}
                            onChangeText={(text) => handleChangeOtp(text, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            maxLength={1}
                            keyboardType="numeric"
                            autoFocus={index === 0}
                        />
                    ))}
                </View>

                <TouchableOpacity
                    style={[styles.verifyButton, loading && styles.verifyButtonDisabled]}
                    onPress={handleVerify}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text style={styles.verifyButtonText}>Verify</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.resendContainer}>
                    <Text style={styles.resendText}>
                        Didn't receive the code? {resendDisabled ? `Resend after (${timer}s)` : ''}
                    </Text>
                    {!resendDisabled && (
                        <TouchableOpacity onPress={handleResendOTP}>
                            <Text style={styles.resendButtonText}>Resend Code</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    backButton: {
        marginTop: Platform.OS === 'ios' ? 50 : 20,
        marginLeft: 20,
        alignSelf: 'flex-start',
        padding: 5,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#333333',
        marginTop: 20,
        marginBottom: 15,
    },
    subtitle: {
        fontSize: 16,
        color: '#757575',
        textAlign: 'center',
        lineHeight: 24,
    },
    contactText: {
        fontWeight: 'bold',
        color: '#555555',
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
    },
    otpInput: {
        width: 65,
        height: 65,
        borderWidth: 1.5,
        borderColor: '#DDDDDD',
        borderRadius: 12,
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        backgroundColor: '#F9F9F9',
    },
    verifyButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 10,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 25,
    },
    verifyButtonDisabled: {
        backgroundColor: '#A5D6A7',
    },
    verifyButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    resendContainer: {
        alignItems: 'center',
    },
    resendText: {
        color: '#757575',
        marginBottom: 10,
    },
    resendButtonText: {
        color: '#4CAF50',
        fontWeight: 'bold',
        fontSize: 16,
    }
});

export default OTP;
