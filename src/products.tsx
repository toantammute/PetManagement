import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    TextInput,
    StatusBar,
    ActivityIndicator,
    Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useProducts } from '../hook/useProduct';
import { useAddToCart, useCart } from '../hook/useCart';
import { addToCart } from '../services/cartService';
import { Product } from '../models/models';
import Toast from 'react-native-toast-message';
import { useQueryClient } from '@tanstack/react-query';

const ProductList = () => {
    const { data: products, isLoading, isError, error } = useProducts();
    const { data: cartItems } = useCart();
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('popularity');
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const { mutate: addToCart } = useAddToCart();

    const navigation = useNavigation<any>();



    const categories = [
        { id: 'All', name: 'All' },
        { id: 'Food', name: 'Food' },
        { id: 'Toy', name: 'Toys' },
        { id: 'Accessory', name: 'Accessories' },
        { id: 'Health', name: 'Health' },
    ];

    // Filter products when category or search changes
    useEffect(() => {
        let result = [...products || []];

        // Filter by category
        if (selectedCategory !== 'All') {
            result = result.filter(item => item.category === selectedCategory);
        }

        // Filter by search
        if (searchQuery) {
            result = result.filter(item =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Sort
        switch (sortBy) {
            case 'price_low':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price_high':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'popularity':
            default:
                // Keep default order
                break;
        }

        setFilteredProducts(result);
    }, [products, selectedCategory, searchQuery, sortBy]);

    const handleCategoryPress = (categoryId: string) => {
        setSelectedCategory(categoryId);
    };

    const handleSortPress = (sortOption: string) => {
        setSortBy(sortOption);
    };

    const navigateToProductDetail = (productId: string) => {
        navigation.navigate('ProductDetail', { productId });
    };

    const navigateToCart = () => {
        navigation.navigate('Cart');
    };

    const handleAddToCart = async (productId: string) => {
        try {
            setIsAddingToCart(true);
            await addToCart({ productId, quantity: 1 });
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Product added to cart'
            });
        } catch (error: any) {
            console.error('Failed to add product to cart:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.message || 'Failed to add product to cart'
            });
        } finally {
            setIsAddingToCart(false);
        }
    };

    const renderProductItem = ({ item }: { item: Product }) => (
        <TouchableOpacity
            style={styles.productCard}
            onPress={() => navigateToProductDetail(item.product_id)}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: item.data_image ? `data:image/jpeg;base64,${item.data_image}` : 'https://via.placeholder.com/150' }}
                    style={styles.productImage}
                    defaultSource={require('../assets/images/bus.png')} // Default image when loading fails
                />
            </View>
            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.productPrice}>{item.price.toLocaleString()}đ</Text>
                <TouchableOpacity
                    style={styles.addToCartButton}
                    onPress={() => handleAddToCart(item.product_id)}
                    disabled={isAddingToCart}
                >
                    <Icon name="add-shopping-cart" size={18} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    const renderCategoryItem = ({ item }: { item: { id: string, name: string } }) => (
        <TouchableOpacity
            style={[
                styles.categoryButton,
                selectedCategory === item.id && styles.selectedCategoryButton
            ]}
            onPress={() => handleCategoryPress(item.id)}
        >
            <Text
                style={[
                    styles.categoryText,
                    selectedCategory === item.id && styles.selectedCategoryText
                ]}
            >
                {item.name}
            </Text>
        </TouchableOpacity>
    );

    if (isLoading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.loaderText}>Loading products...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>

                <Text style={styles.title}>Pet Products</Text>

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

            <View style={styles.searchContainer}>
                <Icon name="search" size={20} color="#757575" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search pet products..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={() => setSearchQuery('')}
                    >
                        <Icon name="clear" size={18} color="#757575" />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.categoriesContainer}>
                <FlatList
                    data={categories}
                    renderItem={renderCategoryItem}
                    keyExtractor={item => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesList}
                />
            </View>

            <View style={styles.sortContainer}>
                <Text style={styles.resultCount}>{filteredProducts.length} products</Text>

                <View style={styles.sortOptions}>
                    <Text style={styles.sortLabel}>Sort by:</Text>

                    <TouchableOpacity
                        style={[styles.sortButton, sortBy === 'price_low' && styles.activeSortButton]}
                        onPress={() => handleSortPress('price_low')}
                    >
                        <Text style={styles.sortButtonText}>Price ↑</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.sortButton, sortBy === 'price_high' && styles.activeSortButton]}
                        onPress={() => handleSortPress('price_high')}
                    >
                        <Text style={styles.sortButtonText}>Price ↓</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {filteredProducts.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Icon name="search-off" size={60} color="#CCCCCC" />
                    <Text style={styles.emptyText}>No products found</Text>
                    <Text style={styles.emptySubText}>Try searching with different keywords</Text>
                </View>
            ) : (
                <View style={styles.productListContainer}>
                    <FlatList
                        data={filteredProducts}
                        renderItem={renderProductItem}
                        keyExtractor={item => item.product_id}
                        numColumns={2}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.productList}
                    />
                </View>
            )}
        </View>
    );
};

const { width } = Dimensions.get('window');
const productWidth = (width - 40 - 10) / 2; // 40 is padding, 10 is the gap between products

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 15,
    },
    productListContainer: {
        flex: 1,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    loaderText: {
        marginTop: 10,
        fontSize: 16,
        color: '#757575',
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
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        marginTop: 10,
        marginBottom: 0,
        paddingHorizontal: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#EEEEEE',
    },
    searchIcon: {},
    searchInput: {
        flex: 1,
        height: 45,
        fontSize: 14,
    },
    clearButton: {
        padding: 5,
    },
    categoriesContainer: {
        marginVertical: 10,
    },
    categoriesList: {},
    categoryButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#EEEEEE',
    },
    selectedCategoryButton: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    categoryText: {
        fontSize: 14,
        color: '#757575',
    },
    selectedCategoryText: {
        color: '#FFFFFF',
        fontWeight: '500',
    },
    sortContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#EEEEEE',
        borderRadius: 8,
    },
    resultCount: {
        fontSize: 14,
        color: '#757575',
    },
    sortOptions: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
    },
    sortLabel: {
        fontSize: 14,
        color: '#757575',
        marginRight: 5,
    },
    sortButton: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        marginLeft: 5,
        borderRadius: 4,
    },
    activeSortButton: {
        backgroundColor: '#E8F5E9',
    },
    sortButtonText: {
        fontSize: 12,
        color: '#424242',
    },
    productList: {
        paddingTop: 10,
        paddingBottom: 20,
        gap: 10,
    },
    productCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        marginBottom: 10,
        marginRight: 5,
        marginLeft: 5,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#EEEEEE',
        maxWidth: productWidth,
    },
    imageContainer: {
        width: '100%',
        height: 150,
        backgroundColor: '#F5F5F5',
    },
    productImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    productInfo: {
        padding: 10,
        position: 'relative',
    },
    productName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333333',
        marginBottom: 5,
        height: 40,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    addToCartButton: {
        position: 'absolute',
        bottom: 7,
        right: 10,
        backgroundColor: '#4CAF50',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
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

export default ProductList;