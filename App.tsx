import React, { useEffect } from 'react';
import type { PropsWithChildren } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Alert,
} from 'react-native';
import { PUSH_NOTI } from '@env';
import {AuthProvider} from './context/AuthContext';
import {enableScreens} from 'react-native-screens';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import AppNavigator from './AppNavigator';
import Toast from 'react-native-toast-message';
import { usePermissions } from './hook/usePermissions';

const App = () => {
  usePermissions();

  useEffect(() => {
    PushNotification.createChannel(
      {
        channelId: "default-channel-id",
        channelName: "default Channel",
        channelDescription: "A default channel",
        soundName: "default",
        importance: 4,
        vibrate: true
      },
      (created) => console.log(`Channel created: ${created}`)
    )
  }, [])

  // Foreground Notification Handling
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log('Notification received in foreground:', remoteMessage);

      PushNotification.localNotification({
        channelId: 'default-channel-id',
        title: remoteMessage.notification?.title || 'Notification',
        message: remoteMessage.notification?.body || 'New message',
        playSound: true,
        soundName: 'default',
        importance: 'high',
        vibrate: true,
      });
    });

    return unsubscribe;
  }, [])

  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
  };
  
  enableScreens();
  const queryClient = new QueryClient();

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={backgroundStyle.backgroundColor}
        />
        <AppNavigator />
        <Toast />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;