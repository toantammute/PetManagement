import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, Image, StatusBar, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { COLORS } from '../theme/color';
import Header from '../component/header';
import { useGenerateQR } from '../hook/useCart';
import { QRRequest } from '../models/models';
import Toast from 'react-native-toast-message';

const QRPayment = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { orderDetail } = route.params as { orderDetail: any };
    const [qrCode, setQrCode] = useState<string>('');
    const { mutate: generateQR, isPending } = useGenerateQR();

    useEffect(() => {
        generateQRCode();
    }, []);

    const generateQRCode = () => {
        const qrData: QRRequest = {
            accountNo: "220220222419",
            accountName: "Pet Care Clinic",
            acqId: "970422",
            bank: "Vietcombank",
            amount: orderDetail.total_amount,
            addInfo: "Ung Ho Quy Vac Xin",
            format: "text",
            template: "E4jYBZ1",
            order_id: orderDetail.id
        };

        generateQR(qrData, {
            onSuccess: (response) => {
                if (response && response.data) {
                    setQrCode(response.data.qrDataURL);
                } else {
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: 'Failed to generate QR code'
                    });
                }
            },
            onError: (error) => {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Failed to generate QR code'
                });
                console.error('Error generating QR:', error);
            }
        });
    };

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
                <Header
                    title="QR Payment"
                    variant="default"
                />

                <View style={styles.content}>
                    <View style={styles.orderInfo}>
                        <Text style={styles.orderTitle}>Order Information</Text>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Order ID:</Text>
                            <Text style={styles.infoValue}>{orderDetail.id}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Amount:</Text>
                            <Text style={styles.infoValue}>{orderDetail.total_amount.toLocaleString('vi-VN')} VND</Text>
                        </View>
                    </View>

                    <View style={styles.qrContainer}>
                        {isPending ? (
                            <ActivityIndicator size="large" color={COLORS.button.choose} />
                        ) : qrCode ? (
                            <>
                                <Image
                                    source={{ uri: qrCode }}
                                    style={styles.qrCode}
                                    resizeMode="contain"
                                />
                                <Text style={styles.scanText}>Scan QR code to pay</Text>
                            </>
                        ) : (
                            <Text style={styles.errorText}>Failed to generate QR code</Text>
                        )}
                    </View>

                    <View style={styles.paymentInfo}>
                        <Text style={styles.paymentTitle}>Payment Information</Text>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Account Number:</Text>
                            <Text style={styles.infoValue}>220220222419</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Account Name:</Text>
                            <Text style={styles.infoValue}>Pet Care Clinic</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Bank:</Text>
                            <Text style={styles.infoValue}>Vietcombank (970422)</Text>
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background.white,
    },
    androidSafeArea: {
        paddingTop: StatusBar.currentHeight,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    orderInfo: {
        backgroundColor: COLORS.background.lightBlue,
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
    orderTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text.text,
        marginBottom: 12,
    },
    qrContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: COLORS.background.white,
        borderRadius: 12,
        marginBottom: 20,
        minHeight: 300,
    },
    qrCode: {
        width: 250,
        height: 250,
        marginBottom: 16,
    },
    scanText: {
        fontSize: 16,
        color: COLORS.text.default,
        marginTop: 12,
    },
    paymentInfo: {
        backgroundColor: COLORS.background.lightBlue,
        padding: 16,
        borderRadius: 12,
    },
    paymentTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text.text,
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoLabel: {
        fontSize: 15,
        color: COLORS.text.default,
        flex: 1,
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.text.text,
        flex: 2,
        textAlign: 'right',
    },
    errorText: {
        color: COLORS.status.cancel,
        fontSize: 16,
        textAlign: 'center',
    },
});

export default QRPayment; 