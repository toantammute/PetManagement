import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  SafeAreaView, 
  ActivityIndicator, 
  Alert,
  Animated,
  ScrollView,
  Keyboard,
  Text,
  Vibration
} from 'react-native';
import { ChatMessage } from './MessageList';
import MobileMessageList from './MobileMessageList';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { 
  sendChatMessage, 
  fetchConversationHistory,
  listConversations,
  deleteConversation,
  ConversationState,
  MessageEntry
} from '../../services/geminiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Define navigation types
type RootStackParamList = {
  ConversationList: undefined;
  ChatbotScreen: { conversationId?: string } | undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface MobileChatScreenProps {
  userId?: string;
  route?: {
    params?: {
      conversationId?: string;
    }
  };
}

// Quick reply suggestions for Pet Assistant
const QUICK_REPLIES = [
  'Các loại bệnh phổ biến ở chó',
  'Lịch tiêm phòng cho mèo',
  'Cách chăm sóc thú cưng',
  'Dinh dưỡng cho thú cưng',
  'Các loại vaccine cần thiết',
];

const MobileChatScreen: React.FC<MobileChatScreenProps> = ({ userId = '', route }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([]);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(route?.params?.conversationId || null);
  
  const navigation = useNavigation<NavigationProp>();
  const inputRef = useRef<TextInput>(null);
  const bottomSheetAnim = useRef(new Animated.Value(0)).current;
  const recordingAnim = useRef(new Animated.Value(1)).current;

  // Setup keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Load conversation history when component mounts or conversationId changes
  useEffect(() => {
    // Load conversation history if we have a conversationId
    if (conversationId) {
      loadConversationHistory(conversationId);
    }
  }, [conversationId]);

  // Load conversation history from the API
  const loadConversationHistory = async (convId: string) => {
    try {
      setIsLoading(true);
      const conversation = await fetchConversationHistory(convId);
      
      if (conversation && conversation.messages) {
        // Convert the backend message format to our UI message format
        const uiMessages: ChatMessage[] = conversation.messages.map((msg: MessageEntry) => ({
          id: `${msg.timestamp}`,
          text: msg.message,
          sender: msg.isBot ? 'bot' : 'user',
          timestamp: new Date(msg.timestamp * 1000).toISOString(),
          responseType: 'text',
          conversationId: convId
        }));
        
        if (uiMessages.length > 0) {
          setMessages(uiMessages);
          
          // Set suggested replies from the conversation state if available
          if (conversation.suggestedFollowUps && conversation.suggestedFollowUps.length > 0) {
            setSuggestedReplies(conversation.suggestedFollowUps.slice(0, 3));
          }
        }
      }
    } catch (error: any) {
      console.error('Error loading conversation history:', error);
      
      // Check if it's an authentication error (403 Forbidden)
      if (error.message && (
          error.message.includes('403') || 
          error.message.includes('unauthorized') || 
          error.message.includes('Phiên đăng nhập đã hết hạn')
        )) {
        
        // Try to handle expired auth gracefully
        Alert.alert(
          'Phiên đăng nhập đã hết hạn',
          'Phiên đăng nhập của bạn đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.',
          [
            { 
              text: 'Đăng nhập lại', 
              onPress: () => {
                // Clear conversation ID
                setConversationId(null);
                // Clear any auth tokens
                AsyncStorage.removeItem('accessToken');
                // Navigate to login (you may need to adjust this based on your navigation setup)
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'login' }],
                  })
                );
              }
            },
            { 
              text: 'Bỏ qua', 
              style: 'cancel',
              onPress: () => {
                // Set empty state for a new conversation
                setConversationId(null);
                const welcomeMessage: ChatMessage = {
                  id: 'welcome',
                  text: `Xin chào! Tôi là Trợ lý Thú cưng. Tôi có thể giúp gì cho bạn?`,
                  sender: 'bot',
                  timestamp: new Date().toISOString(),
                };
                setMessages([welcomeMessage]);
              }
            }
          ]
        );
      } else {
        // For other errors, just show a simple alert
        Alert.alert(
          'Lỗi',
          'Không thể tải lịch sử cuộc trò chuyện. Vui lòng thử lại sau.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Add a welcome message when the component mounts and there's no conversation ID
  useEffect(() => {
    // Only show welcome message for new conversations
    if (!conversationId && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        text: `Xin chào! Tôi là Trợ lý Thú cưng. Tôi có thể giúp gì cho bạn?`,
        sender: 'bot',
        timestamp: new Date().toISOString(),
      };
      setMessages([welcomeMessage]);
      
      // Set initial suggested replies
      setSuggestedReplies(QUICK_REPLIES.slice(0, 3));
    }
  }, [conversationId]);

  // Animate recording pulsing effect
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(recordingAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(recordingAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      Animated.timing(recordingAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isRecording, recordingAnim]);

  // Process bot response to extract structured content
  const processBotResponse = (text: string): { 
    text: string,
    responseType: 'text' | 'list' | 'image',
    listItems?: string[],
    imageUrl?: string
  } => {
    // Default response
    const response = {
      text: text,
      responseType: 'text' as const,
    };

    // Check if response contains a list (bullets or numbered)
    if (text.includes('<ul>') || text.includes('<li>')) {
      // Extract list items
      const listItems: string[] = [];
      const listRegex = /<li[^>]*>(.*?)<\/li>/g;
      let match;
      
      while ((match = listRegex.exec(text)) !== null) {
        listItems.push(match[1].trim());
      }
      
      if (listItems.length > 0) {
        // Get the text before the list
        let mainText = text.split('<ul>')[0].trim();
        // Remove any remaining HTML tags
        mainText = mainText.replace(/<[^>]*>/g, '');
        
        return {
          text: mainText,
          responseType: 'list',
          listItems
        };
      }
    }
    
    // Check for section structure
    if (text.includes('section-header') || text.includes('section-content')) {
      // Extract sections and format them more clearly
      let cleanText = '';
      
      // Extract headers
      const headerRegex = /<[^>]*section-header[^>]*>(.*?)<\/[^>]*>/g;
      let headerMatch;
      while ((headerMatch = headerRegex.exec(text)) !== null) {
        cleanText += `${headerMatch[1].trim()}\n\n`;
      }
      
      // Extract content sections
      const contentRegex = /<[^>]*section-content[^>]*>(.*?)<\/[^>]*>/gs;
      let contentMatch;
      while ((contentMatch = contentRegex.exec(text)) !== null) {
        cleanText += `${contentMatch[1].replace(/<[^>]*>/g, '').trim()}\n\n`;
      }
      
      return {
        text: cleanText.trim(),
        responseType: 'text'
      };
    }
    
    // Check for follow-up suggestions
    if (text.includes('follow-up-section')) {
      const parts = text.split('<div class=\'follow-up-section\'>');
      
      if (parts.length > 1) {
        const mainContent = parts[0].replace(/<[^>]*>/g, '').trim();
        
        // Extract follow-up items
        const followUps: string[] = [];
        const followUpRegex = /<li[^>]*follow-up-item[^>]*>(.*?)<\/li>/g;
        let followUpMatch;
        
        while ((followUpMatch = followUpRegex.exec(parts[1])) !== null) {
          followUps.push(followUpMatch[1].trim());
        }
        
        if (followUps.length > 0) {
          return {
            text: mainContent,
            responseType: 'list',
            listItems: followUps
          };
        }
      }
    }
    
    // If no special formatting needed, just clean the text of HTML tags
    return {
      text: text.replace(/<[^>]*>/g, '').trim(),
      responseType: 'text'
    };
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    // Add user message to the chat
    const userMessage: ChatMessage = {
      id: `${Date.now()}`,
      text,
      sender: 'user',
      timestamp: new Date().toISOString(),
      responseType: 'text',
      conversationId: conversationId || undefined,
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputText('');
    
    // Show typing indicator
    setIsLoading(true);
    
    try {
      console.log('Sending message:', text);
      // Call the API with current conversation ID
      const response = await sendChatMessage(text, conversationId || undefined, 'vi');
      console.log('Received response:', response);
      // Process the response to extract structured content
      const processedResponse = processBotResponse(response.message);
      
      // Update conversation ID if provided
      if (response.conversationId) {
        setConversationId(response.conversationId);
      }
      
      // Create bot message with appropriate formatting
      const botMessage: ChatMessage = {
        id: `${Date.now() + 1}`,
        ...processedResponse,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        sentiment: determineSentiment(response.message),
        confidence: response.confidence || determineConfidence(response),
        sourceDetails: response.sourceDetails,
        drugInfo: response.drugInfo,
        sideEffectReport: response.sideEffectReport,
        conversationId: response.conversationId,
        followUpQuestions: response.followUpQuestions,
        priorityLevel: response.priorityLevel,
      };
      
      // Delay to simulate typing
      setTimeout(() => {
        setIsLoading(false);
        setMessages(prevMessages => [...prevMessages, botMessage]);
        
        // Set suggested replies from follow-up questions if available
        if (response.followUpQuestions && response.followUpQuestions.length > 0) {
          setSuggestedReplies(response.followUpQuestions.slice(0, 3));
        } else {
          // Otherwise generate contextual suggestions
          generateSuggestedReplies(text, response.message);
        }
      }, 500);
      
    } catch (error: unknown) {
      console.error('Error sending message:', error);
      setIsLoading(false);
      
      // Add error message
      const errorMessage = getErrorMessage(error);
      
      // Show subtle vibration for error
      Vibration.vibrate([0, 30, 30, 30]);
      
      const errorMsg: ChatMessage = {
        id: 'error-' + Date.now(),
        text: errorMessage,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        isError: true,
        sentiment: 'negative',
      };
      
      setMessages(prevMessages => [...prevMessages, errorMsg]);
      
      // Handle different types of errors with appropriate feedback
      if (errorMessage.includes('network') || errorMessage.includes('connection')) {
        Alert.alert(
          'Lỗi kết nối',
          'Vui lòng kiểm tra kết nối internet và thử lại.',
          [{ text: 'OK' }]
        );
      } else if (errorMessage.includes('Unauthorized') || errorMessage.includes('unauthorized') || errorMessage.includes('payload not found')) {
       
      }
    }
  };
  
  // Generate suggested replies based on the conversation
  const generateSuggestedReplies = (userMessage: string, botResponse: string) => {
    const lowercaseMessage = userMessage.toLowerCase();
    const lowercaseResponse = botResponse.toLowerCase();
    
    // Context-aware suggestions
    let contextSuggestions: string[] = [];
    
    // Check for questions in the bot's response to suggest follow-up questions
    if (lowercaseResponse.includes('bạn có muốn biết thêm')) {
      contextSuggestions.push('Có, hãy cho tôi biết thêm');
    }
    
    if (lowercaseResponse.includes('tác dụng phụ')) {
      contextSuggestions.push('Những tác dụng phụ này có phổ biến không?');
      contextSuggestions.push('Cách xử lý tác dụng phụ?');
    }
    
    if (lowercaseResponse.includes('thuốc') || lowercaseResponse.includes('dược phẩm')) {
      contextSuggestions.push('Tác dụng phụ là gì?');
      contextSuggestions.push('Liều lượng chính xác là bao nhiêu?');
    }
    
    if (lowercaseResponse.includes('tiêm phòng') || lowercaseResponse.includes('vaccine')) {
      contextSuggestions.push('Khi nào cần tiêm mũi tiếp theo?');
      contextSuggestions.push('Có tác dụng phụ nào không?');
    }
    
    // If we have context-aware suggestions, use those, otherwise use defaults
    const newSuggestions = contextSuggestions.length > 0 
      ? contextSuggestions 
      : QUICK_REPLIES;
    
    // Don't repeat the exact same message the user just sent
    const filteredSuggestions = newSuggestions.filter(
      suggestion => suggestion.toLowerCase() !== lowercaseMessage
    );
    
    // Limit to 3 suggestions
    setSuggestedReplies(filteredSuggestions.slice(0, 3));
  };
  
  // Helper function to extract error message from different error types
  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }
    
    if (typeof error === 'object' && error !== null) {
    
      // Handle other object-based errors
      if ('toString' in error) {
        return error.toString();
      }
    }
    
    // Fallback for any other error type
    return 'Đã xảy ra lỗi. Vui lòng thử lại.';
  };
  
  // Determine sentiment from response text
  const determineSentiment = (text: string): 'positive' | 'negative' | 'neutral' => {
    const lowercaseText = text.toLowerCase();
    
    // Check for positive indicators
    if (
      lowercaseText.includes('tin tốt') ||
      lowercaseText.includes('tích cực') ||
      lowercaseText.includes('có lợi') ||
      lowercaseText.includes('khuyến nghị') ||
      lowercaseText.includes('an toàn')
    ) {
      return 'positive';
    }
    
    // Check for negative indicators
    if (
      lowercaseText.includes('cảnh báo') ||
      lowercaseText.includes('thận trọng') ||
      lowercaseText.includes('bất lợi') ||
      lowercaseText.includes('có hại') ||
      lowercaseText.includes('tiêu cực') ||
      lowercaseText.includes('độc hại') ||
      lowercaseText.includes('nguy hiểm')
    ) {
      return 'negative';
    }
    
    return 'neutral';
  };
  
  // Determine confidence level
  const determineConfidence = (response: any): number => {
    // If response includes a confidence score, use it
    if (response.confidence) {
      return response.confidence;
    }
    
    // Base confidence on response length and detail
    let confidence = 70; // Default mid-range confidence
    
    if (response.message && response.message.length > 500) {
      confidence += 15; // Longer, more detailed responses
    }
    
    if (response.sourceDetails) {
      confidence += 10; // Has sources
    }
    
    if (response.drugInfo || response.sideEffectReport) {
      confidence += 10; // Has specific structured data
    }
    
    // Cap at 95
    return Math.min(confidence, 95);
  };
  
  const toggleVoiceRecording = () => {
    setIsRecording(!isRecording);
    
    // Simulate voice input (in a real app, replace with actual voice recognition)
    if (!isRecording) {
      // Provide vibration feedback
      Vibration.vibrate(20);
      
      setTimeout(() => {
        // Simulate end of recording after 2 seconds
        setIsRecording(false);
        
        // In a real implementation, you would process the voice data
        // and convert it to text. Here we just simulate it.
        setInputText('Cho tôi biết cách chăm sóc chó con');
      }, 2000);
    }
  };

  // Reset conversation
  const resetConversation = async () => {
    try {
      // Clear conversation ID from storage
      if (conversationId) {
        await AsyncStorage.removeItem(`conversation_id_PetAssistant`);
      }
      
      // Reset state
      setConversationId(null);
      
      // Reset messages to just the welcome message
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        text: `Xin chào! Tôi là Trợ lý Thú cưng. Tôi có thể giúp gì cho bạn?`,
        sender: 'bot',
        timestamp: new Date().toISOString(),
      };
      
      setMessages([welcomeMessage]);
      setSuggestedReplies(QUICK_REPLIES.slice(0, 3));
      
      // Provide feedback that conversation was reset
      Alert.alert(
        'Cuộc trò chuyện mới',
        'Cuộc trò chuyện của bạn đã được đặt lại.',
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('Error resetting conversation:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={22} color="#4F46E5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trợ lý ảo</Text>
        <TouchableOpacity 
          style={styles.historyButton}
          onPress={() => navigation.navigate('ConversationList')}
        >
          <MaterialIcons name="history" size={22} color="#4F46E5" />
        </TouchableOpacity>
      </View>
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.messageContainer}>
          <MobileMessageList 
            messages={messages} 
            onFollowUpPress={handleSendMessage}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <Animated.View 
              style={[
                styles.recordButton,
                {
                  transform: [{ scale: recordingAnim }],
                  backgroundColor: isRecording ? '#EF4444' : '#E5E7EB'
                }
              ]}
            >
              <TouchableOpacity
                onPress={toggleVoiceRecording}
                style={styles.recordButtonTouchable}
              >
                <MaterialIcons 
                  name={isRecording ? "mic" : "mic-none"} 
                  size={22} 
                  color={isRecording ? "#fff" : "#6B7280"} 
                />
              </TouchableOpacity>
            </Animated.View>
            
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Hãy đặt câu hỏi về thú cưng của bạn..."
              placeholderTextColor="#9CA3AF"
              multiline
              returnKeyType="send"
              onSubmitEditing={() => handleSendMessage(inputText)}
              blurOnSubmit={false}
            />
            
            <TouchableOpacity 
              style={[
                styles.sendButton, 
                (!inputText.trim() || isLoading) && styles.disabledButton
              ]} 
              onPress={() => handleSendMessage(inputText)}
              disabled={!inputText.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <MaterialIcons name="send" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
          
          {suggestedReplies.length > 0 && !isKeyboardVisible && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.suggestedRepliesContainer}
              contentContainerStyle={styles.suggestedRepliesContent}
            >
              {suggestedReplies.map((reply, index) => (
                <TouchableOpacity
                  key={`suggestion-${index}`}
                  style={styles.suggestionChip}
                  onPress={() => handleSendMessage(reply)}
                  disabled={isLoading}
                >
                  <Text style={styles.suggestionChipText}>{reply}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          
          {conversationId && (
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={resetConversation}
            >
              <MaterialIcons name="refresh" size={16} color="#9CA3AF" />
              <Text style={styles.resetButtonText}>Cuộc hội thoại mới</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4F46E5',
    textAlign: 'center',
  },
  historyButton: {
    padding: 5,
  },
  keyboardAvoid: {
    flex: 1,
  },
  messageContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  inputContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  recordButtonTouchable: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 80,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 16,
    paddingRight: 40,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sendButton: {
    position: 'absolute',
    right: 10,
    backgroundColor: '#4F46E5',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  suggestedRepliesContainer: {
    marginTop: 8,
    maxHeight: 40,
  },
  suggestedRepliesContent: {
    paddingRight: 8,
  },
  suggestionChip: {
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  suggestionChipText: {
    fontSize: 14,
    color: '#4F46E5',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 4,
  },
  resetButtonText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  }
});

export default MobileChatScreen;