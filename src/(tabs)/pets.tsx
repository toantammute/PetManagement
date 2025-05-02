import React, { useState, useEffect } from 'react';
import { Platform, SafeAreaView, StatusBar, StyleSheet, Text, View, TextInput, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import TabBar from '../../component/tabbar';
import { COLORS } from '../../theme/color';
import PetCard from '../../component/petCard';
import DiaryList from '../../component/diaryList';
import AppointmentCard from '../../component/appointmentCard';
import { usePets } from '../../hook/usePets';
import { useDiarybyUser } from '../../hook/useDiary';
import { useSchedulebyUser } from '../../hook/useSchedule';
import ScheduleCard from '../../component/scheduleCard';
import { useUpdateSchedule } from '../../hook/useSchedule';

const Pets = () => {
    const { data: pets, isLoading: isPetsLoading, isError: isPetsError, error: petsError } = usePets();
    const { data: allDiaries, isLoading: isDiaryLoading, isError: isDiaryError, error: diaryError } = useDiarybyUser();
    const { data: allSchedules, isLoading: isScheduleLoading, isError: isScheduleError, error: scheduleError } = useSchedulebyUser();
    const { mutate: updateSchedule } = useUpdateSchedule();

    const [activeTab, setActiveTab] = useState('PROFILE');
    const [text, onChangeText] = useState('Useless Text');
    const [number, onChangeNumber] = React.useState('');

    const handleToggleSchedule = (scheduleId: string, isActive: boolean) => {
        // updateSchedule({ id: scheduleId, is_active: isActive });
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'PROFILE':
                return (
                    <View style={styles.tabContent}>
                        {isPetsLoading ? (
                            <ActivityIndicator size="large" color={COLORS.background.mint} />
                        ) : isPetsError ? (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>Error: {petsError.message}</Text>
                            </View>
                        ) : pets && pets.length > 0 ? (
                            <ScrollView 
                                style={styles.scrollView}
                                contentContainerStyle={styles.scrollContent}
                                showsVerticalScrollIndicator={false}
                            >
                                {pets.map((pet) => (
                                    <PetCard
                                        key={pet.petid}
                                        pet={pet}
                                    />
                                ))}
                            </ScrollView>
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No pets found</Text>
                            </View>
                        )}
                    </View>
                );
            case 'DIARY':
                return (
                    <View style={styles.tabContent}>
                        {isDiaryLoading ? (
                            <ActivityIndicator size="large" color={COLORS.background.mint} />
                        ) : isDiaryError ? (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>Error: {diaryError.message}</Text>
                            </View>
                        ) : allDiaries && allDiaries.length > 0 ? (
                            <ScrollView style={styles.scrollView}>
                                <DiaryList diaries={allDiaries} />
                            </ScrollView>
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No diary entries found</Text>
                            </View>
                        )}
                    </View>
                );
            case 'SCHEDULE':
                return (
                    <View style={styles.tabContent}>
                        {isScheduleLoading ? (
                            <ActivityIndicator size="large" color={COLORS.background.mint} />
                        ) : isScheduleError ? (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>Error: {scheduleError.message}</Text>
                            </View>
                        ) : allSchedules && allSchedules.length > 0 ? (
                            <ScrollView 
                                style={styles.scrollView}
                                contentContainerStyle={styles.scrollContent}
                                showsVerticalScrollIndicator={false}
                            >
                                {allSchedules.map((schedule) => {
                                    const pet = pets?.find(p => p.petid?.toString() === schedule.pet_id?.toString());
                                    return (
                                        <ScheduleCard
                                            key={schedule.id}
                                            schedule={schedule}
                                            onToggle={handleToggleSchedule}
                                            petAvatar={pet?.data_image ? `data:image/jpeg;base64,${pet.data_image}` : undefined}
                                        />
                                    );
                                })}
                            </ScrollView>
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>Không có lịch trình nào</Text>
                            </View>
                        )}
                    </View>
                );
            case 'APPOINTMENT':
                return (
                    <View style={styles.tabContent}>
                        {/* <AppointmentCard appointment={appointment} /> */}
                    </View>
                );
            default:
                return null;
        }
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
                <TabBar type="pets" initialTab="PROFILE" onTabChange={setActiveTab} pets={pets} isLoading={isPetsLoading} />
                <View style={styles.content}>
                    {renderContent()}
                </View>
                {/* <Menu initialTab="paw-outline" /> */}
            </SafeAreaView>
        </>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background.gray,
    },
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
    },
    content: {
        flex: 1, // This will push the menu to the bottom
    },
    androidSafeArea: {
        paddingTop: StatusBar.currentHeight,
    },
    tabContent: {
        flex: 1,
        // justifyContent: 'center',
        alignItems: 'center',
        padding: 15,
        flexDirection: 'column',
        gap: 20,
        alignSelf: 'stretch',
    },
    contentText: {
        fontSize: 24,
        fontWeight: '600',
        color: COLORS.text.text,
    },
    subText: {
        fontSize: 16,
        color: COLORS.text.textDisable,
        textAlign: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: 'red',
        fontSize: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.text.textDisable,
    },
    scrollView: {
        flex: 1,
        width: '100%',
    },
    scrollContent: {
        // paddingBottom: 20,
        gap: 15,
    },
})
export default Pets;