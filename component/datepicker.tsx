import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { COLORS } from '../theme/color';
import DatePicker from 'react-native-date-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface DateInputProps {
    label: string;
    value: Date | null;
    onChange: (date: Date) => void;
    placeholder?: string;
    minimumDate?: Date;
    maximumDate?: Date;
}

const DateInput: React.FC<DateInputProps> = ({
    label,
    value,
    onChange,
    placeholder = "Choose a date",
    minimumDate,
    maximumDate
}) => {
    const [open, setOpen] = useState(false);
    const today = new Date();

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const handleConfirm = (selectedDate: Date) => {
        onChange(selectedDate);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity 
                style={styles.input}
                onPress={() => setOpen(true)}
            >
                <Text style={[
                    styles.inputText,
                    !value && styles.placeholder
                ]}>
                    {value ? formatDate(value) : placeholder}
                </Text>
                <Icon name="calendar-today" size={20} color={COLORS.text.default} />
            </TouchableOpacity>

            <Modal
                transparent={true}
                visible={open}
                animationType="fade"
                onRequestClose={() => setOpen(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setOpen(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.datePickerHeader}>
                            <TouchableOpacity onPress={() => setOpen(false)}>
                                <Text style={styles.cancelButton}>Cancle</Text>
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>Choose a date</Text>
                            <TouchableOpacity 
                                onPress={() => {
                                    if (value) {
                                        handleConfirm(value);
                                    }
                                    setOpen(false);
                                }}
                            >
                                <Text style={styles.doneButton}>Complete</Text>
                            </TouchableOpacity>
                        </View>
                        <DatePicker
                            date={value || today}
                            mode="date"
                            minimumDate={minimumDate}
                            maximumDate={maximumDate}
                            onDateChange={onChange}
                            locale="vi"
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        // marginBottom: 6,
        color: COLORS.text.textChoose,
        lineHeight: 20,
        letterSpacing: -0.28,
    },
    input: {
        
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: COLORS.background.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.border.input,
    },
    inputText: {
        fontSize: 16,
        color: COLORS.text.text,
    },
    placeholder: {
        color: '#757575',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
    },
    datePickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border.input,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text.text,
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
});

export default DateInput;