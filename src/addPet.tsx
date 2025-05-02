import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Platform, PermissionsAndroid, Alert, TouchableOpacity, StyleSheet, Image as RNImage, StatusBar, SafeAreaView, Modal, ActivityIndicator } from 'react-native';
import Input from '../component/input';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary, launchCamera, MediaType, CameraType, PhotoQuality } from "react-native-image-picker";
import Header from '../component/header';
import { COLORS } from '../theme/color';
import DatePicker from '../component/datepicker';
import { useCreatePet } from '../hook/usePets';
import { useNavigation } from '@react-navigation/native';
import { Pet, Image } from '../models/models';

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
                Alert.alert(
                    'Permission Required',
                    'Please grant storage permission from app settings to select images'
                );
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
            Alert.alert('Error', 'Failed to pick image');
        } finally {
            setLoading(false);
        }
    }, [loading]); // Add loading to dependencies

    const takePhoto = useCallback(async () => {

        console.log('takePhoto');
        // Tránh nhiều lần gọi khi đang tải
        if (loading) return;

        setLoading(true);

        try {
            const hasPermission = await requestPermissions();

            if (!hasPermission) {
                Alert.alert(
                    'Yêu cầu quyền truy cập',
                    'Vui lòng cấp quyền truy cập máy ảnh để chụp ảnh'
                );
                return;
            }

            const options = {
                mediaType: 'photo' as MediaType,
                cameraType: 'back' as CameraType,
                includeBase64: false,
                maxHeight: 2000,
                maxWidth: 2000,
                // quality: 0.8,
                quality: 0.8 as PhotoQuality,
            };

            const response = await launchCamera(options);
            if (response.didCancel) {
                console.log('Người dùng đã hủy chụp ảnh');
            } else if (response.assets && response.assets[0]) {
                const selectedImage = response.assets[0];
                setImage({
                    uri: selectedImage.uri || '',
                    type: selectedImage.type || 'image/jpeg',
                    name: selectedImage.fileName || 'image.jpg',
                });
            }
        } catch (error) {
            console.log('Lỗi khi chụp ảnh:', error);
            Alert.alert('Lỗi', 'Không thể chụp ảnh');
        } finally {
            setLoading(false);
        }
    }, [loading]);

    const handleSubmit = async () => {
        if (!image) {
            Alert.alert('Lỗi', 'Vui lòng chọn ảnh cho thú cưng');
            return;
        }

        try {
            console.log('Bắt đầu thêm thú cưng...');
            
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
            
            console.log('Dữ liệu thú cưng:', petData);
            
            const result = await createPet(petData);
            console.log('Thêm thú cưng thành công:', result);
            
            Alert.alert('Thành công', 'Đã thêm thú cưng thành công');
            navigation.goBack();
        } catch (error) {
            console.error('Lỗi khi thêm thú cưng:', error);
            Alert.alert('Lỗi', 'Không thể thêm thú cưng. Vui lòng thử lại sau.');
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
                {/* <ScrollView style={styles.container}> */}
                <Header title="Add Pet" variant="save" onSave={handleSubmit}  />
                <View style={styles.contentContainer}>
                    <ScrollView style={styles.content}>
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatarWrapper}>
                                {/* <Image source={{ uri: image?.uri || '' }} style={styles.avatar} /> */}
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

                        {/* Modal cho image options */}
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
                                label="Tên thú cưng"
                                placeholder="Nhập tên thú cưng của bạn"
                                value={petName}
                                onChangeText={setPetName}
                            />

                            <Input
                                label="Loài"
                                placeholder="Chó, mèo, ..."
                                value={petType}
                                onChangeText={setPetType}
                            />

                            <Input
                                label="Giống"
                                placeholder="Giống thú cưng"
                                value={petBreed}
                                onChangeText={setPetBreed}
                            />

                            <DatePicker
                                label="Ngày sinh"
                                value={birthDate}
                                onChange={handleBirthDateChange}
                            />

                            <View style={styles.row}>
                                <View style={styles.halfWidth}>
                                    <Input
                                        label="Tuổi"
                                        placeholder="Tuổi"
                                        value={petAge}
                                        onChangeText={setPetAge}
                                        editable={false} // Thêm thuộc tính này để không cho phép chỉnh sửa trực tiếp
                                    />
                                </View>

                                <View style={styles.halfWidth}>
                                    <Input
                                        label="Cân nặng (kg)"
                                        placeholder="Cân nặng"
                                        value={petWeight}
                                        onChangeText={setPetWeight}
                                    />
                                </View>
                            </View>

                            <Input
                                label="Giới tính"
                                placeholder="Nhập giới tính thú cưng"
                                value={petGender}
                                onChangeText={setPetGender}
                            />

                            <Input
                                label="Ghi chú sức khỏe"
                                placeholder="Nhập ghi chú sức khỏe"
                                value={petHealthNotes}
                                onChangeText={setPetHealthNotes}
                            />

                            <Input
                                label="Số microchip"
                                placeholder="Nhập số microchip"
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
        // gap: 30,
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
        // flex: 1,
        // marginBottom: 20,
    },
    avatarWrapper: {
        width: 150,
        height: 150,
        borderRadius: 100,
        borderWidth: 2,
        borderColor: '#fff',
        overflow: 'visible', // Thay đổi để hiển thị nút camera
        backgroundColor: COLORS.background.lightBlue,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },

    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 75, // Thêm để đảm bảo ảnh tròn
    },

    cameraButton: {
        position: 'absolute',
        bottom: -8,
        right: 0,
        backgroundColor: COLORS.background.lightBlue,
        // padding:20,
        width: 50,
        height: 50,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#ffffff',
        // elevation: 2,
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.25,
        // shadowRadius: 3.84,
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
        // paddingBottom: 30,
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
    // avatar: {
    //     width: '100%',
    //     height: '100%',
    // },
    placeholderAvatar: {
        // width: '100%',
        // height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: '#e0e0e0',
    },
    imageButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        padding: 10
        // marginBottom: 10,
    },
    imageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4CAF50',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 15,
        // marginHorizontal: 5,
    },
    imageButtonText: {
        color: '#ffffff',
        // marginLeft: 5,
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
        // marginTop: 20,
    },
    submitButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default AddPet;

//         {/* <View style={styles.imageButtonsContainer}>
//             <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
//                 <Icon name="photo-library" size={20} color="#ffffff" />
//                 <Text style={styles.imageButtonText}>Thư viện</Text>
//             </TouchableOpacity>

//             <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
//                 <Icon name="camera-alt" size={20} color="#ffffff" />
//                 <Text style={styles.imageButtonText}>Chụp ảnh</Text>
//             </TouchableOpacity>
//         </View> */}
// {/* </View> */}



// import React from 'react';
// import { View, Text, StyleSheet } from 'react-native';
// import { COLORS } from '../theme/color';

// const AddPet = () => {
//     return (
//         <View style={styles.container}>
//             <Text>Add Pet</Text>
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: COLORS.background.lightBlue,
//     },
// }); 

// export default AddPet;


