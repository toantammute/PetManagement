import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Diary } from '../models/models';
import DiaryContent from './diaryContent';
import DiaryDate from './diaryDate';

interface DiaryListProps {
    diaries: Diary[];
}

const DiaryList: React.FC<DiaryListProps> = ({ diaries }) => {
    // Hàm nhóm nhật ký theo ngày
    const groupDiariesByDate = (diaries: Diary[]) => {
        const grouped: { [key: string]: Diary[] } = {};
        
        diaries.forEach(diary => {
            const date = new Date(diary.date_time);
            const dateKey = date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(diary);
        });
        
        return grouped;
    };

    const groupedDiaries = groupDiariesByDate(diaries);
    const sortedDates = Object.keys(groupedDiaries).sort((a, b) => 
        new Date(b.split('/').reverse().join('-')).getTime() - 
        new Date(a.split('/').reverse().join('-')).getTime()
    );

    return (
        <View style={styles.container}>
            {sortedDates.map(date => {
                const currentDate = new Date(date.split('/').reverse().join('-'));
                const day = currentDate.toLocaleDateString('en-US', { weekday: 'short' });
                const month = currentDate.toLocaleDateString('en-US', { month: 'short' });
                const dayNumber = currentDate.getDate();
                const year = currentDate.getFullYear();
                const isToday = new Date().toDateString() === currentDate.toDateString();
                const isLastYear = year < new Date().getFullYear();

                return (
                    <View key={date} style={styles.dateGroup}>
                        <DiaryDate 
                            day={day as any}
                            date={dayNumber}
                            month={month as any}
                            year={year}
                            variant={isToday ? 'today' : isLastYear ? 'lastYear' : 'normal'}
                        />
                        <View style={styles.diariesContainer}>
                            {groupedDiaries[date].map(diary => (
                                <DiaryContent
                                    key={diary.log_id}
                                    title={diary.title}
                                    description={diary.notes}
                                    date={diary.date_time}
                                    onPress={() => {}}
                                    petId={diary.pet_id}
                                />
                            ))}
                        </View>
                    </View>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // padding: 10,
    },
    dateGroup: {
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    diariesContainer: {
        flex: 1,
        gap: 10,
    },
});

export default DiaryList; 