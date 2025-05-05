import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    StatusBar,
    Dimensions,
    ActivityIndicator,
    FlatList
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../theme/color';
import { ProductDetail } from '../models/models';
import { useProductById } from '../hook/useProduct';
import { useCart } from '../hook/useCart';
import Toast from 'react-native-toast-message';

interface ProductDetails {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    rating: number;
    reviewCount: number;
    images: string[];
    description: string;
    specifications: { label: string; value: string }[];
    inStock: boolean;
    category: string;
}

const ProductDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { productId } = route.params as { productId: string };
    const {data: product_detail, isLoading, isError, error} = useProductById(productId);
    const { data: cartItems } = useCart();
    const [product, setProduct] = useState<ProductDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isFavorite, setIsFavorite] = useState(false);
    const [selectedTab, setSelectedTab] = useState('description');
    
    

    useEffect(() => {
        // Mô phỏng việc tải dữ liệu sản phẩm từ API
        setTimeout(() => {
            const productData: ProductDetails = {
                id: productId,
                name: 'Thức ăn cho chó Royal Canin Mini Adult 2kg',
                price: 350000,
                originalPrice: 420000,
                discount: 17,
                rating: 4.7,
                reviewCount: 126,
                images: [
                    'https://example.com/royal-canin-1.jpg',
                    'https://example.com/royal-canin-2.jpg',
                    'https://example.com/royal-canin-3.jpg',
                ],
                description: 'Royal Canin Mini Adult là thức ăn hạt khô cao cấp dành riêng cho chó trưởng thành thuộc giống chó nhỏ (2-10kg) từ 10 tháng đến 8 tuổi. Được chế biến với công thức đặc biệt giúp duy trì cân nặng lý tưởng, hỗ trợ sức khỏe răng miệng, và cung cấp đầy đủ chất dinh dưỡng cần thiết cho chó của bạn.',
                specifications: [
                    { label: 'Thương hiệu', value: 'Royal Canin' },
                    { label: 'Xuất xứ', value: 'Pháp' },
                    { label: 'Trọng lượng', value: '2kg' },
                    { label: 'Loại thức ăn', value: 'Hạt khô' },
                    { label: 'Đối tượng', value: 'Chó trưởng thành' },
                    { label: 'Độ tuổi', value: '10 tháng - 8 tuổi' },
                ],
                inStock: true,
                category: 'food',
            };
            setProduct(productData);
            setLoading(false);
        }, 1500);
    }, [productId]);

    const handleImageChange = (index: number) => {
        setCurrentImageIndex(index);
    };

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const increaseQuantity = () => {
        setQuantity(quantity + 1);
    };

    const toggleFavorite = () => {
        setIsFavorite(!isFavorite);
        Toast.show({
            type: 'success',
            text1: 'Thông báo',
            text2: 'Đã thêm sản phẩm vào danh sách yêu thích'
        });
    };

    const addToCart = () => {
        Toast.show({
            type: 'success',
            text1: 'Thông báo',
            text2: 'Đã thêm sản phẩm vào giỏ hàng'
        });
        onPress: () =>  navigation.navigate('Cart' as never);
    };

    const navigateToCart = () => {
        navigation.navigate('Cart' as never);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.background.mint} />
                <Text style={styles.loadingText}>Đang tải thông tin sản phẩm...</Text>
            </View>
        );
    }

    if (!product_detail) {
        return (
            <View style={styles.errorContainer}>
                <Icon name="error-outline" size={80} color="#FF5252" />
                <Text style={styles.errorText}>Không thể tải thông tin sản phẩm</Text>
                <TouchableOpacity 
                    style={styles.backToShopButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backToShopText}>Quay lại cửa hàng</Text>
                </TouchableOpacity>
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
                
                <Text style={styles.headerTitle}>Chi tiết sản phẩm</Text>
                
                <View style={styles.headerRight}>
                    <TouchableOpacity 
                        style={styles.favoriteButton}
                        onPress={toggleFavorite}
                    >
                        <Icon 
                            name={isFavorite ? "favorite" : "favorite-border"} 
                            size={24} 
                            color={isFavorite ? "#FF5252" : "#333"} 
                        />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.cartButton}
                        onPress={navigateToCart}
                    >
                        <Icon name="shopping-cart" size={24} color="#333" />
                        {cartItems && cartItems.length > 0 && (
                            <View style={styles.cartBadge}>
                                <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
            
            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Main Image */}
                <View style={styles.mainImageContainer}>
                    <Image 
                        source={{ uri: product_detail.data_image ? `data:image/jpeg;base64,${product_detail.data_image}` : 'https://via.placeholder.com/150' }} 
                        style={styles.mainImage}
                        resizeMode="contain"
                        defaultSource={require('../assets/images/bus.png')}
                    />
                    
                    {/* {product_detail.discount && (
                        <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>-{product.discount}%</Text>
                        </View>
                    )} */}
                </View>
                
                {/* Image Thumbnails */}
                {/* <FlatList 
                    data={product_detail.}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(_, index) => index.toString()}
                    contentContainerStyle={styles.thumbnailList}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity
                            style={[
                                styles.thumbnailContainer,
                                currentImageIndex === index && styles.selectedThumbnail
                            ]}
                            onPress={() => handleImageChange(index)}
                        >
                            <Image 
                                source={{ 
                                    uri: item
                                }}
                                defaultSource={require('../assets/images/download.jpg')}
                                style={styles.thumbnailImage}
                                resizeMode="cover"
                            />
                        </TouchableOpacity>
                    )}
                /> */}
                
                {/* Product Info */}
                <View style={styles.productInfoContainer}>
                    <Text style={styles.productName}>{product_detail.name}</Text>
                    
                    <View style={styles.priceContainer}>
                        <Text style={styles.price}>{product_detail.price.toLocaleString()}đ</Text>
                        {/* {product_detail.originalPrice && (
                            <Text style={styles.originalPrice}>{product_detail.originalPrice.toLocaleString()}đ</Text>
                        )} */}
                    </View>
                    
                    {/* <View style={styles.ratingContainer}>
                        <View style={styles.stars}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Icon 
                                    key={star}
                                    name={star <= Math.floor(product_detail.rating) ? "star" : star <= product_detail.rating ? "star-half" : "star-border"}
                                    size={16}
                                    color="#FFC107"
                                />
                            ))}
                        </View>
                        <Text style={styles.ratingText}>{product.rating}</Text>
                        <Text style={styles.reviewCount}>({product.reviewCount} đánh giá)</Text>
                    </View> */}
                    
                    {/* <View style={styles.stockContainer}>
                        <Icon 
                            name={product.inStock ? "check-circle" : "cancel"} 
                            size={18} 
                            color={product.inStock ? COLORS.status.success : COLORS.status.cancel} 
                        />
                        <Text style={[
                            styles.stockStatus,
                            { color: product.inStock ? COLORS.status.success : COLORS.status.cancel }
                        ]}>
                            {product.inStock ? "Còn hàng" : "Hết hàng"}
                        </Text>
                    </View> */}
                </View>
                
                {/* Quantity Selector */}
                <View style={styles.quantityContainer}>
                    <Text style={styles.quantityLabel}>Số lượng:</Text>
                    <View style={styles.quantitySelector}>
                        <TouchableOpacity 
                            style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
                            onPress={decreaseQuantity}
                            disabled={quantity <= 1}
                        >
                            <Icon name="remove" size={20} color={quantity <= 1 ? "#BDBDBD" : "#333"} />
                        </TouchableOpacity>
                        <Text style={styles.quantityValue}>{quantity}</Text>
                        <TouchableOpacity 
                            style={styles.quantityButton}
                            onPress={increaseQuantity}
                        >
                            <Icon name="add" size={20} color="#333" />
                        </TouchableOpacity>
                    </View>
                </View>
                
                {/* Info Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity 
                        style={[styles.tab, selectedTab === 'description' && styles.selectedTab]}
                        onPress={() => setSelectedTab('description')}
                    >
                        <Text style={[styles.tabText, selectedTab === 'description' && styles.selectedTabText]}>Mô tả</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tab, selectedTab === 'specifications' && styles.selectedTab]}
                        onPress={() => setSelectedTab('specifications')}
                    >
                        <Text style={[styles.tabText, selectedTab === 'specifications' && styles.selectedTabText]}>Thông số</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tab, selectedTab === 'reviews' && styles.selectedTab]}
                        onPress={() => setSelectedTab('reviews')}
                    >
                        <Text style={[styles.tabText, selectedTab === 'reviews' && styles.selectedTabText]}>Đánh giá</Text>
                    </TouchableOpacity>
                </View>
                
                {/* Tab Content */}
                {/* <View style={styles.tabContent}>
                    {selectedTab === 'description' && (
                        <Text style={styles.descriptionText}>{product_detail.description}</Text>
                    )}
                    
                    {selectedTab === 'specifications' && (
                        <View style={styles.specificationsContainer}>
                            {product.specifications.map((spec, index) => (
                                <View key={index} style={styles.specificationRow}>
                                    <Text style={styles.specificationLabel}>{spec.label}</Text>
                                    <Text style={styles.specificationValue}>{spec.value}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                    
                    {selectedTab === 'reviews' && (
                        <View style={styles.reviewsContainer}>
                            <View style={styles.reviewSummary}>
                                <Text style={styles.reviewRating}>{product.rating}</Text>
                                <View style={styles.reviewStars}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Icon 
                                            key={star}
                                            name={star <= Math.floor(product.rating) ? "star" : star <= product.rating ? "star-half" : "star-border"}
                                            size={18}
                                            color="#FFC107"
                                        />
                                    ))}
                                </View>
                                <Text style={styles.reviewCount}>({product.reviewCount} đánh giá)</Text>
                            </View>
                            <Text style={styles.noReviewsText}>Chưa có đánh giá chi tiết nào.</Text>
                        </View>
                    )}
                </View> */}
            </ScrollView>
            
            {/* Bottom Actions */}
            <View style={styles.bottomActions}>
                <TouchableOpacity style={styles.addToCartButton} onPress={addToCart}>
                    <Icon name="add-shopping-cart" size={24} color="#FFFFFF" />
                    <Text style={styles.addToCartText}>Thêm vào giỏ hàng</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.buyNowButton} onPress={() => {
                    addToCart();
                    navigateToCart();
                }}>
                    <Text style={styles.buyNowText}>Mua ngay</Text>
                </TouchableOpacity>
            </View>
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
        marginBottom: 20,
    },
    backToShopButton: {
        paddingVertical: 12,
        paddingHorizontal: 25,
        backgroundColor: COLORS.background.mint,
        borderRadius: 8,
    },
    backToShopText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
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
    favoriteButton: {
        padding: 5,
        marginRight: 10,
    },
    cartButton: {
        padding: 5,
        position: 'relative',
    },
    cartBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#FF5252',
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cartBadgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    scrollContent: {
        paddingBottom: 80,
    },
    mainImageContainer: {
        width: '100%',
        height: 300,
        backgroundColor: '#F9F9F9',
        position: 'relative',
    },
    mainImage: {
        width: '100%',
        height: '100%',
    },
    discountBadge: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: '#FF5252',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    discountText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    thumbnailList: {
        paddingVertical: 15,
        paddingHorizontal: 15,
    },
    thumbnailContainer: {
        width: 60,
        height: 60,
        marginRight: 10,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#EEEEEE',
        overflow: 'hidden',
    },
    selectedThumbnail: {
        borderColor: COLORS.background.mint,
        borderWidth: 2,
    },
    thumbnailImage: {
        width: '100%',
        height: '100%',
    },
    productInfoContainer: {
        padding: 15,
        borderBottomWidth: 8,
        borderBottomColor: '#F5F5F5',
    },
    productName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 10,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    price: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.background.mint,
    },
    originalPrice: {
        fontSize: 16,
        color: '#9E9E9E',
        textDecorationLine: 'line-through',
        marginLeft: 10,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    stars: {
        flexDirection: 'row',
    },
    ratingText: {
        fontSize: 14,
        color: '#333',
        fontWeight: 'bold',
        marginLeft: 5,
    },
    reviewCount: {
        fontSize: 14,
        color: '#757575',
        marginLeft: 5,
    },
    stockContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stockStatus: {
        fontSize: 14,
        marginLeft: 5,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        borderBottomWidth: 8,
        borderBottomColor: '#F5F5F5',
    },
    quantityLabel: {
        fontSize: 16,
        color: '#333',
    },
    quantitySelector: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EEEEEE',
        borderRadius: 4,
    },
    quantityButton: {
        padding: 8,
        backgroundColor: '#F5F5F5',
    },
    quantityButtonDisabled: {
        opacity: 0.5,
    },
    quantityValue: {
        paddingHorizontal: 15,
        fontSize: 16,
        fontWeight: 'bold',
    },
    tabContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    tab: {
        flex: 1,
        paddingVertical: 15,
        alignItems: 'center',
    },
    selectedTab: {
        borderBottomWidth: 2,
        borderBottomColor: COLORS.background.mint,
    },
    tabText: {
        fontSize: 14,
        color: '#757575',
    },
    selectedTabText: {
        fontWeight: 'bold',
        color: COLORS.background.mint,
    },
    tabContent: {
        padding: 15,
    },
    descriptionText: {
        fontSize: 14,
        lineHeight: 22,
        color: '#424242',
    },
    specificationsContainer: {
        backgroundColor: '#FFFFFF',
    },
    specificationRow: {
        flexDirection: 'row',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    specificationLabel: {
        flex: 1,
        fontSize: 14,
        color: '#757575',
    },
    specificationValue: {
        flex: 1,
        fontSize: 14,
        color: '#333333',
        fontWeight: '500',
    },
    reviewsContainer: {
        alignItems: 'center',
        paddingTop: 10,
    },
    reviewSummary: {
        alignItems: 'center',
        marginBottom: 20,
    },
    reviewRating: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    reviewStars: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    noReviewsText: {
        fontSize: 14,
        color: '#757575',
        fontStyle: 'italic',
    },
    bottomActions: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    addToCartButton: {
        flex: 1,
        backgroundColor: COLORS.button.default,
        paddingVertical: 12,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    addToCartText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    buyNowButton: {
        flex: 1,
        backgroundColor: COLORS.background.mint,
        paddingVertical: 12,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buyNowText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
});

export default ProductDetailScreen;