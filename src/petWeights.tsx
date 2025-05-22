import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    ScrollView,
    SafeAreaView,
    StatusBar,
    Platform,
} from 'react-native';
import { COLORS } from '../theme/color';
import { LineChart } from 'react-native-chart-kit';
import { usePetWeightHistory } from '../hook/usePets';
import { useRoute } from '@react-navigation/native';
import Header from '../component/header';

interface WeightRecord {
    id: number;
    pet_id: number;
    weight_kg: number;
    weight_lb: number;
    recorded_at: string;
    created_at: string;
}

interface WeightHistory {
    pet_id: number;
    pet_name: string;
    current_weight: WeightRecord;
    weight_history: WeightRecord[];
    total_records: number;
    default_unit_type: string;
}

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
};

const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
};

const PetWeightsScreen = () => {
    const route = useRoute();
    const { petId } = route.params as { petId: string };
    const { data: weightHistory, isLoading } = usePetWeightHistory(petId);

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <Header title="Weight History" />
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!weightHistory?.weight_history?.length) {
        return (
            <SafeAreaView style={styles.container}>
                <Header title="Weight History" />
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No weight history available</Text>
                </View>
            </SafeAreaView>
        );
    }

    const typedWeightHistory = weightHistory as unknown as WeightHistory;
    
    // Sort weight history by date
    const sortedHistory = [...typedWeightHistory.weight_history].sort(
        (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
    );

    const chartData = {
        labels: sortedHistory.map(record => formatDate(record.recorded_at)),
        datasets: [{
            data: sortedHistory.map(record => record.weight_kg)
        }]
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

            <Header title="Weight History" />
            <ScrollView style={styles.content}>
                <View style={styles.chartCard}>
                    <Text style={styles.petName}>{typedWeightHistory.pet_name}</Text>
                    <Text style={styles.currentWeight}>
                        Current Weight: {typedWeightHistory.current_weight.weight_kg} kg
                    </Text>
                    <View style={styles.chartContainer}>
                        <LineChart
                            data={chartData}
                            width={Dimensions.get('window').width - 40}
                            height={220}
                            chartConfig={{
                                backgroundColor: '#ffffff',
                                backgroundGradientFrom: '#ffffff',
                                backgroundGradientTo: '#ffffff',
                                decimalPlaces: 1,
                                color: (opacity = 1) => COLORS.button.choose,
                                labelColor: (opacity = 1) => COLORS.text.default,
                                style: {
                                    borderRadius: 16,
                                },
                                propsForDots: {
                                    r: '6',
                                    strokeWidth: '2',
                                    stroke: COLORS.button.choose
                                }
                            }}
                            bezier
                            style={{
                                marginVertical: 8,
                                borderRadius: 16
                            }}
                        />
                    </View>
                </View>

                <View style={styles.historyCard}>
                    <Text style={styles.historyTitle}>Weight History</Text>
                    {sortedHistory.map((record, index) => (
                        <View key={record.id} style={styles.historyItem}>
                            <Text style={styles.historyDate}>
                                {formatFullDate(record.recorded_at)}
                            </Text>
                            <Text style={styles.historyWeight}>{record.weight_kg} kg</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background.gray,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    androidSafeArea: {
        paddingTop: StatusBar.currentHeight,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: COLORS.text.default,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.text.default,
    },
    chartCard: {
        backgroundColor: COLORS.background.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    petName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text.text,
        marginBottom: 8,
    },
    currentWeight: {
        fontSize: 16,
        color: COLORS.text.default,
        marginBottom: 16,
    },
    chartContainer: {
        alignItems: 'center',
    },
    historyCard: {
        backgroundColor: COLORS.background.white,
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    historyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text.text,
        marginBottom: 16,
    },
    historyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border.input,
    },
    historyDate: {
        fontSize: 14,
        color: COLORS.text.default,
    },
    historyWeight: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text.text,
    },
});

export default PetWeightsScreen;
