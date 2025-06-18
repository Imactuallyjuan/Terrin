import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageCircle, 
  Send, 
  Users, 
  Clock,
  CheckCheck,
  Plus
} from 'lucide-react';

export default function MessagingSystem({ projectId, projectTitle }) {
  const { user } = useFirebaseAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const messagesEndRef = useRef(null);

  // Fetch user conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ['/api/conversations'],
    enabled: !!user
  });

  // Fetch messages for selected conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/conversations', selectedConversation?.id, 'messages'],
    enabled: !!selectedConversation,
    refetchInterval: 3000 // Poll every 3 seconds for new messages
  });

  // Create conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: async (conversationData) => {
      return await apiRequest('/api/conversations', {
        method: 'POST',
        body: JSON.stringify(conversationData)
      });
    },
    onSuccess: (newConversation) => {
      queryClient.invalidateQueries(['/api/conversations']);
      setSelectedConversation(newConversation);
      toast({
        title: "Conversation Created",
        description: "You can now start messaging about this project."
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Create Conversation",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, content }) => {
      return await apiRequest(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/conversations', selectedConversation?.id, 'messages']);
      setNewMessage('');
    },
    onError: (error) => {
      toast({
        title: "Failed to Send Message",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Find or create project conversation
  useEffect(() => {
    if (projectId && conversations.length > 0 && !selectedConversation) {
      const projectConversation = conversations.find(conv => conv.projectId === projectId);
      if (projectConversation) {
        setSelectedConversation(projectConversation);
      }
    }
  }, [conversations, projectId, selectedConversation]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    sendMessageMutation.mutate({
      conversationId: selectedConversation.id,
      content: newMessage.trim()
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startProjectConversation = () => {
    if (!projectId) return;
    
    createConversationMutation.mutate({
      projectId,
      participants: [], // Will be populated by backend
      title: `${projectTitle} Discussion`
    });
  };

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = (now - date) / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Please log in to access messaging</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Conversations List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Conversations</span>
            {projectId && !conversations.find(conv => conv.projectId === projectId) && (
              <Button
                size="sm"
                onClick={startProjectConversation}
                disabled={createConversationMutation.isPending}
              >
                <Plus className="h-4 w-4 mr-1" />
                Start Chat
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {conversationsLoading ? (
              <div className="p-4 text-center text-gray-500">Loading conversations...</div>
            ) : conversations.length > 0 ? (
              <div className="space-y-1">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-3 cursor-pointer hover:bg-gray-50 border-b ${
                      selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">
                          {conversation.title || 'Project Discussion'}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          <Users className="h-3 w-3 inline mr-1" />
                          {conversation.participants?.length || 0} participants
                        </p>
                      </div>
                      {conversation.projectId && (
                        <Badge variant="outline" className="text-xs">
                          Project
                        </Badge>
                      )}
                    </div>
                    {conversation.lastMessageAt && (
                      <p className="text-xs text-gray-400 mt-2">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {formatMessageTime(conversation.lastMessageAt)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No conversations yet</p>
                {projectId && (
                  <Button
                    size="sm"
                    className="mt-2"
                    onClick={startProjectConversation}
                    disabled={createConversationMutation.isPending}
                  >
                    Start Project Discussion
                  </Button>
                )}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Messages Area */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>
            {selectedConversation 
              ? selectedConversation.title || 'Project Discussion'
              : 'Select a conversation'
            }
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex flex-col h-[500px]">
          {selectedConversation ? (
            <>
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {messagesLoading ? (
                  <div className="text-center text-gray-500">Loading messages...</div>
                ) : messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderId === user.uid ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            message.senderId === user.uid
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div className={`flex items-center justify-between mt-2 text-xs ${
                            message.senderId === user.uid ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            <span>{formatMessageTime(message.createdAt)}</span>
                            {message.senderId === user.uid && (
                              <CheckCheck className="h-3 w-3 ml-2" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No messages yet</p>
                    <p className="text-sm">Start the conversation below</p>
                  </div>
                )}
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={sendMessageMutation.isPending}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}