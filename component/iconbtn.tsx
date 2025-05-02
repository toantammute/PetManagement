import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SIZES, ButtonVariant } from '../theme/color';
import { useNavigation } from '@react-navigation/native';


//icon button in bottom menu
interface IconButtonProps {
    iconName: string;
    iconSize?: number;
    variant?: ButtonVariant;
    onPress: () => void;
    route?: string;
}

const IconButton: React.FC<IconButtonProps> = ({
    iconName,
    iconSize = SIZES.icon.medium,
    variant = 'default',
    onPress,
    route,
}) => {
    const navigation = useNavigation();
    const getColors = () => {
        if (iconName === 'add-circle') {
            return COLORS.background.mint; // Use mint color for chosen add-circle
        }
        switch (variant) {
            case 'default':
                return COLORS.button.default;
            case 'choose':
                return COLORS.button.choose;
            case 'disable':
                return COLORS.button.disable;
            default:
                return COLORS.button.default;
        }
    };

    const handlePress = () => {
        if (route) {
            navigation.navigate(route as never);
        }
    };

    const color = getColors();

    return (
        <Pressable
            style={styles.iconContainer}
            onPress={onPress}
            disabled={variant === 'disable'}
        >
            <Icon name={iconName} size={SIZES.icon.medium} color={color} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, aspectRatio: 1 / 1 }} />
        </Pressable>
    )
}

interface iconBtnProps {
    iconName: string;
    iconSize?: number;
    variant?: ButtonVariant;
    onPress: () => void;
}



// const iconBtn: React.FC<iconBtnProps> = ({
//     iconName,
//     iconSize = SIZES.icon.medium,
//     variant = 'default',
//     onPress,
// }) => {
//     const getColors = () => {
//         if (iconName === 'add-circle') {
//             return COLORS.background.mint; // Use mint color for chosen add-circle
//         }
//         switch (variant) {
//             case 'default':
//                 return COLORS.button.default;
//             case 'choose':
//                 return COLORS.button.choose;
//             case 'disable':
//                 return COLORS.button.disable;
//             default:
//                 return COLORS.button.default;
//         }
//     };

//     const color = getColors();

//     return (
//         <Pressable
//             style={styles.iconContainer}
//             onPress={onPress}
//             disabled={variant === 'disable'} >
//             <Icon name={iconName} size={SIZES.icon.medium} color={color} style={{display: 'flex', justifyContent: 'center', alignItems: 'center',flex: 1,aspectRatio: 1/1}}/>
//         </Pressable>
//     )
// }


const styles = StyleSheet.create({

    icon: {
        display: 'flex',
        height: 28,
        padding: 3,
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        aspectRatio: 1 / 1,
    },
    iconContainer: {
        display: 'flex',
        padding: 5,
        justifyContent: 'center',
        alignItems: 'center',
        height: 40,
        gap: 10,
        borderRadius: 8,

    }
})

export { IconButton, };