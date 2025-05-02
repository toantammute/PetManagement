import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Platform, StatusBar, SafeAreaView, ScrollView } from 'react-native';
import { Diary } from '../models/models';
import DatePicker from '../component/datepicker';
import Input from '../component/input';
import Header from '../component/header';
import Avatar from '../component/avabtn';
import { usePets } from '../hook/usePets';
import AvaBtn from '../component/avabtn';
import { useCreateDiary } from '../hook/useDiary';

const AddLog = () => {
    const { data: pets, isLoading, isError, error } = usePets();
    const createDiaryMutation = useCreateDiary();

    const [title, setTitle] = useState('');
    const [notes, setNotes] = useState('');
    const [dateTime, setDateTime] = useState<Date | null>(new Date());
    const [petId, setPetId] = useState('');
    const [selectedPet, setSelectedPet] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!title || !notes || !dateTime || !petId) {
            Alert.alert('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        try {
            await createDiaryMutation.mutateAsync({
                title,
                notes,
                date_time: dateTime.toISOString(),
                pet_id: petId
            });
            Alert.alert('Thành công', 'Đã thêm nhật ký mới');
            // Reset form
            setTitle('');
            setNotes('');
            setDateTime(new Date());
            setPetId('');
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể thêm nhật ký mới');
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
                <Header title="Add Daily Log" variant="save" onSave={handleSubmit} />
                <ScrollView style={styles.content}>
                    <View style={styles.form}>
                    <View style={styles.avatarList}>
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
                            value={notes}
                            onChangeText={setNotes}
                        />

                        <DatePicker
                            label="Ngày giờ"
                            value={dateTime}
                            onChange={setDateTime}
                            maximumDate={new Date()}
                        />
                    </View>
                </ScrollView>
            </SafeAreaView>
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
});

export default AddLog;
