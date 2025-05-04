import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MobileChatScreen from '../component/chatbot/MobileChatScreen';

// Define interface for route params
interface ChatbotRouteParams {
  conversationId?: string;
}

// Define navigation and route types
type RootStackParamList = {
  ConversationList: undefined;
  ChatbotScreen: ChatbotRouteParams | undefined;
};

type ChatbotScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ChatbotScreenRouteProp = RouteProp<RootStackParamList, 'ChatbotScreen'>;

const ChatbotScreen = () => {
  const navigation = useNavigation<ChatbotScreenNavigationProp>();
  const route = useRoute<ChatbotScreenRouteProp>();
  const params = route.params || {};

  // Navigation header setup
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Text style={styles.headerTitle}>Pet Assistant</Text>
      ),
      headerLeft: () => (
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#4F46E5" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate('ConversationList')}
        >
          <MaterialIcons name="history" size={24} color="#4F46E5" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.chatContainer}>
        <MobileChatScreen route={{ params }} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerButton: {
    padding: 8,
  },
  chatContainer: {
    flex: 1,
  },
});

export default ChatbotScreen;