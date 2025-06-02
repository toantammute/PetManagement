import React from 'react';
import { View, Text, StyleSheet, Platform, SafeAreaView, StatusBar } from 'react-native';
import Header from '../component/header';
import { COLORS } from '../theme/color';

const History = () => {
    return (
        <>
            <StatusBar
                barStyle="dark-content"
                backgroundColor={COLORS.background.gray}
            />
            <SafeAreaView style={[
                styles.container,
                Platform.OS === 'android' && styles.androidSafeArea
            ]}>
                <View style={styles.container}>
                    <Header title="History" />
                    <View style={styles.contentContainer}>
                        <Text style={styles.text}>
                            This feature is under development, we will update soon
                        </Text>
                    </View>
                </View>
            </SafeAreaView>
        </>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    androidSafeArea: {
        paddingTop: StatusBar.currentHeight,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    text: {
        fontSize: 16,
        textAlign: 'center',
        color: '#666',
    },
});

export default History;
