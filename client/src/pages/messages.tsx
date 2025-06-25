import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, ArrowLeft, Clock, Wifi, WifiOff, Trash2 } from "lucide-react";
import PaymentButton from "@/components/payment-button";
import CustomPaymentForm from "@/components/custom-payment-form";
import ChatInput from "@/components/chat-input";
import { Link, useLocation } from "wouter";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  id: number;
  projectId?: number;
  projectTitle?: string;
  participants?: string[];
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  createdAt: string;
}

interface Message {
  id: number;
  conversationId: number;
  senderId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

export default function Messages() {
  const { user } = useFirebaseAuth();
  const { isConnected, sendMessage } = useWebSocket();
  const [location] = useLocation();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);


  // Fetch conversations
  const { data: conversations = [], isLoading: loadingConversations } = useQuery<Conversation[]>({
    queryKey: ['/api/conversations'],
    queryFn: async () => {
      const token = await user?.getIdToken();
      const response = await fetch('/api/conversations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch conversations');
      return response.json();
    },
    enabled: !!user,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 300000 // 5 minutes
  });

  // Fetch professionals to get names for participants
  const { data: professionals = [] } = useQuery({
    queryKey: ['/api/professionals'],
    queryFn: async () => {
      const response = await fetch('/api/professionals');
      if (!response.ok) throw new Error('Failed to fetch professionals');
      return response.json();
    },
    refetchInterval: false,
    refetchOnWindowFocus: false,
    staleTime: 3600000, // 1 hour - professionals data rarely changes
    retry: 3
  });

