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
    StatusBar,
    Alert 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Input from '../component/input';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigation = useNavigation();

    const handleSubmit = async () => {
        // Kiểm tra email
        if (!email.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập email hoặc số điện thoại của bạn');
            return;
        }

        setLoading(true);
        
        try {
            // Mô phỏng API gửi mã xác nhận
            setTimeout(() => {
                // Chuyển đến màn hình OTP
                // navigation.navigate('OTP' as never, { 
                //     email,
                //     forgotPassword: true
                // } as never);
                setLoading(false);
            }, 1500);
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể gửi mã xác nhận. Vui lòng thử lại sau.');
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
                    <Image 
                        source={require('../assets/images/download.jpg')} 
                        style={styles.logo}
                    />
                </View>

                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Quên mật khẩu?</Text>
                    <Text style={styles.subtitle}>
                        Vui lòng nhập email hoặc số điện thoại đã đăng ký để nhận mã xác nhận
                    </Text>
                </View>

                <View style={styles.formContainer}>
                    <Input 
                        label="Email hoặc số điện thoại" 
                        placeholder="Nhập email hoặc số điện thoại" 
                        value={email} 
                        onChangeText={setEmail}
                    />

                    <TouchableOpacity 
                        style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        <Text style={styles.submitButtonText}>
                            {loading ? 'Đang gửi...' : 'Gửi mã xác nhận'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.rememberText}>Bạn đã nhớ mật khẩu? </Text>
                    <TouchableOpacity onPress={navigateToLogin}>
                        <Text style={styles.loginText}>Đăng nhập</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.helpContainer}>
                    <TouchableOpacity style={styles.helpButton}>
                        <Icon name="help-outline" size={20} color="#4CAF50" />
                        <Text style={styles.helpText}>Cần trợ giúp thêm?</Text>
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