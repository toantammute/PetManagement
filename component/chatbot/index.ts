// Export components
export { default as MobileChatScreen } from './MobileChatScreen';
export { default as MobileMessageList } from './MobileMessageList';
export { default as ConversationListScreen } from './ConversationListScreen';
export type { ChatMessage } from './MessageList';
export { default as MessageList } from './MessageList';
export { default as ChatInterface } from './ChatInterface';

// Export types and utilities
export type BotType = 'HealthTrendBot' | 'MediBot' | 'SideEffectHelper';
export type { ChatMessage as ChatMessageType } from './MessageList';

// Export a simple function to create random message IDs
export const generateMessageId = (): string => {
  return 'msg-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
};