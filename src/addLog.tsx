import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, StatusBar, SafeAreaView, ScrollView, Text } from 'react-native';
import { Diary } from '../models/models';
import DatePicker from '../component/datepicker';
import Input from '../component/input';
import Header from '../component/header';
import { usePets } from '../hook/usePets';
import AvaBtn from '../component/avabtn';
import { useCreateDiary, useUpdateDiary } from '../hook/useDiary';
import Toast from 'react-native-toast-message';
import { COLORS } from '../theme/color';
import { useRoute, useNavigation } from '@react-navigation/native';

const AddLog = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { isEditMode, diary, diaryId } = route.params as any || {};
    
    const { data: pets, isLoading, isError, error } = usePets();
    const createDiaryMutation = useCreateDiary();
    const updateDiaryMutation = useUpdateDiary();

    const [title, setTitle] = useState('');
    const [notes, setNotes] = useState('');
    const [dateTime, setDateTime] = useState<Date | null>(new Date());
    const [petId, setPetId] = useState('');

    // Điền dữ liệu khi ở chế độ chỉnh sửa
    useEffect(() => {
        if (isEditMode && diary) {
            setTitle(diary.title || '');
            setNotes(diary.notes || '');
            
            if (diary.date_time) {
                setDateTime(new Date(diary.date_time));
            }
            
            if (diary.pet_id) {
                setPetId(diary.pet_id);
            }
        }
    }, [isEditMode, diary]);

    const handleSubmit = async () => {
        if (!title || !notes || !dateTime || !petId) {
            Toast.show({
                type: 'error',
                text1: 'Vui lòng điền đầy đủ thông tin',
            });
            return;
        }

        const diaryData = {
            title,
            notes,
            date_time: dateTime.toISOString(),
            pet_id: petId
        };

        try {
            if (isEditMode && diaryId) {
                // Chế độ chỉnh sửa
                await updateDiaryMutation.mutateAsync({
                    ...diaryData,
                    log_id: diaryId
                });
                Toast.show({
                    type: 'success',
                    text1: 'Thành công',
                    text2: 'Đã cập nhật nhật ký',
                });
                navigation.goBack();
            } else {
                // Chế độ thêm mới
                await createDiaryMutation.mutateAsync(diaryData);
                Toast.show({
                    type: 'success',
                    text1: 'Thành công',
                    text2: 'Đã thêm nhật ký mới',
                });
                // Reset form
                setTitle('');
                setNotes('');
                setDateTime(new Date());
                setPetId('');
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Không thể xử lý nhật ký',
            });
        }
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
                    title={isEditMode ? "Edit Diary" : "Add Daily Log"} 
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
                                        isChosen={petId === pet.petid}
                                        onPress={() => setPetId(pet.petid || '')}
                                    />
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                

                <Input
                    label="Title"
                    placeholder="Enter title"
                    value={title}
                    onChangeText={setTitle}
                />

                <Input
                    label="Notes"
                    placeholder="Enter notes"
                    value={notes}
                    onChangeText={setNotes}
                />

                <DatePicker
                    label="Date and Time"
                    value={dateTime}
                    onChange={setDateTime}
                    maximumDate={new Date()}
                />
                </ScrollView>

            </SafeAreaView >
        </>
    )

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    androidSafeArea: {
        paddingTop: StatusBar.currentHeight,
        backgroundColor: '#fff',
    },
    avatarList: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    content: {
        padding: 20,
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.text.textChoose,
        marginBottom: 8,
    },
    avatarScroll: {
        flexGrow: 0,
        gap: 15,
    },
});

export default AddLog;
