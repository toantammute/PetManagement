import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme/color';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

type HeaderVariant = 'default' | 'three-dot' | 'save';

interface HeaderProps {
    title: string;
    variant?: HeaderVariant;
    onSave?: () => void;
    onThreeDotPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, variant = 'default', onSave, onThreeDotPress }) => {

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
                            color={COLORS.text.textDisable} 
                            style={{
                                paddingHorizontal: 4,
                            }}
                        />
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
                <Feather name='chevron-left' size={25} color={COLORS.text.textDisable}/>
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
        fontSize: 20,
        fontWeight: '500',
        color: COLORS.text.textDisable,
        fontFamily: 'Poppins-Regular',
        fontStyle: 'normal',
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
});

export default Header;
