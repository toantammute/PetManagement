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
    ActivityIndicator,
    SafeAreaView,
    Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useCart, useAddToCart, useRemoveFromCart,useCreateOrder } from '../hook/useCart';
import { useProductById } from '../hook/useProduct';
import { Cart } from '../models/models';
import { COLORS } from '../theme/color';
import Toast from 'react-native-toast-message';
import Header from '../component/header';

const CartScreen = () => {
    const { data: cartItems, isLoading, isError, error } = useCart();
    const { mutate: addToCart } = useAddToCart();
    const navigation = useNavigation();
    const { mutate: removeFromCart } = useRemoveFromCart();
    const { mutate: createOrder } = useCreateOrder();
    
    const calculateTotal = () => {
        if (!cartItems) return 0;
        return cartItems.reduce((total, item) => total + (item.unit_price * item.quantity), 0);
    };

    const handleQuantityChange = async (productId: string, newQuantity: number) => {
        await addToCart(
            { productId: productId, quantity: newQuantity },
            {
                onSuccess: () => {
                    Toast.show({
                        type: 'success',
                        text1: 'Cart Updated',
                        text2: 'Item added to cart successfully'
                    });
                },
                onError: () => {
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: 'Failed to add item to cart'
                    });
                }
            }
        );
    };

    const handleRemoveItem = (itemId: string) => {
        Toast.show({
            type: 'info',
            text1: 'Remove Item',
            text2: 'Are you sure you want to remove this item?',
            onPress: () => {
                removeFromCart(itemId, {
                    onSuccess: () => {
                        Toast.show({
                            type: 'success',
                            text1: 'Item Removed',
                            text2: 'Item removed from cart'
                        });
                    },
                    onError: () => {
                        Toast.show({
                            type: 'error',
                            text1: 'Error',
                            text2: 'Failed to remove item'
                        });
                    }
                });
            }
        });
    };

    const handleClearCart = () => {
        Toast.show({
            type: 'info',
            text1: 'Clear Cart',
            text2: 'Are you sure you want to clear your cart?',
            onPress: () => {
                // clearCart(undefined, {
                //     onSuccess: () => {
                //         Toast.show({
                //             type: 'success',
                //             text1: 'Cart Cleared',
                //             text2: 'All items removed from cart'
                //         });
                //     },
                //     onError: () => {
                //         Toast.show({
                //             type: 'error',
                //             text1: 'Error',
                //             text2: 'Failed to clear cart'
                //         });
                //     }
                // });
            }
        });
    };

    

    const handleCheckout = () => {
        createOrder(undefined, {
            onSuccess: () => {
                Toast.show({
                    type: 'success',
                    text1: 'Order Created',
                    text2: 'Order created successfully'
                });
            },
            onError: () => {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Failed to create order'
                });
            }
        });
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
                            onPress={() => handleQuantityChange(item.product_id, - 1)}
                            disabled={item.quantity <= 1}
                        >
                            <Icon name="remove" size={20} color={item.quantity <= 1 ? "#BDBDBD" : "#333"} />
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{item.quantity}</Text>
                        <TouchableOpacity 
                            style={styles.quantityButton}
                            onPress={() => handleQuantityChange(item.product_id, 1)}
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
                <Text style={styles.loadingText}>Loading cart...</Text>
            </View>
        );
    }

    if (isError) {
        return (
            <View style={styles.errorContainer}>
                <Icon name="error-outline" size={80} color="#FF5252" />
                <Text style={styles.errorText}>Unable to load cart</Text>
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
            
            {/* Header */}
            <Header title="Cart" />
            
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
                            <Text style={styles.totalLabel}>Total:</Text>
                            <Text style={styles.totalPrice}>{calculateTotal().toLocaleString()}₫</Text>
                        </View>
                        
                        <TouchableOpacity 
                            style={styles.checkoutButton}
                            onPress={handleCheckout}
                        >
                            <Text style={styles.checkoutButtonText}>Checkout</Text>
                        </TouchableOpacity>
                    </View>
                </>
            ) : (
                <View style={styles.emptyContainer}>
                    <Icon name="shopping-cart" size={80} color="#CCCCCC" />
                    <Text style={styles.emptyText}>Cart is empty</Text>
                    <Text style={styles.emptySubText}>Please add products to your cart</Text>
                    <TouchableOpacity 
                        style={styles.continueShoppingButton}
                        onPress={() => navigation.navigate('Products' as never)}
                    >
                        <Text style={styles.continueShoppingText}>Continue shopping</Text>
                    </TouchableOpacity>
                </View>
            )}
            </SafeAreaView>
        </>
    );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    androidSafeArea: {
        paddingTop: StatusBar.currentHeight,
    },
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
