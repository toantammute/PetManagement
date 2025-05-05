import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Modal, SafeAreaView, StatusBar, Platform } from 'react-native';
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
import Toast from 'react-native-toast-message';

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
        { label: 'No repeat', value: 'none' },
        { label: 'Daily', value: 'daily' },
        { label: 'Weekly', value: 'weekly' },
        { label: 'Monthly', value: 'monthly' },
    ];

    const { mutate: createSchedule } = useCreateSchedule();
    const { mutate: updateSchedule } = useUpdateSchedule();
    const { mutate: deleteSchedule } = useDeleteSchedule();

    const handleSave = () => {
        if (!title || !startDate || !startTime || !petId) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please enter all required information'
            });
            return;
        }

        const reminderDateTime = new Date(startDate);
        reminderDateTime.setHours(startTime.getHours());
        reminderDateTime.setMinutes(startTime.getMinutes());
        reminderDateTime.setSeconds(0);
        reminderDateTime.setMilliseconds(0);

        let formattedEndDate = null;
        if (hasEndDate && endDate) {
            const endDateTime = new Date(endDate);
            endDateTime.setHours(23);
            endDateTime.setMinutes(59);
            endDateTime.setSeconds(59);
            endDateTime.setMilliseconds(0);
            formattedEndDate = endDateTime.toISOString();
        }

        const scheduleData: Schedule = {
            pet_id: parseInt(petId, 10),
            title,
            notes: note,
            reminder_datetime: reminderDateTime.toISOString(),
            event_repeat: repeat,
            end_type: hasEndDate,
            end_date: formattedEndDate,
            is_active: initialSchedule?.is_active ?? true
        };

        if (isUpdate && initialSchedule?.id) {
            updateSchedule({ id: initialSchedule.id, ...scheduleData }, {
                onSuccess: () => {
                    Toast.show({
                        type: 'success',
                        text1: 'Success',
                        text2: 'Schedule updated successfully'
                    });
                    navigation.goBack();
                },
                onError: (error) => {
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: 'Unable to update schedule'
                    });
                    console.error('Error updating schedule:', error);
                }
            });
        } else {
            createSchedule(scheduleData, {
                onSuccess: () => {
                    Toast.show({
                        type: 'success',
                        text1: 'Success',
                        text2: 'New schedule added successfully'
                    });
                    navigation.goBack();
                },
                onError: (error) => {
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: 'Unable to add new schedule'
                    });
                    console.error('Error creating schedule:', error);
                }
            });
        }
    };

    const handleDelete = () => {
        if (initialSchedule?.id) {
            Toast.show({
                type: 'info',
                text1: 'Confirm',
                text2: 'Are you sure you want to delete this schedule?'
            });
            deleteSchedule(initialSchedule.id, {
                onSuccess: () => {
                    Toast.show({
                        type: 'success',
                        text1: 'Success',
                        text2: 'Schedule deleted successfully'
                    });
                    navigation.goBack();
                },
                onError: (error) => {
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: 'Unable to delete schedule'
                    });
                    console.error('Error deleting schedule:', error);
                }
            });
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
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
                        title={isUpdate ? "Update Schedule" : "Add Schedule"}
                        variant="save"
                        onSave={handleSave}
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
                                            isChosen={petId === pet.petid}
                                            onPress={() => setPetId(pet.petid || '')}
                                        />
                                    ))}
                                </ScrollView>
                            </View>

                            <Input
                                label="Title"
                                placeholder="Enter title"
                                value={title}
                                onChangeText={setTitle}
                            />

                            <Input
                                label="Note"
                                placeholder="Enter note"
                                value={note}
                                onChangeText={setNote}
                            />

                            <View style={styles.section}>
                                <Text style={styles.label}>Repeat</Text>
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
                                        label="Start Date"
                                        value={startDate}
                                        onChange={setStartDate}
                                        minimumDate={new Date()}
                                    />
                                </View>
                                <View style={styles.dateTimeItem}>
                                    <Text style={styles.label}>Start Time</Text>
                                    <TouchableOpacity
                                        style={styles.timeButton}
                                        onPress={() => setShowTimePicker(true)}
                                    >
                                        <Text style={styles.timeText}>
                                            {startTime ? formatTime(startTime) : 'Select time'}
                                        </Text>
                                        <MaterialIcons name="access-time" size={20} color={COLORS.text.default} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.label}>Has End Date</Text>
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
                                    label="End Date"
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
                            <Text style={styles.deleteButtonText}>Delete Schedule</Text>
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
                                        <Text style={styles.cancelButton}>Cancel</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.headerTitle}>Select Time</Text>
                                    <TouchableOpacity
                                        onPress={() => {
                                            if (startTime) {
                                                setStartTime(startTime);
                                            }
                                            setShowTimePicker(false);
                                        }}
                                    >
                                        <Text style={styles.doneButton}>Done</Text>
                                    </TouchableOpacity>
                                </View>
                                <DatePicker
                                    date={startTime || new Date()}
                                    mode="time"
                                    onDateChange={setStartTime}
                                    locale="en"
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
                                    <Text style={styles.modalTitle}>Select Repeat Frequency</Text>
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
