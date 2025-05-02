import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/color';
import Avatar from './avabtn';
import Feather from 'react-native-vector-icons/Feather';
import { Appointment } from '../models/models';

interface AppointmentCardProps {
    appointment: Appointment;
}

const AppointmentCard = ({ appointment }: AppointmentCardProps) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        
        return {
            day: days[date.getDay()],
            date: date.getDate().toString(),
            month: months[date.getMonth()],
        };
    };

    const { day, date, month } = formatDate(appointment.date);
    const time = appointment.time_slot.start_time.split(':').slice(0, 2).join(':');

    return (
        <View style={styles.container}>
            {/* top */}
            <View style={styles.topContainer}>
                {/* left */}
                <View style={styles.dateContainer}>
                    <Text style={styles.day}>{day}</Text>
                    <Text style={styles.date}>{date}</Text>
                    <Text style={styles.month}>{month}</Text>
                </View>
                {/* right */}
                <View style={styles.rightContainer}>
                    <View style={styles.statusContainer}>
                        {/* <Text style={styles.status}>PENDING CONFIRMATION</Text> */}
                        <Text style={[
                            styles.status,
                            { backgroundColor: appointment.state === 'CANCELLED' ? '#FF3B30' : '#f8941A' }
                        ]}>
                            {appointment.state.toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.infoContainer}>
                        <Text style={styles.serviceText}>{appointment.service.service_name}</Text>
                        <Text style={styles.timeText}>{time}</Text>
                    </View>
                    <View style={styles.petContainer}>
                        <View style={styles.avaBtnContainer}>
                            <Avatar
                                variant='noava'
                                onPress={() => { }}
                                size={30}
                            />
                        </View>

                        <Text style={styles.petName}>{appointment.pet.pet_name}</Text>
                    </View>
                </View>
            </View>
            {/* line */}
            <View style={styles.line}>
            </View>
            {/* middle */}
            <View style={styles.doctorContainer}>
                <View style={styles.doctorAvaContainer}>
                    <Avatar
                        variant='noava'
                        onPress={() => { }}
                        size={30}
                    />
                </View>

                <Text style={styles.doctorName}>{appointment.doctor.doctor_name}</Text>
            </View>
            {/* line */}
            <View style={styles.line}>
            </View>
            {/* bottom */}
            <View style={styles.bottomContainer}>
                <View>
                    <Feather name='info' size={25} color={COLORS.button.choose} />
                </View>

                <Text style={styles.bottomText}>
                    Appointment requested by {appointment.owner.owner_name} on {appointment.created_at}
                </Text>


            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        alignSelf: 'stretch',
        gap: 12,
        // flex: 1,
        backgroundColor: 'white',
        width: '100%',
    },
    line: {
        flex: 1,
        display: 'flex',
        alignSelf: 'stretch',
        alignItems: 'flex-start',
        borderBottomWidth: 1,
        borderBottomColor: '#ECECEC',
    },
    dateContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        paddingTop: 5,
        paddingBottom: 10,
        paddingHorizontal: 10,
        borderTopLeftRadius: 10,
        borderBottomRightRadius: 20,
        backgroundColor: COLORS.background.darkBlue,
    },
    day: {
        fontSize: 12,
        fontWeight: 400,
        color: 'white',
        fontFamily: 'Poppins-Regular',
        fontStyle: 'normal',
        textAlign: 'center',
        display: 'flex',
        paddingHorizontal: 3,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    date: {
        fontSize: 18,
        fontWeight: 700,
        color: 'white',
        fontFamily: 'Poppins-Regular',
        fontStyle: 'normal',
        display: 'flex',
        paddingHorizontal: 3,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    month: {
        fontSize: 12,
        fontWeight: 400,
        color: 'white',
        fontFamily: 'Poppins-Regular',
        fontStyle: 'normal',
        textAlign: 'center',
        display: 'flex',
        paddingHorizontal: 3,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    status: {
        color: 'white',
        textAlign: 'center',
        fontSize: 12,
        fontWeight: 400,
        fontFamily: 'Poppins-Regular',
        fontStyle: 'normal',
        display: 'flex',
        paddingHorizontal: 15,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 3,
        borderTopRightRadius: 10,
        borderBottomLeftRadius: 10,
        backgroundColor: '#f8941A',
    },
    statusContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        alignSelf: 'stretch',
    },
    infoContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        alignSelf: 'stretch',
        gap: 5,
    },
    petName: {
        fontSize: 16,
        fontWeight: 400,
        color: COLORS.text.text,
        fontFamily: 'Poppins-Regular',
        fontStyle: 'normal',
        textAlign: 'center',
        alignItems: 'center',
    },
    petContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'stretch',
        height: 25,
        gap: 11
    },
    avaBtnContainer: {
        height: '100%',
        alignItems: 'center',
    },
    rightContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 10,
        flex: 1,
    },
    topContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        alignSelf: 'stretch',
        gap: 13
    },
    serviceText: {
        fontSize: 18,
        fontWeight: 700,
        color: COLORS.text.text,
        fontFamily: 'Poppins-Regular',
        fontStyle: 'normal',
    },
    timeText: {
        fontSize: 16,
        fontWeight: 400,
        color: COLORS.text.text,
        fontFamily: 'Poppins-Regular',
        fontStyle: 'normal',
    },
    doctorContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'stretch',
        height: 25,
        gap: 11,
        paddingHorizontal: 15,
    },
    doctorAvaContainer: {
        height: '100%',
        alignItems: 'center',
    },
    doctorName: {
        fontSize: 16,
        fontWeight: 400,
        color: COLORS.text.text,
        fontFamily: 'Poppins-Regular',
        fontStyle: 'normal',
        textAlign: 'center',
        alignItems: 'center',
    },
    bottomContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'stretch',
        paddingHorizontal: 15,
        gap: 10,
        paddingBottom: 8,
    },
    bottomText: {
        fontSize: 12,
        fontWeight: 400,
        color: COLORS.text.textDisable,
        fontFamily: 'Poppins-Regular',
        fontStyle: 'normal',
        display: 'flex',
        paddingHorizontal: 10,
        // padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        // gap: 10,
        flex: 1,
    },

});

export default AppointmentCard;
