import { useEffect, useRef, useState } from 'react';
import { useFirebaseAuth } from './useFirebaseAuth';
import { queryClient } from '@/lib/queryClient';

interface WebSocketMessage {
  type: string;
  conversationId?: number;
  message?: any;
  userId?: string;
}

export function useWebSocket() {
  const { user } = useFirebaseAuth();
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Connect to WebSocket server with proper error handling
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.host || 'localhost:5000';
      const wsUrl = `${protocol}//${host}/ws`;
      console.log('WebSocket connecting to:', wsUrl);
      ws.current = new WebSocket(wsUrl);
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      return;
    }

    ws.current.onopen = () => {
      console.log('WebSocket connected successfully');
      setIsConnected(true);
      // Authenticate with user ID
      if (ws.current && user?.uid) {
        ws.current.send(JSON.stringify({
          type: 'auth',
          userId: user.uid
        }));
      }
    };

    ws.current.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        
        if (data.type === 'auth_success') {
          console.log('WebSocket authenticated for user:', data.userId);
        } else if (data.type === 'new_message') {
          // Don't invalidate immediately to avoid spinner conflicts
          // The optimistic update should handle new messages
          console.log('New message received via WebSocket:', data.message);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.current.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      setIsConnected(false);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
  }, [user?.uid]);

  const sendMessage = (conversationId: number, messageData: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'new_message',
        conversationId,
        messageData
      }));
    }
  };

  return {
    isConnected,
    sendMessage
  };
}