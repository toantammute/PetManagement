import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme/color';
import { Schedule } from '../models/models';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AvaBtn from './avabtn';
import { useNavigation } from '@react-navigation/native';
import { useToggleSchedule } from '../hook/useSchedule';
import Toast from 'react-native-toast-message';

interface ScheduleCardProps {
    schedule: Schedule;
    onToggle: (id: number, isActive: boolean) => void;
    petAvatar?: string;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({ schedule, onToggle, petAvatar }) => {
    const navigation = useNavigation<any>();
    const { mutate: toggleScheduleActive, isPending } = useToggleSchedule();

    const handlePress = () => {
        console.log("Navigating to AddSchedule with schedule:", schedule);
        navigation.navigate('AddSchedule', { 
            schedule: schedule,
            isUpdate: true 
        });
    };

    const handleToggle = (value: boolean) => {
        if (!schedule.id) return;
        
        const scheduleId = schedule.id.toString();
        
        // Gọi onToggle cho tương thích ngược với component cha
        onToggle(parseInt(scheduleId), value);
        
        // Thêm một setTimeout để đảm bảo UI được cập nhật trước
        setTimeout(() => {
            console.log('Đang gọi API để cập nhật trạng thái cho Schedule ID:', scheduleId);
            
            // Gọi API để cập nhật trạng thái với ID dạng string
            toggleScheduleActive(
                { id: scheduleId, isActive: value },
                {
                    onSuccess: (data) => {
                        console.log('Cập nhật trạng thái thành công:', data);
                        console.log('Trạng thái mới:', value ? 'Đã kích hoạt' : 'Đã vô hiệu hóa');
                        
                        Toast.show({
                            type: 'success',
                            text1: 'Thành công',
                            text2: value ? 'Đã kích hoạt lịch nhắc nhở' : 'Đã vô hiệu hóa lịch nhắc nhở',
                            position: 'bottom'
                        });
                        
                        // Force refresh the schedule list
                        if (onToggle) {
                            onToggle(parseInt(scheduleId), value);
                        }
                    },
                    onError: (error) => {
                        console.error('Lỗi khi cập nhật trạng thái:', error);
                        // Đã thất bại, cần khôi phục trạng thái toggle
                        if (onToggle) {
                            onToggle(parseInt(scheduleId), !value); // Đảo ngược lại
                        }
                        
                        Toast.show({
                            type: 'error',
                            text1: 'Lỗi',
                            text2: 'Không thể cập nhật trạng thái. Vui lòng thử lại sau.',
                            position: 'bottom'
                        });
                    }
                }
            );
        }, 0);
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'Asia/Ho_Chi_Minh'
        });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: 'Asia/Ho_Chi_Minh'
        });
    };

    const getRepeatText = (repeat: string) => {
        switch (repeat) {
            case 'daily':
                return 'Daily';
            case 'weekly':
                return 'Weekly';
            case 'monthly':
                return 'Monthly';
            default:
                return 'None';
        }
    };

    return (
        <TouchableOpacity style={styles.container} onPress={handlePress}>
            <View style={styles.header}>
                <View style={styles.timeContainer}>
                    <Text style={styles.time}>{formatTime(schedule.reminder_datetime)}</Text>
                    <Text style={styles.date}>{formatDate(schedule.reminder_datetime)}</Text>
                </View>
                <Switch
                    value={schedule.is_active}
                    onValueChange={handleToggle}
                    trackColor={{ false: COLORS.border.input, true: COLORS.button.choose }}
                    thumbColor={COLORS.background.white}
                />
            </View>

            <View style={styles.line} ></View>

            <View style={styles.content}>
                <View style={styles.leftContent}>
                    <Text style={styles.title}>{schedule.title}</Text>
                    <View style={styles.detailsContainer}>
                        <View style={styles.detailRow}>
                            <MaterialIcons name="repeat" size={20} color={COLORS.text.textDisable} />
                            <Text style={styles.detailText}>{getRepeatText(schedule.event_repeat)}</Text>
                        </View>
                        {schedule.end_date && schedule.end_date !== "0001-01-01T00:00:00Z" && (
                            <View style={styles.detailRow}>
                                <MaterialIcons name="event" size={20} color={COLORS.text.textDisable} />
                                <Text style={styles.detailText}>
                                    End: {new Date(schedule.end_date).toLocaleDateString('en-US', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                        timeZone: 'Asia/Ho_Chi_Minh'
                                    })}
                                </Text>
                            </View>
                        )}
                        {schedule.notes && (
                            <View style={styles.detailRow}>
                                <MaterialIcons name="notes" size={20} color={COLORS.text.textDisable} />
                                <Text style={styles.detailText}>{schedule.notes}</Text>
                            </View>
                        )}
                    </View>
                </View>
                
                <View style={styles.rightContent}>
                    {petAvatar && (
                        <AvaBtn
                            variant="default"
                            onPress={() => {}}
                            showPetName={false}
                            size={32}
                            imageUrl={petAvatar}
                        />
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.background.white,
        borderRadius: 12,
        // borderWidth: 1,
        // borderColor: COLORS.border.input,
        // shadowColor: '#000',
        // shadowOffset: {
        //     width: 0,
        //     height: 2,
        // },
        // shadowOpacity: 0.1,
        // shadowRadius: 3,
        // elevation: 3,
    },
    line: {
        flex: 1,
        display: 'flex',
        alignSelf: 'stretch',
        alignItems: 'flex-start',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border.mintbrd,
        // paddingHorizontal: 50
        marginHorizontal: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        // borderBottomWidth: 1,
        // borderBottomColor: COLORS.border.mintbrd,
    },
    timeContainer: {
        alignItems: 'flex-start',
    },
    time: {
        fontSize: 24,
        fontWeight: '600',
        color: COLORS.text.text,
    },
    date: {
        fontSize: 14,
        color: COLORS.text.textDisable,
        marginTop: 4,
    },
    content: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingVertical: 5,
        gap: 10,
    },
    leftContent: {
        flex: 1,
        gap: 5,
    },
    rightContent: {
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text.text,
    },
    detailsContainer: {
        gap: 5,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailText: {
        fontSize: 14,
        color: COLORS.text.textDisable,
        marginLeft: 8,
        flex: 1,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
});

export default ScheduleCard; 