  // Track conversationId from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setConversationId(params.get("conversation"));
  }, [location.search]);

  // Auto-select conversation based on conversationId state or fallback to newest
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      if (conversationId) {
        const selected = conversations.find(c => c.id === Number(conversationId));
        if (selected) {
          setSelectedConversation(selected.id);
          return;
        }
      }
      
      // Fallback to newest conversation only if none selected
      const sortedConversations = conversations.sort((a, b) => b.id - a.id);
      setSelectedConversation(sortedConversations[0].id);
    }
  }, [conversations.length, conversationId]); // Use length instead of conversations array to prevent re-renders

  // Fetch messages for selected conversation
  const { data: messages, isLoading: loadingMessages, error: messagesError } = useQuery<Message[]>({
    queryKey: ['/api/conversations', selectedConversation, 'messages'],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      const token = await user.getIdToken();
      if (!token) throw new Error('Failed to get auth token');
      
      const response = await fetch(`/api/conversations/${selectedConversation}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch messages: ${response.status}`);
      }
      return response.json();
    },
    enabled: !!selectedConversation && !!user,
    retry: 2,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: 30000, // 30 seconds
    gcTime: 300000 // Keep cached data for 5 minutes
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { conversationId: number; content: string }) => {
      if (!user) throw new Error('User not authenticated');
      const token = await user.getIdToken();
      if (!token) throw new Error('Failed to get auth token');
      
      const response = await fetch(`/api/conversations/${data.conversationId}/messages`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: data.content
        })
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to send message:', response.status, errorText);
        throw new Error('Failed to send message');
      }
      return response.json();
    },
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['/api/conversations', selectedConversation, 'messages'] });
      
      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData<Message[]>(['/api/conversations', selectedConversation, 'messages']);
      
      // Return a context object with the snapshotted value
      return { previousMessages };
    },
    onSuccess: (newMessageData, variables, context) => {
      // Optimistically update to the new value
      queryClient.setQueryData(['/api/conversations', selectedConversation, 'messages'], (old: Message[] = []) => {
        const alreadyExists = old.some(msg => msg.id === newMessageData.id);
        return alreadyExists ? old : [...old, newMessageData];
      });
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(
        ['/api/conversations', selectedConversation, 'messages'],
        context?.previousMessages
      );
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/conversations', selectedConversation, 'messages'] });
      }, 2000);
    }
  });

  const handleSendMessage = useCallback((content: string) => {
    if (!selectedConversation || sendMessageMutation.isPending) return;
    
    console.log('Sending message:', content, 'to conversation:', selectedConversation);
    console.log('Current cached messages:', queryClient.getQueryData(['/api/conversations', selectedConversation, 'messages']));
    
    sendMessageMutation.mutate({
      conversationId: selectedConversation,
      content
    });
  }, [selectedConversation, sendMessageMutation, queryClient]);

  // Helper function to get participant name with stable lookup
  const getParticipantName = (conversation: Conversation) => {
    if (!conversation.participants || !user) return 'Unknown';
    
    // Find the other participant (not the current user)
    const otherParticipantId = conversation.participants.find(id => id !== user.uid);
    if (!otherParticipantId) return 'Direct Message';
    
    // Known contractor mapping (stable fallback)
    if (otherParticipantId === 'C4T7TowRx2hogquBwEQtCZhIyga2') {
      return 'Valley Point Construction';
    }
    
    // Look up in professionals array
    const professional = professionals.find((p: any) => p.userId === otherParticipantId);
    if (professional?.businessName) {
      return professional.businessName;
    }
    
    console.log('Professional lookup failed for:', otherParticipantId, 'in professionals:', professionals);
    return `Professional (${otherParticipantId.slice(0, 8)}...)`;
  };

  // Helper function to get other participant ID
  const getOtherParticipantId = (conversation: Conversation) => {
    if (!conversation.participants || !user) return '';
    return conversation.participants.find(id => id !== user.uid) || '';
  };

  // Delete conversation mutation
  const deleteConversationMutation = useMutation({
    mutationFn: async (conversationId: number) => {
      if (!user) return;
      
      const token = await user.getIdToken();
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to delete conversation');
      return response.json();
    },
    onSuccess: () => {
      console.log('🗑️ Conversation deleted, refreshing list');
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      setSelectedConversation(null);
      setConversationId(null);
    }
  });

  // Get selected conversation data
  const selectedConversationData = conversations.find(c => c.id === selectedConversation);

  if (loadingConversations) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="lg:col-span-2 h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              <p className="text-gray-600">Communicate with professionals and clients</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Wifi className="h-3 w-3 mr-1" />
                Live
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                <WifiOff className="h-3 w-3 mr-1" />
                Offline
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Conversations
                {conversations.length > 0 && (
                  <Badge variant="secondary">{conversations.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-96">
                {conversations.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No conversations yet</p>
                    <p className="text-sm">Start a project to begin messaging</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {conversations.map((conversation: Conversation) => (
                      <div
                        key={conversation.id}
                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors group ${
                          selectedConversation === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                        }`}
                        onClick={() => setSelectedConversation(conversation.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="text-xs">
                                    {getParticipantName(conversation).charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <h3 className="font-medium text-sm">
                                  {getParticipantName(conversation)}
                                </h3>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteConversationMutation.mutate(conversation.id);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                            {conversation.lastMessage && (
                              <p className="text-xs text-gray-600 truncate">
                                {conversation.lastMessage}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {conversation.lastMessageAt && (
                              <span className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })}
                              </span>
                            )}
                            {conversation.unreadCount && conversation.unreadCount > 0 && (
                              <Badge variant="destructive" className="text-xs px-2 py-0">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Messages Area */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>
                {selectedConversation ? (
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    {conversations.find((c: Conversation) => c.id === selectedConversation)?.projectTitle || 
                     (conversations.find((c: Conversation) => c.id === selectedConversation)?.projectId 
                       ? `Project ${conversations.find((c: Conversation) => c.id === selectedConversation)?.projectId}`
                       : 'Discussion')}
                  </div>
                ) : (
                  "Select a conversation"
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedConversation ? (
                <div className="h-96 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p>Select a conversation to start messaging</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Messages */}
                  <ScrollArea className="h-80">
                    <div className="space-y-4 p-2">
                      {!messages ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                          <p>No messages yet</p>
                          <p className="text-sm">Start the conversation below</p>
                          {messagesError && (
                            <p className="text-xs text-red-500 mt-2">Error: {messagesError.message}</p>
                          )}
                        </div>
                      ) : (
                        messages.map((message: Message) => {
                          console.log('Rendering message:', message.id, message.content);
                          return (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.senderId === user?.uid ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.senderId === user?.uid
                                  ? 'bg-blue-600 text-white'
                                  : message.senderId === 'system'
                                  ? 'bg-green-100 text-green-800 border border-green-200'
                                  : 'bg-gray-200 text-gray-900'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Clock className="h-3 w-3 opacity-70" />
                                <span className="text-xs opacity-70">
                                  {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                        })
                      )}
                    </div>
                  </ScrollArea>

                  <Separator />

                  {/* Payment Section */}
                  {selectedConversationData && (
                    <div className="border-t p-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Send Payment</p>
                          <p className="text-xs text-gray-500">Pay for project milestone or deposit</p>
                        </div>
                        <div className="flex gap-2">
                          <PaymentButton
                            projectId={selectedConversationData.projectId || 1}
                            conversationId={selectedConversationData.id}
                            amount={100.00}
                            payeeId={getOtherParticipantId(selectedConversationData)}
                            description="Project Deposit"
                            className="bg-blue-600 hover:bg-blue-700 text-xs px-3 py-1"
                          />
                          <PaymentButton
                            projectId={selectedConversationData.projectId || 1}
                            conversationId={selectedConversationData.id}
                            amount={250.00}
                            payeeId={getOtherParticipantId(selectedConversationData)}
                            description="Milestone Payment"
                            className="bg-green-600 hover:bg-green-700 text-xs px-3 py-1"
                          />
                          <CustomPaymentForm
                            projectId={selectedConversationData.projectId || 1}
                            conversationId={selectedConversationData.id}
                            payeeId={getOtherParticipantId(selectedConversationData)}
                            className="text-xs px-3 py-1"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Message Input - Isolated component */}
                  <ChatInput
                    onSendMessage={handleSendMessage}
                    disabled={!selectedConversation}
                    isLoading={sendMessageMutation.isPending}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}