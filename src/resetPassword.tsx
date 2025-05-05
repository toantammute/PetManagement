import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    ScrollView, 
    KeyboardAvoidingView, 
    Platform,
    StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Input from '../component/input';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const navigation = useNavigation();

    const handleResetPassword = async () => {
        if (!newPassword) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please enter a new password',
                position: 'bottom'
            });
            return;
        }

        if (newPassword.length < 6) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Password must be at least 6 characters',
                position: 'bottom'
            });
            return;
        }

        if (newPassword !== confirmPassword) {
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
            // Simulate API call
            setTimeout(() => {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Your password has been reset successfully',
                    position: 'bottom'
                });
                navigation.navigate('Login' as never);
                setLoading(false);
            }, 1500);
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to reset password. Please try again.',
                position: 'bottom'
            });
            setLoading(false);
        }
    };

    const toggleShowNewPassword = () => {
        setShowNewPassword(!showNewPassword);
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
                    <Text style={styles.title}>Reset Password</Text>
                    <Text style={styles.subtitle}>
                        Create a new password for your account
                    </Text>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.passwordContainer}>
                        <Input 
                            label="New Password" 
                            placeholder="Enter new password" 
                            value={newPassword} 
                            onChangeText={setNewPassword}
                            secureTextEntry={!showNewPassword}
                        />
                        <TouchableOpacity 
                            style={styles.eyeIcon} 
                            onPress={toggleShowNewPassword}
                        >
                            <Icon 
                                name={showNewPassword ? 'visibility' : 'visibility-off'} 
                                size={24} 
                                color="#757575"
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.passwordContainer}>
                        <Input 
                            label="Confirm Password" 
                            placeholder="Re-enter new password" 
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
                            Password must be at least 6 characters and should include uppercase, lowercase, numbers, and special characters.
                        </Text>
                    </View>

                    <TouchableOpacity 
                        style={[styles.resetButton, loading && styles.resetButtonDisabled]} 
                        onPress={handleResetPassword}
                        disabled={loading}
                    >
                        <Text style={styles.resetButtonText}>
                            {loading ? 'Updating...' : 'Update Password'}
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






