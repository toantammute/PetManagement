import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/color';
import DiaryDate from './diaryDate';
import DiaryContent from './diaryContent';
import { Diary } from '../models/models';

type Day = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
type Month = 'Jan' | 'Feb' | 'Mar' | 'Apr' | 'May' | 'Jun' | 'Jul' | 'Aug' | 'Sep' | 'Oct' | 'Nov' | 'Dec';

interface DiaryCardProps {
    diary: Diary;
}

const DiaryCard = ({diary}: DiaryCardProps) => {
    const diaryDate = new Date(diary.date_time);
    const day = diaryDate.toLocaleDateString('en-US', { weekday: 'short' }) as Day;
    const month = diaryDate.toLocaleDateString('en-US', { month: 'short' }) as Month;
    const dayNumber = diaryDate.getDate();
    const year = diaryDate.getFullYear();

    return (
        <View style={styles.container}>
            {/* <DiaryContent title="Title" description="Description" date="2025-01-01" onPress={() => {}} /> */}
            <DiaryDate 
                day={day} 
                date={dayNumber} 
                month={month} 
                year={year} 
                variant="today" 
            />
            <View style={styles.contentContainer}>
                <DiaryContent 
                    title={diary.title} 
                    description={diary.notes} 
                    date={diary.date_time} 
                    onPress={() => {}} 
                    petId={diary.pet_id}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap:5,
        alignSelf: 'stretch',
    },
    contentContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        flex: 1,
        flexDirection: 'column',
        gap: 10,
        alignItems: 'flex-start',
        alignSelf: 'stretch',
    },
});

export default DiaryCard;
