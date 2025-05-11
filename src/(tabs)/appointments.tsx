import React, { useState, useMemo } from 'react';
import { Platform, SafeAreaView, StatusBar, StyleSheet, Text, View, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { COLORS } from '../../theme/color';
import TabBar from '../../component/tabbar';
import AppointmentCard from '../../component/appointmentCard';
import { useAppointments } from '../../hook/useAppointment';
import { Appointment } from '../../models/models';
import { usePets } from '../../hook/usePets';
import Toast from 'react-native-toast-message';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';

const Appointments = () => {
    const navigation = useNavigation<any>();
    const { data: appointments, isLoading, error, refetch, isRefetching } = useAppointments();
    const { data: pets, isLoading: isPetLoading } = usePets();
    const [activeTab, setActiveTab] = useState('UPCOMING');
    const [selectedAvatars, setSelectedAvatars] = useState<string[]>(['all']);

    const filteredAppointments = useMemo(() => {
        if (!appointments) return [];
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Lọc theo thú cưng được chọn
        let filteredByPet = appointments;
        if (!selectedAvatars.includes('all')) {
            filteredByPet = appointments.filter(appointment => 
                selectedAvatars.includes(appointment.pet.pet_id)
            );
        }

        // Lọc theo trạng thái tab
        return filteredByPet.filter(appointment => {
            const appointmentDate = new Date(appointment.date);
            appointmentDate.setHours(0, 0, 0, 0);

            switch (activeTab) {
                case 'UPCOMING':
                    return appointmentDate >= today && appointment.state !== 'CANCELLED';
                case 'PAST':
                    return appointmentDate < today && appointment.state !== 'CANCELLED';
                case 'CANCELLED':
                    return appointment.state === 'CANCELLED';
                default:
                    return false;
            }
        }).sort((a, b) => {
            // Sắp xếp theo ngày
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            
            if (activeTab === 'UPCOMING') {
                // Sắp xếp tăng dần cho upcoming (gần nhất lên trên)
                return dateA.getTime() - dateB.getTime();
            } else {
                // Sắp xếp giảm dần cho past (gần đây nhất lên trên)
                return dateB.getTime() - dateA.getTime();
            }
        });
    }, [appointments, activeTab, selectedAvatars]);

    const handleAddAppointment = () => {
        // Chuyển hướng đến trang đặt lịch hẹn
        navigation.navigate('AddAppointment');
    };

    const renderEmptyState = () => {
        let message = '';
        let subMessage = '';
        
        switch (activeTab) {
            case 'UPCOMING':
                message = 'Không có cuộc hẹn sắp tới';
                subMessage = 'Bạn chưa có cuộc hẹn nào sắp tới. Hãy đặt lịch để chăm sóc thú cưng của bạn.';
                break;
            case 'PAST':
                message = 'Không có cuộc hẹn đã qua';
                subMessage = 'Bạn chưa có cuộc hẹn nào đã hoàn thành.';
                break;
            case 'CANCELLED':
                message = 'Không có cuộc hẹn đã hủy';
                subMessage = 'Bạn chưa có cuộc hẹn nào bị hủy.';
                break;
        }
        
        return (
            <View style={styles.emptyContainer}>
                <Feather name={activeTab === 'UPCOMING' ? 'calendar' : activeTab === 'PAST' ? 'check-circle' : 'x-circle'} 
                    size={60} color={COLORS.text.textDisable} />
                <Text style={styles.emptyTitle}>{message}</Text>
                <Text style={styles.emptySubtitle}>{subMessage}</Text>
                
                {activeTab === 'UPCOMING' && (
                    <TouchableOpacity style={styles.addButton} onPress={handleAddAppointment}>
                        <Feather name="plus" size={20} color="#FFF" />
                        <Text style={styles.addButtonText}>Đặt lịch hẹn</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.button.choose} />
                    <Text style={styles.loadingText}>Đang tải cuộc hẹn...</Text>
                </View>
            );
        }

        if (error) {
            return (
                <View style={styles.errorContainer}>
                    <Feather name="alert-triangle" size={50} color="#FF3B30" />
                    <Text style={styles.errorTitle}>Đã xảy ra lỗi</Text>
                    <Text style={styles.errorMessage}>{error.message}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
                        <Feather name="refresh-cw" size={16} color="#FFF" />
                        <Text style={styles.retryText}>Thử lại</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <FlatList
                data={filteredAppointments}
                renderItem={({ item }) => <AppointmentCard appointment={item} />}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={[
                    styles.listContent,
                    filteredAppointments.length === 0 && styles.emptyList
                ]}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={renderEmptyState}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={refetch}
                        colors={[COLORS.button.choose]}
                        tintColor={COLORS.button.choose}
                    />
                }
            />
        );
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
                {/* <View style={styles.header}>
                    <Text style={styles.headerTitle}>Cuộc hẹn</Text>
                    {activeTab === 'UPCOMING' && (
                        <TouchableOpacity style={styles.headerButton} onPress={handleAddAppointment}>
                            <Feather name="plus" size={24} color={COLORS.button.choose} />
                        </TouchableOpacity>
                    )}
                </View> */}
                
                <TabBar 
                    type="appointments" 
                    initialTab="UPCOMING" 
                    onTabChange={setActiveTab} 
                    pets={pets} 
                    isLoading={isPetLoading}
                    selectedAvatars={selectedAvatars}
                    onAvatarChange={setSelectedAvatars} 
                />
                
                <View style={styles.content}>
                    {renderContent()}
                </View>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.background.gray,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.text.text,
        fontFamily: 'Poppins-Bold',
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.background.gray,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
    },
    listContent: {
        padding: 15,
        gap: 15,
    },
    emptyList: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: COLORS.text.textDisable,
        fontFamily: 'Poppins-Regular',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: COLORS.text.text,
        marginTop: 10,
        marginBottom: 5,
        fontFamily: 'Poppins-SemiBold',
    },
    errorMessage: {
        fontSize: 14,
        color: COLORS.text.textDisable,
        textAlign: 'center',
        marginBottom: 20,
        fontFamily: 'Poppins-Regular',
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.button.choose,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        gap: 8,
    },
    retryText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Poppins-SemiBold',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: COLORS.text.text,
        marginTop: 15,
        marginBottom: 5,
        fontFamily: 'Poppins-SemiBold',
    },
    emptySubtitle: {
        fontSize: 14,
        color: COLORS.text.textDisable,
        textAlign: 'center',
        marginBottom: 20,
        fontFamily: 'Poppins-Regular',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.button.choose,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        gap: 8,
    },
    addButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Poppins-SemiBold',
    },
});

export default Appointments;

