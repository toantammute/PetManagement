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
import { sendChatMessage } from '../../services/geminiService';

interface MobileChatScreenProps {
  botType?: 'HealthTrendBot' | 'MediBot' | 'SideEffectHelper';
  headerTitle?: string;
}

interface ApiError {
  message: string;
  code?: string;
  details?: string;
}

// Quick reply suggestions based on bot type
const QUICK_REPLIES = {
  HealthTrendBot: [
    'Show vaccination trends',
    'Common pet diseases',
    'Preventative care',
  ],
  MediBot: [
    'Common medications',
    'Antibiotics side effects',
    'Medicine dosage info',
  ],
  SideEffectHelper: [
    'Report a side effect',
    'Vaccine reactions',
    'Medication risks',
  ]
};

const MobileChatScreen: React.FC<MobileChatScreenProps> = ({ 
  botType = 'HealthTrendBot',
  headerTitle = 'Pet Health Assistant'
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([]);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  
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

  // Add a welcome message when the component mounts
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      text: `Hello! I'm your ${getBotName(botType)}. How can I help you today?`,
      sender: 'bot',
      timestamp: new Date().toISOString(),
      botType
    };
    setMessages([welcomeMessage]);
    
    // Set initial suggested replies
    setSuggestedReplies(QUICK_REPLIES[botType] || QUICK_REPLIES.HealthTrendBot);
  }, [botType]);

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

  const getBotName = (type?: string) => {
    switch(type) {
      case 'HealthTrendBot':
        return 'Health Trend Bot';
      case 'MediBot':
        return 'Medication Assistant';
      case 'SideEffectHelper':
        return 'Side Effect Advisor';
      default:
        return 'Vet Assistant';
    }
  };

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
    // Add user message to the chat
    const userMessage: ChatMessage = {
      id: `${Date.now()}`,
      text,
      sender: 'user',
      timestamp: new Date().toISOString(),
      responseType: 'text',
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputText('');
    
    // Show typing indicator
    setIsLoading(true);
    
    try {
      // Simulate API call to get bot response
      const response = await sendChatMessage(text, botType);
      
      // Process the response to extract structured content
      const processedResponse = processBotResponse(response.message);
      
      // Create bot message with appropriate formatting
      const botMessage: ChatMessage = {
        id: `${Date.now() + 1}`,
        ...processedResponse,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        sentiment: response.sentiment || 'neutral',
        confidence: response.confidence || 95,
        botType,
        sourceDetails: response.sourceDetails,
        drugInfo: response.drugInfo,
        sideEffectReport: response.sideEffectReport,
      };
      
      // Delay to simulate typing
      setTimeout(() => {
        setIsLoading(false);
        setMessages(prevMessages => [...prevMessages, botMessage]);
      }, 1500);
      
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
        botType,
        sentiment: 'negative',
      };
      
      setMessages(prevMessages => [...prevMessages, errorMsg]);
      
      // Optionally show an alert for critical errors
      if (errorMessage.includes('network') || errorMessage.includes('connection')) {
        Alert.alert(
          'Connection Error',
          'Please check your internet connection and try again.',
          [{ text: 'OK' }]
        );
      }
    }
  };
  
  // Generate suggested replies based on the conversation
  const generateSuggestedReplies = (userMessage: string, botResponse: string) => {
    const lowercaseMessage = userMessage.toLowerCase();
    const lowercaseResponse = botResponse.toLowerCase();
    
    // Default suggestions based on bot type
    const defaultSuggestions = QUICK_REPLIES[botType] || [];
    
    // Context-aware suggestions
    let contextSuggestions: string[] = [];
    
    // Check for questions in the bot's response to suggest follow-up questions
    if (lowercaseResponse.includes('would you like to know more')) {
      contextSuggestions.push('Yes, tell me more');
    }
    
    if (lowercaseResponse.includes('side effect')) {
      contextSuggestions.push('Are these side effects common?');
      contextSuggestions.push('How to manage these side effects?');
    }
    
    if (lowercaseResponse.includes('medication') || lowercaseResponse.includes('drug')) {
      contextSuggestions.push('What are the side effects?');
      contextSuggestions.push('What is the correct dosage?');
    }
    
    if (lowercaseResponse.includes('vaccination') || lowercaseResponse.includes('vaccine')) {
      contextSuggestions.push('When is the next dose needed?');
      contextSuggestions.push('Are there any side effects?');
    }
    
    // If we have context-aware suggestions, use those, otherwise use defaults
    const newSuggestions = contextSuggestions.length > 0 
      ? contextSuggestions 
      : defaultSuggestions;
    
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
      // Try to handle structured API errors
      const apiError = error as ApiError;
      if (apiError.message) {
        return apiError.message;
      }
      
      // Handle other object-based errors
      if ('toString' in error) {
        return error.toString();
      }
    }
    
    // Fallback for any other error type
    return 'An unknown error occurred. Please try again.';
  };
  
  // Determine sentiment from response text
  const determineSentiment = (text: string): 'positive' | 'negative' | 'neutral' => {
    const lowercaseText = text.toLowerCase();
    
    // Check for positive indicators
    if (
      lowercaseText.includes('good news') ||
      lowercaseText.includes('positive') ||
      lowercaseText.includes('beneficial') ||
      lowercaseText.includes('recommended') ||
      lowercaseText.includes('safe')
    ) {
      return 'positive';
    }
    
    // Check for negative indicators
    if (
      lowercaseText.includes('warning') ||
      lowercaseText.includes('caution') ||
      lowercaseText.includes('adverse') ||
      lowercaseText.includes('harmful') ||
      lowercaseText.includes('negative') ||
      lowercaseText.includes('toxic') ||
      lowercaseText.includes('danger')
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
    
    if (response.message.length > 500) {
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
        if (botType === 'MediBot') {
          setInputText('What are common antibiotics for dogs?');
        } else if (botType === 'SideEffectHelper') {
          setInputText('What side effects should I watch for after vaccination?');
        } else {
          setInputText('Show me recent trends in pet health issues');
        }
      }, 2000);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.messageContainer}>
          <MobileMessageList messages={messages} />
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
              placeholder={`Ask your ${getBotName(botType)}...`}
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
  }
});

export default MobileChatScreen; 