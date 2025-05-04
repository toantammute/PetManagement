import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

export interface ChatInterfaceProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  botType?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onSendMessage,
  isLoading,
  botType = 'HealthTrendBot'
}) => {
  const [message, setMessage] = useState<string>("");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isExamplesOpen, setIsExamplesOpen] = useState<boolean>(false);
  const [activeExampleTab, setActiveExampleTab] = useState<string>("suggestions");
  const inputRef = useRef<TextInput>(null);

  // Focus the input field when the component mounts or bot changes
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [botType]);

  const handleSubmit = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage("");
    }
  };

  // Allow sending message with Enter key
  const handleKeyDown = (e: any) => {
    if (e.nativeEvent.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleRecording = () => {
    // This would be implemented with actual voice recording functionality
    setIsRecording(!isRecording);
  };

  // Get placeholder text based on bot type
  const getPlaceholder = () => {
    if (isLoading) return "Processing your request...";
    
    switch(botType) {
      case 'MediBot':
        return "Ask about medications (e.g., 'What is Metacam used for?')";
      case 'SideEffectHelper':
        return "Ask about side effects (e.g., 'Is vomiting common with antibiotics?')";
      case 'HealthTrendBot':
      default:
        return "Ask about health trends (e.g., 'Vaccination trends in the last 5 years')";
    }
  };

  // Get suggestion chips based on bot type
  const getSuggestionChips = () => {
    switch(botType) {
      case 'MediBot':
        return [
          "What is Metacam used for?",
          "Side effects of antibiotics",
          "Interactions between Rimadyl and Tramadol"
        ];
      case 'SideEffectHelper':
        return [
          "How to report side effects?",
          "Common side effects of vaccines",
          "Side effects of antibiotics in cats"
        ];
      case 'HealthTrendBot':
      default:
        return [
          "Vaccination trends",
          "Common pet medical conditions",
          "Preventative care statistics"
        ];
    }
  };

  // Get detailed examples for each bot type
  const getDetailedExamples = () => {
    switch(botType) {
      case 'MediBot':
        return [
          {
            title: "Medication Information",
            description: "Get details about specific medications",
            query: "Tell me about Metacam for dogs",
            icon: "medication"
          },
          {
            title: "Drug Interactions",
            description: "Learn about potential drug interactions",
            query: "Are there interactions between Rimadyl and Tramadol?",
            icon: "warning"
          },
          {
            title: "Medication Usage",
            description: "Proper administration and usage",
            query: "How should I administer amoxicillin to my cat?",
            icon: "lightbulb"
          }
        ];
      case 'SideEffectHelper':
        return [
          {
            title: "Report Side Effects",
            description: "Learn how to report medication side effects",
            query: "How do I report a side effect my dog experienced?",
            icon: "warning"
          },
          {
            title: "Common Side Effects",
            description: "Learn about common side effects",
            query: "What are common side effects of antibiotics in cats?",
            icon: "medication"
          },
          {
            title: "Side Effect Management",
            description: "How to manage side effects",
            query: "How to manage vomiting after vaccination?",
            icon: "auto-fix-high"
          }
        ];
      case 'HealthTrendBot':
      default:
        return [
          {
            title: "Vaccination Trends",
            description: "View statistics on pet vaccination rates",
            query: "Show me trends in pet vaccinations",
            icon: "trending-up"
          },
          {
            title: "Disease Prevalence",
            description: "Information about common conditions",
            query: "What are the most common diseases in golden retrievers?",
            icon: "pets"
          },
          {
            title: "Breed Statistics",
            description: "Health statistics for specific breeds",
            query: "Health statistics for Labrador Retrievers vs German Shepherds",
            icon: "auto-fix-high"
          }
        ];
    }
  };

  // Get samples for query conversation examples
  const getConversationExamples = () => {
    switch(botType) {
      case 'MediBot':
        return [
          {
            title: "Asking about medication dosage",
            queries: [
              "What's the proper dosage of Metacam for a 20kg dog?",
              "When should Metacam be administered?",
              "Does Metacam need to be given with food?"
            ]
          },
          {
            title: "Investigating side effects",
            queries: [
              "What are the side effects of Rimadyl?",
              "How common is liver damage with long-term Rimadyl use?",
              "What monitoring is recommended for pets on Rimadyl?"
            ]
          }
        ];
      case 'SideEffectHelper':
        return [
          {
            title: "Reporting a side effect",
            queries: [
              "My dog had vomiting after taking antibiotics, should I report it?",
              "Who should I contact about a medication side effect?",
              "What information do I need when reporting a side effect?"
            ]
          },
          {
            title: "Understanding severe vs normal reactions",
            queries: [
              "Is lethargy normal after vaccination?",
              "What vaccine side effects require immediate vet attention?",
              "How long should mild side effects last?"
            ]
          }
        ];
      case 'HealthTrendBot':
      default:
        return [
          {
            title: "Investigating breed health",
            queries: [
              "What health issues are trending in French Bulldogs?",
              "How has the prevalence of hip dysplasia changed in the last decade?",
              "Which breeds show the most improvement in genetic health?"
            ]
          },
          {
            title: "Comparing treatment approaches",
            queries: [
              "How has treatment for canine lymphoma evolved over time?",
              "Are there trends showing benefits of early spay/neuter vs waiting?",
              "What preventative measures have increased most in the past 5 years?"
            ]
          }
        ];
    }
  };
  
  const suggestions = getSuggestionChips() || [];
  const detailedExamples = getDetailedExamples() || [];
  const conversationExamples = getConversationExamples() || [];

  const getBotName = () => {
    switch(botType) {
      case 'MediBot':
        return 'Medication Assistant';
      case 'SideEffectHelper':
        return 'Side Effect Advisor';
      case 'HealthTrendBot':
      default:
        return 'Health Trend Bot';
    }
  };

  // Render the examples section based on active tab
  const renderExamplesContent = () => {
    if (!isExamplesOpen) return null;

    switch(activeExampleTab) {
      case 'suggestions':
        return (
          <View style={styles.suggestionsTab}>
            <FlatList
              data={detailedExamples}
              horizontal={false}
              numColumns={1}
              keyExtractor={(item, index) => `suggestion-${index}`}
              renderItem={({item, index}) => (
                <TouchableOpacity
                  style={styles.exampleCard}
                  onPress={() => !isLoading && onSendMessage(item.query)}
                  disabled={isLoading}
                >
                  <View style={styles.exampleHeader}>
                    <View style={styles.exampleIconContainer}>
                      <MaterialIcons name={item.icon} size={20} color="#4F46E5" />
                    </View>
                    <View style={styles.exampleHeaderText}>
                      <Text style={styles.exampleTitle}>{item.title}</Text>
                      <Text style={styles.exampleDescription}>{item.description}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        );
      case 'conversation':
        return (
          <View style={styles.conversationTab}>
            {conversationExamples.map((convo, index) => (
              <View key={`convo-${index}`} style={styles.conversationCard}>
                <View style={styles.conversationHeader}>
                  <MaterialIcons name="chat" size={16} color="#4F46E5" />
                  <Text style={styles.conversationTitle}>{convo.title}</Text>
                </View>
                <View style={styles.queriesList}>
                  {convo.queries.map((query, qIndex) => (
                    <TouchableOpacity
                      key={`query-${index}-${qIndex}`}
                      style={styles.queryItem}
                      onPress={() => !isLoading && onSendMessage(query)}
                      disabled={isLoading}
                    >
                      <View style={styles.queryNumber}>
                        <Text style={styles.queryNumberText}>{qIndex + 1}</Text>
                      </View>
                      <Text style={styles.queryText}>{query}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View>
        );
      case 'about':
        return (
          <View style={styles.aboutTab}>
            <View style={styles.aboutCard}>
              <View style={styles.aboutHeader}>
                <MaterialIcons name="smart-toy" size={16} color="#4F46E5" />
                <Text style={styles.aboutTitle}>About {getBotName()}</Text>
              </View>
              <Text style={styles.aboutText}>
                {(() => {
                  switch(botType) {
                    case 'MediBot':
                      return 'This assistant provides detailed information about pet medications, including dosages, side effects, contraindications, and interactions. Ask about specific medications or general pharmaceutical questions.';
                    case 'SideEffectHelper':
                      return 'This assistant helps you understand and report medication side effects. Get information about expected vs. concerning reactions, reporting procedures, and managing common side effects.';
                    case 'HealthTrendBot':
                    default:
                      return 'This assistant analyzes veterinary health data to provide insights on trends, statistics, and patterns. Ask about disease prevalence, breed-specific health issues, or treatment efficacy over time.';
                  }
                })()}
              </Text>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.chatInterface}>
          {/* Main input area */}
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              placeholder={getPlaceholder()}
              value={message}
              onChangeText={setMessage}
              onSubmitEditing={handleSubmit}
              multiline
              blurOnSubmit={false}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!message.trim() || isLoading) && styles.disabledButton
              ]}
              onPress={handleSubmit}
              disabled={!message.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <MaterialIcons name="send" size={24} color="#fff" />
              )}
            </TouchableOpacity>
          </View>

          {/* Quick suggestion chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.suggestionChipsContainer}
            contentContainerStyle={styles.suggestionChipsContent}
          >
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={`chip-${index}`}
                style={styles.suggestionChip}
                onPress={() => !isLoading && onSendMessage(suggestion)}
                disabled={isLoading}
              >
                <Text style={styles.suggestionChipText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Collapsible examples section */}
          <View style={styles.examplesContainer}>
            <TouchableOpacity
              style={styles.examplesToggle}
              onPress={() => setIsExamplesOpen(!isExamplesOpen)}
            >
              <Text style={styles.examplesToggleText}>
                {isExamplesOpen ? "Hide examples" : "Show examples"}
              </Text>
              <MaterialIcons
                name={isExamplesOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                size={18}
                color="#6B7280"
              />
            </TouchableOpacity>

            {isExamplesOpen && (
              <View style={styles.tabsContainer}>
                <View style={styles.tabButtons}>
                  <TouchableOpacity
                    style={[
                      styles.tabButton,
                      activeExampleTab === "suggestions" && styles.activeTabButton
                    ]}
                    onPress={() => setActiveExampleTab("suggestions")}
                  >
                    <MaterialIcons name="lightbulb" size={16} color={activeExampleTab === "suggestions" ? "#4F46E5" : "#6B7280"} />
                    <Text
                      style={[
                        styles.tabButtonText,
                        activeExampleTab === "suggestions" && styles.activeTabButtonText
                      ]}
                    >
                      Suggestions
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.tabButton,
                      activeExampleTab === "conversation" && styles.activeTabButton
                    ]}
                    onPress={() => setActiveExampleTab("conversation")}
                  >
                    <MaterialIcons name="chat" size={16} color={activeExampleTab === "conversation" ? "#4F46E5" : "#6B7280"} />
                    <Text
                      style={[
                        styles.tabButtonText,
                        activeExampleTab === "conversation" && styles.activeTabButtonText
                      ]}
                    >
                      Conversations
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.tabButton,
                      activeExampleTab === "about" && styles.activeTabButton
                    ]}
                    onPress={() => setActiveExampleTab("about")}
                  >
                    <MaterialIcons name="smart-toy" size={16} color={activeExampleTab === "about" ? "#4F46E5" : "#6B7280"} />
                    <Text
                      style={[
                        styles.tabButtonText,
                        activeExampleTab === "about" && styles.activeTabButtonText
                      ]}
                    >
                      About
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.tabContent}>
                  {renderExamplesContent()}
                </View>
              </View>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoid: {
    flex: 1,
  },
  chatInterface: {
    flex: 1,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingRight: 48,
    fontSize: 16,
  },
  sendButton: {
    position: 'absolute',
    right: 20,
    bottom: 18,
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
  suggestionChipsContainer: {
    maxHeight: 40,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  suggestionChipsContent: {
    paddingRight: 12,
  },
  suggestionChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  suggestionChipText: {
    fontSize: 14,
    color: '#4B5563',
  },
  examplesContainer: {
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
  },
  examplesToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  examplesToggleText: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 4,
  },
  tabsContainer: {
    padding: 12,
  },
  tabButtons: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginBottom: 12,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  tabButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#6B7280',
  },
  activeTabButtonText: {
    color: '#4F46E5',
  },
  tabContent: {
    marginTop: 8,
  },
  suggestionsTab: {
    marginBottom: 16,
  },
  exampleCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  exampleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  exampleIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exampleHeaderText: {
    flex: 1,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  exampleDescription: {
    fontSize: 14,
    color: '#4B5563',
  },
  conversationTab: {},
  conversationCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 8,
  },
  queriesList: {},
  queryItem: {
    flexDirection: 'row',
    paddingVertical: 6,
    alignItems: 'center',
  },
  queryNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  queryNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  queryText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
  },
  aboutTab: {},
  aboutCard: {
    backgroundColor: '#EEF2FF',
    padding: 16,
    borderRadius: 8,
  },
  aboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginLeft: 8,
  },
  aboutText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  }
});

export default ChatInterface;
