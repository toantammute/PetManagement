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
    SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Input from '../component/input';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import Header from '../component/header';
import { COLORS } from '../theme/color';

const ResetPassword = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const navigation = useNavigation();

    const handleResetPassword = async () => {
        if (!oldPassword) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please enter your old password',
                position: 'bottom'
            });
            return;
        }

        if (!newPassword) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please enter your new password',
                position: 'bottom'
            });
            return;
        }

        if (newPassword.length < 6) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Password must be at least 6 characters long',
                position: 'bottom'
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Confirm password does not match',
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
                    text2: 'Your password has been updated',
                    position: 'bottom'
                });
                navigation.goBack();
                setLoading(false);
            }, 1500);
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Unable to update password. Please try again.',
                position: 'bottom'
            });
            setLoading(false);
        }
    };

    return (
        <>
            <StatusBar
                barStyle="dark-content"
                backgroundColor={COLORS.background.white}
            />
            <SafeAreaView style={[
                styles.container,
                Platform.OS === 'android' && styles.androidSafeArea
            ]}>
                <Header title="Change Password" />
                
                <KeyboardAvoidingView 
                    style={styles.keyboardView}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
                >
                    <ScrollView 
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.formContainer}>
                            {/* Old Password */}
                            <Input 
                                label="Old Password" 
                                placeholder="Enter your old password"
                                value={oldPassword} 
                                onChangeText={setOldPassword}
                                secureTextEntry={!showOldPassword}
                                rightIcon={
                                    <TouchableOpacity onPress={() => setShowOldPassword(!showOldPassword)}>
                                        <Icon 
                                            name={showOldPassword ? 'visibility' : 'visibility-off'} 
                                            size={24} 
                                            color="#757575"
                                        />
                                    </TouchableOpacity>
                                }
                            />
                            
                            {/* New Password */}
                            <Input 
                                label="New Password" 
                                placeholder="Enter your new password" 
                                value={newPassword} 
                                onChangeText={setNewPassword}
                                secureTextEntry={!showNewPassword}
                                rightIcon={
                                    <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                                        <Icon 
                                            name={showNewPassword ? 'visibility' : 'visibility-off'} 
                                            size={24} 
                                            color="#757575"
                                        />
                                    </TouchableOpacity>
                                }
                            />

                            {/* Confirm New Password */}
                            <Input 
                                label="Confirm New Password" 
                                placeholder="Re-enter your new password" 
                                value={confirmPassword} 
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirmPassword}
                                rightIcon={
                                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                        <Icon 
                                            name={showConfirmPassword ? 'visibility' : 'visibility-off'} 
                                            size={24} 
                                            color="#757575"
                                        />
                                    </TouchableOpacity>
                                }
                            />

                            <View style={styles.passwordInfo}>
                                <Icon name="info-outline" size={16} color="#757575" />
                                <Text style={styles.infoText}>
                                    Password must be at least 6 characters long and should include uppercase, lowercase, numbers, and special characters.
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
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background.white,
    },
    androidSafeArea: {
        paddingTop: StatusBar.currentHeight,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    formContainer: {
        marginBottom: 30,
    },
    passwordInfo: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 10,
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
        backgroundColor: COLORS.button.choose,
        borderRadius: 10,
        paddingVertical: 16,
        alignItems: 'center',
    },
    resetButtonDisabled: {
        opacity: 0.7,
    },
    resetButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ResetPassword;






