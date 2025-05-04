import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  Image,
  Animated,
  TouchableOpacity
} from 'react-native';
import { ChatMessage } from './MessageList';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface MobileMessageListProps {
  messages: ChatMessage[];
  onFollowUpPress?: (question: string) => void;
}

const MobileMessageList: React.FC<MobileMessageListProps> = ({ 
  messages,
  onFollowUpPress 
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Scroll to the bottom when messages change
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
    
    // Animate new message appearance
    if (messages.length > 0) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start();
    }
  }, [messages, fadeAnim]);

  // Format timestamp to a readable format
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Sửa đổi hàm getBotName để chỉ hiển thị tên của chatbot duy nhất
  const getBotName = (botType?: string) => {
    return 'Trợ lý Thú cưng';
  };

  // Render message content based on type
  const renderMessageContent = (message: ChatMessage) => {
    // Check if this is an image message type
    if (message.responseType === 'image' && message.imageUrl) {
      return (
        <View style={styles.mediaContainer}>
          <Image
            source={{ uri: message.imageUrl }}
            style={styles.imageContent}
            resizeMode="cover"
          />
          <Text style={styles.messageText}>{cleanResponseText(message.text)}</Text>
        </View>
      );
    }
    
    // Check if this is a list message type
    if (message.responseType === 'list' && message.listItems && message.listItems.length > 0) {
      return (
        <View>
          <Text style={styles.messageText}>{cleanResponseText(message.text)}</Text>
          <View style={styles.listContainer}>
            {message.listItems.map((item, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.listItemText}>{cleanResponseText(item)}</Text>
              </View>
            ))}
          </View>
        </View>
      );
    }
    
    // Special handling for medical advice responses
    if (message.sender === 'bot' && isMedicalAdviceResponse(message.text)) {
      return renderMedicalAdviceContent(message.text, message.followUpQuestions);
    }
    
    // Default text message
    return (
      <Text style={[
        styles.messageText,
        message.sender === 'user' && styles.userMessageText
      ]}>
        {cleanResponseText(message.text)}
      </Text>
    );
  };
  
  // Check if text appears to be medical advice
  const isMedicalAdviceResponse = (text: string): boolean => {
    if (!text) return false;
    
    const lowerText = text.toLowerCase();
    return (
      (lowerText.includes('bác sĩ') || lowerText.includes('y tế') || 
       lowerText.includes('thuốc') || lowerText.includes('triệu chứng') ||
       lowerText.includes('điều trị') || lowerText.includes('sốt') ||
       lowerText.includes('bệnh') || lowerText.includes('sức khỏe') ||
       lowerText.includes('khám') || lowerText.includes('uống thuốc'))
    );
  };
  
  // Render enhanced medical advice content with proper formatting
  const renderMedicalAdviceContent = (text: string, followUpQuestions?: string[]) => {
    // Split text into paragraphs
    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
    
    // Find and format bullet point lists
    const formattedParagraphs = paragraphs.map((paragraph, index) => {
      // If paragraph contains bullet points (*)
      if (paragraph.includes('* ')) {
        const listItems = paragraph.split('* ').filter(item => item.trim().length > 0);
        return (
          <View key={`paragraph-${index}`} style={styles.adviceParagraph}>
            {listItems.map((item, itemIndex) => (
              <View key={`item-${itemIndex}`} style={styles.adviceListItem}>
                <View style={styles.adviceBulletPoint} />
                <Text style={styles.adviceListItemText}>{item.trim()}</Text>
              </View>
            ))}
          </View>
        );
      }
      
      // Check if it's a header (often in bold or emphasized)
      if (paragraph.startsWith('**') || paragraph.includes(':')) {
        return (
          <Text key={`paragraph-${index}`} style={styles.adviceHeader}>
            {paragraph.replace(/\*\*/g, '')}
          </Text>
        );
      }
      
      // Regular paragraph
      return (
        <Text key={`paragraph-${index}`} style={styles.adviceParagraph}>
          {paragraph}
        </Text>
      );
    });
    
    // Add disclaimer notice for medical advice
    return (
      <View style={styles.adviceContainer}>
        <View style={styles.medicalInfoHeader}>
          <MaterialIcons name="info" size={16} color="#3B82F6" />
          <Text style={styles.medicalInfoText}>Thông tin y tế</Text>
        </View>
        
        {formattedParagraphs}
        
        {followUpQuestions && followUpQuestions.length > 0 && (
          <View style={styles.adviceFollowUpContainer}>
            <Text style={styles.adviceFollowUpTitle}>Câu hỏi liên quan:</Text>
            {followUpQuestions.map((question, index) => (
              <TouchableOpacity
                key={`followup-${index}`}
                style={styles.adviceFollowUpItem}
                onPress={() => onFollowUpPress && onFollowUpPress(question)}
              >
                <MaterialIcons name="help-outline" size={16} color="#4F46E5" />
                <Text style={styles.adviceFollowUpText}>{question}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        <View style={styles.disclaimerContainer}>
          <MaterialIcons name="medical-services" size={12} color="#9CA3AF" />
          <Text style={styles.disclaimerText}>
            Thông tin này chỉ mang tính tham khảo và không thay thế cho lời khuyên y tế chuyên nghiệp.
          </Text>
        </View>
      </View>
    );
  };

  // Clean response text by removing HTML tags and formatting properly
  const cleanResponseText = (text: string): string => {
    if (!text) return '';
    
    // Remove HTML tags
    let cleanText = text.replace(/<[^>]*>/g, '');
    
    // Replace common patterns with formatted text
    cleanText = cleanText
      .replace(/section-header/g, '')
      .replace(/section-content/g, '')
      .replace(/follow-up-section/g, '')
      .replace(/follow-up-list/g, '')
      .replace(/follow-up-item/g, '')
      .replace(/details/g, '')
      .replace(/summary/g, '')
      .replace(/div class=/g, '')
      .replace(/p>/g, '')
      .replace(/small>/g, '')
      .replace(/ul>/g, '')
      .replace(/li>/g, '')
      .replace(/li class=/g, '');
    
    // Convert multiple spaces to single space
    cleanText = cleanText.replace(/\s+/g, ' ').trim();
    
    return cleanText;
  };

  // Render animated typing indicator
  const renderTypingIndicator = () => {
    return (
      <View style={styles.typingIndicator}>
        <View style={styles.typingDot} />
        <View style={[styles.typingDot, { marginHorizontal: 4 }]} />
        <View style={styles.typingDot} />
      </View>
    );
  };

  // Render confidence indicator
  const renderConfidence = (confidence?: number) => {
    if (confidence === undefined) return null;
    
    let color = '#4ADE80'; // Green for high confidence
    if (confidence < 50) color = '#F87171'; // Red for low confidence
    else if (confidence < 80) color = '#FBBF24'; // Yellow for medium confidence
    
    return (
      <View style={[styles.confidenceIndicator, { backgroundColor: color }]}>
        <Text style={styles.confidenceText}>{confidence}%</Text>
      </View>
    );
  };

  // // Render follow-up questions if available
  // const renderFollowUpQuestions = (message: ChatMessage) => {
  //   if (!message.followUpQuestions || message.followUpQuestions.length === 0) {
  //     return null;
  //   }
    
  //   return (
  //     <View style={styles.followUpContainer}>
  //       <Text style={styles.followUpTitle}>Suggested follow-up questions:</Text>
  //       <View style={styles.followUpList}>
  //         {message.followUpQuestions.map((question, index) => (
  //           <TouchableOpacity
  //             key={`followup-${index}`}
  //             style={styles.followUpItem}
  //             onPress={() => onFollowUpPress && onFollowUpPress(question)}
  //           >
  //             <MaterialIcons name="arrow-right" size={14} color="#4F46E5" />
  //             <Text style={styles.followUpText}>{question}</Text>
  //           </TouchableOpacity>
  //         ))}
  //       </View>
  //     </View>
  //   );
  // };

  // Render priority level indicator if available
  const renderPriorityLevel = (priorityLevel?: string) => {
    if (!priorityLevel) return null;
    
    let color = '#4F46E5'; // Default color
    let icon = 'info';
    
    if (priorityLevel.toLowerCase() === 'high') {
      color = '#EF4444';
      icon = 'warning';
    } else if (priorityLevel.toLowerCase() === 'medium') {
      color = '#F59E0B';
      icon = 'priority-high';
    }
    
    return (
      <View style={[styles.priorityContainer, { borderColor: color }]}>
        <MaterialIcons name={icon} size={14} color={color} />
        <Text style={[styles.priorityText, { color }]}>
          {priorityLevel.charAt(0).toUpperCase() + priorityLevel.slice(1).toLowerCase()} Priority
        </Text>
      </View>
    );
  };

  return (
    <ScrollView 
      style={styles.container}
      ref={scrollViewRef}
      contentContainerStyle={styles.contentContainer}
    >
      {messages.length === 0 ? (
        <View style={styles.welcomeContainer}>
          <View style={styles.welcomeIcon}>
            <MaterialIcons name="smart-toy" size={40} color="#4F46E5" />
          </View>
          <Text style={styles.welcomeTitle}>Veterinary Assistant</Text>
          <Text style={styles.welcomeText}>
            Ask me questions about your pet's health, treatments, medications, and more.
            I'll provide you with information based on veterinary data.
          </Text>
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Here are some things you can ask:</Text>
            <View style={styles.suggestionsList}>
              <View style={styles.suggestionItem}>
                <MaterialIcons name="pets" size={16} color="#4F46E5" style={styles.suggestionIcon} />
                <Text style={styles.suggestion}>What are the common side effects of antibiotics for dogs?</Text>
              </View>
              <View style={styles.suggestionItem}>
                <MaterialIcons name="trending-up" size={16} color="#4F46E5" style={styles.suggestionIcon} />
                <Text style={styles.suggestion}>Show me trends in pet vaccinations over recent years</Text>
              </View>
              <View style={styles.suggestionItem}>
                <MaterialIcons name="medical-services" size={16} color="#4F46E5" style={styles.suggestionIcon} />
                <Text style={styles.suggestion}>What are the recommended vaccinations for a new puppy?</Text>
              </View>
              <View style={styles.suggestionItem}>
                <MaterialIcons name="compare" size={16} color="#4F46E5" style={styles.suggestionIcon} />
                <Text style={styles.suggestion}>Compare the safety profiles of common flea treatments</Text>
              </View>
            </View>
          </View>
        </View>
      ) : (
        messages.map((message, index) => (
          <Animated.View
            key={message.id}
            style={[
              styles.messageContainer,
              message.sender === 'user' ? styles.userMessageContainer : styles.botMessageContainer,
              index === messages.length - 1 && { opacity: fadeAnim }
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                message.sender === 'user' 
                  ? styles.userMessageBubble 
                  : message.isError 
                    ? styles.errorMessageBubble 
                    : styles.botMessageBubble,
                message.isPending ? styles.pendingMessage : {}
              ]}
            >
              <View style={styles.messageHeader}>
                <View style={styles.senderInfo}>
                  <View style={[
                    styles.avatarCircle,
                    message.sender === 'user' ? styles.userAvatar : styles.botAvatar
                  ]}>
                    <MaterialIcons 
                      name={message.sender === 'user' ? 'person' : 'smart-toy'} 
                      size={14} 
                      color={message.sender === 'user' ? '#4F46E5' : '#6B7280'} 
                    />
                  </View>
                  <Text style={styles.senderName}>
                    {message.sender === 'user' ? 'You' : getBotName(message.botType)}
                  </Text>
                </View>
                <View style={styles.timestampContainer}>
                  {message.isPending ? (
                    renderTypingIndicator()
                  ) : (
                    <Text style={styles.timestamp}>{formatTimestamp(message.timestamp)}</Text>
                  )}
                </View>
              </View>
              
              <View style={styles.messageContentContainer}>
                {renderMessageContent(message)}
                {message.sentiment && (
                  <View style={[
                    styles.sentimentIndicator,
                    message.sentiment === 'positive' ? styles.positiveSentiment :
                    message.sentiment === 'negative' ? styles.negativeSentiment :
                    styles.neutralSentiment
                  ]} />
                )}
                {renderConfidence(message.confidence)}
              </View>
              
              {message.priorityLevel && message.sender === 'bot' && (
                renderPriorityLevel(message.priorityLevel)
              )}
              
              {message.sourceDetails && (
                <View style={styles.footerContainer}>
                  <Text style={styles.sourceText}>{message.sourceDetails}</Text>
                </View>
              )}

              {message.drugInfo && (
                <TouchableOpacity 
                  style={styles.footerContainer}
                  activeOpacity={0.7}
                >
                  <View style={styles.footerHeader}>
                    <MaterialIcons name="medication" size={14} color="#4F46E5" />
                    <Text style={styles.footerTitle}>Medication Information</Text>
                  </View>
                  <Text style={styles.footerText}>
                    {typeof message.drugInfo === 'string' 
                      ? message.drugInfo 
                      : message.drugInfo && typeof message.drugInfo === 'object' 
                        ? Object.entries(message.drugInfo)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join('\n')
                        : 'No medication information available'
                    }
                  </Text>
                </TouchableOpacity>
              )}

              {message.sideEffectReport && (
                <TouchableOpacity 
                  style={styles.footerContainer}
                  activeOpacity={0.7}
                >
                  <View style={styles.footerHeader}>
                    <MaterialIcons name="warning" size={14} color="#F59E0B" />
                    <Text style={[styles.footerTitle, { color: '#F59E0B' }]}>Side Effect Report</Text>
                  </View>
                  <Text style={styles.footerText}>
                    {typeof message.sideEffectReport === 'string' 
                      ? message.sideEffectReport 
                      : message.sideEffectReport && typeof message.sideEffectReport === 'object' 
                        ? Object.entries(message.sideEffectReport)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join('\n')
                        : 'No side effect information available'
                    }
                  </Text>
                </TouchableOpacity>
              )}
              
              {/* {message.followUpQuestions && message.followUpQuestions.length > 0 && 
               message.sender === 'bot' && onFollowUpPress && (
                //  renderFollowUpQuestions(message)
              )}
               */}
              {message.conversationId && message.sender === 'bot' && (
                <Text style={styles.conversationIdText}>
                  Conversation #{message.conversationId.substring(0, 6)}
                </Text>
              )}
            </View>
          </Animated.View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  welcomeContainer: {
    padding: 16,
    alignItems: 'center',
  },
  welcomeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF2FF',
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#111827',
  },
  welcomeText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  suggestionsContainer: {
    alignSelf: 'stretch',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  suggestionsList: {
    gap: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  suggestionIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  suggestion: {
    fontSize: 14,
    color: '#4B5563',
    flex: 1,
  },
  messageContainer: {
    marginBottom: 16,
    marginHorizontal: 8,
    flexDirection: 'row',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  botMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  userMessageBubble: {
    backgroundColor: '#4F46E5',
    borderBottomRightRadius: 4,
    marginLeft: 'auto',
  },
  botMessageBubble: {
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 4,
  },
  errorMessageBubble: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderBottomLeftRadius: 4,
  },
  pendingMessage: {
    opacity: 0.7,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  userAvatar: {
    backgroundColor: '#EEF2FF',
  },
  botAvatar: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  senderName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#9CA3AF',
    opacity: 0.7,
  },
  messageContentContainer: {
    position: 'relative',
  },
  messageText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  mediaContainer: {
    marginBottom: 8,
  },
  imageContent: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 8,
  },
  listContainer: {
    marginTop: 8,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: 2,
  },
  bulletPoint: {
    marginRight: 8,
    fontSize: 15,
    color: '#4F46E5',
  },
  listItemText: {
    fontSize: 14,
    color: '#4B5563',
    flex: 1,
  },
  sentimentIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    top: 0,
    right: 0,
  },
  positiveSentiment: {
    backgroundColor: '#4ADE80', // Green
  },
  negativeSentiment: {
    backgroundColor: '#F87171', // Red
  },
  neutralSentiment: {
    backgroundColor: '#FBBF24', // Yellow
  },
  confidenceIndicator: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    position: 'absolute',
    top: -10,
    right: -10,
  },
  confidenceText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  footerContainer: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  footerTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
    marginLeft: 4,
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
  sourceText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  followUpContainer: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  followUpTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
    marginBottom: 8,
  },
  followUpList: {
    gap: 6,
  },
  followUpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  followUpText: {
    fontSize: 13,
    color: '#4F46E5',
    marginLeft: 6,
    flex: 1,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 6,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  conversationIdText: {
    marginTop: 8,
    fontSize: 10,
    fontStyle: 'italic',
    color: '#9CA3AF',
    textAlign: 'right',
  },
  adviceContainer: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  medicalInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  medicalInfoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    marginLeft: 4,
  },
  adviceParagraph: {
    marginBottom: 12,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  adviceHeader: {
    marginBottom: 8,
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  adviceListItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingLeft: 4,
  },
  adviceBulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3B82F6',
    marginRight: 8,
    marginTop: 6,
  },
  adviceListItemText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    lineHeight: 20,
  },
  adviceFollowUpContainer: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  adviceFollowUpTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4F46E5',
    marginBottom: 8,
  },
  adviceFollowUpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    marginBottom: 8,
  },
  adviceFollowUpText: {
    fontSize: 13,
    color: '#4F46E5',
    marginLeft: 6,
    flex: 1,
  },
  disclaimerContainer: {
    marginTop: 12,
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  disclaimerText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginLeft: 4,
    flex: 1,
    fontStyle: 'italic',
  },
});

export default MobileMessageList;