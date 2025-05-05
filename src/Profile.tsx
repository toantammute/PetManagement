import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, Platform, TouchableOpacity, ActivityIndicator, Modal, Image as RNImage, ScrollView } from 'react-native';
import { COLORS } from '../theme/color';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import Avatar from '../component/avabtn';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Header from '../component/header';
import { launchImageLibrary, launchCamera, MediaType, CameraType, PhotoQuality } from "react-native-image-picker";
import { PermissionsAndroid } from 'react-native';
import Toast from 'react-native-toast-message';
import Input from '../component/input';
import { useProfile, useUpdateProfile, useUpdateAvatar } from '../hook/useProfile';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Profile = () => {
    const navigation = useNavigation<any>();
    const { data: profileResponse, isLoading, isError, error } = useProfile();
    const userProfile = profileResponse?.data;
    const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
    const { mutate: updateAvatar, isPending: isUpdatingAvatar } = useUpdateAvatar();

    const [showOptions, setShowOptions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showOptionsModal, setShowOptionsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');

    useEffect(() => {
        if (userProfile) {
            setUsername(userProfile.username || '');
            setFullName(userProfile.full_name || '');
            setEmail(userProfile.email || '');
            setPhoneNumber(userProfile.phone_number || '');
            setAddress(userProfile.address || '');
        }
    }, [userProfile]);

    type ImageFile = {
        uri: string;
        name: string;
        type: string;
    };

    const [image, setImage] = useState<ImageFile | null>(null);

    const handleImagePress = () => {
        setShowOptions(true);
    };

    const requestPermissions = async () => {
        if (Platform.OS === 'android') {
            if (Platform.Version >= 33) {
                try {
                    const permissions = [
                        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
                        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
                        PermissionsAndroid.PERMISSIONS.CAMERA,
                    ];

                    const granted = await PermissionsAndroid.requestMultiple(permissions);

                    return Object.values(granted).every(
                        permission => permission === PermissionsAndroid.RESULTS.GRANTED
                    );
                } catch (err) {
                    console.warn(err);
                    return false;
                }
            } else {
                try {
                    const storageGranted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                        {
                            title: 'Storage Permission',
                            message: 'App needs access to your storage to select photos',
                            buttonNeutral: 'Ask Me Later',
                            buttonNegative: 'Cancel',
                            buttonPositive: 'OK',
                        }
                    );

                    const cameraGranted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.CAMERA,
                        {
                            title: 'Camera Permission',
                            message: 'App needs access to your camera to take photos',
                            buttonNeutral: 'Ask Me Later',
                            buttonNegative: 'Cancel',
                            buttonPositive: 'OK',
                        }
                    );

                    return storageGranted === PermissionsAndroid.RESULTS.GRANTED &&
                        cameraGranted === PermissionsAndroid.RESULTS.GRANTED;
                } catch (err) {
                    console.warn(err);
                    return false;
                }
            }
        }
        return true;
    };

    const pickImage = useCallback(async () => {
        if (loading) return;
        setLoading(true);

        try {
            const hasPermission = await requestPermissions();

            if (!hasPermission) {
                Toast.show({
                    type: 'error',
                    text1: 'Permission Request',
                    text2: 'Please grant storage access to select photos',
                });
                return;
            }

            const options = {
                mediaType: 'photo' as const,
                includeBase64: false,
                maxHeight: 2000,
                maxWidth: 2000,
            };

            const response = await launchImageLibrary(options);
            if (response.didCancel) {
            } else if (response.assets && response.assets[0]) {
                const selectedImage = response.assets[0];
                setImage({
                    uri: selectedImage.uri || '',
                    type: selectedImage.type || 'image/jpeg',
                    name: selectedImage.fileName || 'image.jpg',
                });
            }
        } catch (error) {
            console.log('Error picking image:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Unable to select image',
            });
        } finally {
            setLoading(false);
            setShowOptions(false);
        }
    }, [loading]);

    const takePhoto = useCallback(async () => {
        if (loading) return;
        setLoading(true);

        try {
            const hasPermission = await requestPermissions();

            if (!hasPermission) {
                Toast.show({
                    type: 'error',
                    text1: 'Permission Request',
                    text2: 'Please grant camera access to take photos',
                });
                return;
            }

            const options = {
                mediaType: 'photo' as MediaType,
                cameraType: 'back' as CameraType,
                includeBase64: false,
                maxHeight: 2000,
                maxWidth: 2000,
                quality: 0.8 as PhotoQuality,
            };

            const response = await launchCamera(options);
            if (response.didCancel) {
                console.log('User canceled photo capture');
            } else if (response.assets && response.assets[0]) {
                const selectedImage = response.assets[0];
                setImage({
                    uri: selectedImage.uri || '',
                    type: selectedImage.type || 'image/jpeg',
                    name: selectedImage.fileName || 'image.jpg',
                });
            }
        } catch (error) {
            console.log('Error capturing photo:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Unable to capture photo',
            });
        } finally {
            setLoading(false);
            setShowOptions(false);
        }
    }, [loading]);

    const handleThreeDotPress = () => {
        setShowOptionsModal(true);
    };

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('accessToken');
            await AsyncStorage.removeItem('refreshToken');
            
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'You have been logged out successfully',
            });
            
            navigation.reset({
                index: 0,
                routes: [{ name: 'login' }],
            });
        } catch (error) {
            console.error('Error logging out:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to log out. Please try again.',
            });
        }
    };

    const handleUpdateProfile = async () => {
        if (isUpdating) return;

        try {
            await updateProfile({
                username,
                full_name: fullName,
                email,
                phone_umber: phoneNumber,
                address,
            });

            if (image) {
                await updateAvatar(image);
            }

            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Profile information has been updated',
            });
            setShowEditModal(false);
        } catch (error: any) {
            console.error('Error updating profile information:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.message || 'Unable to update profile. Please try again later.',
            });
        }
    };

    if (isLoading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color={COLORS.button.choose} />
            </View>
        );
    }

    if (isError) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Text style={styles.errorText}>Error: {error.message}</Text>
            </View>
        );
    }

    return (
        <>
            <StatusBar
                barStyle="dark-content"
                backgroundColor='#fff'
            />
            <SafeAreaView style={[
                styles.container,
                Platform.OS === 'android' && styles.androidSafeArea
            ]}>
                <Header
                    title="My Profile"
                    variant="three-dot"
                    onThreeDotPress={handleThreeDotPress}
                />

                <View style={styles.content}>
                    <View style={styles.infoContainer}>
                        <View style={styles.avatarSection}>
                            <View style={styles.avatarWrapper}>
                                <Avatar
                                    variant={userProfile?.data_image ? 'default' : 'noava'}
                                    size={80}
                                    onPress={handleImagePress}
                                    imageUrl={userProfile?.data_image ? `data:image/jpeg;base64,${userProfile.data_image}` : undefined} 
                                />
                                <TouchableOpacity
                                    style={styles.cameraButton}
                                    onPress={handleImagePress}
                                >
                                    <MaterialIcons name="camera-alt" size={18} color={COLORS.text.default} />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.nameText}>{userProfile?.full_name || 'User Name'}</Text>
                            <Text style={styles.usernameText}>@{userProfile?.username || 'username'}</Text>
                        </View>

                        <TouchableOpacity 
                            style={styles.editButton} 
                            onPress={() => setShowEditModal(true)}
                        >
                            <Text style={styles.editButtonText}>Edit Profile</Text>
                        </TouchableOpacity>
                        
                        <View style={styles.infoSection}>
                            <View style={styles.infoItem}>
                                <Feather name="mail" size={22} color={COLORS.text.default} />
                                <Text style={styles.infoText}>{userProfile?.email || 'Email not provided'}</Text>
                            </View>
                            
                            <View style={styles.infoItem}>
                                <Feather name="phone" size={22} color={COLORS.text.default} />
                                <Text style={styles.infoText}>{userProfile?.phone_number || 'Phone not provided'}</Text>
                            </View>
                            
                            <View style={styles.infoItem}>
                                <Feather name="map-pin" size={22} color={COLORS.text.default} />
                                <Text style={styles.infoText}>{userProfile?.address || 'Address not provided'}</Text>
                            </View>
                        </View>
                    </View>
                    
                    <View style={styles.optionsContainer}>
                        <TouchableOpacity style={styles.optionItem}>
                            <View style={styles.optionIcon}>
                                <Feather name="bell" size={22} color={COLORS.text.default} />
                            </View>
                            <Text style={styles.optionText}>Notifications</Text>
                            <Feather name="chevron-right" size={22} color={COLORS.text.default} />
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.optionItem}>
                            <View style={styles.optionIcon}>
                                <Feather name="lock" size={22} color={COLORS.text.default} />
                            </View>
                            <Text style={styles.optionText}>Privacy and Security</Text>
                            <Feather name="chevron-right" size={22} color={COLORS.text.default} />
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.optionItem}>
                            <View style={styles.optionIcon}>
                                <Feather name="help-circle" size={22} color={COLORS.text.default} />
                            </View>
                            <Text style={styles.optionText}>Help and Support</Text>
                            <Feather name="chevron-right" size={22} color={COLORS.text.default} />
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[styles.optionItem, styles.logoutItem]}
                            onPress={handleLogout}
                        >
                            <View style={styles.optionIcon}>
                                <Feather name="log-out" size={22} color="#FF3B30" />
                            </View>
                            <Text style={[styles.optionText, styles.logoutText]}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <Modal
                    visible={showOptions}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowOptions(false)}>
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setShowOptions(false)}>
                        <View style={styles.modalContent}>
                            <TouchableOpacity
                                style={styles.modalOption}
                                onPress={pickImage}
                            >
                                <MaterialIcons name="photo-library" size={24} color={COLORS.text.default} />
                                <Text style={styles.modalOptionText}>Choose from library</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.modalOption}
                                onPress={takePhoto}
                            >
                                <MaterialIcons name="camera-alt" size={24} color={COLORS.text.default} />
                                <Text style={styles.modalOptionText}>Take a new photo</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </Modal>

                <Modal
                    visible={showOptionsModal}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowOptionsModal(false)}>
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setShowOptionsModal(false)}>
                        <View style={styles.modalContent}>
                            <TouchableOpacity
                                style={styles.modalOption}
                                onPress={() => {
                                    setShowOptionsModal(false);
                                    handleLogout();
                                }}
                            >
                                <MaterialIcons name="logout" size={24} color="#FF3B30" />
                                <Text style={[styles.modalOptionText, { color: '#FF3B30' }]}>Logout</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.modalOption}
                                onPress={() => {
                                    setShowOptionsModal(false);
                                    setShowEditModal(true);
                                }}
                            >
                                <MaterialIcons name="edit" size={24} color={COLORS.text.default} />
                                <Text style={styles.modalOptionText}>Edit Profile</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </Modal>

                <Modal
                    visible={showEditModal}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowEditModal(false)}>
                    <SafeAreaView style={styles.editModalContainer}>
                        <View style={styles.editModalHeader}>
                            <TouchableOpacity onPress={() => setShowEditModal(false)} style={styles.closeButton}>
                                <MaterialIcons name="close" size={24} color={COLORS.text.default} />
                            </TouchableOpacity>
                            <Text style={styles.editModalTitle}>Update Profile</Text>
                            <TouchableOpacity onPress={handleUpdateProfile} style={styles.saveButton} disabled={isUpdating}>
                                {isUpdating ? (
                                    <ActivityIndicator size="small" color={COLORS.text.control} />
                                ) : (
                                    <Text style={styles.saveButtonText}>Save</Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.editModalContent}>
                            <View style={styles.avatarContainer}>
                                <View style={styles.avatarEditWrapper}>
                                    {image ? (
                                        <RNImage source={{ uri: image.uri }} style={styles.avatarImage} />
                                    ) : userProfile?.data_image ? (
                                        <RNImage
                                            source={{ uri: `data:image/jpeg;base64,${userProfile.data_image}` }}
                                            style={styles.avatarImage}
                                        />
                                    ) : (
                                        <View style={styles.placeholderAvatar}>
                                            <MaterialIcons name="person" size={50} color='#A2C1DA' />
                                        </View>
                                    )}
                                    <TouchableOpacity
                                        style={styles.editAvatarButton}
                                        onPress={handleImagePress}
                                    >
                                        <MaterialIcons name="camera-alt" size={24} color={COLORS.text.default} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.form}>
                                <Input
                                    label="Username"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChangeText={setUsername}
                                />

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
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                />

                                <Input
                                    label="Address"
                                    placeholder="Enter your address"
                                    value={address}
                                    onChangeText={setAddress}
                                />
                            </View>
                        </ScrollView>
                    </SafeAreaView>
                </Modal>

            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background.gray,
    },
    androidSafeArea: {
        paddingTop: StatusBar.currentHeight,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
    },
    content: {
        flex: 1,
        padding: 15,
    },
    infoContainer: {
        backgroundColor: COLORS.background.white,
        borderRadius: 15,
        padding: 20,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 20,
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 15,
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.background.lightBlue,
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#ffffff',
    },
    nameText: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.text.text,
        marginBottom: 5,
    },
    usernameText: {
        fontSize: 16,
        color: COLORS.text.default,
    },
    editButton: {
        backgroundColor: COLORS.button.choose,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
    },
    editButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    infoSection: {
        gap: 15,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    infoText: {
        fontSize: 16,
        color: COLORS.text.text,
        marginLeft: 15,
        flex: 1,
    },
    optionsContainer: {
        backgroundColor: COLORS.background.white,
        borderRadius: 15,
        padding: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.background.gray,
    },
    optionIcon: {
        width: 40,
        alignItems: 'center',
    },
    optionText: {
        fontSize: 16,
        color: COLORS.text.text,
        flex: 1,
        marginLeft: 10,
    },
    logoutItem: {
        borderBottomWidth: 0,
    },
    logoutText: {
        color: '#FF3B30',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 10,
    },
    modalOptionText: {
        marginLeft: 15,
        fontSize: 16,
        color: '#333333',
        fontWeight: '500',
    },
    editModalContainer: {
        flex: 1,
        backgroundColor: COLORS.background.white,
    },
    editModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.background.gray,
    },
    closeButton: {
        padding: 10,
    },
    editModalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text.text,
    },
    saveButton: {
        padding: 10,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.text.control,
    },
    editModalContent: {
        flex: 1,
        paddingHorizontal: 20,
    },
    avatarContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    avatarEditWrapper: {
        position: 'relative',
    },
    avatarImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    placeholderAvatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.background.gray,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.background.lightBlue,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#ffffff',
    },
    form: {
        marginTop: 20,
        marginBottom: 30,
    },
});

export default Profile;
