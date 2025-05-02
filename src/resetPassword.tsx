import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    ScrollView, 
    KeyboardAvoidingView, 
    Platform,
    StatusBar,
    Alert 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Input from '../component/input';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const navigation = useNavigation();

    const handleResetPassword = async () => {
        // Kiểm tra mật khẩu
        if (!password) {
            Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu mới');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
            return;
        }

        setLoading(true);
        
        try {
            // Mô phỏng API đặt lại mật khẩu
            setTimeout(() => {
                setLoading(false);
                Alert.alert(
                    'Thành công',
                    'Mật khẩu của bạn đã được cập nhật thành công.',
                    [
                        {
                            text: 'Đăng nhập ngay',
                            onPress: () => navigation.navigate('Login' as never)
                        }
                    ]
                );
            }, 1500);
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể đặt lại mật khẩu. Vui lòng thử lại sau.');
            setLoading(false);
        }
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const toggleShowConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
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
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                
                <View style={styles.header}>
                    <Icon name="lock-reset" size={80} color="#4CAF50" />
                    <Text style={styles.title}>Đặt lại mật khẩu</Text>
                    <Text style={styles.subtitle}>
                        Tạo mật khẩu mới cho tài khoản của bạn
                    </Text>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.passwordContainer}>
                        <Input 
                            label="Mật khẩu mới" 
                            placeholder="Nhập mật khẩu mới" 
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
                            placeholder="Nhập lại mật khẩu mới" 
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

                    <View style={styles.passwordInfo}>
                        <Icon name="info-outline" size={16} color="#757575" />
                        <Text style={styles.infoText}>
                            Mật khẩu phải có ít nhất 6 ký tự và nên bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
                        </Text>
                    </View>

                    <TouchableOpacity 
                        style={[styles.resetButton, loading && styles.resetButtonDisabled]} 
                        onPress={handleResetPassword}
                        disabled={loading}
                    >
                        <Text style={styles.resetButtonText}>
                            {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                        </Text>
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
        marginBottom: 40,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#333333',
        marginTop: 20,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#757575',
        textAlign: 'center',
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
    passwordInfo: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 5,
        marginBottom: 25,
        paddingHorizontal: 5,
    },
    infoText: {
        fontSize: 12,
        color: '#757575',
        marginLeft: 5,
        flex: 1,
    },
    resetButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 10,
        paddingVertical: 16,
        alignItems: 'center',
    },
    resetButtonDisabled: {
        backgroundColor: '#A5D6A7',
    },
    resetButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ResetPassword;






