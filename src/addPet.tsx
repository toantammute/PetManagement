import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Platform, PermissionsAndroid, TouchableOpacity, StyleSheet, Image as RNImage, StatusBar, SafeAreaView, Modal } from 'react-native';
import Input from '../component/input';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary, launchCamera, MediaType, CameraType, PhotoQuality } from "react-native-image-picker";
import Header from '../component/header';
import { COLORS } from '../theme/color';
import DatePicker from '../component/datepicker';
import { useCreatePet } from '../hook/usePets';
import { useNavigation } from '@react-navigation/native';
import { Pet, Image } from '../models/models';
import Toast from 'react-native-toast-message';

const AddPet = () => {
    const navigation = useNavigation<any>();
    type ImageFile = {
        uri: string;
        name: string;
        type: string;
    };

    const [loading, setLoading] = useState(false);
    const [petName, setPetName] = useState('');
    const [petType, setPetType] = useState('');
    const [petBreed, setPetBreed] = useState('');
    const [petAge, setPetAge] = useState('');
    const [petWeight, setPetWeight] = useState('');
    const [petGender, setPetGender] = useState('');
    const [petHealthNotes, setPetHealthNotes] = useState('');
    const [petMicrochipNumber, setPetMicrochipNumber] = useState('');
    const [image, setImage] = useState<ImageFile | null>(null);
    const [birthDate, setBirthDate] = useState<Date | null>(null);

    const [showOptions, setShowOptions] = useState(false);

    const { mutate: createPet } = useCreatePet();

    const handleImagePress = () => {
        setShowOptions(true);
    };

    const calculateAge = (birthDate: Date) => {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age.toString();
    };

    const handleBirthDateChange = (date: Date) => {
        setBirthDate(date);
        setPetAge(calculateAge(date));
    };

    const requestPermissions = async () => {
        if (Platform.OS === 'android') {
            // For Android 13+ (API level 33+)
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
                // For Android 12 and below
                // try {
                //     const granted = await PermissionsAndroid.request(
                //         PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                //         {
                //             title: 'Storage Permission',
                //             message: 'App needs access to your storage to select photos',
                //             buttonNeutral: 'Ask Me Later',
                //             buttonNegative: 'Cancel',
                //             buttonPositive: 'OK',
                //         }
                //     );
                //     return granted === PermissionsAndroid.RESULTS.GRANTED;
                // } catch (err) {
                //     console.warn(err);
                //     return false;
                // }
            }
        }
        return true; // iOS doesn't need runtime permissions
    };

    const pickImage = useCallback(async () => {
        // Prevent multiple calls while loading
        if (loading) return;

        setLoading(true);

        try {
            const hasPermission = await requestPermissions();

            if (!hasPermission) {
                Toast.show({
                    type: 'error',
                    text1: 'Permission Required',
                    text2: 'Please grant storage permission from app settings to select images'
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
                console.log('User cancelled image picker');
            } else if (response.assets && response.assets[0]) {
                const selectedImage = response.assets[0];
                setImage({
                    uri: selectedImage.uri || '',
                    type: selectedImage.type || 'image/jpeg',
                    name: selectedImage.fileName || 'image.jpg',
                }
                );

            }
        } catch (error) {
            console.log('Error picking image:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to pick image'
            });
        } finally {
            setLoading(false);
        }
    }, [loading]); // Add loading to dependencies

    const takePhoto = useCallback(async () => {

        console.log('takePhoto');
        // Prevent multiple calls while loading
        if (loading) return;

        setLoading(true);

        try {
            const hasPermission = await requestPermissions();

            if (!hasPermission) {
                Toast.show({
                    type: 'error',
                    text1: 'Permission Required',
                    text2: 'Please grant camera access to take photos'
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
                console.log('User cancelled taking photo');
            } else if (response.assets && response.assets[0]) {
                const selectedImage = response.assets[0];
                setImage({
                    uri: selectedImage.uri || '',
                    type: selectedImage.type || 'image/jpeg',
                    name: selectedImage.fileName || 'image.jpg',
                });
            }
        } catch (error) {
            console.log('Error taking photo:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to take photo'
            });
        } finally {
            setLoading(false);
        }
    }, [loading]);

    const handleSubmit = async () => {
        if (!image) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please select an image for the pet'
            });
            return;
        }

        try {
            console.log('Starting to add pet...');

            // Format birth_date to YYYY-MM-DD
            const formattedBirthDate = birthDate
                ? birthDate.toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0];

            const petData = {
                pet: {
                    name: petName,
                    type: petType,
                    breed: petBreed,
                    age: Number(petAge),
                    weight: Number(petWeight),
                    gender: petGender,
                    healthnotes: petHealthNotes,
                    microchip_number: petMicrochipNumber,
                    birth_date: formattedBirthDate
                },
                image: {
                    uri: image.uri,
                    type: image.type || 'image/jpeg',
                    name: 'pet_image.jpg'
                }
            };

            console.log('Pet data:', petData);

            const result = await createPet(petData);
            console.log('Pet added successfully:', result);

            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Pet added successfully'
            });
            navigation.goBack();
        } catch (error) {
            console.error('Error adding pet:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to add pet. Please try again later.'
            });
        }
    };

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
                <Header title="Add Pet" variant="save" onSave={handleSubmit} />
                <View style={styles.contentContainer}>
                    <ScrollView style={styles.content}>
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatarWrapper}>
                                {image ? (
                                    <RNImage source={{ uri: image.uri }} style={styles.avatar} />
                                ) : (
                                    <View style={styles.placeholderAvatar}>
                                        <Icon name="pets" size={50} color='#A2C1DA' />
                                    </View>
                                )}
                                <TouchableOpacity
                                    style={styles.cameraButton}
                                    onPress={handleImagePress}
                                >
                                    <Icon name="camera-alt" size={24} color={COLORS.text.default} />
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
                                        onPress={() => {
                                            setShowOptions(false);
                                            pickImage();
                                        }}
                                    >
                                        <Icon name="photo-library" size={24} color={COLORS.text.default} />
                                        <Text style={styles.modalOptionText}>Choose from library</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.modalOption}
                                        onPress={() => {
                                            setShowOptions(false);
                                            takePhoto();
                                        }}
                                    >
                                        <Icon name="camera-alt" size={24} color={COLORS.text.default} />
                                        <Text style={styles.modalOptionText}>Take a new photo</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        </Modal>

                        <View style={styles.form}>
                            <Input
                                label="Pet Name"
                                placeholder="Enter your pet's name"
                                value={petName}
                                onChangeText={setPetName}
                            />

                            <Input
                                label="Species"
                                placeholder="Dog, cat, ..."
                                value={petType}
                                onChangeText={setPetType}
                            />

                            <Input
                                label="Breed"
                                placeholder="Enter pet breed"
                                value={petBreed}
                                onChangeText={setPetBreed}
                            />

                            <DatePicker
                                label="Date of Birth"
                                value={birthDate}
                                onChange={handleBirthDateChange}
                            />

                            <View style={styles.row}>
                                <View style={styles.halfWidth}>
                                    <Input
                                        label="Age"
                                        placeholder="Age"
                                        value={petAge}
                                        onChangeText={setPetAge}
                                        editable={false}
                                    />
                                </View>

                                <View style={styles.halfWidth}>
                                    <Input
                                        label="Weight (kg)"
                                        placeholder="Enter weight"
                                        value={petWeight}
                                        onChangeText={setPetWeight}
                                    />
                                </View>
                            </View>

                            <Input
                                label="Gender"
                                placeholder="Enter pet's gender"
                                value={petGender}
                                onChangeText={setPetGender}
                            />

                            <Input
                                label="Health Notes"
                                placeholder="Enter health notes"
                                value={petHealthNotes}
                                onChangeText={setPetHealthNotes}
                            />

                            <Input
                                label="Microchip Number"
                                placeholder="Enter microchip number"
                                value={petMicrochipNumber}
                                onChangeText={setPetMicrochipNumber}
                            />
                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    androidSafeArea: {
        paddingTop: StatusBar.currentHeight,
        backgroundColor: '#fff',
    },
    contentContainer: {
        display: 'flex',
        flex: 1,
        backgroundColor: '#f5f5f5',
        flexDirection: 'column',
        alignItems: 'center',
        alignSelf: 'stretch',
        paddingVertical: 20,
        paddingHorizontal: 18
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        alignSelf: 'stretch',
    },
    header: {
        padding: 16,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    avatarContainer: {
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
    },
    avatarWrapper: {
        width: 150,
        height: 150,
        borderRadius: 100,
        borderWidth: 2,
        borderColor: '#fff',
        overflow: 'visible',
        backgroundColor: COLORS.background.lightBlue,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 75,
    },
    cameraButton: {
        position: 'absolute',
        bottom: -8,
        right: 0,
        backgroundColor: COLORS.background.lightBlue,
        width: 50,
        height: 50,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#ffffff',
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
    placeholderAvatar: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        padding: 10
    },
    imageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4CAF50',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 15,
    },
    imageButtonText: {
        color: '#ffffff',
        fontWeight: '500',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        alignSelf: 'stretch',
        marginTop: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfWidth: {
        width: '48%',
    },
    submitButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
    },
    submitButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default AddPet;


