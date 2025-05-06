import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Image, Animated, Platform, StatusBar } from 'react-native';
import { useOrderHistory } from '../hook/useCart';
import { useGetAppointmentHistory } from '../hook/useAppointment';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SIZES } from '../theme/color';
import { useNavigation } from '@react-navigation/native';
import { usePets } from '../hook/usePets';
import TabBar from '../component/tabbar';

interface OrderItem {
    id: number;
    cart_id: number;
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
}

interface Order {
    order_id: string;
    user_id: string;
    payment_status: string;
    order_date: string;
    total_amount: number;
    shipping_address: string;
    cart_items: OrderItem[];
}

interface OrderHistoryResponse {
    data: Order[];
}

interface Appointment {
    id: string;
    date: string;
    time: string;
    status: string;
    service_name: string;
    doctor_name: string;
    clinic_name: string;
    clinic_address: string;
    notes?: string;
    pet: {
        pet_id: string;
        name: string;
        image?: string;
    };
}

type TabType = 'orders' | 'appointments';

const HistoryScreen = () => {
    const navigation = useNavigation();
    const { data: orderHistory, isLoading: isOrderLoading, error: orderError, refetch: refetchOrders } = useOrderHistory();
    const { data: pets, isLoading: petsLoading } = usePets();
    const [activeTab, setActiveTab] = useState<TabType>('orders');
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
    const [expandedAppointmentId, setExpandedAppointmentId] = useState<string | null>(null);
    const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [animation] = useState(new Animated.Value(0));

    const { data: appointmentHistory, isLoading: isAppointmentLoading, error: appointmentError, refetch: refetchAppointments } = 
        useGetAppointmentHistory(selectedPetId || '');

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
        
        // When switching to appointments tab, ensure a pet is selected if available
        if (tab === 'appointments' && !selectedPetId && pets && pets.length > 0) {
            setSelectedPetId(pets[0].petid || null);
        }
    };

    // Set default pet when pets data is loaded and no pet is selected
    useEffect(() => {
        if (!selectedPetId && pets && pets.length > 0) {
            setSelectedPetId(pets[0].petid || null);
        }
    }, [pets, selectedPetId]);

    // Ensure we have a pet selected when switching to appointments tab if possible
    useEffect(() => {
        if (activeTab === 'appointments' && !selectedPetId && pets && pets.length > 0) {
            setSelectedPetId(pets[0].petid || null);
        }
    }, [activeTab, pets, selectedPetId]);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        if (activeTab === 'orders') {
            refetchOrders().finally(() => setRefreshing(false));
        } else {
            refetchAppointments().finally(() => setRefreshing(false));
        }
    }, [activeTab, refetchOrders, refetchAppointments]);

    const toggleOrderExpansion = (id: string) => {
        const isExpanding = expandedOrderId !== id;

        Animated.timing(animation, {
            toValue: isExpanding ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
        }).start();

        setExpandedOrderId(expandedOrderId === id ? null : id);
    };

    const toggleAppointmentExpansion = (id: string) => {
        const isExpanding = expandedAppointmentId !== id;

        Animated.timing(animation, {
            toValue: isExpanding ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
        }).start();

        setExpandedAppointmentId(expandedAppointmentId === id ? null : id);
    };

    const getStatusIcon = (status: string | undefined) => {
        if (!status) return 'help-circle-outline';

        switch (status.toLowerCase()) {
            case 'completed':
                return 'check-circle';
            case 'pending':
                return 'clock-outline';
            case 'cancelled':
                return 'close-circle';
            default:
                return 'help-circle-outline';
        }
    };

    const getStatusColor = (status: string | undefined) => {
        if (!status) return COLORS.text.textDisable;

        switch (status.toLowerCase()) {
            case 'completed':
                return COLORS.status.success;
            case 'pending':
                return COLORS.status.pending;
            case 'cancelled':
                return COLORS.status.cancel;
            default:
                return COLORS.text.textDisable;
        }
    };

    const renderOrderItem = ({ item }: { item: Order }) => {
        const isExpanded = expandedOrderId === item.order_id;
        const statusColor = getStatusColor(item.payment_status);
        const statusIcon = getStatusIcon(item.payment_status);

        return (
            <TouchableOpacity
                style={[styles.orderCard, isExpanded && styles.expandedCard]}
                onPress={() => toggleOrderExpansion(item.order_id)}
                activeOpacity={0.8}
            >
                <View style={styles.orderHeader}>
                    <Text style={styles.orderId}>Order #{item.order_id}</Text>
                    <Text style={styles.orderDate}>{new Date(item.order_date).toLocaleDateString()}</Text>
                </View>

                <View style={styles.orderDetails}>
                    <View style={styles.statusContainer}>
                        <MaterialCommunityIcons name={statusIcon} size={18} color={statusColor} />
                        <Text style={[styles.orderStatus, { color: statusColor }]}>
                            {item.payment_status || 'Unknown'}
                        </Text>
                    </View>

                    <View style={styles.priceExpand}>
                        <Text style={styles.orderTotal}>{item.total_amount.toLocaleString()}đ</Text>
                        <Icon
                            name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                            size={24}
                            color={COLORS.text.textDisable}
                            style={styles.expandIcon}
                        />
                    </View>
                </View>

                {item.shipping_address && (
                    <View style={styles.addressContainer}>
                        <MaterialCommunityIcons name="map-marker" size={16} color={COLORS.text.textDisable} />
                        <Text numberOfLines={isExpanded ? undefined : 1} style={styles.shippingAddress}>
                            {item.shipping_address}
                        </Text>
                    </View>
                )}

                {isExpanded && (
                    <Animated.View style={styles.expandedContent}>
                        <Text style={styles.itemsTitle}>Items</Text>
                        {item.cart_items && item.cart_items.map((product) => (
                            <View key={`${item.order_id}-${product.product_id}`} style={styles.productItem}>
                                <View style={styles.productInfo}>
                                    <Text style={styles.productName}>{product.product_name}</Text>
                                    <Text style={styles.productPrice}>{product.unit_price.toLocaleString()}đ x {product.quantity}</Text>
                                </View>
                                <Text style={styles.productTotal}>{product.total_price.toLocaleString()}đ</Text>
                            </View>
                        ))}

                        <View style={styles.orderSummary}>
                            <Text style={styles.summaryTitle}>Order Summary</Text>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>Subtotal:</Text>
                                <Text style={styles.summaryValue}>{item.total_amount.toLocaleString()}đ</Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>Shipping:</Text>
                                <Text style={styles.summaryValue}>0đ</Text>
                            </View>
                            <View style={[styles.summaryItem, styles.totalRow]}>
                                <Text style={styles.totalLabel}>Total:</Text>
                                <Text style={styles.totalValue}>{item.total_amount.toLocaleString()}đ</Text>
                            </View>
                        </View>

                        {item.payment_status && item.payment_status.toLowerCase() === 'pending' && (
                            <View style={styles.actionButtonsContainer}>
                                <TouchableOpacity style={[styles.actionButton, styles.trackButton]}>
                                    <MaterialCommunityIcons name="truck-fast" size={18} color="#fff" />
                                    <Text style={styles.actionButtonText}>Track Order</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.actionButton, styles.cancelButton]}>
                                    <MaterialCommunityIcons name="close" size={18} color="#fff" />
                                    <Text style={styles.actionButtonText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </Animated.View>
                )}
            </TouchableOpacity>
        );
    };

    const renderAppointmentItem = ({ item }: { item: Appointment }) => {
        const isExpanded = expandedAppointmentId === item.id;
        const statusColor = getStatusColor(item.status);
        const statusIcon = getStatusIcon(item.status);

        return (
            <TouchableOpacity
                style={[styles.orderCard, isExpanded && styles.expandedCard, { borderLeftColor: COLORS.background.darkBlue }]}
                onPress={() => toggleAppointmentExpansion(item.id)}
                activeOpacity={0.8}
            >
                <View style={styles.appointmentHeader}>
                    <View style={styles.petInfo}>
                        {item.pet?.image ? (
                            <Image
                                source={{ uri: item.pet.image }}
                                style={styles.petImage}
                            />
                        ) : (
                            <View style={styles.petImagePlaceholder}>
                                <MaterialCommunityIcons name="paw" size={18} color={COLORS.text.textDisable} />
                            </View>
                        )}
                        <Text style={styles.petName}>{item.pet?.name || 'Pet'}</Text>
                    </View>
                    <Text style={styles.appointmentDate}>
                        {new Date(item.date).toLocaleDateString()} {item.time}
                    </Text>
                </View>

                <View style={styles.orderDetails}>
                    <View>
                        <Text style={styles.serviceName}>{item.service_name}</Text>
                        <View style={styles.statusContainer}>
                            <MaterialCommunityIcons name={statusIcon} size={18} color={statusColor} />
                            <Text style={[styles.orderStatus, { color: statusColor }]}>
                                {item.status || 'Unknown'}
                            </Text>
                        </View>
                    </View>

                    <Icon
                        name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                        size={24}
                        color={COLORS.text.textDisable}
                        style={styles.expandIcon}
                    />
                </View>

                {isExpanded && (
                    <Animated.View style={styles.expandedContent}>
                        <View style={styles.appointmentDetail}>
                            <MaterialCommunityIcons name="doctor" size={16} color={COLORS.text.textDisable} />
                            <Text style={styles.appointmentDetailText}>
                                Doctor: {item.doctor_name}
                            </Text>
                        </View>

                        <View style={styles.appointmentDetail}>
                            <MaterialCommunityIcons name="hospital-building" size={16} color={COLORS.text.textDisable} />
                            <Text style={styles.appointmentDetailText}>
                                Clinic: {item.clinic_name}
                            </Text>
                        </View>

                        <View style={styles.appointmentDetail}>
                            <MaterialCommunityIcons name="map-marker" size={16} color={COLORS.text.textDisable} />
                            <Text style={styles.appointmentDetailText}>
                                Address: {item.clinic_address}
                            </Text>
                        </View>

                        {item.notes && (
                            <View style={styles.appointmentDetail}>
                                <MaterialCommunityIcons name="note-text" size={16} color={COLORS.text.textDisable} />
                                <Text style={styles.appointmentDetailText}>
                                    Notes: {item.notes}
                                </Text>
                            </View>
                        )}

                        {item.status && item.status.toLowerCase() === 'pending' && (
                            <View style={styles.actionButtonsContainer}>
                                <TouchableOpacity style={[styles.actionButton, styles.trackButton, { backgroundColor: COLORS.background.darkBlue }]}>
                                    <MaterialCommunityIcons name="calendar-check" size={18} color="#fff" />
                                    <Text style={styles.actionButtonText}>Reschedule</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.actionButton, styles.cancelButton]}>
                                    <MaterialCommunityIcons name="close" size={18} color="#fff" />
                                    <Text style={styles.actionButtonText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </Animated.View>
                )}
            </TouchableOpacity>
        );
    };

    const renderContent = () => {
        if (activeTab === 'orders') {
            if (isOrderLoading) {
                return (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={COLORS.background.mint} />
                        <Text style={styles.loadingText}>Loading order history...</Text>
                    </View>
                );
            }

            if (orderError) {
                return (
                    <View style={styles.errorContainer}>
                        <MaterialCommunityIcons name="alert-circle" size={60} color={COLORS.status.cancel} />
                        <Text style={styles.errorText}>Failed to load order history</Text>
                        <TouchableOpacity style={styles.retryButton} onPress={() => refetchOrders()}>
                            <Text style={styles.retryText}>Try Again</Text>
                        </TouchableOpacity>
                    </View>
                );
            }

            return (
                orderHistory && orderHistory.data && orderHistory.data.length > 0 ? (
                    <FlatList
                        data={orderHistory.data}
                        renderItem={renderOrderItem}
                        keyExtractor={(item) => item.order_id}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={[COLORS.background.mint]}
                                tintColor={COLORS.background.mint}
                            />
                        }
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                    />
                ) : (
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="shopping-outline" size={80} color={COLORS.text.textDisable} />
                        <Text style={styles.emptyText}>No order history found</Text>
                        <Text style={styles.emptySubText}>Items you order will appear here</Text>
                        <TouchableOpacity style={styles.shopNowButton}>
                            <Text style={styles.shopNowText}>Shop Now</Text>
                        </TouchableOpacity>
                    </View>
                )
            );
        } else {
            if (isAppointmentLoading) {
                return (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={COLORS.background.mint} />
                        <Text style={styles.loadingText}>Loading appointment history...</Text>
                    </View>
                );
            }

            

            return (
                <>
                    {!pets || pets.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="paw" size={80} color={COLORS.text.textDisable} />
                            <Text style={styles.emptyText}>No pets found</Text>
                            <Text style={styles.emptySubText}>Add a pet to view appointment history</Text>
                        </View>
                    ) : (
                        <>
                            <TabBar 
                                type="pets" 
                                initialTab="PROFILE" 
                                onTabChange={(tab: string) => {
                                    // We ignore pet tabs - we're just using this for pet selection
                                    // This bridges the type mismatch
                                }}
                                pets={pets} 
                                isLoading={petsLoading}
                                selectedAvatars={selectedPetId ? [selectedPetId] : ['all']}
                                onAvatarChange={(avatars) => {
                                    // If we're selecting a specific pet (not 'all')
                                    const petId = avatars.find(id => id !== 'all');
                                    if (petId) {
                                        setSelectedPetId(petId);
                                    } else {
                                        // If 'all' is selected, use the first pet
                                        if (pets && pets.length > 0) {
                                            setSelectedPetId(pets[0].petid || null);
                                        }
                                    }
                                }}
                            />
                            {appointmentHistory && appointmentHistory.length > 0 ? (
                                <FlatList
                                    data={appointmentHistory}
                                    renderItem={renderAppointmentItem}
                                    keyExtractor={(item) => item.id}
                                    refreshControl={
                                        <RefreshControl
                                            refreshing={refreshing}
                                            onRefresh={onRefresh}
                                            colors={[COLORS.background.mint]}
                                            tintColor={COLORS.background.mint}
                                        />
                                    }
                                    contentContainerStyle={styles.listContainer}
                                    showsVerticalScrollIndicator={false}
                                />
                            ) : (
                                <View style={styles.emptyContainer}>
                                    <MaterialCommunityIcons name="calendar-blank" size={80} color={COLORS.text.textDisable} />
                                    <Text style={styles.emptyText}>No appointment history found</Text>
                                    <Text style={styles.emptySubText}>Appointments will appear here</Text>
                                    <TouchableOpacity
                                        style={[styles.shopNowButton, { backgroundColor: COLORS.background.darkBlue }]}
                                        onPress={() => navigation.navigate('AddAppointment')}
                                    >
                                        <Text style={styles.shopNowText}>Book Appointment</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </>
                    )}
                </>
            );
        }
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
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Icon name="arrow-back" size={24} color={COLORS.text.text} />
                    </TouchableOpacity>
                    <Text style={styles.title}>History</Text>
                    <View style={{ width: 24 }} />
                </View>

                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'orders' && styles.activeTabButton]}
                        onPress={() => handleTabChange('orders')}
                    >
                        <MaterialCommunityIcons
                            name="shopping-outline"
                            size={18}
                            color={activeTab === 'orders' ? COLORS.text.textChoose : COLORS.text.textDisable}
                        />
                        <Text
                            style={[
                                styles.tabButtonText,
                                activeTab === 'orders' && styles.activeTabButtonText
                            ]}
                        >
                            Orders
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'appointments' && styles.activeTabButton]}
                        onPress={() => handleTabChange('appointments')}
                    >
                        <MaterialCommunityIcons
                            name="calendar-clock"
                            size={18}
                            color={activeTab === 'appointments' ? COLORS.text.textChoose : COLORS.text.textDisable}
                        />
                        <Text
                            style={[
                                styles.tabButtonText,
                                activeTab === 'appointments' && styles.activeTabButtonText
                            ]}
                        >
                            Appointments
                        </Text>
                    </TouchableOpacity>
                </View>

                {renderContent()}
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background.gray,
    },
    androidSafeArea: {
        paddingTop: StatusBar.currentHeight,
    },
    header: {
        backgroundColor: COLORS.background.white,
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
        elevation: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background.gray,
    },
    loadingText: {
        marginTop: 12,
        fontSize: SIZES.text.l,
        color: COLORS.text.default,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: COLORS.background.gray,
    },
    errorText: {
        fontSize: SIZES.text.xl,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
        color: COLORS.text.text,
    },
    retryButton: {
        marginTop: 16,
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: COLORS.background.mint,
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    retryText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: SIZES.text.l,
    },
    listContainer: {
        padding: 16,
        paddingBottom: 30,
    },
    title: {
        fontSize: SIZES.text.xl,
        fontWeight: 'bold',
        color: COLORS.text.text,
    },
    orderCard: {
        backgroundColor: COLORS.background.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.background.mint,
    },
    expandedCard: {
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 5,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        paddingBottom: 12,
    },
    orderId: {
        fontWeight: 'bold',
        fontSize: SIZES.text.l,
        color: COLORS.text.text,
    },
    orderDate: {
        color: COLORS.text.default,
        fontSize: SIZES.text.m,
    },
    orderDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    orderStatus: {
        fontSize: SIZES.text.l,
        fontWeight: '500',
        marginLeft: 6,
    },
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    shippingAddress: {
        fontSize: SIZES.text.m,
        color: COLORS.text.default,
        marginLeft: 6,
        flex: 1,
    },
    priceExpand: {
        alignItems: 'flex-end',
    },
    orderTotal: {
        fontWeight: 'bold',
        fontSize: SIZES.text.l,
        color: COLORS.background.mint,
    },
    expandIcon: {
        marginTop: 4,
    },
    expandedContent: {
        marginTop: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    itemsTitle: {
        fontWeight: 'bold',
        marginBottom: 12,
        fontSize: SIZES.text.l,
        color: COLORS.text.text,
    },
    productItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    productInfo: {
        flex: 1,
        marginRight: 8,
    },
    productName: {
        fontSize: SIZES.text.l,
        fontWeight: '500',
        marginBottom: 4,
        color: COLORS.text.text,
    },
    productPrice: {
        fontSize: SIZES.text.m,
        color: COLORS.text.default,
    },
    productTotal: {
        fontSize: SIZES.text.l,
        fontWeight: 'bold',
        textAlign: 'right',
        color: COLORS.text.text,
    },
    orderSummary: {
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        backgroundColor: '#FAFAFA',
        padding: 12,
        borderRadius: 8,
    },
    summaryTitle: {
        fontSize: SIZES.text.l,
        fontWeight: 'bold',
        marginBottom: 10,
        color: COLORS.text.text,
    },
    summaryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: SIZES.text.m,
        color: COLORS.text.default,
    },
    summaryValue: {
        fontSize: SIZES.text.m,
        color: COLORS.text.text,
    },
    totalRow: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
    },
    totalLabel: {
        fontSize: SIZES.text.l,
        fontWeight: 'bold',
        color: COLORS.text.text,
    },
    totalValue: {
        fontSize: SIZES.text.l,
        fontWeight: 'bold',
        color: COLORS.background.mint,
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
        gap: 10,
    },
    actionButton: {
        flex: 1,
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    trackButton: {
        backgroundColor: COLORS.background.mint,
    },
    cancelButton: {
        backgroundColor: COLORS.status.cancel,
    },
    actionButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: SIZES.text.m,
        marginLeft: 6,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: SIZES.text.xl,
        fontWeight: 'bold',
        color: COLORS.text.text,
        marginTop: 15,
    },
    emptySubText: {
        fontSize: SIZES.text.l,
        color: COLORS.text.default,
        marginTop: 8,
        marginBottom: 20,
    },
    shopNowButton: {
        backgroundColor: COLORS.background.mint,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginTop: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    shopNowText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: SIZES.text.l,
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: COLORS.background.white,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    tabButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    activeTabButton: {
        backgroundColor: COLORS.background.lightGray,
    },
    tabButtonText: {
        marginLeft: 8,
        fontSize: SIZES.text.m,
        color: COLORS.text.textDisable,
    },
    activeTabButtonText: {
        color: COLORS.text.textChoose,
        fontWeight: '500',
    },
    appointmentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        paddingBottom: 12,
    },
    petInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    petImage: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 8,
    },
    petImagePlaceholder: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    petName: {
        fontWeight: '500',
        fontSize: SIZES.text.m,
        color: COLORS.text.text,
    },
    serviceName: {
        fontSize: SIZES.text.l,
        fontWeight: '500',
        color: COLORS.text.text,
        marginBottom: 4,
    },
    appointmentDate: {
        color: COLORS.text.default,
        fontSize: SIZES.text.m,
    },
    appointmentDetail: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    appointmentDetailText: {
        marginLeft: 8,
        fontSize: SIZES.text.m,
        color: COLORS.text.text,
        flex: 1,
    },
    errorMessage: {
        fontSize: SIZES.text.m,
        color: COLORS.text.default,
        textAlign: 'center',
        marginBottom: 16,
    }
});

export default HistoryScreen;