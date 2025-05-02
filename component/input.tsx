import React from 'react';
import { Text, View, TextInput, StyleSheet } from 'react-native';
import { COLORS } from '../theme/color';

interface InputProps {
    label: string;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    secureTextEntry?: boolean; // Thêm thuộc tính này
    editable?: boolean;
}

const Input: React.FC<InputProps> = ({ 
    label, 
    placeholder, 
    value, 
    onChangeText,
    secureTextEntry = false,
    editable = true
}) => {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TextInput 
                style={styles.input}
                placeholder={placeholder} 
                value={value} 
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry}
                editable={editable}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        // marginBottom: 16,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        alignSelf: 'stretch',
        gap:6

    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        // marginBottom: 6,
        color: COLORS.text.textChoose,
        lineHeight: 20,
        letterSpacing: -0.28,
    },
    input: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: 12,
        flex:1,
        alignSelf: 'stretch',
        borderWidth: 1,
        borderColor: COLORS.border.input,
        borderRadius: 6,
        paddingHorizontal: 12,
        // paddingVertical: 10,
        fontSize: 16,
        backgroundColor: '#fff',
    }
});

export default Input;