import { requestPost, requestGet } from './index';

export const fetchLangChain = (params: { query: string }) => {
  return requestPost('/api/langchain', params);
};

export const fetchRagQuery = (params: {
  query: string;
  conversationId?: string;
}) => {
  return requestPost('/api/rag/query', params);
};

export const fetchHistoryMessages = (params: { conversationId: string }) => {
  return requestGet('/api/chat/history', params);
};
