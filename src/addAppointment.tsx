import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Platform, StatusBar, SafeAreaView, Alert } from 'react-native';
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

const AddAppointment = () => {
    const navigation = useNavigation();
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

    const handleSubmit = () => {
        if (!formData.petId || !formData.doctorId || !formData.date || !formData.timeSlotId || !formData.serviceId || !formData.reason) {
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
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
                Alert.alert('Thành công', 'Đã tạo cuộc hẹn mới');
                navigation.goBack();
            },
            onError: (error) => {
                Alert.alert('Lỗi', 'Không thể tạo cuộc hẹn. Vui lòng thử lại sau.');
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
                    title="Tạo Cuộc Hẹn" 
                    variant="save" 
                    onSave={handleSubmit}
                />

                <ScrollView style={styles.content}>
                    <View style={styles.form}>
                        <Text style={styles.label}>Chọn thú cưng</Text>
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
                            <Text style={styles.label}>Chọn Bác Sĩ</Text>
                            <View style={styles.pickerWrapper}>
                                <Picker
                                    selectedValue={formData.doctorId}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, doctorId: value, timeSlotId: '' }))}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Chọn bác sĩ" value="" />
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
                            label="Ngày hẹn"
                            value={formData.date}
                            onChange={(date) => setFormData(prev => ({ ...prev, date, timeSlotId: '' }))}
                            maximumDate={new Date()}
                        />

                        <View style={styles.pickerContainer}>
                            <Text style={styles.label}>Chọn Khung Giờ</Text>
                            <View style={styles.pickerWrapper}>
                                <Picker
                                    selectedValue={formData.timeSlotId}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, timeSlotId: value }))}
                                    style={styles.picker}
                                    enabled={!!formData.doctorId && !!formData.date}
                                >
                                    <Picker.Item label="Chọn khung giờ" value="" />
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
                            <Text style={styles.label}>Chọn Dịch Vụ</Text>
                            <View style={styles.pickerWrapper}>
                                <Picker
                                    selectedValue={formData.serviceId}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, serviceId: value }))}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Chọn dịch vụ" value="" />
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
                            label="Lý do khám"
                            placeholder="Nhập lý do khám"
                            value={formData.reason}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, reason: text }))}
                        />
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
    }
});

export default AddAppointment;

// const AddAppointment = () => {


