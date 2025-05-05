import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, StatusBar, SafeAreaView } from 'react-native';
import { COLORS } from '../../theme/color';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../../component/header';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';

interface MenuButtonProps {
    icon: string;
    label: string;
    onPress: () => void;
}

const MenuButton: React.FC<MenuButtonProps> = ({ icon, label, onPress }) => {
    return (
        <TouchableOpacity style={styles.menuButton} onPress={onPress}>
            <Icon name={icon} size={28} color={COLORS.button.choose} />
            {/* <View style={styles.iconContainer}>
                
            </View> */}
            <Text style={styles.menuButtonText}>{label}</Text>
        </TouchableOpacity>
    );
};

const Account = () => {
    const navigation = useNavigation<any>();
    const { logout } = useAuth();

    const menuItems = [
        {
            icon: 'lock-reset',
            label: 'Đổi mật khẩu',
            onPress: () => navigation.navigate('ResetPassword')
        },
        {
            icon: 'account-circle',
            label: 'Profile',
            onPress: () => navigation.navigate('Profile')
        },
        {
            icon: 'notifications',
            label: 'Thông báo',
            onPress: () => navigation.navigate('Notifications')
        },
        {
            icon: 'history',
            label: 'Lịch sử',
            onPress: () => navigation.navigate('History')
        },
        {
            icon: 'settings',
            label: 'Cài đặt',
            onPress: () => navigation.navigate('Settings')
        },
        {
            icon: 'chat',
            label: 'Chatbot',
            onPress: () => navigation.navigate('Chatbot')
        },
        {    
            icon: 'pets',
            label: 'Dự đoán giống',
            onPress: () => navigation.navigate('BreedDetection')
        },
        {
            icon: 'star-rate',
            label: 'Đánh giá',
            onPress: () => navigation.navigate('Rate')
        },
        {
            icon: 'logout',
            label: 'Đăng xuất',
            onPress: () => {
                logout();
            }
        },
    ];

    const renderMenuGrid = () => {
        const rows = [];
        for (let i = 0; i < menuItems.length; i += 3) {
            const rowItems = menuItems.slice(i, i + 3);
            rows.push(
                <View key={i} style={styles.menuRow}>
                    {rowItems.map((item, index) => (
                        <MenuButton
                            key={index}
                            icon={item.icon}
                            label={item.label}
                            onPress={item.onPress}
                        />
                    ))}
                    {/* Thêm các nút giả để điền đầy hàng cuối nếu cần */}
                    {rowItems.length < 3 && [...Array(3 - rowItems.length)].map((_, index) => (
                        <View key={`empty-${index}`} style={styles.emptyButton} />
                    ))}
                </View>
            );
        }
        return rows;
    };

    return (
        <>
            <StatusBar
                barStyle="dark-content"
                backgroundColor='#fff'
            />
            <SafeAreaView style={[
                styles.container,
                Platform.OS === 'android' && styles.androidSafeArea
            ]}>
                <Header title="Account" />
                <ScrollView style={styles.content}>
                    <View style={styles.menuContainer}>
                        {renderMenuGrid()}
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
    androidSafeArea: {
        paddingTop: StatusBar.currentHeight,
        backgroundColor: COLORS.background.white,
    },
    content: {
        flex: 1,
    },
    menuContainer: {
        padding: 16,
    },
    menuRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    menuButton: {
        width: '25%',
        aspectRatio: 1,
        backgroundColor: COLORS.background.white,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    iconContainer: {
        width: 45,
        height: 45,
        borderRadius: 24,
        backgroundColor: COLORS.background.lightBlue,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    menuButtonText: {
        fontSize: 14,
        color: COLORS.text.text,
        textAlign: 'center',
        marginTop: 4,
    },
    emptyButton: {
        width: '30%',
        aspectRatio: 1,
    },
});

export default Account;