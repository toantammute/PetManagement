import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    StatusBar,
    Platform,
} from 'react-native';
import { useCreateVaccination } from '../hook/useVaccination';
import Input from '../component/input';
import DateInput from '../component/datepicker';
import { COLORS } from '../theme/color';
import Header from '../component/header';
import { useNavigation, useRoute } from '@react-navigation/native';

const AddVaccinationScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { petId } = route.params as { petId: string };

    const [vaccineName, setVaccineName] = useState('');
    const [vaccineDate, setVaccineDate] = useState<Date | null>(new Date());
    const [nextDueDate, setNextDueDate] = useState<Date | null>(new Date());
    const [notes, setNotes] = useState('');

    const createVaccinationMutation = useCreateVaccination(petId);

    const handleSubmit = () => {
        if (!vaccineDate || !nextDueDate || !vaccineName.trim()) {
            // You might want to show an error message here
            return;
        }

        const data = {
            pet_id: petId,
            vaccine_name: vaccineName,
            date_administered: vaccineDate.toISOString(),
            next_due_date: nextDueDate.toISOString(),
            notes: notes,
        };

        createVaccinationMutation.mutate(data, {
            onSuccess: () => {
                navigation.goBack();
            },
        });
    };

    return (
        <>
            <StatusBar
                barStyle="dark-content"
                backgroundColor={COLORS.background.gray}
            />
            <SafeAreaView style={[
                styles.container,
                Platform.OS === 'android' && styles.androidSafeArea
            ]}>
            <Header 
                title="Add Vaccination" 
                variant="save"
                onSave={handleSubmit}
            />
            
            <ScrollView style={styles.container}>
                <View style={styles.content}>
                    <Input
                        label="Vaccine Name"
                        placeholder="Enter vaccine name"
                        value={vaccineName}
                        onChangeText={setVaccineName}
                    />

                    <DateInput
                        label="Vaccination Date"
                        value={vaccineDate}
                        onChange={setVaccineDate}
                        placeholder="Select vaccination date"
                        maximumDate={new Date()}
                    />

                    <DateInput
                        label="Next Due Date"
                        value={nextDueDate}
                        onChange={setNextDueDate}
                        placeholder="Select next due date"
                        minimumDate={new Date()}
                    />

                    <Input
                        label="Notes"
                        placeholder="Enter any additional notes"
                        value={notes}
                        onChangeText={setNotes}
                        inputStyle={styles.textArea}
                    />
                </View>
            </ScrollView>
            </SafeAreaView>

        </>
        
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background.white,
    },
    container: {
        flex: 1,
    },
    content: {
        padding: 20,
        gap: 6,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    androidSafeArea: {
        paddingTop: StatusBar.currentHeight,
    },
});

export default AddVaccinationScreen;
