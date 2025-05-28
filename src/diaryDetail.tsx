import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, StatusBar, Platform } from 'react-native';
import { COLORS } from '../theme/color';
import { useDiaryDetail } from "../hook/useDiary";
import { useDeleteDiary } from '../hook/useDiary';
import { useNavigation, useRoute } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import { usePetById } from '../hook/usePets';
import Avatar from '../component/avabtn';
import Header from '../component/header';
import Toast from 'react-native-toast-message';

const DiaryDetail = () => {
    const route = useRoute();
    const navigation = useNavigation<any>();
    const { diaryId } = route.params as { diaryId: string };
    const { data: diary, isLoading } = useDiaryDetail(diaryId);
    const { data: pet } = usePetById(diary?.pet_id || '');
    const { mutate: deleteDiary } = useDeleteDiary();

    const handleDelete = () => {
        Toast.show({
            type: 'info',
            text1: 'Delete Diary',
            text2: 'Are you sure you want to delete this diary?',
            onPress: () => {
                if (diary?.log_id) {
                    deleteDiary(diary.log_id);
                    navigation.goBack();
                    Toast.show({
                        type: 'success',
                        text1: 'Success',
                        text2: 'Diary deleted successfully'
                    });
                }
            }
        });
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    if (!diary) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Diary not found</Text>
            </View>
        );
    }

    const formattedDate = new Date(diary.date_time).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const formattedTime = new Date(diary.date_time).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    return (
        <>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.white} />
            <SafeAreaView style={[
                styles.container,
                Platform.OS === 'android' && styles.androidSafeArea
            ]}>
                <Header title="Diary Details" />

                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Pet Info */}
                    <View style={styles.petInfoCard}>
                        <Avatar
                            variant={pet?.data_image ? "default" : "noava"}
                            imageUrl={pet?.data_image ? `data:image/jpeg;base64,${pet.data_image}` : undefined}
                            size={50}
                            onPress={() => { }}
                        />
                        <View style={styles.petInfo}>
                            <Text style={styles.petName}>{pet?.name || 'No name'}</Text>
                            <View style={styles.dateTimeContainer}>
                                <Feather name="calendar" size={14} color={COLORS.text.textDisable} />
                                <Text style={styles.date}>{formattedDate}</Text>
                                <Feather name="clock" size={14} color={COLORS.text.textDisable} />
                                <Text style={styles.date}>{formattedTime}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>{diary.title}</Text>

                    {/* Content Card */}
                    <View style={styles.contentCard}>
                        <View style={styles.contentHeader}>
                            <Feather name="book-open" size={20} color={COLORS.text.text} />
                            <Text style={styles.contentTitle}>Notes</Text>
                        </View>
                        <Text style={styles.content}>{diary.notes}</Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.editButton]}
                            onPress={() => {
                                navigation.navigate('AddLog' as never, {
                                    isEditMode: true,
                                    diary: diary,
                                    diaryId: diary.log_id
                                } as never);
                            }}
                        >
                            <Feather name="edit-2" size={20} color={COLORS.background.white} />
                            <Text style={styles.buttonText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.deleteButton]}
                            onPress={handleDelete}
                        >
                            <Feather name="trash-2" size={20} color={COLORS.background.white} />
                            <Text style={styles.buttonText}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </>

    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background.white,
    },
    androidSafeArea: {
        paddingTop: StatusBar.currentHeight,
    },
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
        padding: 16,
    },
    petInfoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: COLORS.background.gray,
        borderRadius: 12,
        marginBottom: 20,
    },
    petInfo: {
        marginLeft: 16,
    },
    petName: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text.text,
        fontFamily: 'Poppins-SemiBold',
        marginBottom: 4,
    },
    dateTimeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    date: {
        fontSize: 14,
        color: COLORS.text.textDisable,
        fontFamily: 'Poppins-Regular',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text.text,
        marginBottom: 20,
        fontFamily: 'Poppins-Bold',
    },
    contentCard: {
        backgroundColor: COLORS.background.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.border.mintbrd,
    },
    contentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    contentTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text.text,
        fontFamily: 'Poppins-SemiBold',
    },
    content: {
        fontSize: 15,
        color: COLORS.text.text,
        lineHeight: 24,
        fontFamily: 'Poppins-Regular',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginTop: 10,
        marginBottom: 20,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        gap: 8,
    },
    editButton: {
        backgroundColor: COLORS.background.mint,
    },
    deleteButton: {
        backgroundColor: COLORS.text.textDisable,
    },
    buttonText: {
        color: COLORS.background.white,
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Poppins-SemiBold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background.white,
    },
    loadingText: {
        fontSize: 16,
        color: COLORS.text.text,
        fontFamily: 'Poppins-Regular',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background.white,
    },
    errorText: {
        fontSize: 16,
        color: COLORS.text.textDisable,
        fontFamily: 'Poppins-Regular',
    },
});

export default DiaryDetail;
