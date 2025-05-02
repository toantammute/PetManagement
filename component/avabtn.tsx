import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, SIZES, ButtonVariant } from '../theme/color';
import Icon from 'react-native-vector-icons/Foundation';

type AvaBtnVariant = 'default' | 'noava' | 'all';

interface AvaBtnProps {
    petName?: string;
    variant: AvaBtnVariant;
    onPress: () => void;
    imageUrl?: string;
    isChosen?: boolean;
    showPetName?: boolean;
    size?: number;
}

const AvaBtn: React.FC<AvaBtnProps> = ({
    variant,
    petName,
    onPress,
    imageUrl,
    isChosen = false,
    showPetName = true,
    size = 50
}) => {
    const renderContent = () => {
        switch (variant) {
            case 'all':
                return <Text style={styles.text}>ALL PETS</Text>;
            case 'noava':
                return (
                    <Icon
                        name='paw'
                        size={size/1.5}
                        color={COLORS.button.icon}
                    />
                );
            case 'default':
                return (
                    <Image
                        source={{ uri: imageUrl }}
                        style={
                            styles.image
                        }
                    />
                );
        }
    };
    return (
        <View style={styles.container}>
            <Pressable
                onPress={onPress}
                style={[
                    styles.outCircle,
                    {
                        borderColor: isChosen ? COLORS.border.mintbrd : COLORS.border.avatar,
                        width: size,
                        height: size,
                        borderRadius: size / 2
                    }
                ]}
            >
                <View
                    style={[
                        styles.button,
                        styles.circle,
                        { borderRadius: size / 2 }
                    ]}>
                    {renderContent()}
                </View>
            </Pressable>
            <Text style={styles.petName}>{petName}</Text>
        </View>

    )
}

const styles = StyleSheet.create({

    outCircle: {
        padding: 2,
        borderWidth: 1,
        borderColor: COLORS.border.mintbrd,
    },
    button: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    circle: {
        backgroundColor: COLORS.background.lightBlue,
        borderWidth: 1,
        borderColor: COLORS.border.avatar,
        overflow: 'hidden', 
    },
    circleChosen: {
        backgroundColor: COLORS.background.gray,
    },
    text: {
        fontSize: SIZES.text.s,
        textAlign: 'center',
        color: COLORS.text.text,
        paddingHorizontal: 2,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
    },
    petName: {
        fontSize: SIZES.text.s,
        textAlign: 'center',
        color: COLORS.text.default,
        fontWeight: '400',
        fontFamily: 'Inter',
        fontStyle: 'normal',
    },


})

export default AvaBtn;
