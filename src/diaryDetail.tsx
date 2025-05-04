import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, SafeAreaView, StatusBar } from 'react-native';
import { COLORS } from '../theme/color';
import { useDiaryDetail } from "../hook/useDiary";
import { useDeleteDiary } from '../hook/useDiary';
import { useNavigation, useRoute } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import { usePetById } from '../hook/usePets';
import Avatar from '../component/avabtn';
import Header from '../component/header';

const DiaryDetail = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { diaryId } = route.params as { diaryId: string };
    const { data: diary, isLoading } = useDiaryDetail(diaryId);
    const { data: pet } = usePetById(diary?.pet_id || '');
    const { mutate: deleteDiary } = useDeleteDiary();

    const handleDelete = () => {
        Alert.alert(
            'Xóa nhật ký',
            'Bạn có chắc chắn muốn xóa nhật ký này không?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    onPress: () => {
                        if (diary?.log_id) {
                            deleteDiary(diary.log_id);
                            navigation.goBack();
                        }
                    },
                    style: 'destructive',
                },
            ],
            { cancelable: true }
        );
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Đang tải...</Text>
            </View>
        );
    }

    if (!diary) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Không tìm thấy nhật ký</Text>
            </View>
        );
    }

    const formattedDate = new Date(diary.date_time).toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const formattedTime = new Date(diary.date_time).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Ho_Chi_Minh'
    });

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.white} />
            <View style={styles.container}>
                <Header title="Chi tiết nhật ký" />

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
                            onPress={() => {}}
                        />
                        <View style={styles.petInfo}>
                            <Text style={styles.petName}>{pet?.name || 'Không có tên'}</Text>
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
                            <Text style={styles.contentTitle}>Ghi chú</Text>
                        </View>
                        <Text style={styles.content}>{diary.notes}</Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                        <TouchableOpacity 
                            style={[styles.actionButton, styles.editButton]}
                            onPress={() => {}}
                        >
                            <Feather name="edit-2" size={20} color={COLORS.background.white} />
                            <Text style={styles.buttonText}>Chỉnh sửa</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.actionButton, styles.deleteButton]}
                            onPress={handleDelete}
                        >
                            <Feather name="trash-2" size={20} color={COLORS.background.white} />
                            <Text style={styles.buttonText}>Xóa</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background.white,
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
