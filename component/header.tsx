import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme/color';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

type HeaderVariant = 'default' | 'three-dot' | 'save' | 'cart';

interface HeaderProps {
    title: string;
    variant?: HeaderVariant;
    onSave?: () => void;
    onThreeDotPress?: () => void;
    onCartPress?: () => void;
    cartItemsCount?: number;
}

const Header: React.FC<HeaderProps> = ({ 
    title, 
    variant = 'default', 
    onSave, 
    onThreeDotPress,
    onCartPress,
    cartItemsCount = 0 
}) => {
    const navigation = useNavigation<any>();

    const renderRightComponent = () => {
        switch (variant) {
            case 'three-dot':
                return (
                    <TouchableOpacity 
                        style={styles.headerButton}
                        onPress={onThreeDotPress}
                    >
                        <MaterialCommunityIcons 
                            name='dots-vertical' 
                            size={25} 
                            color={COLORS.header.text} 
                            style={{
                                paddingHorizontal: 4,
                            }}
                        />
                    </TouchableOpacity>
                );
            case 'cart':
                return (
                    <TouchableOpacity 
                        style={styles.headerButton}
                        onPress={onCartPress}
                    >
                        <View style={styles.cartContainer}>
                            <Icon 
                                name='shopping-cart' 
                                size={24} 
                                color={COLORS.button.disable}
                            />
                            {cartItemsCount > 0 && (
                                <View style={styles.cartBadge}>
                                    <Text style={styles.cartBadgeText}>{cartItemsCount}</Text>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                );
            case 'save':
                return (
                    <TouchableOpacity 
                        style={styles.saveButton}
                        onPress={onSave}
                    >
                        <Text style={styles.saveText}>Save</Text>
                    </TouchableOpacity>
                );
            default:
                return <View style={styles.headerButton} />;
        }
    };
    
    return (
        <View style={styles.headerContainer}>
            {/*Left*/}
            <TouchableOpacity style={styles.headerButton}
                onPress={() => {
                    navigation.goBack();
                }}
            >
                <Feather name='chevron-left' size={25} color={COLORS.header.text}/>
            </TouchableOpacity>
            {/*Middle*/}
            <Text style={styles.headerText}>{title}</Text>
            {/*Right*/}
            {renderRightComponent()}
            {/* <TouchableOpacity style={styles.headerButton}>
                <MaterialCommunityIcons name='dots-vertical' size={25} color={COLORS.text.textDisable} />
            </TouchableOpacity> */}
        </View>
    );
};

const styles = StyleSheet.create({
    headerButton: {
        display: 'flex',
        alignItems: 'center',
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4F46E5',
        // fontFamily: 'Poppins-Regular',
        // fontStyle: 'normal',
        flex: 1,
        textAlign: 'center',
    },
    
    headerContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: 'white',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
    },

    saveButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // paddingHorizontal: 4,
    },

    saveText: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.button.choose,
        fontFamily: 'Poppins-Regular',
    },

    cartContainer: {
        position: 'relative',
        padding: 5,
    },
    cartBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: COLORS.background.mint,
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cartBadgeText: {
        color: COLORS.background.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
});

export default Header;
