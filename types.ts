export enum Role {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system'
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  thought?: string;
}

export interface SpectraResponse {
  text: string;
  thought?: string;
  conversationId?: string;
}
