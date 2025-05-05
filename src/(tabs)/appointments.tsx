import React, { useState, useMemo } from 'react';
import { Platform, SafeAreaView, StatusBar, StyleSheet, Text, View, FlatList } from 'react-native';
import { COLORS } from '../../theme/color';
import TabBar from '../../component/tabbar';
import AppointmentCard from '../../component/appointmentCard';
import { useAppointments } from '../../hook/useAppointment';
import { Appointment } from '../../models/models';
import { usePets } from '../../hook/usePets';
import Toast from 'react-native-toast-message';

const Appointments = () => {
    const { data: appointments, isLoading, error } = useAppointments();
    const { data: pets, isLoading: isPetLoading, isError: isPetError, error: petError } = usePets();
    const [activeTab, setActiveTab] = useState('UPCOMING');

    const filteredAppointments = useMemo(() => {
        if (!appointments) return [];
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return appointments.filter(appointment => {
            const appointmentDate = new Date(appointment.date);
            appointmentDate.setHours(0, 0, 0, 0);

            switch (activeTab) {
                case 'UPCOMING':
                    return appointmentDate >= today;
                case 'PAST':
                    return appointmentDate < today;
                case 'CANCELLED':
                    return appointment.state === 'CANCELLED';
                default:
                    return false;
            }
        });
    }, [appointments, activeTab]);

    const renderContent = () => {
        if (isLoading) {
            Toast.show({
                type: 'info',
                text1: 'Loading...',
                position: 'bottom'
            });
            return (
                <View style={styles.tabContent}>
                    <Text style={styles.contentText}>Loading...</Text>
                </View>
            );
        }

        if (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message,
                position: 'bottom'
            });
            return (
                <View style={styles.tabContent}>
                    <Text style={styles.contentText}>Error occurred</Text>
                    <Text style={styles.subText}>{error.message}</Text>
                </View>
            );
        }

        if (filteredAppointments.length === 0) {
            return (
                <View style={styles.tabContent}>
                    <Text style={styles.contentText}>No appointments</Text>
                    <Text style={styles.subText}>
                        {activeTab === 'UPCOMING' 
                            ? 'You have no upcoming appointments'
                            : activeTab === 'PAST'
                            ? 'You have no past appointments'
                            : 'You have no cancelled appointments'}
                    </Text>
                </View>
            );
        }

        return (
            <FlatList
                data={filteredAppointments}
                renderItem={({ item }) => <AppointmentCard appointment={item} />}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        );
    };

    return (
        <>
            <StatusBar
                barStyle="dark-content"
                backgroundColor={COLORS.background.gray}
            />
            <SafeAreaView style={[
                styles.container,
                Platform.OS === 'android' && styles.androidSafeArea
            ]}>
                <TabBar type="appointments" initialTab="UPCOMING" onTabChange={setActiveTab} pets={pets} isLoading={isPetLoading} />
                <View style={styles.content}>
                    {renderContent()}
                </View>
                {/* <Menu initialTab="calendar-outline" /> */}
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background.gray,
    },
    content: {
        flex: 1, // This will push the menu to the bottom
    },
    androidSafeArea: {
        paddingTop: StatusBar.currentHeight,
    },
    tabContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
    },
    listContent: {
        padding: 15,
        gap: 15,
    },
    contentText: {
        fontSize: 24,
        fontWeight: '600',
        color: COLORS.text.text,
        marginBottom: 8,
    },
    subText: {
        fontSize: 16,
        color: COLORS.text.textDisable,
        textAlign: 'center',
    }
});

export default Appointments;

