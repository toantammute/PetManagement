import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';

class NotificationService {
  async requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    return authStatus === messaging.AuthorizationStatus.AUTHORIZED || 
           authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  }

  async getFCMToken() {
    try {
      const token = await messaging().getToken();
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  createDefaultChannel() {
    PushNotification.createChannel(
      {
        channelId: 'default',
        channelName: 'Default Channel',
        channelDescription: 'A default channel for notifications',
        soundName: 'default',
        importance: 4,
        vibrate: true,
      },
      (created) => console.log(`Channel created: ${created}`)
    );
  }

  showNotification(title: string, message: string, data = {}) {
    PushNotification.localNotification({
      channelId: 'default',
      title,
      message,
      playSound: true,
      soundName: 'default',
      importance: "low",
      vibrate: true,
      
    });
  }

  // Xử lý notification khi app đang chạy
  onForegroundMessage() {
    return messaging().onMessage(async (remoteMessage) => {
      console.log('Received foreground message:', remoteMessage);
      this.showNotification(
        remoteMessage.notification?.title || '',
        remoteMessage.notification?.body || '',
        remoteMessage.data
      );
    });
  }

  // Xử lý notification khi app ở background
  onBackgroundMessage() {
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Received background message:', remoteMessage);
      this.showNotification(
        remoteMessage.notification?.title || '',
        remoteMessage.notification?.body || '',
        remoteMessage.data
      );
    });
  }

  // Xử lý khi người dùng click vào notification
  onNotificationOpen() {
    return messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification opened app:', remoteMessage);
      // Trả về data để xử lý navigation
      return remoteMessage.data;
    });
  }

  // Xử lý notification khi app đang tắt
  async getInitialNotification() {
    const remoteMessage = await messaging().getInitialNotification();
    if (remoteMessage) {
      console.log('Initial notification:', remoteMessage);
      return remoteMessage.data;
    }
    return null;
  }
}

export default new NotificationService(); 