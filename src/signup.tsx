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
        // Kiểm tra các trường nhập liệu
        if (!fullName.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập họ tên');
            return;
        }

        if (!email.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập email');
            return;
        }

        if (!phone.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
            return;
        }

        if (!password) {
            Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
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
        } catch (error) {
            Alert.alert('Lỗi đăng ký', 'Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.');
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
                    <Text style={styles.title}>Tạo tài khoản</Text>
                    <Text style={styles.subtitle}>
                        Vui lòng điền thông tin để đăng ký tài khoản mới
                    </Text>
                </View>

                <View style={styles.formContainer}>
                    <Input 
                        label="Họ và tên" 
                        placeholder="Nhập họ và tên" 
                        value={fullName} 
                        onChangeText={setFullName}
                    />
                    
                    <Input 
                        label="Email" 
                        placeholder="Nhập địa chỉ email" 
                        value={email} 
                        onChangeText={setEmail}
                    />
                    
                    <Input 
                        label="Số điện thoại" 
                        placeholder="Nhập số điện thoại" 
                        value={phone} 
                        onChangeText={setPhone}
                    />
                    
                    <View style={styles.passwordContainer}>
                        <Input 
                            label="Mật khẩu" 
                            placeholder="Nhập mật khẩu" 
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
                            label="Xác nhận mật khẩu" 
                            placeholder="Nhập lại mật khẩu" 
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
                            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.haveAccountText}>Đã có tài khoản? </Text>
                    <TouchableOpacity 
                    // onPress={navigateToLogin}
                    >
                        <Text style={styles.loginText}>Đăng nhập</Text>
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


