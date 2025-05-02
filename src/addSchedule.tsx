import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Modal, SafeAreaView, StatusBar, Platform, Alert } from 'react-native';
import { COLORS } from '../theme/color';
import Input from '../component/input';
import DateInput from '../component/datepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import Header from '../component/header';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AvaBtn from '../component/avabtn';
import { usePets } from '../hook/usePets';
import { useCreateSchedule, useUpdateSchedule, useDeleteSchedule } from '../hook/useSchedule';
import { Schedule } from '../models/models';
import DatePicker from 'react-native-date-picker';

const AddSchedule = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { schedule: initialSchedule, isUpdate } = route.params || {};
    
    const { data: pets, isLoading, isError, error } = usePets();
    const [title, setTitle] = useState('');
    const [note, setNote] = useState('');
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [hasEndDate, setHasEndDate] = useState(false);
    const [repeat, setRepeat] = useState<string>('none');
    const [showRepeatModal, setShowRepeatModal] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [petId, setPetId] = useState('');

    useEffect(() => {
        if (initialSchedule) {
            setTitle(initialSchedule.title);
            setNote(initialSchedule.notes);
            setPetId(initialSchedule.pet_id.toString());
            setRepeat(initialSchedule.event_repeat);
            setHasEndDate(initialSchedule.end_type === "true");
            
            const reminderDate = new Date(initialSchedule.reminder_datetime);
            setStartDate(reminderDate);
            setStartTime(reminderDate);
            
            if (initialSchedule.end_date && initialSchedule.end_date !== "0001-01-01T00:00:00Z") {
                setEndDate(new Date(initialSchedule.end_date));
            }
        }
    }, [initialSchedule]);

    const repeatOptions = [
        { label: 'Không lặp lại', value: 'none' },
        { label: 'Hàng ngày', value: 'daily' },
        { label: 'Hàng tuần', value: 'weekly' },
        { label: 'Hàng tháng', value: 'monthly' },
    ];

    const { mutate: createSchedule } = useCreateSchedule();
    const { mutate: updateSchedule } = useUpdateSchedule();
    const { mutate: deleteSchedule } = useDeleteSchedule();

    const handleSave = () => {
        if (!title || !startDate || !startTime || !petId) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
            return;
        }

        const reminderDateTime = new Date(startDate);
        reminderDateTime.setHours(startTime.getHours());
        reminderDateTime.setMinutes(startTime.getMinutes());
        reminderDateTime.setSeconds(0);
        reminderDateTime.setMilliseconds(0);

        const scheduleData: Schedule = {
            pet_id: parseInt(petId, 10),
            title,
            notes: note,
            reminder_datetime: reminderDateTime.toISOString(),
            event_repeat: repeat,
            end_type: hasEndDate ? "true" : "false",
            end_date: hasEndDate && endDate ? endDate.toISOString().split('T')[0] : null,
            is_active: initialSchedule?.is_active ?? true
        };

        if (isUpdate && initialSchedule?.id) {
            updateSchedule({ id: initialSchedule.id, ...scheduleData }, {
                onSuccess: () => {
                    Alert.alert('Thành công', 'Đã cập nhật lịch trình');
                    navigation.goBack();
                },
                onError: (error) => {
                    Alert.alert('Lỗi', 'Không thể cập nhật lịch trình');
                    console.error('Error updating schedule:', error);
                }
            });
        } else {
            createSchedule(scheduleData, {
                onSuccess: () => {
                    Alert.alert('Thành công', 'Đã thêm lịch trình mới');
                    navigation.goBack();
                },
                onError: (error) => {
                    Alert.alert('Lỗi', 'Không thể thêm lịch trình mới');
                    console.error('Error creating schedule:', error);
                }
            });
        }
    };

    const handleDelete = () => {
        if (initialSchedule?.id) {
            Alert.alert(
                'Xác nhận',
                'Bạn có chắc chắn muốn xóa lịch trình này?',
                [
                    {
                        text: 'Hủy',
                        style: 'cancel',
                    },
                    {
                        text: 'Xóa',
                        style: 'destructive',
                        onPress: () => {
                            deleteSchedule(initialSchedule.id, {
                                onSuccess: () => {
                                    Alert.alert('Thành công', 'Đã xóa lịch trình');
                                    navigation.goBack();
                                },
                                onError: (error) => {
                                    Alert.alert('Lỗi', 'Không thể xóa lịch trình');
                                    console.error('Error deleting schedule:', error);
                                }
                            });
                        },
                    },
                ]
            );
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
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
                <View style={styles.container}>
                    <Header
                        title={isUpdate ? "Cập nhật lịch trình" : "Thêm lịch trình"}
                        variant="save"
                        onSave={handleSave}
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
                                            isChosen={petId === pet.petid}
                                            onPress={() => setPetId(pet.petid || '')}
                                        />
                                    ))}
                                </ScrollView>
                            </View>

                            <Input
                                label="Tiêu đề"
                                placeholder="Nhập tiêu đề"
                                value={title}
                                onChangeText={setTitle}
                            />

                            <Input
                                label="Ghi chú"
                                placeholder="Nhập ghi chú"
                                value={note}
                                onChangeText={setNote}
                            />

                            <View style={styles.section}>
                                <Text style={styles.label}>Lặp lại</Text>
                                <TouchableOpacity
                                    style={styles.repeatButton}
                                    onPress={() => setShowRepeatModal(true)}
                                >
                                    <Text style={styles.repeatText}>
                                        {repeatOptions.find(opt => opt.value === repeat)?.label}
                                    </Text>
                                    <MaterialIcons name="keyboard-arrow-down" size={24} color={COLORS.text.default} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.dateTimeContainer}>
                                <View style={styles.dateTimeItem}>
                                    <DateInput
                                        label="Ngày bắt đầu"
                                        value={startDate}
                                        onChange={setStartDate}
                                        minimumDate={new Date()}
                                    />
                                </View>
                                <View style={styles.dateTimeItem}>
                                    <Text style={styles.label}>Giờ bắt đầu</Text>
                                    <TouchableOpacity
                                        style={styles.timeButton}
                                        onPress={() => setShowTimePicker(true)}
                                    >
                                        <Text style={styles.timeText}>
                                            {startTime ? formatTime(startTime) : 'Chọn giờ'}
                                        </Text>
                                        <MaterialIcons name="access-time" size={20} color={COLORS.text.default} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.label}>Có ngày kết thúc</Text>
                                <TouchableOpacity
                                    style={styles.switchButton}
                                    onPress={() => setHasEndDate(!hasEndDate)}
                                >
                                    <View style={[
                                        styles.switch,
                                        hasEndDate && styles.switchActive
                                    ]}>
                                        <View style={[
                                            styles.switchThumb,
                                            hasEndDate && styles.switchThumbActive
                                        ]} />
                                    </View>
                                </TouchableOpacity>
                            </View>

                            {hasEndDate && (
                                <DateInput
                                    label="Ngày kết thúc"
                                    value={endDate}
                                    onChange={setEndDate}
                                    minimumDate={startDate || new Date()}
                                />
                            )}
                        </View>
                    </ScrollView>

                    {isUpdate && (
                        <TouchableOpacity 
                            style={styles.deleteButton}
                            onPress={handleDelete}
                        >
                            <Text style={styles.deleteButtonText}>Xóa lịch trình</Text>
                        </TouchableOpacity>
                    )}

                    <Modal
                        visible={showTimePicker}
                        transparent={true}
                        animationType="fade"
                        onRequestClose={() => setShowTimePicker(false)}
                    >
                        <TouchableOpacity
                            style={styles.modalOverlay}
                            activeOpacity={1}
                            onPress={() => setShowTimePicker(false)}
                        >
                            <View style={styles.modalContent}>
                                <View style={styles.datePickerHeader}>
                                    <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                                        <Text style={styles.cancelButton}>Hủy</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.headerTitle}>Chọn giờ</Text>
                                    <TouchableOpacity
                                        onPress={() => {
                                            if (startTime) {
                                                setStartTime(startTime);
                                            }
                                            setShowTimePicker(false);
                                        }}
                                    >
                                        <Text style={styles.doneButton}>Xong</Text>
                                    </TouchableOpacity>
                                </View>
                                <DatePicker
                                    date={startTime || new Date()}
                                    mode="time"
                                    onDateChange={setStartTime}
                                    locale="vi"
                                />
                            </View>
                        </TouchableOpacity>
                    </Modal>

                    <Modal
                        visible={showRepeatModal}
                        transparent={true}
                        animationType="slide"
                        onRequestClose={() => setShowRepeatModal(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Chọn tần suất lặp lại</Text>
                                    <TouchableOpacity onPress={() => setShowRepeatModal(false)}>
                                        <MaterialIcons name="close" size={24} color={COLORS.text.default} />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.modalOptions}>
                                    {repeatOptions.map((option) => (
                                        <TouchableOpacity
                                            key={option.value}
                                            style={styles.modalOption}
                                            onPress={() => {
                                                setRepeat(option.value);
                                                setShowRepeatModal(false);
                                            }}
                                        >
                                            <Text style={[
                                                styles.modalOptionText,
                                                repeat === option.value && styles.modalOptionTextActive
                                            ]}>
                                                {option.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </View>
                    </Modal>
                </View>
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
        gap: 10,
    },
    avatarList: {
        flexDirection: 'row',
        marginBottom: 0,
        paddingHorizontal: 10,
    },
    avatarScroll: {
        flexGrow: 0,
        gap: 15,
    },
    section: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.text.textChoose,
    },
    repeatButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: COLORS.background.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.border.input,
    },
    repeatText: {
        fontSize: 16,
        color: COLORS.text.text,
        marginRight: 8,
    },
    dateTimeContainer: {
        flexDirection: 'row',
        gap: 10,
        // marginBottom: 10,
    },
    dateTimeItem: {
        flex: 1,
        gap: 5,
    },
    timeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
        backgroundColor: COLORS.background.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.border.input,
        height: 48,
    },
    timeText: {
        fontSize: 16,
        color: COLORS.text.text,
    },
    switchButton: {
        padding: 5,
    },
    switch: {
        width: 50,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#E0E0E0",
        justifyContent: 'center',
        padding: 2,
    },
    switchActive: {
        backgroundColor: COLORS.button.choose,
    },
    switchThumb: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: COLORS.background.white,
        transform: [{ translateX: 0 }],
    },
    switchThumbActive: {
        transform: [{ translateX: 22 }],
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.background.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border.input,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text.text,
    },
    modalOptions: {
        padding: 16,
    },
    modalOption: {
        paddingVertical: 12,
    },
    modalOptionText: {
        fontSize: 16,
        color: COLORS.text.text,
    },
    modalOptionTextActive: {
        color: COLORS.button.choose,
        fontWeight: '600',
    },
    datePickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border.input,
    },
    cancelButton: {
        fontSize: 16,
        color: COLORS.text.default,
    },
    doneButton: {
        fontSize: 16,
        color: COLORS.button.choose,
        fontWeight: '600',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text.text,
    },
    deleteButton: {
        backgroundColor: '#FF3B30',
        padding: 15,
        alignItems: 'center',
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 8,
    },
    deleteButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default AddSchedule;
