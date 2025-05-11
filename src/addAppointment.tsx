import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Platform, StatusBar, SafeAreaView, Image, Modal, ActivityIndicator } from 'react-native';
import { COLORS } from '../theme/color';
import Input from '../component/input';
import DateInput from '../component/datepicker';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import Header from '../component/header';
import { useDoctors, useDoctorTimeSlots, useCreateAppointment } from '../hook/useAppointment';
import { useServices } from '../hook/useService';
import AvaBtn from '../component/avabtn';
import { usePets } from '../hook/usePets';
import Toast from 'react-native-toast-message';

const AddAppointment = () => {
    const navigation = useNavigation<any>();
    const [formData, setFormData] = useState({
        petId: '',
        doctorId: '',
        date: null as Date | null,
        timeSlotId: '',
        serviceId: '',
        reason: ''
    });
    const [showDoctors, setShowDoctors] = useState(false);
    const [showTimeSlots, setShowTimeSlots] = useState(false);
    const [showServices, setShowServices] = useState(false);

    const { data: pets } = usePets();
    const { data: doctors, isLoading: isLoadingDoctors } = useDoctors();
    console.log('Doctors:', doctors);
    const { data: services, isLoading: isLoadingServices } = useServices();

    const formatDateForAPI = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const { data: timeSlots, isLoading: isLoadingTimeSlots } = useDoctorTimeSlots(
        formData.doctorId,
        formData.date ? formatDateForAPI(formData.date) : ''
    );

    console.log('Selected Doctor ID:', formData.doctorId);
    console.log('Time Slots:', timeSlots);

    const createAppointmentMutation = useCreateAppointment();

    // Filter doctors with role "doctor"
    const filteredDoctors = useMemo(() => {
        return doctors?.filter(doctor => doctor.role === "doctor") || [];
    }, [doctors]);

    // Find the selected doctor
    const selectedDoctor = filteredDoctors?.find(doc => doc.doctor_id === formData.doctorId);

    // Group time slots by morning/afternoon/evening
    const groupedTimeSlots = useMemo(() => {
        if (!timeSlots) return { morning: [], afternoon: [], evening: [] };

        const morning = timeSlots.filter(slot => {
            const hour = parseInt(slot.start_time.split(':')[0]);
            return hour >= 7 && hour < 12;
        });

        const afternoon = timeSlots.filter(slot => {
            const hour = parseInt(slot.start_time.split(':')[0]);
            return hour >= 12 && hour < 17;
        });


        return { morning, afternoon };
    }, [timeSlots]);

    // Get selected time slot for display
    const selectedTimeSlot = useMemo(() => {
        return timeSlots?.find(slot => slot.id === formData.timeSlotId);
    }, [timeSlots, formData.timeSlotId]);

    useEffect(() => {
        if (formData.doctorId && formData.date) {
            console.log('Fetching time slots for doctor:', formData.doctorId, 'and date:', formData.date.toISOString().split('T')[0]);
        }
    }, [formData.doctorId, formData.date]);

    const handleSubmit = () => {
        Toast.show({
            type: 'info',
            text1: 'Processing',
            text2: 'Processing request...',
            position: 'bottom',
            visibilityTime: 2000,
        });

        if (!formData.petId || !formData.doctorId || !formData.date || !formData.timeSlotId || !formData.serviceId || !formData.reason) {
            console.log('Validation failed. Missing fields:', {
                petId: !formData.petId,
                doctorId: !formData.doctorId,
                date: !formData.date,
                timeSlotId: !formData.timeSlotId,
                serviceId: !formData.serviceId,
                reason: !formData.reason
            });
            
            setTimeout(() => {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Please fill in all required fields',
                    position: 'bottom',
                    visibilityTime: 4000,
                    autoHide: true,
                    bottomOffset: 80,
                });
            }, 500);
            return;
        }

        const appointmentData = {
            pet_id: parseInt(formData.petId),
            doctor_id: parseInt(formData.doctorId),
            date: formData.date ? formatDateForAPI(formData.date) : '',
            time_slot_id: parseInt(formData.timeSlotId),
            service_id: parseInt(formData.serviceId),
            reason: formData.reason
        };

        console.log('Creating appointment with data:', appointmentData);

        createAppointmentMutation.mutate(appointmentData, {
            onSuccess: (data) => {
                console.log('Appointment created successfully:', data);
                setTimeout(() => {
                    Toast.show({
                        type: 'success',
                        text1: 'Success',
                        text2: 'New appointment created',
                        position: 'bottom',
                        visibilityTime: 3000,
                    });
                }, 500);

                setTimeout(() => {
                    navigation.goBack();
                }, 2000);
            },
            onError: (error: any) => {
                console.error('Error creating appointment:', error);
                const errorMessage = error?.response?.data?.message || 'Could not create appointment. Please try again later.';
                setTimeout(() => {
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: errorMessage,
                        position: 'bottom',
                        visibilityTime: 4000,
                    });
                }, 500);
            }
        });
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
                <Header
                    title="Create Appointment"
                    variant="save"
                    onSave={handleSubmit}
                />

                <ScrollView style={styles.content}>
                    <View style={styles.form}>
                        <Text style={styles.label}>Select Pet</Text>
                        <View style={styles.avatarList}>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.avatarScroll}
                            >
                                {pets?.map((pet) => (
                                    <AvaBtn
                                        key={pet.petid}
                                        petName={pet.name}
                                        imageUrl={pet.data_image ? `data:image/jpeg;base64,${pet.data_image}` : undefined}
                                        variant="default"
                                        isChosen={formData.petId === pet.petid}
                                        onPress={() => setFormData(prev => ({ ...prev, petId: pet.petid || '' }))}
                                    />
                                ))}
                            </ScrollView>
                        </View>

                        <View style={styles.pickerContainer}>
                            <Text style={styles.label}>Select Doctor</Text>
                            <TouchableOpacity 
                                style={styles.doctorPickerButton}
                                onPress={() => {
                                    console.log("Opening doctor popup");
                                    setShowDoctors(true);
                                }}
                            >
                                <Text style={styles.doctorPickerText}>
                                    {selectedDoctor ? selectedDoctor.doctor_name : "Select a doctor"}
                                </Text>
                                <Text style={styles.dropdownIcon}>▼</Text>
                            </TouchableOpacity>
                        </View>

                        <Modal
                            animationType="slide"
                            transparent={true}
                            visible={showDoctors}
                            onRequestClose={() => {
                                console.log("Modal closed");
                                setShowDoctors(false);
                            }}
                        >
                            <View style={styles.centeredView}>
                                <View style={styles.modalView}>
                                    <View style={styles.modalHeader}>
                                        <Text style={styles.modalTitle}>Select Doctor</Text>
                                        <TouchableOpacity 
                                            onPress={() => {
                                                console.log("Close button pressed");
                                                setShowDoctors(false);
                                            }}
                                            style={styles.closeButtonContainer}
                                        >
                                            <Text style={styles.closeButton}>✕</Text>
                                        </TouchableOpacity>
                                    </View>
                                    
                                    {filteredDoctors?.length > 0 ? (
                                        <ScrollView style={styles.doctorScrollView}>
                                            {filteredDoctors.map((doctor) => (
                                                <TouchableOpacity 
                                                    key={doctor.doctor_id}
                                                    style={[
                                                        styles.doctorCard, 
                                                        formData.doctorId === doctor.doctor_id && styles.selectedDoctorCard
                                                    ]}
                                                    onPress={() => {
                                                        console.log("Selected doctor:", doctor.doctor_name);
                                                        setFormData(prev => ({ ...prev, doctorId: doctor.doctor_id, timeSlotId: '' }));
                                                        setShowDoctors(false);
                                                    }}
                                                >
                                                    <View style={styles.doctorAvatarContainer}>
                                                        {doctor?.data_image ? (
                                                            <Image 
                                                                source={{ uri: `data:image/jpeg;base64,${doctor.data_image}` }} 
                                                                style={styles.doctorImage} 
                                                            />
                                                        ) : (
                                                            <View style={styles.doctorPlaceholder}>
                                                                <Text style={styles.doctorPlaceholderText}>
                                                                    {doctor.doctor_name.charAt(0)}
                                                                </Text>
                                                            </View>
                                                        )}
                                                    </View>
                                                    <View style={styles.doctorDetails}>
                                                        <Text style={styles.doctorName}>{doctor.doctor_name}</Text>
                                                        <Text style={styles.doctorSpecialty}>
                                                            {doctor.specialization ? `Specialty: ${doctor.specialization}` : "Specialty: General"}
                                                        </Text>
                                                        <Text style={styles.doctorExperience}>
                                                            {doctor.year_of_experience ? `${doctor.year_of_experience} years experience` : ""}
                                                        </Text>
                                                    </View>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    ) : (
                                        <View style={styles.noDataContainer}>
                                            <Text style={styles.noDataText}>No doctors available</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </Modal>

                        <DateInput
                            label="Appointment Date"
                            value={formData.date}
                            onChange={(date) => {
                                console.log('Date selected properly:', date);
                                // Đảm bảo chúng ta có một Date object hợp lệ
                                if (date instanceof Date && !isNaN(date.getTime())) {
                                    setFormData(prev => ({ 
                                        ...prev, 
                                        date: date,
                                        timeSlotId: '' 
                                    }));
                                }
                            }}
                            minimumDate={new Date()}
                        />

                        <View style={styles.pickerContainer}>
                            <Text style={styles.label}>Time Slot</Text>
                            <TouchableOpacity 
                                style={[
                                    styles.doctorPickerButton,
                                    (!formData.doctorId || !formData.date) && styles.disabledPickerButton
                                ]}
                                onPress={() => {
                                    if (formData.doctorId && formData.date) {
                                        setShowTimeSlots(true);
                                    } else {
                                        Toast.show({
                                            type: 'info',
                                            text1: 'Select a doctor and date first',
                                            position: 'bottom',
                                            visibilityTime: 2000,
                                        });
                                    }
                                }}
                                disabled={!formData.doctorId || !formData.date}
                            >
                                {isLoadingTimeSlots && formData.doctorId && formData.date ? (
                                    <View style={styles.loadingContainer}>
                                        <ActivityIndicator size="small" color={COLORS.button.choose} />
                                        <Text style={styles.loadingText}>Loading available time slots...</Text>
                                    </View>
                                ) : (
                                    <>
                                        <Text style={[
                                            styles.doctorPickerText,
                                            (!formData.doctorId || !formData.date) && styles.disabledText
                                        ]}>
                                            {selectedTimeSlot 
                                                ? `${selectedTimeSlot.start_time.substring(0, 5)} - ${selectedTimeSlot.end_time.substring(0, 5)}` 
                                                : "Select a time slot"}
                                        </Text>
                                        <Text style={styles.dropdownIcon}>▼</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Time Slot Selection Modal */}
                        <Modal
                            animationType="slide"
                            transparent={true}
                            visible={showTimeSlots}
                            onRequestClose={() => {
                                setShowTimeSlots(false);
                            }}
                        >
                            <View style={styles.centeredView}>
                                <View style={styles.modalView}>
                                    <View style={styles.modalHeader}>
                                        <Text style={styles.modalTitle}>
                                            Select Time Slot for {formData.date ? formData.date.toLocaleDateString() : ""}
                                        </Text>
                                        <TouchableOpacity 
                                            onPress={() => setShowTimeSlots(false)}
                                            style={styles.closeButtonContainer}
                                        >
                                            <Text style={styles.closeButton}>✕</Text>
                                        </TouchableOpacity>
                                    </View>
                                    
                                    <ScrollView style={styles.timeSlotScrollView}>
                                        {isLoadingTimeSlots ? (
                                            <View style={styles.loadingTimeSlotsContainer}>
                                                <ActivityIndicator size="large" color={COLORS.button.choose} />
                                                <Text style={styles.loadingTimeSlotsText}>
                                                    Loading available time slots...
                                                </Text>
                                            </View>
                                        ) : (
                                            <>
                                                {/* Morning slots */}
                                                {groupedTimeSlots.morning.length > 0 && (
                                                    <View style={styles.timeSlotSection}>
                                                        <Text style={styles.timeSlotSectionTitle}>Buổi sáng</Text>
                                                        <View style={styles.timeSlotGrid}>
                                                            {groupedTimeSlots.morning.map((slot) => (
                                                                <TouchableOpacity
                                                                    key={slot.id}
                                                                    style={[
                                                                        styles.timeSlotButton,
                                                                        slot.status !== 'available' && styles.disabledTimeSlot,
                                                                        formData.timeSlotId === slot.id && styles.selectedTimeSlot
                                                                    ]}
                                                                    onPress={() => {
                                                                        if (slot.status === 'available') {
                                                                            setFormData(prev => ({ ...prev, timeSlotId: slot.id }));
                                                                            setShowTimeSlots(false);
                                                                        }
                                                                    }}
                                                                    disabled={slot.status !== 'available'}
                                                                >
                                                                    <Text style={[
                                                                        styles.timeSlotText,
                                                                        slot.status !== 'available' && styles.disabledTimeSlotText,
                                                                        formData.timeSlotId === slot.id && styles.selectedTimeSlotText
                                                                    ]}>
                                                                        {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                                                                    </Text>
                                                                </TouchableOpacity>
                                                            ))}
                                                        </View>
                                                    </View>
                                                )}

                                                {/* Afternoon slots */}
                                                {groupedTimeSlots.afternoon.length > 0 && (
                                                    <View style={styles.timeSlotSection}>
                                                        <Text style={styles.timeSlotSectionTitle}>Buổi chiều</Text>
                                                        <View style={styles.timeSlotGrid}>
                                                            {groupedTimeSlots.afternoon.map((slot) => (
                                                                <TouchableOpacity
                                                                    key={slot.id}
                                                                    style={[
                                                                        styles.timeSlotButton,
                                                                        slot.status !== 'available' && styles.disabledTimeSlot,
                                                                        formData.timeSlotId === slot.id && styles.selectedTimeSlot
                                                                    ]}
                                                                    onPress={() => {
                                                                        if (slot.status === 'available') {
                                                                            setFormData(prev => ({ ...prev, timeSlotId: slot.id }));
                                                                            setShowTimeSlots(false);
                                                                        }
                                                                    }}
                                                                    disabled={slot.status !== 'available'}
                                                                >
                                                                    <Text style={[
                                                                        styles.timeSlotText,
                                                                        slot.status !== 'available' && styles.disabledTimeSlotText,
                                                                        formData.timeSlotId === slot.id && styles.selectedTimeSlotText
                                                                    ]}>
                                                                        {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                                                                    </Text>
                                                                </TouchableOpacity>
                                                            ))}
                                                        </View>
                                                    </View>
                                                )}
                                                
                                                {(!groupedTimeSlots.morning.length && !groupedTimeSlots.afternoon.length ) && (
                                                    <View style={styles.noDataContainer}>
                                                        <Text style={styles.noDataText}>
                                                            No time slots available for this doctor on {formData.date?.toLocaleDateString()}
                                                        </Text>
                                                        <Text style={styles.noDataSubText}>
                                                            Please try selecting a different date or doctor
                                                        </Text>
                                                    </View>
                                                )}
                                            </>
                                        )}
                                    </ScrollView>
                                </View>
                            </View>
                        </Modal>

                        <View style={styles.pickerContainer}>
                            <Text style={styles.label}>Service</Text>
                            <TouchableOpacity 
                                style={styles.doctorPickerButton}
                                onPress={() => setShowServices(true)}
                            >
                                <Text style={styles.doctorPickerText}>
                                    {services?.find(s => s.id === formData.serviceId)
                                        ? `${services?.find(s => s.id === formData.serviceId)?.name} - ${services?.find(s => s.id === formData.serviceId)?.cost}đ`
                                        : "Select a service"}
                                </Text>
                                <Text style={styles.dropdownIcon}>▼</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Service Selection Modal */}
                        <Modal
                            animationType="slide"
                            transparent={true}
                            visible={showServices}
                            onRequestClose={() => {
                                setShowServices(false);
                            }}
                        >
                            <View style={styles.centeredView}>
                                <View style={styles.modalView}>
                                    <View style={styles.modalHeader}>
                                        <Text style={styles.modalTitle}>Select Service</Text>
                                        <TouchableOpacity 
                                            onPress={() => setShowServices(false)}
                                            style={styles.closeButtonContainer}
                                        >
                                            <Text style={styles.closeButton}>✕</Text>
                                        </TouchableOpacity>
                                    </View>
                                    
                                    {isLoadingServices ? (
                                        <View style={styles.loadingTimeSlotsContainer}>
                                            <ActivityIndicator size="large" color={COLORS.button.choose} />
                                            <Text style={styles.loadingTimeSlotsText}>
                                                Loading services...
                                            </Text>
                                        </View>
                                    ) : (
                                        <ScrollView style={styles.serviceScrollView}>
                                            {services && services.length > 0 ? (
                                                services.map((service) => (
                                                    <TouchableOpacity 
                                                        key={service.id}
                                                        style={[
                                                            styles.serviceCard, 
                                                            formData.serviceId === service.id && styles.selectedServiceCard
                                                        ]}
                                                        onPress={() => {
                                                            setFormData(prev => ({ ...prev, serviceId: service.id }));
                                                            setShowServices(false);
                                                        }}
                                                    >
                                                        <View style={styles.serviceInfo}>
                                                            <Text style={styles.serviceName}>{service.name}</Text>
                                                            <Text style={styles.serviceDescription}>{service.description}</Text>
                                                            <View style={styles.serviceDetailRow}>
                                                                <Text style={styles.serviceCost}>{service.cost}đ</Text>
                                                                <Text style={styles.serviceDuration}>{service.duration} phút</Text>
                                                            </View>
                                                        </View>
                                                    </TouchableOpacity>
                                                ))
                                            ) : (
                                                <View style={styles.noDataContainer}>
                                                    <Text style={styles.noDataText}>No services available</Text>
                                                </View>
                                            )}
                                        </ScrollView>
                                    )}
                                </View>
                            </View>
                        </Modal>

                        <Input
                            label="Reason for Visit"
                            placeholder="Enter reason for visit"
                            value={formData.reason}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, reason: text }))}
                        />

                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleSubmit}
                        >
                            <Text style={styles.submitButtonText}>Create Appointment</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
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
        backgroundColor: COLORS.background.white,
    },
    content: {
        flex: 1,
    },
    form: {
        padding: 20,
        gap: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.text.textChoose,
        marginBottom: 8,
    },
    avatarList: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    avatarScroll: {
        flexGrow: 0,
        gap: 15,
    },
    pickerContainer: {
        gap: 8,
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: COLORS.border.input,
        borderRadius: 8,
        backgroundColor: COLORS.background.white,
        overflow: 'hidden',
    },
    picker: {
        height: 48,
    },
    doctorPickerButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border.input,
        borderRadius: 8,
        backgroundColor: COLORS.background.white,
        paddingHorizontal: 10,
        paddingVertical: 12,
    },
    doctorPickerText: {
        fontSize: 16,
        color: COLORS.text.text,
    },
    dropdownIcon: {
        fontSize: 14,
        color: COLORS.text.textDisable,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        width: '90%',
        maxHeight: '70%',
        backgroundColor: 'white',
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E8E8E8',
        backgroundColor: COLORS.background.white,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text.textChoose,
    },
    closeButtonContainer: {
        padding: 5,
    },
    closeButton: {
        fontSize: 20,
        color: COLORS.text.textDisable,
    },
    doctorScrollView: {
        width: '100%',
    },
    noDataContainer: {
        padding: 20,
        alignItems: 'center',
    },
    noDataText: {
        fontSize: 16,
        color: COLORS.text.textDisable,
    },
    noDataSubText: {
        fontSize: 14,
        color: COLORS.text.textDisable,
        marginTop: 8,
    },
    doctorCard: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        backgroundColor: COLORS.background.white,
    },
    selectedDoctorCard: {
        backgroundColor: '#F0F8FF',
    },
    doctorAvatarContainer: {
        width: 60,
        height: 60,
        marginRight: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    doctorImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    doctorPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#E1E1E1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    doctorPlaceholderText: {
        fontSize: 22,
        color: '#909090',
        fontWeight: 'bold',
    },
    doctorDetails: {
        flex: 1,
    },
    doctorName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3498db',
        marginBottom: 4,
    },
    doctorSpecialty: {
        fontSize: 14,
        color: COLORS.text.text,
        marginBottom: 2,
    },
    doctorExperience: {
        fontSize: 14,
        color: COLORS.text.text,
        marginBottom: 2,
    },
    disabledText: {
        color: COLORS.text.textDisable,
    },
    disabledPickerButton: {
        backgroundColor: COLORS.background.gray,
        borderColor: COLORS.border.input,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        flex: 1,
    },
    loadingText: {
        color: COLORS.text.textDisable,
        marginLeft: 10,
        fontSize: 14,
    },
    timeSlotScrollView: {
        width: '100%',
        padding: 16,
    },
    timeSlotSection: {
        marginBottom: 24,
    },
    timeSlotSectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text.textChoose,
        marginBottom: 12,
    },
    timeSlotGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        gap: 10,
    },
    timeSlotButton: {
        backgroundColor: '#E6F2FF',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        minWidth: '30%',
        alignItems: 'center',
        marginBottom: 8,
    },
    timeSlotText: {
        color: '#3498db',
        fontWeight: '500',
    },
    disabledTimeSlot: {
        backgroundColor: '#F0F0F0',
    },
    disabledTimeSlotText: {
        color: '#A0A0A0',
    },
    selectedTimeSlot: {
        backgroundColor: '#3498db',
    },
    selectedTimeSlotText: {
        color: 'white',
        fontWeight: 'bold',
    },
    loadingTimeSlotsContainer: {
        padding: 40,
        alignItems: 'center',
    },
    loadingTimeSlotsText: {
        marginTop: 16,
        color: COLORS.text.textDisable,
        fontSize: 16,
    },
    serviceScrollView: {
        width: '100%',
    },
    serviceCard: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        backgroundColor: COLORS.background.white,
    },
    selectedServiceCard: {
        backgroundColor: '#F0F8FF',
    },
    serviceInfo: {
        flex: 1,
    },
    serviceName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3498db',
        marginBottom: 8,
    },
    serviceDescription: {
        fontSize: 14,
        color: COLORS.text.text,
        marginBottom: 8,
        lineHeight: 20,
    },
    serviceDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
        alignItems: 'center',
    },
    serviceCost: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text.textChoose,
    },
    serviceDuration: {
        fontSize: 14,
        color: COLORS.text.textDisable,
        backgroundColor: '#F0F0F0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    submitButton: {
        backgroundColor: COLORS.button.choose,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 30,
    },
    submitButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
    }
});

export default AddAppointment;


