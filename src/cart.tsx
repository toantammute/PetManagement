import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    StatusBar,
    Dimensions,
    ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useCart } from '../hook/useCart';
import { useProductById } from '../hook/useProduct';
import { Cart } from '../models/models';
import { COLORS } from '../theme/color';

const CartScreen = () => {
    const { data: cartItems, isLoading, isError, error } = useCart();
    const navigation = useNavigation();

    const calculateTotal = () => {
        if (!cartItems) return 0;
        return cartItems.reduce((total, item) => total + (item.unit_price * item.quantity), 0);
    };

    const handleQuantityChange = (itemId: string, newQuantity: number) => {
        // TODO: Implement quantity change
    };

    const handleRemoveItem = (itemId: string) => {
        // TODO: Implement remove item
    };

    const handleCheckout = () => {
        // TODO: Implement checkout
    };

    const CartItem = ({ item }: { item: Cart }) => {
        const { data: product, isLoading: isLoadingProduct } = useProductById(item.product_id);

        if (isLoadingProduct) {
            return (
                <View style={styles.cartItem}>
                    <View style={[styles.productImage, { backgroundColor: '#F5F5F5' }]} />
                    <View style={styles.itemDetails}>
                        <Text style={styles.productName} numberOfLines={2}>{item.product_name}</Text>
                        <Text style={styles.productPrice}>{item.unit_price.toLocaleString()}đ</Text>
                        <ActivityIndicator size="small" color={COLORS.background.mint} />
                    </View>
                </View>
            );
        }

        return (
            <View style={styles.cartItem}>
                <Image 
                    source={{ uri: product?.data_image ? `data:image/jpeg;base64,${product.data_image}` : undefined }} 
                    style={styles.productImage}
                    defaultSource={require('../assets/images/bus.png')}
                />
                <View style={styles.itemDetails}>
                    <Text style={styles.productName} numberOfLines={2}>{item.product_name}</Text>
                    <Text style={styles.productPrice}>{item.unit_price.toLocaleString()}đ</Text>
                    
                    <View style={styles.quantityContainer}>
                        <TouchableOpacity 
                            style={styles.quantityButton}
                            onPress={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                        >
                            <Icon name="remove" size={20} color={item.quantity <= 1 ? "#BDBDBD" : "#333"} />
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{item.quantity}</Text>
                        <TouchableOpacity 
                            style={styles.quantityButton}
                            onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                            <Icon name="add" size={20} color="#333" />
                        </TouchableOpacity>
                    </View>
                </View>
                
                <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => handleRemoveItem(item.id)}
                >
                    <Icon name="delete" size={24} color="#FF5252" />
                </TouchableOpacity>
            </View>
        );
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.background.mint} />
                <Text style={styles.loadingText}>Đang tải giỏ hàng...</Text>
            </View>
        );
    }

    if (isError) {
        return (
            <View style={styles.errorContainer}>
                <Icon name="error-outline" size={80} color="#FF5252" />
                <Text style={styles.errorText}>Không thể tải giỏ hàng</Text>
                <Text style={styles.errorSubText}>{error?.message}</Text>
            </View>
        );
    }

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
                
                <Text style={styles.headerTitle}>Giỏ hàng</Text>
                
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.clearButton}>
                        <Text style={styles.clearButtonText}>Xóa tất cả</Text>
                    </TouchableOpacity>
                </View>
            </View>
            
            {cartItems && cartItems.length > 0 ? (
                <>
                    <FlatList
                        data={cartItems}
                        renderItem={({ item }) => <CartItem item={item} />}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.cartList}
                        showsVerticalScrollIndicator={false}
                    />
                    
                    {/* Checkout Section */}
                    <View style={styles.checkoutContainer}>
                        <View style={styles.totalContainer}>
                            <Text style={styles.totalLabel}>Tổng cộng:</Text>
                            <Text style={styles.totalPrice}>{calculateTotal().toLocaleString()}đ</Text>
                        </View>
                        
                        <TouchableOpacity 
                            style={styles.checkoutButton}
                            onPress={handleCheckout}
                        >
                            <Text style={styles.checkoutButtonText}>Thanh toán</Text>
                        </TouchableOpacity>
                    </View>
                </>
            ) : (
                <View style={styles.emptyContainer}>
                    <Icon name="shopping-cart" size={80} color="#CCCCCC" />
                    <Text style={styles.emptyText}>Giỏ hàng trống</Text>
                    <Text style={styles.emptySubText}>Hãy thêm sản phẩm vào giỏ hàng</Text>
                    <TouchableOpacity 
                        style={styles.continueShoppingButton}
                        onPress={() => navigation.navigate('Products' as never)}
                    >
                        <Text style={styles.continueShoppingText}>Tiếp tục mua sắm</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
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
        flexDirection: 'row',
        alignItems: 'center',
    },
    clearButton: {
        padding: 5,
    },
    clearButtonText: {
        color: '#FF5252',
        fontSize: 14,
    },
    cartList: {
        padding: 15,
    },
    cartItem: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#EEEEEE',
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 4,
        marginRight: 10,
    },
    itemDetails: {
        flex: 1,
        justifyContent: 'space-between',
    },
    productName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333333',
        marginBottom: 5,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.background.mint,
        marginBottom: 5,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EEEEEE',
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    quantityButton: {
        padding: 8,
        backgroundColor: '#F5F5F5',
    },
    quantityText: {
        paddingHorizontal: 15,
        fontSize: 16,
        fontWeight: 'bold',
    },
    removeButton: {
        padding: 5,
        marginLeft: 10,
    },
    checkoutContainer: {
        padding: 15,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    totalLabel: {
        fontSize: 16,
        color: '#333333',
    },
    totalPrice: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.background.mint,
    },
    checkoutButton: {
        backgroundColor: COLORS.background.mint,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    checkoutButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
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
    continueShoppingButton: {
        marginTop: 20,
        paddingVertical: 12,
        paddingHorizontal: 25,
        backgroundColor: COLORS.background.mint,
        borderRadius: 8,
    },
    continueShoppingText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default CartScreen;
