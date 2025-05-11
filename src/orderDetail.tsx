import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    StatusBar,
    ActivityIndicator,
    ScrollView
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useGetOrdersById } from '../hook/useCart';
import { useProductById } from '../hook/useProduct';
import { COLORS } from '../theme/color';

const OrderDetailScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const orderId = route.params?.orderId;
    const { data: orderDetail, isLoading, isError, error } = useGetOrdersById(orderId);

    const handlePayment = () => {
        // TODO: Xử lý thanh toán
        console.log('Thanh toán đơn hàng:', orderId);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.background.mint} />
                <Text style={styles.loadingText}>Đang tải chi tiết đơn hàng...</Text>
            </View>
        );
    }

    if (isError || !orderDetail) {
        return (
            <View style={styles.errorContainer}>
                <Icon name="error-outline" size={80} color="#FF5252" />
                <Text style={styles.errorText}>Không thể tải chi tiết đơn hàng</Text>
                <Text style={styles.errorSubText}>{error?.message}</Text>
            </View>
        );
    }

    const cartItems = orderDetail.cart_items || [];
    const isUnpaid = orderDetail.payment_status.toLowerCase() === 'pending';

    const ProductItem = ({ item }: { item: any }) => {
        const { data: productDetail } = useProductById(item.product_id);

        return (
            <View style={styles.productItem}>
                <Image 
                    source={{ uri: productDetail?.data_image ? `data:image/jpeg;base64,${productDetail.data_image}` : undefined }} 
                    style={styles.productImage}
                    defaultSource={require('../assets/images/bus.png')}
                />
                <View style={styles.productInfo}>
                    <Text style={styles.productName}>{item.product_name}</Text>
                    <Text style={styles.productPrice}>{item.unit_price.toLocaleString()}đ</Text>
                    <Text style={styles.quantity}>Số lượng: {item.quantity}</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView style={styles.content}>
                {/* Thông tin đơn hàng */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Mã đơn hàng:</Text>
                        <Text style={styles.infoValue}>#{orderDetail.id}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Ngày đặt:</Text>
                        <Text style={styles.infoValue}>{formatDate(orderDetail.order_date)}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Trạng thái:</Text>
                        <Text style={[
                            styles.infoValue,
                            { color: orderDetail.payment_status === 'paid' ? COLORS.background.mint : '#FF5252' }
                        ]}>
                            {orderDetail.payment_status.toUpperCase()}
                        </Text>
                    </View>
                </View>

                {/* Danh sách sản phẩm */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Sản phẩm</Text>
                    {cartItems.length > 0 ? (
                        cartItems.map((item) => (
                            <ProductItem key={item.id} item={item} />
                        ))
                    ) : (
                        <Text style={styles.emptyText}>Không có sản phẩm trong đơn hàng</Text>
                    )}
                </View>

                {/* Tổng tiền */}
                <View style={styles.section}>
                    <View style={styles.totalContainer}>
                        <Text style={styles.totalLabel}>Tổng tiền:</Text>
                        <Text style={styles.totalAmount}>{orderDetail.total_amount.toLocaleString()}đ</Text>
                    </View>
                </View>

                {/* Địa chỉ giao hàng */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
                    <Text style={styles.shippingAddress}>{orderDetail.shipping_address}</Text>
                </View>
            </ScrollView>

            {/* Nút thanh toán */}
            {isUnpaid && (
                <View style={styles.paymentContainer}>
                    <TouchableOpacity 
                        style={styles.paymentButton}
                        onPress={handlePayment}
                    >
                        <Text style={styles.paymentButtonText}>Thanh toán ngay</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 15,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
    },
    headerRight: {
        width: 34,
    },
    content: {
        flex: 1,
    },
    section: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 15,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    infoLabel: {
        fontSize: 14,
        color: '#757575',
    },
    infoValue: {
        fontSize: 14,
        color: '#333333',
        fontWeight: '500',
    },
    productItem: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 15,
    },
    productInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    productName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333333',
        marginBottom: 5,
    },
    productPrice: {
        fontSize: 16,
        color: COLORS.background.mint,
        marginBottom: 5,
    },
    quantity: {
        fontSize: 14,
        color: '#757575',
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 16,
        color: '#333333',
        fontWeight: '500',
    },
    totalAmount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.background.mint,
    },
    shippingAddress: {
        fontSize: 14,
        color: '#757575',
        lineHeight: 20,
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
    emptyText: {
        fontSize: 14,
        color: '#757575',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    paymentContainer: {
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
        backgroundColor: '#FFFFFF',
    },
    paymentButton: {
        backgroundColor: COLORS.background.mint,
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    paymentButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default OrderDetailScreen;
