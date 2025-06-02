import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    StatusBar,
    ActivityIndicator,
    SafeAreaView,
    Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useGetOrdersByUser } from '../hook/useCart';
import { OrderDetail, Order } from '../models/models';
import { COLORS } from '../theme/color';
import Header from '../component/header';

const OrderScreen = () => {
    const { data: orders, isLoading, isError, error } = useGetOrdersByUser();
    const navigation = useNavigation<any>();

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        // Chuyển đổi sang múi giờ +7
        const vietnamTime = new Date(date.getTime() + (7 * 60 * 60 * 1000));
        return vietnamTime.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const OrderCard = ({ order }: { order: Order }) => {
        return (
            <TouchableOpacity
                style={styles.orderCard}
                onPress={() => navigation.navigate('OrderDetail', { orderId: order.order_id })}
            >
                <View style={styles.orderHeader}>
                    <View style={styles.orderInfo}>
                        <Text style={styles.orderId}>Order #{order.order_id}</Text>
                        <Text style={styles.orderDate}>{formatDate(order.order_date)}</Text>
                    </View>
                    <View style={styles.orderStatus}>
                        <Text style={[
                            styles.statusText,
                            { color: order.payment_status === 'paid' ? COLORS.background.mint : '#FF5252' }
                        ]}>
                            {order.payment_status.toUpperCase()}
                        </Text>
                        <Icon name="chevron-right" size={24} color="#333" />
                    </View>
                </View>
                <View style={styles.orderFooter}>
                    <Text style={styles.totalAmount}>{order.total_amount.toLocaleString()}đ</Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.background.mint} />
                <Text style={styles.loadingText}>Loading orders...</Text>
            </View>
        );
    }

    if (isError) {
        return (
            <View style={styles.errorContainer}>
                <Icon name="error-outline" size={80} color="#FF5252" />
                <Text style={styles.errorText}>Unable to load orders</Text>
                <Text style={styles.errorSubText}>{error?.message}</Text>
            </View>
        );
    }

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
                    title="My Orders"
                    variant="default"
                />

                {orders && orders.length > 0 ? (
                    <FlatList
                        data={orders}
                        renderItem={({ item }) => <OrderCard order={item as unknown as Order} />}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.orderList}
                        showsVerticalScrollIndicator={false}
                    />
                ) : (
                    <View style={styles.emptyContainer}>
                        <Icon name="receipt" size={80} color="#CCCCCC" />
                        <Text style={styles.emptyText}>No orders yet</Text>
                        <Text style={styles.emptySubText}>Your order history will appear here</Text>
                    </View>
                )}
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    androidSafeArea: {
        paddingTop: StatusBar.currentHeight,
    },
    orderList: {
        padding: 15,
    },
    orderCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#EEEEEE',
        overflow: 'hidden',
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
    },
    orderInfo: {
        flex: 1,
    },
    orderId: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 5,
    },
    orderDate: {
        fontSize: 14,
        color: '#757575',
    },
    orderStatus: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusText: {
        fontSize: 14,
        fontWeight: '500',
        marginRight: 10,
    },
    orderFooter: {
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
        alignItems: 'flex-end',
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.background.mint,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    loadingText: {
        marginTop: 15,
        color: '#757575',
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#FFFFFF',
    },
    errorText: {
        fontSize: 18,
        color: '#333',
        textAlign: 'center',
        marginTop: 15,
        marginBottom: 5,
    },
    errorSubText: {
        fontSize: 14,
        color: '#757575',
        textAlign: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#757575',
        marginTop: 15,
    },
    emptySubText: {
        fontSize: 14,
        color: '#9E9E9E',
        marginTop: 5,
        textAlign: 'center',
    },
});

export default OrderScreen;
