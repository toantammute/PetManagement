import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { COLORS } from '../theme/color';
import AvaBtn from './avabtn';
import { usePetById } from '../hook/usePets';

interface DiaryContentProps {
    title: string;
    description: string;
    date: string;
    onPress: () => void;
    petId: string;
}

const DiaryContent: React.FC<DiaryContentProps> = ({title, description, date, onPress, petId}) => {
    const { data: pet, isLoading } = usePetById(petId);

    return (
        <View style={styles.container}>
            <View style={styles.infoContainer}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description}>{description}</Text>
            </View>
            {/* Line */}
            <View style={styles.line} >
            </View>
            <View style={styles.dateContainer}>
                <Text style={styles.date}>{date}</Text>
                
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
        </View>
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
    date: {
        fontSize: 14,
        fontWeight: 500,
        fontFamily: 'Poppins-Regular',
        fontStyle: 'normal',
        textAlign: 'center',
        color: COLORS.text.default,
        alignSelf: 'center',
    },
    dateContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        alignSelf: 'stretch',
        height: 40,
    },
    avaBtnContainer: {
        height: '100%',
        alignItems: 'center',
    },
    infoContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap:5,
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
        width:30,
        height: 30,
        borderRadius: 17.5,
    },
})

export default DiaryContent;
