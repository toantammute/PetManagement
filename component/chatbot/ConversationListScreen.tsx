import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Platform
} from 'react-native';
import { listConversations, deleteConversation, ConversationState } from '../../services/geminiService';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Define navigation type
type RootStackParamList = {
  Chatbot: { conversationId?: string } | undefined;
  ConversationList: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ConversationListScreen = () => {
  const [conversations, setConversations] = useState<ConversationState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const conversationList = await listConversations(30);
      setConversations(conversationList);
    } catch (error) {
      console.error('Error loading conversations:', error);
      Alert.alert(
        'Lỗi',
        'Không thể tải danh sách cuộc trò chuyện. Vui lòng thử lại sau.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  const handleDeleteConversation = async (conversationId: string) => {
    Alert.alert(
      'Xóa cuộc trò chuyện',
      'Bạn có chắc chắn muốn xóa cuộc trò chuyện này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await deleteConversation(conversationId);
              if (success) {
                // Update the local state to remove the deleted conversation
                setConversations(conversations.filter(conv => conv.conversationId !== conversationId));
              } else {
                throw new Error('Failed to delete conversation');
              }
            } catch (error) {
              console.error('Error deleting conversation:', error);
              Alert.alert(
                'Lỗi',
                'Không thể xóa cuộc trò chuyện. Vui lòng thử lại sau.',
                [{ text: 'OK' }]
              );
            }
          }
        }
      ]
    );
  };

  const handleOpenConversation = (conversationId: string) => {
    navigation.navigate({
      name: 'Chatbot',
      params: { conversationId }
    });
  };

  // Format timestamp to a readable date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Hôm nay ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'Hôm qua ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays < 7) {
      const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
      return days[date.getDay()] + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit'
      });
    }
  };

  // Get a preview of the conversation
  const getConversationPreview = (conversation: ConversationState) => {
    if (!conversation.messages || conversation.messages.length === 0) {
      return 'Không có tin nhắn';
    }
    
    // Find the last message from the bot
    const lastBotMessage = [...conversation.messages]
      .reverse()
      .find(msg => msg.isBot);
      
    // If no bot message, use the last user message
    if (!lastBotMessage) {
      const lastUserMessage = conversation.messages[conversation.messages.length - 1];
      return lastUserMessage.message.length > 60 
        ? lastUserMessage.message.substring(0, 60) + '...'
        : lastUserMessage.message;
    }
    
    return lastBotMessage.message.length > 60 
      ? lastBotMessage.message.substring(0, 60) + '...'
      : lastBotMessage.message;
  };

  const renderConversationItem = ({ item }: { item: ConversationState }) => {
    return (
      <TouchableOpacity 
        style={styles.conversationItem}
        onPress={() => handleOpenConversation(item.conversationId)}
      >
        <View style={styles.conversationHeader}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="chat" size={24} color="#4F46E5" />
          </View>
          <View style={styles.conversationInfo}>
            <Text style={styles.previewText}>{getConversationPreview(item)}</Text>
            <Text style={styles.dateText}>{formatDate(item.lastActivity)}</Text>
          </View>
          <TouchableOpacity
            onPress={() => handleDeleteConversation(item.conversationId)}
            style={styles.deleteButton}
          >
            <MaterialIcons name="delete-outline" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.emptyText}>Đang tải cuộc trò chuyện...</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="chat-bubble-outline" size={60} color="#9CA3AF" />
        <Text style={styles.emptyText}>Không có cuộc trò chuyện nào</Text>
        <TouchableOpacity
          style={styles.newChatButton}
          onPress={() => navigation.navigate('Chatbot')}
        >
          <Text style={styles.newChatButtonText}>Bắt đầu cuộc trò chuyện mới</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cuộc trò chuyện của tôi</Text>
        <TouchableOpacity
          style={styles.newButton}
          onPress={() => navigation.navigate('Chatbot')}
        >
          <MaterialIcons name="add" size={24} color="#4F46E5" />
          <Text style={styles.newButtonText}>Mới</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={conversations}
        renderItem={renderConversationItem}
        keyExtractor={item => item.conversationId}
        contentContainerStyle={conversations.length === 0 ? { flex: 1 } : {}}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#4F46E5']}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newButtonText: {
    fontSize: 16,
    color: '#4F46E5',
    marginLeft: 4,
  },
  conversationItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  conversationInfo: {
    flex: 1,
  },
  previewText: {
    fontSize: 15,
    color: '#1F2937',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 13,
    color: '#6B7280',
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  newChatButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  newChatButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ConversationListScreen;