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
    SafeAreaView
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import Input from '../component/input';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'react-native-image-picker';
import { useAuth } from '../context/AuthContext';
import { Image as ImageModel } from '../models/models';
import { COLORS } from '../theme/color';

const Signup = () => {
    const navigation = useNavigation<any>();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [avatar, setAvatar] = useState<string | null>(null);
    const [showImageOptions, setShowImageOptions] = useState(false);
    const [username, setUsername] = useState('');
    const [address, setAddress] = useState('');
    const { register } = useAuth();
    // const navigation = useNavigation();

    const handleImagePicker = () => {
        setShowImageOptions(true);
    };

    const takePhoto = () => {
        setShowImageOptions(false);
        const options: ImagePicker.CameraOptions = {
            mediaType: 'photo' as ImagePicker.MediaType,
            includeBase64: false,
            maxHeight: 500,
            maxWidth: 500,
            quality: 0.8,
        };

        ImagePicker.launchCamera(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled camera');
            } else if (response.errorMessage) {
                console.log('Camera Error: ', response.errorMessage);
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Unable to take photo',
                    position: 'bottom'
                });
            } else if (response.assets && response.assets.length > 0) {
                setAvatar(response.assets[0].uri || null);
            }
        });
    };

    const chooseFromLibrary = () => {
        setShowImageOptions(false);
        const options: ImagePicker.ImageLibraryOptions = {
            mediaType: 'photo' as ImagePicker.MediaType,
            includeBase64: false,
            maxHeight: 500,
            maxWidth: 500,
            quality: 0.8,
        };

        ImagePicker.launchImageLibrary(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.errorMessage) {
                console.log('ImagePicker Error: ', response.errorMessage);
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Unable to select image',
                    position: 'bottom'
                });
            } else if (response.assets && response.assets.length > 0) {
                setAvatar(response.assets[0].uri || null);
            }
        });
    };

    const cancelImageSelection = () => {
        setShowImageOptions(false);
    };

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

        if (!username.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please enter your username',
                position: 'bottom'
            });
            return;
        }

        if (!address.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please enter your address',
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

        // Validate if avatar is selected
        if (!avatar) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please select a profile picture',
                position: 'bottom'
            });
            return;
        }

        setLoading(true);
        
        try {
            // Chuẩn bị đối tượng Image cho register
            const imageObj: ImageModel = {
                uri: avatar,
                type: 'image/jpeg', // Giả định là JPEG, có thể cần xác định loại thực tế
                name: `avatar_${Date.now()}.jpg` // Tạo tên tệp duy nhất
            };
            
            // const username = email.split('@')[0]; // Tạo username từ phần đầu của email
            // const address = ''; // Địa chỉ trống, có thể thêm sau
            
            // Gọi hàm register từ AuthContext
            const response = await register(
                username, 
                password, 
                email, 
                imageObj, 
                fullName, 
                phone, 
                address
            );
            console.log("Register response: ", response);
            
            // Chuyển hướng đến trang OTP
            navigation.navigate('OTP', { 
                email, 
                username
            });
            
            setLoading(false);
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
            <StatusBar
                barStyle="dark-content"
                backgroundColor={COLORS.background.gray}
            />
            <SafeAreaView style={[
                styles.container,
                Platform.OS === 'android' && styles.androidSafeArea
            ]}>
            
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => navigation.navigate('Login')}
                    // onPress={navigateToLogin}
                >
                    <Icon name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>

                 {/* <View style={styles.header}>
                    <Text style={styles.appName}>Pet Care</Text>
                </View> */}

                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>
                        Please fill in the details below to create your account.
                    </Text>
                </View>

                <View style={styles.avatarContainer}>
                    <TouchableOpacity style={styles.avatarWrapper} onPress={handleImagePicker}>
                        {avatar ? (
                            <Image source={{ uri: avatar }} style={styles.avatarImage} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Icon name="person" size={40} color="#BDBDBD" />
                            </View>
                        )}
                        <View style={styles.cameraIconContainer}>
                            <Icon name="camera-alt" size={16} color="#fff" />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.avatarText}>Select Profile Picture</Text>
                </View>

                {/* Image selection options */}
                {showImageOptions && (
                    <View style={styles.optionsContainer}>
                        <View style={styles.optionsBox}>
                            <Text style={styles.optionsTitle}>Select Profile Picture</Text>
                            <TouchableOpacity 
                                style={styles.optionButton} 
                                onPress={takePhoto}
                            >
                                <Icon name="camera-alt" size={20} color={COLORS.background.mint} style={styles.optionIcon} />
                                <Text style={styles.optionText}>Take Photo</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.optionButton} 
                                onPress={chooseFromLibrary}
                            >
                                <Icon name="photo-library" size={20} color={COLORS.background.mint} style={styles.optionIcon} />
                                <Text style={styles.optionText}>Choose from Library</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.optionButton, styles.cancelButton]} 
                                onPress={cancelImageSelection}
                            >
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

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
                    
                    <Input 
                        label="Username" 
                        placeholder="Enter your username" 
                        value={username} 
                        onChangeText={setUsername}
                    />
                    
                    <Input 
                        label="Address" 
                        placeholder="Enter your address" 
                        value={address} 
                        onChangeText={setAddress}
                    />
                    
                    <View style={styles.passwordContainer}>
                        <Input 
                            label="Password" 
                            placeholder="Enter your password" 
                            value={password} 
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            rightIcon={
                                <TouchableOpacity 
                                    onPress={toggleShowPassword}
                                >
                                    <Icon 
                                        name={showPassword ? 'visibility' : 'visibility-off'} 
                                        size={24} 
                                        color="#757575"
                                    />
                                </TouchableOpacity>
                            }
                        />
                    </View>

                    <View style={styles.passwordContainer}>
                        <Input 
                            label="Confirm Password" 
                            placeholder="Re-enter your password" 
                            value={confirmPassword} 
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showConfirmPassword}
                            rightIcon={
                                <TouchableOpacity 
                                    onPress={toggleShowConfirmPassword}
                                >
                                    <Icon 
                                        name={showConfirmPassword ? 'visibility' : 'visibility-off'} 
                                        size={24} 
                                        color="#757575"
                                    />
                                </TouchableOpacity>
                            }
                        />
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
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.loginText}>Login</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            </SafeAreaView>
            
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    androidSafeArea: {
        paddingTop: StatusBar.currentHeight,
    },
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
        color: COLORS.background.mint,
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
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    avatarWrapper: {
        position: 'relative',
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 8,
        overflow: 'visible',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    cameraIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.background.mint,
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    avatarText: {
        fontSize: 14,
        color: COLORS.background.mint,
        fontWeight: '500',
    },
    formContainer: {
        marginBottom: 20,
    },
    passwordContainer: {
        marginBottom: 0,
    },
    eyeIcon: {
        position: 'absolute',
        right: 15,
        top: 40,
        padding: 8,
        height: 40,
        width: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    signupButton: {
        backgroundColor: COLORS.background.mint,
        borderRadius: 10,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 15,
    },
    signupButtonDisabled: {
        backgroundColor: '#B2DFDB',
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
        color: COLORS.background.mint,
        fontWeight: 'bold',
        fontSize: 16,
    },
    optionsContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    optionsBox: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    optionsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    optionIcon: {
        marginRight: 15,
        color: COLORS.background.mint,
    },
    optionText: {
        fontSize: 16,
        color: '#333',
    },
    cancelButton: {
        marginTop: 10,
        borderBottomWidth: 0,
        backgroundColor: '#F5F5F5',
        borderRadius: 5,
        justifyContent: 'center',
    },
    cancelText: {
        fontSize: 16,
        color: '#757575',
        textAlign: 'center',
        width: '100%',
    },
});

export default Signup;


