import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export interface ChatMessage {
  id: string | number;
  text: string;
  sender: 'bot' | 'user';
  timestamp: string;
  isError?: boolean;
  isPending?: boolean;
  sourceDetails?: string;
  botType?: string;
  drugInfo?: string | Record<string, string>;
  sideEffectReport?: string | Record<string, string>;
  // Enhanced properties for better responses
  responseType?: 'text' | 'chart' | 'image' | 'list';
  sentiment?: 'positive' | 'negative' | 'neutral';
  confidence?: number; // 0-100 value indicating how confident the bot is
  imageUrl?: string;
  listItems?: string[];
  // New properties for conversation API support
  conversationId?: string;
  followUpQuestions?: string[];
  priorityLevel?: string;
  language?: string;
}

interface MessageListProps {
  messages: ChatMessage[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const scrollViewRef = useRef<ScrollView>(null);

  // Scroll to the bottom when messages change
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // Format timestamp to a readable format
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };



  // Render message content based on type
  const renderMessageContent = (message: ChatMessage) => {
    // Handle different types of responses
    if (message.responseType === 'image' && message.imageUrl) {
      return (
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: message.imageUrl }} 
            style={styles.messageImage}
            resizeMode="contain"
          />
          <Text style={styles.messageText}>{message.text}</Text>
        </View>
      );
    }
    
    if (message.responseType === 'list' && message.listItems) {
      return (
        <View style={styles.listContainer}>
          <Text style={styles.messageText}>{message.text}</Text>
          {message.listItems.map((item, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.listBullet}>•</Text>
              <Text style={styles.listItemText}>{item}</Text>
            </View>
          ))}
        </View>
      );
    }
    
    // Default text response
    return <Text style={styles.messageText}>{message.text}</Text>;
  };

  // Render confidence indicator for bot responses
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

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {messages.length === 0 ? (
        <View style={styles.welcomeContainer}>
          <View style={styles.welcomeIconContainer}>
            <MaterialIcons name="smart-toy" size={40} color="#4F46E5" />
          </View>
          <Text style={styles.welcomeTitle}>Veterinary Assistant</Text>
          <Text style={styles.welcomeText}>
            Ask me questions about your pet's health, treatments, medications, and more.
            I'll provide you with information based on veterinary data.
          </Text>
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Here are some things you can ask:</Text>
            <Text style={styles.suggestion}>• What are the most common side effects of antibiotics for dogs?</Text>
            <Text style={styles.suggestion}>• Show me trends in pet vaccinations over recent years</Text>
            <Text style={styles.suggestion}>• What are the recommended vaccinations for a new puppy?</Text>
            <Text style={styles.suggestion}>• Compare the safety profiles of common flea treatments</Text>
          </View>
        </View>
      ) : (
        messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageRow,
              message.sender === 'user' ? styles.userMessageRow : styles.botMessageRow
            ]}>
            <View style={styles.avatarContainer}>
              <View style={[
                styles.avatar,
                message.sender === 'user' ? styles.userAvatar : styles.botAvatar
              ]}>
                <MaterialIcons 
                  name={message.sender === 'user' ? 'person' : 'smart-toy'} 
                  size={16} 
                  color={message.sender === 'user' ? '#4F46E5' : '#6B7280'} 
                />
              </View>
            </View>
            
            <View style={[
              styles.messageBubble,
              message.sender === 'user' 
                ? styles.userBubble 
                : message.isError 
                  ? styles.errorBubble 
                  : styles.botBubble,
              message.isPending ? styles.pendingBubble : null
            ]}>
              <View style={styles.messageHeader}>
                <Text style={styles.senderName}>
                  {message.sender === 'user' }
                </Text>
                <View style={styles.messageTime}>
                  {message.isPending ? (
                    <View style={styles.processingContainer}>
                      <MaterialIcons name="timelapse" size={12} color="#9CA3AF" />
                      <Text style={styles.processingText}>Processing...</Text>
                    </View>
                  ) : (
                    <View style={styles.timestampContainer}>
                      {message.sender === 'user' && (
                        <MaterialIcons name="check" size={12} color="#9CA3AF" />
                      )}
                      <Text style={styles.timestamp}>{formatTimestamp(message.timestamp)}</Text>
                    </View>
                  )}
                </View>
              </View>
              
              <View style={styles.messageContent}>
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
              
              {message.sourceDetails && (
                <View style={styles.messageFooter}>
                  <Text style={styles.sourceText}>{message.sourceDetails}</Text>
                </View>
              )}

              {message.drugInfo && (
                <View style={styles.messageFooter}>
                  <Text style={styles.footerTitle}>Medication Information:</Text>
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
                </View>
              )}

              {message.sideEffectReport && (
                <View style={styles.messageFooter}>
                  <Text style={styles.footerTitle}>Side Effect Report:</Text>
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
                </View>
              )}
            </View>
          </View>
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
    padding: 16,
  },
  welcomeContainer: {
    alignItems: 'center',
    padding: 16,
  },
  welcomeIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 16,
  },
  suggestionsContainer: {
    width: '100%',
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  suggestion: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 6,
    paddingLeft: 4,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  userMessageRow: {
    justifyContent: 'flex-end',
    flexDirection: 'row-reverse',
  },
  botMessageRow: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginTop: 4,
    marginHorizontal: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  userAvatar: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  botAvatar: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: '#4F46E5',
  },
  botBubble: {
    backgroundColor: '#F9FAFB',
  },
  errorBubble: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  pendingBubble: {
    opacity: 0.7,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  messageTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  processingText: {
    fontSize: 10,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 10,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  messageContent: {
    position: 'relative',
  },
  messageText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  imageContainer: {
    marginBottom: 8,
  },
  messageImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  listContainer: {
    marginTop: 4,
  },
  listItem: {
    flexDirection: 'row',
    marginTop: 4,
    paddingLeft: 4,
  },
  listBullet: {
    fontSize: 15,
    color: '#4F46E5',
    marginRight: 8,
  },
  listItemText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  sentimentIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    top: 4,
    right: 4,
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
  messageFooter: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4F46E5',
    marginBottom: 4,
  },
  footerText: {
    fontSize: 12,
    color: '#4B5563',
  },
  sourceText: {
    fontSize: 10,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
});

export default MessageList;