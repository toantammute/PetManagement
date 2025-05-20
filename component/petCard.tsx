import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES } from '../theme/color';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import AvaBtn from './avabtn';
import FuncBtn from './funcbtn';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import PetDetail from '../src/petDetail';
import { Pet } from '../models/models';

interface PetCardProps {
    pet: Pet;
}

const PetCard: React.FC<PetCardProps> = ({ pet }) => {
    const navigation = useNavigation<any>();
    return (
        <View style={styles.cardContainer}>
            {/* Top */}
            <View style={styles.infoContainer}>
                <View style={styles.topContainer}>
                    <View style={styles.avaNameContainer}>
                        {/* Avatar */}
                        <AvaBtn
                            variant={pet.data_image ? "default" : "noava"}
                            onPress={() => { }}
                            showPetName={false}
                            size={48}
                            imageUrl={pet.data_image ? `data:image/jpeg;base64,${pet.data_image}` : undefined}
                        />
                        <View style={styles.nameContainer}>
                            <Text style={styles.petNameText}>{pet.name}</Text>
                            <Text style={styles.petBreedText}>{pet.breed}</Text>
                        </View>
                    </View>
                    <View style={styles.kgContainer}>
                        <Text style={styles.kgText}>{pet.weight} kg</Text>
                    </View>
                </View>
                <View style={styles.bottomInfo}>
                    <Text style={styles.bottomInfoText}>
                        {pet.birth_date 
                            ? new Date(pet.birth_date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : 'N/A'
                        }
                    </Text>
                    <Text style={styles.bottomInfoText}>Allergies: None</Text>
                </View>

            </View>
            {/* Bottom */}
            <View style={styles.bottomContainer}>
                <TouchableOpacity style={styles.buttonContainer} onPress={() => navigation.navigate('AddVaccination', { petId: pet.petid })}>
                    <Fontisto name="injection-syringe" size={28} color={COLORS.button.choose} />
                    <Text style={styles.text}>Add Vaccination</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonContainer} onPress={() => navigation.navigate('PetDetail', { petId: pet.petid })}>
                    <Ionicons name="paw-outline" size={28} color={COLORS.button.choose} />
                    <Text style={styles.text}>View Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonContainer} onPress={() => navigation.navigate('PetWeights', { petId: pet.petid })}>
                    {/* <Ionicons name="calendar-outline" size={28} color={COLORS.button.choose} /> */}
                    <MaterialCommunityIcons name="chart-line" size={28} color={COLORS.button.choose} />
                    <Text style={styles.text}>Pet Weight</Text>
                </TouchableOpacity>

            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    cardContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        alignSelf: 'stretch',
        alignItems: 'flex-start',
    },
    kgContainer: {
        display: 'flex',
        paddingVertical: 5,
        paddingHorizontal: 5,
        alignItems: 'center',
        borderRadius: 5,
        backgroundColor: COLORS.background.lightBlue,
    },
    kgText: {
        color: 'black',
        textAlign: 'center',
        fontFamily: 'Poppins-Regular',
        fontStyle: 'normal',
        fontSize: 14,
        fontWeight: 700,
    },
    petNameText: {
        color: 'black',
        fontFamily: 'Poppins-Regular',
        fontStyle: 'normal',
        fontSize: 16,
        fontWeight: 700,
    },
    petBreedText: {
        color: COLORS.text.default,
        textAlign: 'center',
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        fontWeight: 500,
        fontStyle: 'normal',
    },
    nameContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        alignItems: 'flex-start',
    },
    avaNameContainer: {
        display: 'flex',
        flexDirection: 'row',
        gap: 6,
        alignItems: 'flex-start',
    },
    topContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        alignSelf: 'stretch',
    },
    infoContainer: {
        display: 'flex',
        flexDirection: 'column',
        // gap: 5,
        alignItems: 'flex-start',
        paddingVertical: 10,
        paddingHorizontal: 15,
        alignSelf: 'stretch',
        borderRadius: 10,
        backgroundColor: COLORS.background.white,
    },
    bottomContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        alignSelf: 'stretch',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: COLORS.background.white,
    },
    buttonContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: 7,
        alignItems: 'center',
    },
    text: {
        color: COLORS.text.default,
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
        fontWeight: 600,
        textAlign: 'center',
        alignSelf: 'center',
        fontStyle: 'normal',
    },
    buttonText: {
        color: COLORS.text.default,
        fontFamily: 'Poppins-Regular',
        fontSize: 10,
        fontWeight: 500,
    },
    bottomInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        alignItems: 'flex-start',
        paddingLeft: 5
    },
    bottomInfoText: {
        color: COLORS.text.text,
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        fontWeight: 600,
        fontStyle: 'normal',
    },

})

export default PetCard;
