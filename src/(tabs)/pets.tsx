import React, { useState, useEffect } from 'react';
import { Platform, SafeAreaView, StatusBar, StyleSheet, Text, View, TextInput, ActivityIndicator, RefreshControl, ScrollView, TouchableOpacity } from 'react-native';
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
import { useAppointments } from '../../hook/useAppointment';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';

// Define the type for the navigation stack
type RootStackParamList = {
  BreedDetection: undefined;
  AddDiary: undefined;
  AddAppointment: undefined;
  AddPet: undefined;
  AddSchedule: undefined;
  [key: string]: undefined | object;
};

type PetsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Pets = () => {
    const navigation = useNavigation<PetsScreenNavigationProp>();
    const route = useRoute();
    const params = route.params as { initialTab?: string };
    
    const { data: pets, isLoading: isPetsLoading, isError: isPetsError, error: petsError } = usePets();
    const { data: allDiaries, isLoading: isDiaryLoading, isError: isDiaryError, error: diaryError } = useDiarybyUser();
    const { data: allSchedules, isLoading: isScheduleLoading, isError: isScheduleError, error: scheduleError } = useSchedulebyUser();
    const { mutate: updateSchedule } = useUpdateSchedule();
    const { data: appointments, isLoading: isAppointmentsLoading, isError: isAppointmentsError, error: appointmentsError } = useAppointments();
    
    // Set initial active tab based on navigation params
    const [activeTab, setActiveTab] = useState<string>(params?.initialTab || 'PROFILE');
    const [selectedAvatars, setSelectedAvatars] = useState<string[]>(['all']);
    const [refreshing, setRefreshing] = useState(false);

    // Use useFocusEffect to update the tab when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            if (params?.initialTab) {
                setActiveTab(params.initialTab);
                // Clear the initialTab parameter after setting the active tab
                navigation.setParams({ initialTab: undefined });
            }
        }, [params?.initialTab, navigation])
    );

    // Handle tab change
    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
    };

    // Filter data based on selected pet
    const getFilteredData = () => {
        const isAllSelected = selectedAvatars.includes('all');
        
        const filteredPets = isAllSelected ? pets : pets?.filter(pet => 
            selectedAvatars.includes(pet.petid || '')
        );

        const filteredDiaries = isAllSelected ? allDiaries : allDiaries?.filter(diary => 
            selectedAvatars.includes(diary.pet_id)
        );

        const filteredSchedules = isAllSelected ? allSchedules : allSchedules?.filter(schedule => {
            // Convert pet_id from number to string for comparison
            return selectedAvatars.some(avatarId => schedule.pet_id === parseInt(avatarId));
        });

        // Filter and sort appointments
        const sortedAppointments = appointments?.slice()?.sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return dateB - dateA; // Sort in descending order
        });

        const filteredAppointments = isAllSelected ? sortedAppointments : sortedAppointments?.filter(appointment => 
            selectedAvatars.includes(appointment.pet.pet_id)
        );

        return {
            pets: filteredPets,
            diaries: filteredDiaries,
            schedules: filteredSchedules,
            appointments: filteredAppointments
        };
    };

    const { pets: filteredPets, diaries: filteredDiaries, schedules: filteredSchedules, appointments: filteredAppointments } = getFilteredData();

    // Add refetch functions for each data type
    const { refetch: refetchPets } = usePets();
    const { refetch: refetchDiaries } = useDiarybyUser();
    const { refetch: refetchSchedules } = useSchedulebyUser();
    const { refetch: refetchAppointments } = useAppointments();

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        try {
            // Refetch all data based on active tab
            switch (activeTab) {
                case 'PROFILE':
                    await refetchPets();
                    break;
                case 'DIARY':
                    await refetchDiaries();
                    break;
                case 'SCHEDULE':
                    await refetchSchedules();
                    break;
                case 'APPOINTMENT':
                    await refetchAppointments();
                    break;
            }
        } catch (error) {
            console.error('Error refreshing data:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to refresh data'
            });
        } finally {
            setRefreshing(false);
        }
    }, [activeTab, refetchPets, refetchDiaries, refetchSchedules, refetchAppointments]);

    const handleToggleSchedule = (scheduleId: number, isActive: boolean) => {
        const scheduleToUpdate = allSchedules?.find(s => s.id === scheduleId.toString());
        if (scheduleToUpdate && scheduleToUpdate.id) {
            updateSchedule({
                ...scheduleToUpdate,
                id: scheduleToUpdate.id,
                is_active: isActive
            });
        }
    };

    // const navigateToBreedDetection = () => {
    //     navigation.navigate('BreedDetection');
    // };

    const renderContent = () => {
        const refreshControl = (
            <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.background.mint]}
                tintColor={COLORS.background.mint}
            />
        );

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
                        ) : filteredPets && filteredPets.length > 0 ? (
                            <ScrollView 
                                style={styles.scrollView}
                                contentContainerStyle={styles.scrollContent}
                                showsVerticalScrollIndicator={false}
                                refreshControl={refreshControl}
                            >
                                {filteredPets.map((pet) => (
                                    <PetCard
                                        key={pet.petid}
                                        pet={pet}
                                    />
                                ))}
                            </ScrollView>
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Icon name="paw" size={50} color={COLORS.background.mint} style={styles.emptyIcon} />
                                <Text style={styles.emptyText}>No data</Text>
                                <Text style={styles.emptySubText}>You haven't added any pets yet</Text>
                                <TouchableOpacity 
                                    style={styles.addButton}
                                    onPress={() => navigation.navigate('AddPet')}
                                >
                                    <Icon name="plus" size={20} color="#fff" />
                                    <Text style={styles.addButtonText}>Add Pet</Text>
                                </TouchableOpacity>
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
                        ) : !filteredDiaries || filteredDiaries.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Icon name="book-outline" size={50} color={COLORS.background.mint} style={styles.emptyIcon} />
                                <Text style={styles.emptyText}>No data</Text>
                                <Text style={styles.emptySubText}>No diary yet</Text>
                                <TouchableOpacity 
                                    style={styles.addButton}
                                    onPress={() => navigation.navigate('AddDiary')}
                                >
                                    <Icon name="plus" size={20} color="#fff" />
                                    <Text style={styles.addButtonText}>Add Diary</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <ScrollView 
                                style={styles.scrollView}
                                refreshControl={refreshControl}
                            >
                                <DiaryList diaries={filteredDiaries} />
                            </ScrollView>
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
                        ) : !allSchedules || allSchedules.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Icon name="calendar-clock" size={50} color={COLORS.background.mint} style={styles.emptyIcon} />
                                <Text style={styles.emptyText}>No data</Text>
                                <Text style={styles.emptySubText}>No schedules yet</Text>
                                <TouchableOpacity 
                                    style={styles.addButton}
                                    onPress={() => navigation.navigate('AddSchedule')}
                                >
                                    <Icon name="plus" size={20} color="#fff" />
                                    <Text style={styles.addButtonText}>Add Schedule</Text>
                                </TouchableOpacity>
                            </View>
                        ) : filteredSchedules && filteredSchedules.length > 0 ? (
                            <ScrollView 
                                style={styles.scrollView}
                                contentContainerStyle={styles.scrollContent}
                                showsVerticalScrollIndicator={false}
                                refreshControl={refreshControl}
                            >
                                {filteredSchedules.map((schedule) => {
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
                                <Icon name="calendar-clock" size={50} color={COLORS.background.mint} style={styles.emptyIcon} />
                                <Text style={styles.emptyText}>No data</Text>
                                <Text style={styles.emptySubText}>No schedules for selected pets</Text>
                                <TouchableOpacity 
                                    style={styles.addButton}
                                    onPress={() => navigation.navigate('AddSchedule')}
                                >
                                    <Icon name="plus" size={20} color="#fff" />
                                    <Text style={styles.addButtonText}>Add Schedule</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                );
            case 'APPOINTMENT':
                return (
                    <View style={styles.tabContent}>
                        {isAppointmentsLoading ? (
                            <ActivityIndicator size="large" color={COLORS.background.mint} />
                        ) : isAppointmentsError ? (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>Error: {appointmentsError.message}</Text>
                            </View>
                        ) : filteredAppointments && filteredAppointments.length > 0 ? (
                            <ScrollView 
                                style={styles.scrollView}
                                contentContainerStyle={styles.scrollContent}
                                showsVerticalScrollIndicator={false}
                                refreshControl={refreshControl}
                            >
                                {filteredAppointments.map((appointment) => (
                                    <AppointmentCard
                                        key={appointment.id}
                                        appointment={appointment}
                                    />
                                ))}
                            </ScrollView>
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Icon name="calendar-check" size={50} color={COLORS.background.mint} style={styles.emptyIcon} />
                                <Text style={styles.emptyText}>No data</Text>
                                <Text style={styles.emptySubText}>No appointments found</Text>
                                <TouchableOpacity 
                                    style={styles.addButton}
                                    onPress={() => navigation.navigate('AddAppointment')}
                                >
                                    <Icon name="plus" size={20} color="#fff" />
                                    <Text style={styles.addButtonText}>Add Appointment</Text>
                                </TouchableOpacity>
                            </View>
                        )}
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
                <TabBar 
                    type="pets" 
                    initialTab={activeTab} 
                    onTabChange={handleTabChange} 
                    pets={pets} 
                    isLoading={isPetsLoading}
                    selectedAvatars={selectedAvatars}
                    onAvatarChange={setSelectedAvatars}
                />
                <View style={styles.content}>
                    {renderContent()}
                </View>
                
                {/* Floating Action Button for Breed Detection */}
                {/* <TouchableOpacity 
                    style={styles.breedDetectionButton} 
                    onPress={navigateToBreedDetection}
                >
                    <Icon name="paw" size={24} color="#fff" />
                    <Text style={styles.breedDetectionButtonText}>Detect Breed</Text>
                </TouchableOpacity> */}
            </SafeAreaView>
        </>
    )
};

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
        paddingHorizontal: 20,
    },
    emptyIcon: {
        marginBottom: 15,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text.text,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubText: {
        fontSize: 14,
        color: COLORS.text.textDisable,
        textAlign: 'center',
        lineHeight: 20,
    },
    scrollView: {
        flex: 1,
        width: '100%',
    },
    scrollContent: {
        // paddingBottom: 20,
        gap: 15,
    },
    breedDetectionButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: COLORS.background.mint,
        borderRadius: 25,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    breedDetectionButtonText: {
        color: '#fff',
        marginLeft: 8,
        fontWeight: 'bold',
    },
    addButton: {
        backgroundColor: COLORS.background.mint,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        marginTop: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
})

export default Pets;