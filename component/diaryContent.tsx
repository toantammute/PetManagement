import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme/color';
import AvaBtn from './avabtn';
import { usePetById } from '../hook/usePets';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Feather from 'react-native-vector-icons/Feather';

type RootStackParamList = {
    DiaryDetail: { diaryId: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DiaryDetail'>;

interface DiaryContentProps {
    title: string;
    description: string;
    date: string;
    onPress: () => void;
    petId: string;
    diaryId: string;
}

const DiaryContent: React.FC<DiaryContentProps> = ({title, description, date, onPress, petId, diaryId}) => {
    const { data: pet, isLoading } = usePetById(petId);
    const navigation = useNavigation<NavigationProp>();
    const handlePress = () => {
        navigation.navigate('DiaryDetail', { diaryId });
    };

    const formattedDate = new Date(date).toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const formattedTime = new Date(date).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Ho_Chi_Minh'
    });

    return (
        <TouchableOpacity style={styles.container} onPress={handlePress}>
            <View style={styles.infoContainer}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description}>{description}</Text>
            </View>
            {/* Line */}
            <View style={styles.line} />
            <View style={styles.dateContainer}>
                <View style={styles.dateTimeContainer}>
                    <Feather name="calendar" size={14} color={COLORS.text.textDisable} />
                    <Text style={styles.date}>{formattedDate}</Text>
                    <Feather name="clock" size={14} color={COLORS.text.textDisable} />
                    <Text style={styles.date}>{formattedTime}</Text>
                </View>
                
                <View style={styles.avaBtnContainer}>
                    {isLoading ? (
                        <AvaBtn 
                            variant="noava"
                            onPress={() => {}}
                            showPetName={false}
                            size={30}
                        />
                    ) : (
                        <Image 
                            source={{ uri: pet?.data_image ? `data:image/jpeg;base64,${pet.data_image}` : undefined }} 
                            style={styles.avatar}
                            defaultSource={require('../assets/images/bus.png')}
                        />
                    )}
                </View>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: 10,
        borderRadius: 5,
        backgroundColor: COLORS.background.white,
        alignSelf: 'stretch',
        width: '100%',
    },
    title: {
        fontSize: 16,
        fontWeight: 700,
        fontFamily: 'Poppins-Bold',
        fontStyle: 'normal',
        color: COLORS.text.default,
    },
    description: {
        fontSize: 14,
        fontWeight: 400,
        fontFamily: 'Poppins-Regular',
        fontStyle: 'normal',
        color: COLORS.text.default,
        flexWrap: 'wrap',
        width: '100%',
    },
    dateContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        alignSelf: 'stretch',
        height: 40,
    },
    dateTimeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    date: {
        fontSize: 14,
        fontWeight: 500,
        fontFamily: 'Poppins-Regular',
        fontStyle: 'normal',
        color: COLORS.text.textDisable,
    },
    avaBtnContainer: {
        height: '100%',
        alignItems: 'center',
    },
    infoContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
        alignItems: 'flex-start',
        alignSelf: 'stretch',
        minHeight: 'auto',
    },
    line: {
        flex: 1,
        display: 'flex',
        alignSelf: 'stretch',
        alignItems: 'flex-start',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border.mintbrd,
    },
    avatar: {
        width: 30,
        height: 30,
        borderRadius: 17.5,
    },
});

export default DiaryContent;
