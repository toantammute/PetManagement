import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Platform, StatusBar, SafeAreaView } from 'react-native';
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

    const { data: pets } = usePets();
    const { data: doctors, isLoading: isLoadingDoctors } = useDoctors();
    const { data: services, isLoading: isLoadingServices } = useServices();
    const { data: timeSlots, isLoading: isLoadingTimeSlots } = useDoctorTimeSlots(
        formData.doctorId,
        formData.date ? formData.date.toISOString().split('T')[0] : ''
    );

    const createAppointmentMutation = useCreateAppointment();

    useEffect(() => {
        const timer = setTimeout(() => {
            Toast.show({
                type: 'info',
                text1: 'Form Loaded',
                text2: 'Please fill in all required fields',
                position: 'top',
                visibilityTime: 2000,
            });
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    const handleSubmit = () => {
        Toast.show({
            type: 'info',
            text1: 'Processing',
            text2: 'Processing request...',
            position: 'bottom',
            visibilityTime: 2000,
        });

        if (!formData.petId || !formData.doctorId || !formData.date || !formData.timeSlotId || !formData.serviceId || !formData.reason) {
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
            date: formData.date.toISOString().split('T')[0],
            time_slot_id: parseInt(formData.timeSlotId),
            service_id: parseInt(formData.serviceId),
            reason: formData.reason
        };

        createAppointmentMutation.mutate(appointmentData, {
            onSuccess: () => {
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
            onError: (error) => {
                setTimeout(() => {
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: 'Could not create appointment. Please try again later.',
                        position: 'bottom',
                        visibilityTime: 4000,
                    });
                }, 500);
                console.error('Error creating appointment:', error);
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
                            <View style={styles.pickerWrapper}>
                                <Picker
                                    selectedValue={formData.doctorId}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, doctorId: value, timeSlotId: '' }))}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Select a doctor" value="" />
                                    {doctors?.map((doctor) => (
                                        <Picker.Item
                                            key={doctor.doctor_id}
                                            label={doctor.doctor_name}
                                            value={doctor.doctor_id}
                                        />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        <DateInput
                            label="Appointment Date"
                            value={formData.date}
                            onChange={(date) => setFormData(prev => ({ ...prev, date, timeSlotId: '' }))}
                            minimumDate={new Date()}
                        />

                        <View style={styles.pickerContainer}>
                            <Text style={styles.label}>Select Time Slot</Text>
                            <View style={styles.pickerWrapper}>
                                <Picker
                                    selectedValue={formData.timeSlotId}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, timeSlotId: value }))}
                                    style={styles.picker}
                                    enabled={!!formData.doctorId && !!formData.date}
                                >
                                    <Picker.Item label="Select a time slot" value="" />
                                    {timeSlots?.map((slot) => (
                                        <Picker.Item
                                            key={slot.id}
                                            label={`${slot.start_time} - ${slot.end_time}`}
                                            value={slot.id}
                                        />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        <View style={styles.pickerContainer}>
                            <Text style={styles.label}>Select Service</Text>
                            <View style={styles.pickerWrapper}>
                                <Picker
                                    selectedValue={formData.serviceId}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, serviceId: value }))}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Select a service" value="" />
                                    {services?.map((service) => (
                                        <Picker.Item
                                            key={service.id}
                                            label={`${service.name} - ${service.cost}đ`}
                                            value={service.id}
                                        />
                                    ))}
                                </Picker>
                            </View>
                        </View>

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


