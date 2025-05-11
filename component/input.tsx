import React, { ReactNode } from 'react';
import { Text, View, TextInput, StyleSheet } from 'react-native';
import { COLORS } from '../theme/color';

interface InputProps {
    label: string;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    secureTextEntry?: boolean;
    editable?: boolean;
    rightIcon?: ReactNode;
    inputStyle?: object;
}

const Input: React.FC<InputProps> = ({ 
    label, 
    placeholder, 
    value, 
    onChangeText,
    secureTextEntry = false,
    editable = true,
    rightIcon,
    inputStyle
}) => {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputContainer}>
                <TextInput 
                    style={[styles.input, rightIcon ? styles.inputWithIcon : undefined, inputStyle]}
                    placeholder={placeholder} 
                    value={value} 
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry}
                    editable={editable}
                />
                {rightIcon && (
                    <View style={styles.rightIconContainer}>
                        {rightIcon}
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        alignSelf: 'stretch',
        gap: 6,
        marginBottom: 10
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.text.textChoose,
        lineHeight: 20,
        letterSpacing: -0.28,
    },
    inputContainer: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'stretch',
    },
    input: {
        flex: 1,
        height: 48,
        borderWidth: 1,
        borderColor: COLORS.border.input,
        borderRadius: 6,
        paddingHorizontal: 12,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    inputWithIcon: {
        paddingRight: 45,
    },
    rightIconContainer: {
        position: 'absolute',
        right: 0,
        height: '100%',
        justifyContent: 'center',
        paddingHorizontal: 15,
    }
});

export default Input;