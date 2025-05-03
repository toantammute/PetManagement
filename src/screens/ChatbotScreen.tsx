import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MobileChatScreen from '../chatbot/MobileChatScreen';

// Define the route params type
type ChatRouteParams = {
  botType?: 'HealthTrendBot' | 'MediBot' | 'SideEffectHelper';
};

// The available bot types
const BOT_TYPES = [
  { id: 'MediBot', name: 'Medication Info', icon: 'medication' },
  { id: 'SideEffectHelper', name: 'Side Effect Help', icon: 'healing' }
];

const ChatbotScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<Record<string, ChatRouteParams>, string>>();
  // Get initialBotType from route params or default to HealthTrendBot
  const initialBotType = route.params?.botType || 'HealthTrendBot';
  const [activeBotType, setActiveBotType] = useState<'HealthTrendBot' | 'MediBot' | 'SideEffectHelper'>(initialBotType);

  // Get the header title based on bot type
  const getHeaderTitle = (botType: string) => {
    switch(botType) {
      case 'HealthTrendBot':
        return 'Health Trends';
      case 'MediBot':
        return 'Medication Assistant';
      case 'SideEffectHelper':
        return 'Side Effect Helper';
      default:
        return 'Pet Health Assistant';
    }
  };

  // Navigation header setup
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Text style={styles.headerTitle}>{getHeaderTitle(activeBotType)}</Text>
      ),
      headerLeft: () => (
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#4F46E5" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, activeBotType]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.botSelectorContainer}>
        {BOT_TYPES.map((bot) => (
          <TouchableOpacity
            key={bot.id}
            style={[
              styles.botSelector,
              activeBotType === bot.id && styles.activeBotSelector
            ]}
            onPress={() => setActiveBotType(bot.id as 'HealthTrendBot' | 'MediBot' | 'SideEffectHelper')}
          >
            <MaterialIcons
              name={bot.icon}
              size={20}
              color={activeBotType === bot.id ? '#4F46E5' : '#6B7280'}
            />
            <Text
              style={[
                styles.botSelectorText,
                activeBotType === bot.id && styles.activeBotSelectorText
              ]}
            >
              {bot.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.chatContainer}>
        <MobileChatScreen botType={activeBotType} />
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
  botSelectorContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  botSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  activeBotSelector: {
    backgroundColor: '#EEF2FF',
  },
  botSelectorText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeBotSelectorText: {
    color: '#4F46E5',
  },
  chatContainer: {
    flex: 1,
  },
});

export default ChatbotScreen; 