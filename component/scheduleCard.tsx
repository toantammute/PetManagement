import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme/color';
import { Schedule } from '../models/models';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AvaBtn from './avabtn';
import { useNavigation } from '@react-navigation/native';

interface ScheduleCardProps {
    schedule: Schedule;
    onToggle: (id: number, isActive: boolean) => void;
    petAvatar?: string;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({ schedule, onToggle, petAvatar }) => {
    const navigation = useNavigation<any>();

    const handlePress = () => {
        console.log("Navigating to AddSchedule with schedule:", schedule);
        navigation.navigate('AddSchedule', { 
            schedule: schedule,
            isUpdate: true 
        });
    };

    const handleToggle = (value: boolean) => {
        if (schedule.id) {
            onToggle(parseInt(schedule.id), value);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'Asia/Ho_Chi_Minh'
        });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
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
                return 'Hàng ngày';
            case 'weekly':
                return 'Hàng tuần';
            case 'monthly':
                return 'Hàng tháng';
            default:
                return 'Không lặp lại';
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
                                    Kết thúc: {new Date(schedule.end_date).toLocaleDateString('vi-VN', {
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