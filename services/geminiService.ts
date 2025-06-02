import { API_URL } from '@env';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
console.log('Gemini API', API_URL);

// Define the response shape
interface ChartData {
  labels: string[];
  datasets: {
    label?: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

// Define the message entry model for conversation history
export interface MessageEntry {
  message: string;
  timestamp: number;
  isBot: boolean;
}

// Define the conversation state model
export interface ConversationState {
  conversationId: string;
  userId: string;
  language: string;
  lastActivity: number;
  messages: MessageEntry[];
  suggestedFollowUps?: string[];
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
  previousMessages?: string[];
  language?: string;
}

export interface ChatResponse {
  message: string;
  data?: any;
  conversationId?: string;
  isLoading?: boolean;
  followUpQuestions?: string[];
  priorityLevel?: string;
  language?: string;
  chartData?: ChartData;
  chartType?: string;
  chartTitle?: string;
  sentiment?: string;
  confidence?: number;
  sourceDetails?: string;
  drugInfo?: any;
  sideEffectReport?: any;
}

export const sendChatMessage = async (message: string, conversationId?: string, language: string = 'vi') => {
  try {
    const request: ChatRequest = {
      message,
      language,
    };
    
    // Include conversation ID if provided
    if (conversationId) {
      request.conversationId = conversationId;
    }


    const accessToken = await AsyncStorage.getItem('accessToken');

    if (!accessToken) {
      throw new Error('Cần đăng nhập để gửi tin nhắn');
    }
    // Send the request to the API
    console.log('Sending request to API:', request);

    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(request),
    });
    console.log('Response from API:', response);

    if (!response.ok) {
      let errorText = 'Không thể nhận phản hồi';

      try {
        const errorData = await response.json();
        errorText = errorData.error || errorText;
        if (errorData.details) {
          errorText += `: ${errorData.details}`;
        }
      } catch (e) {
        errorText = `Lỗi máy chủ (${response.status})`;
      }

      throw new Error(errorText);
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    throw error;
  }
};

// Fetch conversation history from the API
export const fetchConversationHistory = async (conversationId: string): Promise<ConversationState> => {
  try {
    // This requires authentication - check if user is logged in
    const accessToken = await AsyncStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error('Cần đăng nhập để xem lịch sử cuộc trò chuyện');
    }

    const response = await fetch(`${API_URL}/conversations/${conversationId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      let errorText = `Không thể tải lịch sử cuộc trò chuyện: ${response.status}`;
      
      try {
        // Try to extract detailed error information from the response
        const errorData = await response.json();
        if (errorData.error) {
          errorText = errorData.error;
        }
        if (errorData.details) {
          errorText += `: ${errorData.details}`;
        }
      } catch (e) {
        // If we can't parse the error response, use the status code
        errorText = `Lỗi máy chủ (${response.status})`;
        
        // For 403 errors, provide more helpful message
        if (response.status === 403) {
          errorText = 'Phiên đăng nhập đã hết hạn hoặc không có quyền truy cập cuộc hội thoại này. Vui lòng đăng nhập lại.';
        }
      }

      throw new Error(errorText);
    }

    const conversation = await response.json();
    return conversation;
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    throw error;
  }
};

// Delete a conversation
export const deleteConversation = async (conversationId: string): Promise<boolean> => {
  try {
    // This requires authentication
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      throw new Error('Cần đăng nhập để xóa cuộc trò chuyện');
    }

    const response = await fetch(`${API_URL}/conversations/${conversationId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return response.ok;
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return false;
  }
};

// List recent conversations for the user
export const listConversations = async (limit: number = 10): Promise<ConversationState[]> => {
  try {
    // This requires authentication
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      throw new Error('Cần đăng nhập để xem danh sách cuộc trò chuyện');
    }

    const response = await fetch(`${API_URL}/conversations?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Không thể tải danh sách cuộc trò chuyện: ${response.status}`);
    }

    const data = await response.json();
    return data.conversations || [];
  } catch (error) {
    console.error('Error listing conversations:', error);
    return [];
  }
};

/**
 * Checks if the API is available
 * @returns {Promise<boolean>} Promise that resolves with true if API is available
 */
export const checkAPIHealth = async () => {
  try {
    const response = await fetch(`${API_URL}/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
};
