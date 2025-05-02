import React from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, SIZES, ButtonVariant } from '../theme/color';

interface TabButtonProps {
    tabName: string;
    variant?: ButtonVariant;
    onPress: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ 
    tabName,
    variant = 'default',
    onPress 
}) => {
    const getColors = () => {
        switch (variant) {
            case 'default':
                return COLORS.text.default;
            case 'choose':
                return COLORS.text.textChoose;
            default:
                return COLORS.text.default;
        }
    };
    const color = getColors();
    return (
        <TouchableOpacity
            style={[
                styles.button,
                variant === 'choose' && styles.buttonChosen // Add bottom border when chosen
            ]}
            onPress={onPress}
        >
            <Text style={[styles.text, { color: color }]}>{tabName}</Text>
        </TouchableOpacity>
    )
}
const styles = StyleSheet.create({
    button: {
        display: 'flex',
        paddingVertical: 10,
        paddingHorizontal: 8,
        justifyContent: 'center',
        alignItems: 'center',

    },
    text:{
        fontFamily: 'Inter',
        fontSize: SIZES.text.m,
        fontWeight: '600',
        textAlign: 'center',
        fontStyle: 'normal',
    },
    buttonChosen: {
        borderBottomWidth: 2,
        borderBottomColor: COLORS.button.choose,
    },
})

export default TabButton;

