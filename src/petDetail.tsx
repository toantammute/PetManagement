import React, { useState, useCallback, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, Platform, TouchableOpacity, ActivityIndicator, Modal, Image as RNImage, Alert } from 'react-native';
import { COLORS } from '../theme/color';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import Avatar from '../component/avabtn';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { usePetById, useDeletePet } from '../hook/usePets';
import { useVaccinations } from '../hook/useVaccination';
import Header from '../component/header';
import { launchImageLibrary, launchCamera, MediaType, CameraType, PhotoQuality } from "react-native-image-picker";
import { PermissionsAndroid } from 'react-native';
import TreatmentPage from './treatmentPage';

const PetDetail = () => {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const petId = (route.params as any).petId;
    const { data: pet, isLoading, isError, error } = usePetById(petId);
    const { data: vaccinations, isLoading: isLoadingVaccinations } = useVaccinations(petId);
    const { mutate: deletePet, isPending } = useDeletePet();

    const [activeTab, setActiveTab] = useState<string>('Overview');
    const [showOptions, setShowOptions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showOptionsModal, setShowOptionsModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

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
                });
            }
        } catch (error) {
            console.log('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image');
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
            setShowOptions(false);
        }
    }, [loading]);

    const handleThreeDotPress = () => {
        setShowOptionsModal(true);
    };

    const handleDeletePet = async (petId: string) => {
        if (isDeleting) return;
        setIsDeleting(true);

        try {
            await deletePet(petId);
            Alert.alert('Thành công', 'Đã xóa thú cưng thành công');
            navigation.goBack();
        } catch (error: any) {
            console.error('Lỗi khi xóa thú cưng:', error);
            Alert.alert(
                'Lỗi', 
                error.response?.data?.message || 'Không thể xóa thú cưng. Vui lòng thử lại sau.'
            );
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    const handleSharePet = () => {
        // TODO: Implement chức năng chia sẻ
        Alert.alert('Thông báo', 'Chức năng chia sẻ đang được phát triển');
    };

    const renderTabContent = () => {
        return (
            <View style={styles.bottomContainer}>
                <TouchableOpacity 
                    style={[
                        styles.buttonContainer,
                        activeTab === 'Overview' && styles.activeTab
                    ]} 
                    onPress={() => setActiveTab('Overview')}
                >
                    <Ionicons 
                        name="document-text-outline" 
                        size={28} 
                        color={activeTab === 'Overview' ? COLORS.button.choose : COLORS.text.default} 
                    />
                    <Text style={[
                        styles.text,
                        activeTab === 'Overview' && styles.activeText
                    ]}>Overview</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[
                        styles.buttonContainer,
                        activeTab === 'Vaccination' && styles.activeTab
                    ]} 
                    onPress={() => setActiveTab('Vaccination')}
                >
                    <Ionicons 
                        name="paw-outline" 
                        size={28} 
                        color={activeTab === 'Vaccination' ? COLORS.button.choose : COLORS.text.default} 
                    />
                    <Text style={[
                        styles.text,
                        activeTab === 'Vaccination' && styles.activeText
                    ]}>Vaccination</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[
                        styles.buttonContainer,
                        activeTab === 'Treatment' && styles.activeTab
                    ]} 
                    onPress={() => setActiveTab('Treatment')}
                >
                    <Ionicons 
                        name="calendar-outline" 
                        size={28} 
                        color={activeTab === 'Treatment' ? COLORS.button.choose : COLORS.text.default} 
                    />
                    <Text style={[
                        styles.text,
                        activeTab === 'Treatment' && styles.activeText
                    ]}>Treatment</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderActiveTabContent = () => {
        switch (activeTab) {
            case 'Overview':
                return (
                    <View style={styles.tabContentContainer}>
                        <Text style={styles.contentTitle}>Pet Overview</Text>
                        {/* Thêm nội dung overview ở đây */}
                    </View>
                );
            case 'Vaccination':
                return (
                    <View style={styles.tabContentContainer}>
                        <Text style={styles.contentTitle}>Vaccination History</Text>
                        {isLoadingVaccinations ? (
                            <ActivityIndicator size="small" color={COLORS.button.choose} />
                        ) : vaccinations && vaccinations.length > 0 ? (
                            vaccinations.map((vaccination) => (
                                <View key={vaccination.vaccination_id} style={styles.vaccinationItem}>
                                    <View style={styles.vaccinationHeader}>
                                        <Text style={styles.vaccineName}>{vaccination.vaccine_name}</Text>
                                        <Text style={styles.vaccinationDate}>
                                            {new Date(vaccination.date_administered).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    <Text style={styles.vaccineDescription}>
                                        {'No description available'}
                                    </Text>
                                    <View style={styles.vaccineInfo}>
                                        <Text style={styles.vaccineDetail}>
                                            Next dose: {vaccination.next_due_date ? 
                                                new Date(vaccination.next_due_date).toLocaleDateString() : 
                                                'Not scheduled'}
                                        </Text>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.emptyText}>No vaccination records found</Text>
                        )}
                    </View>
                );
            case 'Treatment':
                return (
                    <View style={styles.treatmentTabContainer}>
                        <TreatmentPage petId={petId} />
                    </View>
                );
            default:
                return null;
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
                    title="Pet Detail" 
                    variant="three-dot" 
                    onThreeDotPress={handleThreeDotPress} 
                />

                <View style={styles.tabContent}>
                    <View style={styles.infoContainer}>
                        <View style={styles.topInfoContainer}>
                            <View style={styles.leftContainer}>
                                <View style={styles.avaBtnContainer}>
                                    <View style={styles.avatarWrapper}>
                                        <Avatar
                                            variant={pet?.data_image ? 'default' : 'noava'} 
                                            size={45}
                                            onPress={handleImagePress}
                                            imageUrl={pet?.data_image ? `data:image/jpeg;base64,${pet.data_image}` : undefined}/>
                                        <TouchableOpacity
                                            style={styles.cameraButton}
                                            onPress={handleImagePress}
                                        >
                                            <MaterialIcons name="camera-alt" size={12} color={COLORS.text.default} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={styles.nameBreedContainer}>
                                    <Text style={styles.nameText}>{pet?.name}</Text>
                                    <Text style={styles.breedText}>{pet?.breed}</Text>
                                </View>
                            </View>
                            <Text style={styles.editText}>Edit</Text>
                        </View>
                        <View style={styles.genAgeContainer}>
                            <View style={styles.genderContainer}>
                                <Text style={styles.genderText}>Gender</Text>
                                <Text style={styles.valueText}>Male</Text>
                            </View>
                            <View style={styles.genderContainer}>
                                <Text style={styles.genderText}>Age</Text>
                                <Text style={styles.valueText}>1 years</Text>
                            </View>
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
                                    <MaterialIcons name="photo-library" size={24} color={COLORS.text.default} />
                                    <Text style={styles.modalOptionText}>Choose from library</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.modalOption}
                                    onPress={() => {
                                        setShowOptions(false);
                                        takePhoto();
                                    }}
                                >
                                    <MaterialIcons name="camera-alt" size={24} color={COLORS.text.default} />
                                    <Text style={styles.modalOptionText}>Take a new photo</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </Modal>

                    {renderTabContent()}
                    {renderActiveTabContent()}
                </View>

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
                                    setShowDeleteModal(true);
                                }}
                            >
                                <MaterialIcons name="delete" size={24} color="#FF3B30" />
                                <Text style={[styles.modalOptionText, { color: '#FF3B30' }]}>Xóa thú cưng</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.modalOption}
                                onPress={() => {
                                    setShowOptionsModal(false);
                                    handleSharePet();
                                }}
                            >
                                <MaterialIcons name="share" size={24} color={COLORS.text.default} />
                                <Text style={styles.modalOptionText}>Chia sẻ</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </Modal>

                <Modal
                    visible={showDeleteModal}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowDeleteModal(false)}>
                    <View style={styles.deleteModalOverlay}>
                        <View style={styles.deleteModalContent}>
                            <Text style={styles.deleteModalTitle}>Xóa thú cưng</Text>
                            <Text style={styles.deleteModalText}>
                                Bạn có chắc chắn muốn xóa thú cưng này không? Hành động này không thể hoàn tác.
                            </Text>
                            <View style={styles.deleteModalButtons}>
                                <TouchableOpacity
                                    style={[styles.deleteModalButton, styles.deleteModalButtonCancel]}
                                    onPress={() => setShowDeleteModal(false)}
                                    disabled={isDeleting}>
                                    <Text style={styles.deleteModalButtonText}>Hủy</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.deleteModalButton, styles.deleteModalButtonDelete]}
                                    onPress={() => handleDeletePet(petId)}
                                    disabled={isDeleting}>
                                    {isDeleting ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Text style={[styles.deleteModalButtonText, styles.deleteModalButtonTextDelete]}>
                                            Xóa
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background.white,
    },
    bottomContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        alignSelf: 'stretch',
        paddingHorizontal: 20,
        paddingTop: 10,
        borderRadius: 10,
        backgroundColor: COLORS.background.white,
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
    buttonContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: 7,
        alignItems: 'center',
        flex: 1,
        paddingVertical: 10,
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },

    activeTab: {
        borderBottomColor: COLORS.button.choose,
    },

    activeText: {
        color: COLORS.button.choose,
        fontWeight: '700',
    },

    tabContentContainer: {
        backgroundColor: COLORS.background.white,
        padding: 15,
        borderRadius: 10,
        alignSelf: 'stretch',
        marginTop: 10,
    },

    treatmentTabContainer: {
        flex: 1,
        backgroundColor: COLORS.background.white,
        padding: 15,
        borderRadius: 10,
        alignSelf: 'stretch',
        marginTop: 10,
    },

    contentTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text.text,
        marginBottom: 10,
    },
    text: {
        color: COLORS.text.default,
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
        fontWeight: 600,
        textAlign: 'center',
        alignSelf: 'center',
        fontStyle: 'normal',
    },

    tabContent: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        padding: 15,
        flexDirection: 'column',
        alignSelf: 'stretch',
        backgroundColor: COLORS.background.gray,
        gap: 10,
    },
    androidSafeArea: {
        paddingTop: StatusBar.currentHeight,
    },
    headerButton: {
        display: 'flex',
        alignItems: 'center',
    },
    headerText: {
        fontSize: 20,
        fontWeight: 500,
        color: COLORS.text.textDisable,
        fontFamily: 'Poppins-Regular',
        fontStyle: 'normal',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        textAlign: 'center',
    },
    headerContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 10,
        paddingBottom: 10,
        paddingHorizontal: 20,
        backgroundColor: 'white',
    },

    petContainer: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 15,
        backgroundColor: 'white',

    },
    avaBtnContainer: {
        height: '100%',
        alignItems: 'center',
    },
    nameText: {
        fontSize: 17,
        fontWeight: 700,
        color: COLORS.text.text,
        fontFamily: 'Poppins-Regular',
        fontStyle: 'normal',
        textAlign: 'center',
    },
    breedText: {
        fontSize: 14,
        fontWeight: 400,
        color: COLORS.text.default,
        fontFamily: 'Poppins-Regular',
        fontStyle: 'normal',
        textAlign: 'center',
    },
    nameBreedContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 3,
        alignSelf: 'stretch',

    },
    leftContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    editText: {
        fontSize: 15,
        fontWeight: 700,
        color: COLORS.text.control,
        fontFamily: 'Poppins-Regular',
        fontStyle: 'normal',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingRight: 10,
    },
    topInfoContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        alignSelf: 'stretch',
    },
    genderContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        flex: 1,
    },
    genAgeContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'stretch',
        justifyContent: 'space-between',
    },
    infoContainer: {
        display: 'flex',
        backgroundColor: 'white',
        paddingVertical: 15,
        paddingLeft: 15,
        paddingRight: 10,
        flexDirection: 'column',
        alignItems: 'center',
        gap: 11,
        alignSelf: 'stretch',
        borderRadius: 10,
    },
    genderText: {
        fontSize: 12,
        fontWeight: 400,
        color: COLORS.text.default,
        fontFamily: 'Poppins-Regular',
        fontStyle: 'normal',
    },
    valueText: {
        fontSize: 15,
        fontWeight: 600,
        color: COLORS.text.text,
        fontFamily: 'Poppins-Regular',
        fontStyle: 'normal',
    },
    vaccinationItem: {
        backgroundColor: COLORS.background.white,
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.button.choose,
    },
    
    vaccinationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    
    vaccineName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text.text,
        fontFamily: 'Poppins-Regular',
    },
    
    vaccinationDate: {
        fontSize: 12,
        color: COLORS.text.default,
        fontFamily: 'Poppins-Regular',
    },
    
    vaccineDescription: {
        fontSize: 14,
        color: COLORS.text.default,
        marginBottom: 8,
        fontFamily: 'Poppins-Regular',
    },
    
    vaccineInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    
    vaccineDetail: {
        fontSize: 12,
        color: COLORS.text.default,
        fontFamily: 'Poppins-Regular',
    },
    
    vaccineStatus: {
        fontSize: 12,
        fontWeight: '600',
        fontFamily: 'Poppins-Regular',
    },
    
    emptyText: {
        textAlign: 'center',
        color: COLORS.text.textDisable,
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
    },

    avatarWrapper: {
        width: 30,
        height: 30,
        borderRadius: 100,
        borderWidth: 2,
        borderColor: '#fff',
        overflow: 'visible',
        backgroundColor: COLORS.background.lightBlue,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },

    cameraButton: {
        position: 'absolute',
        bottom: -5,
        right: -8,
        backgroundColor: COLORS.background.lightBlue,
        width: 15,
        height: 15,
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

    deleteModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    deleteModalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        width: '80%',
        maxWidth: 400,
    },

    deleteModalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text.text,
        marginBottom: 10,
        textAlign: 'center',
    },

    deleteModalText: {
        fontSize: 14,
        color: COLORS.text.default,
        marginBottom: 20,
        textAlign: 'center',
    },

    deleteModalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },

    deleteModalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },

    deleteModalButtonCancel: {
        backgroundColor: COLORS.background.gray,
    },

    deleteModalButtonDelete: {
        backgroundColor: '#FF3B30',
    },

    deleteModalButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.text.text,
    },

    deleteModalButtonTextDelete: {
        color: '#fff',
    },

});

export default PetDetail;
