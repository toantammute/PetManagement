import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Foundation';
import { COLORS } from '../theme/color';

interface FuncBtnProps {
    icon: string;
    variant: 'default' | 'choose';
    name: string;
    onPress: () => void;
}

const FuncBtn: React.FC<FuncBtnProps> = ({icon, variant, name, onPress}) => {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <Icon name={icon} size={20} color={COLORS.text.default} />
            <Text style={styles.text}>{name}</Text>
        </TouchableOpacity>
    )
}
const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        alignItems: 'center',
        justifyContent: 'center',
        // padding: 10,
        // alignSelf: 'stretch',
    },
    text:{
        color: COLORS.text.default,
        textAlign: 'center',
        fontSize: 8,
        fontWeight: 500,
        fontFamily: 'Poppins-Regular',
        fontStyle: 'normal',
        display: 'flex',
        justifyContent: 'center',
    }
})

export default FuncBtn;
