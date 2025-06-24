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

    // Connect to WebSocket server
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      setIsConnected(true);
      // Authenticate with user ID
      ws.current?.send(JSON.stringify({
        type: 'auth',
        userId: user.uid
      }));
    };

    ws.current.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        
        if (data.type === 'auth_success') {
          console.log('WebSocket authenticated for user:', data.userId);
        } else if (data.type === 'new_message') {
          // Invalidate conversation queries to refresh messages
          queryClient.invalidateQueries({ 
            queryKey: ['/api/conversations', data.conversationId, 'messages'] 
          });
          queryClient.invalidateQueries({ 
            queryKey: ['/api/conversations'] 
          });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.current.onclose = () => {
      setIsConnected(false);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    return () => {
      ws.current?.close();
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