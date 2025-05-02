import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/color';

type Day = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
type Month = 'Jan' | 'Feb' | 'Mar' | 'Apr' | 'May' | 'Jun' | 'Jul' | 'Aug' | 'Sep' | 'Oct' | 'Nov' | 'Dec';
type Variant = 'today' | 'normal' | 'lastYear';

interface DiaryDateProps {
    day: Day;
    date: number;
    month: Month;
    year: number;
    variant: Variant;
}

const DiaryDate: React.FC<DiaryDateProps> = ({ day, date, month, year, variant }) => {
    return (
        <View style={styles.container}>
            <View style={[
                styles.dateContainer,
                variant === 'today' && styles.todayContainer
            ]}>
                <Text style={[
                    styles.dayText,
                    variant === 'today' && styles.todayText
                ]}>
                    {day}
                </Text>
                <Text style={[
                    styles.dateText,
                    variant === 'today' && styles.todayText
                ]}>
                    {date}
                </Text>
                <Text style={[
                    styles.monthText,
                    variant === 'today' && styles.todayText
                ]}>
                    {month}
                </Text>
            </View>
            {variant === 'lastYear' && (
                <Text style={styles.yearText}>{year}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
    },
    dateContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 8,
        borderRadius: 8,
    },
    todayContainer: {
        backgroundColor: COLORS.background.darkBlue,
    },
    dayText: {
        fontSize: 12,
        color: COLORS.text.default,
        fontWeight: '500',
    },
    dateText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text.default,
    },
    monthText: {
        fontSize: 12,
        color: COLORS.text.default,
    },
    todayText: {
        color: 'white',
    },
    yearText: {
        fontSize: 12,
        color: COLORS.text.default,
        fontWeight: '500',
    }
});

export default DiaryDate;
