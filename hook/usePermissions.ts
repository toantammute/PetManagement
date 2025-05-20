import { useEffect } from 'react';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import messaging from '@react-native-firebase/messaging';

export const usePermissions = () => {
    const requestCameraPermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                    title: 'Camera Permission',
                    message: 'App needs access to your camera to take pet photos and identify breeds.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
            console.warn(err);
            return false;
        }
    };

    const requestStoragePermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
                {
                    title: 'Photo Access Permission',
                    message: 'App needs access to your photos to upload pet images and documents.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
            console.warn(err);
            return false;
        }
    };

    const requestNotificationPermission = async () => {
        try {
            if (Platform.OS === 'android') {
                if (parseInt(Platform.Version.toString(), 10) >= 33) {
                    const pushGranted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
                        {
                            title: 'Push Notification Permission',
                            message: 'Allow app to send you notifications about your pet\'s health, appointments, and important updates.',
                            buttonNeutral: 'Ask Me Later',
                            buttonNegative: 'Cancel',
                            buttonPositive: 'OK',
                        }
                    );

                    // Only proceed with Firebase if push notification permission is granted
                    if (pushGranted === PermissionsAndroid.RESULTS.GRANTED) {
                        const authStatus = await messaging().requestPermission();
                        const enabled =
                            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

                        if (enabled) {
                            console.log('Firebase notification permission granted');
                            const token = await messaging().getToken();
                            console.log('FCM Token:', token);
                        }
                        return enabled;
                    }
                    return false;
                } else {
                    // For Android < 13, directly request Firebase permission
                    const authStatus = await messaging().requestPermission();
                    const enabled =
                        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

                    if (enabled) {
                        console.log('Firebase notification permission granted');
                        const token = await messaging().getToken();
                        console.log('FCM Token:', token);
                    }
                    return enabled;
                }
            } else {
                // For iOS, only request Firebase permission
                const authStatus = await messaging().requestPermission();
                const enabled =
                    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

                if (enabled) {
                    console.log('Firebase notification permission granted');
                    const token = await messaging().getToken();
                    console.log('FCM Token:', token);
                }
                return enabled;
            }
        } catch (error) {
            console.log('Failed to get notification permission:', error);
            return false;
        }
    };

    const requestPermissions = async () => {
        if (Platform.OS === 'android') {
            const permissions = [
                {
                    name: 'camera',
                    request: requestCameraPermission,
                },
                {
                    name: 'storage',
                    request: requestStoragePermission,
                },
                {
                    name: 'notification',
                    request: requestNotificationPermission,
                },
            ];

            for (const permission of permissions) {
                const granted = await permission.request();
                console.log(`${permission.name} permission:`, granted ? 'granted' : 'denied');
            }
        } else {
            // iOS permissions are handled through Info.plist
            await requestNotificationPermission();
        }
    };

    useEffect(() => {
        requestPermissions();
    }, []);

    return { requestPermissions };
}; 