import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    StatusBar,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../theme/color';
import { useServices } from '../hook/useService';
import Header from '../component/header';
import { Service } from '../models/models';

const ServiceCard = ({ service, onPress }: { service: Service; onPress: () => void }) => (
    <TouchableOpacity 
        style={styles.serviceCard} 
        onPress={onPress}
        activeOpacity={0.7}
    >
        <View style={styles.cardHeader}>
            <View style={styles.mainInfo}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{service.category}</Text>
                </View>
            </View>
            <View style={styles.priceTag}>
                <Text style={styles.priceText}>${service.cost}</Text>
            </View>
        </View>
        
        <Text style={styles.serviceDescription} numberOfLines={2}>
            {service.description}
        </Text>
        
        <View style={styles.cardFooter}>
            <View style={styles.durationContainer}>
                <Text style={styles.durationText}>⏱ {service.duration} minutes</Text>
            </View>
            <TouchableOpacity style={styles.bookNowButton} onPress={onPress}>
                <Text style={styles.bookNowText}>Book Now</Text>
            </TouchableOpacity>
        </View>
    </TouchableOpacity>
);

const ClinicServicesScreen = () => {
    const navigation = useNavigation<any>();
    const { data: services, isLoading, error } = useServices();

    const handleBookAppointment = (service: Service) => {
        navigation.navigate('AddAppointment', { selectedService: service });
    };

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, Platform.OS === 'android' && styles.androidSafeArea]}>
                <Header title="Our Services" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.button.choose} />
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={[styles.container, Platform.OS === 'android' && styles.androidSafeArea]}>
                <Header title="Our Services" />
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Failed to load services</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <>
            <StatusBar
                barStyle="dark-content"
                backgroundColor={COLORS.background.gray}
            />
            <SafeAreaView style={[styles.container, Platform.OS === 'android' && styles.androidSafeArea]}>
                <Header title="Our Services" />
                <ScrollView 
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {services?.map((service: Service) => (
                        <ServiceCard
                            key={service.id}
                            service={service}
                            onPress={() => handleBookAppointment(service)}
                        />
                    ))}
                </ScrollView>
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    androidSafeArea: {
        paddingTop: StatusBar.currentHeight,
    },
    container: {
        flex: 1,
        backgroundColor: COLORS.background.gray,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        color: 'red',
    },
    serviceCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    mainInfo: {
        flex: 1,
        marginRight: 12,
    },
    serviceName: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text.text,
        marginBottom: 8,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 4,
        backgroundColor: COLORS.background.gray,
        borderRadius: 12,
    },
    categoryText: {
        fontSize: 12,
        color: COLORS.text.default,
        fontWeight: '500',
    },
    priceTag: {
        backgroundColor: COLORS.button.choose,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    priceText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    serviceDescription: {
        fontSize: 14,
        color: COLORS.text.default,
        lineHeight: 20,
        marginBottom: 16,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    durationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    durationText: {
        fontSize: 14,
        color: COLORS.text.default,
        fontWeight: '500',
    },
    bookNowButton: {
        backgroundColor: COLORS.button.choose + '15', // 15% opacity
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
    },
    bookNowText: {
        color: COLORS.button.choose,
        fontSize: 14,
        fontWeight: '600',
    },
});

export default ClinicServicesScreen;
