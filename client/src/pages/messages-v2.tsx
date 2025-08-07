import { useState, useEffect, useRef } from "react";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "wouter";
import { 
  MessageSquare, 
  Send, 
  ArrowLeft, 
  Clock, 
  User,
  Trash2,
  RefreshCw,
  DollarSign,
  CreditCard,
  Paperclip,
  X,
  File,
  Image
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: number;
  conversationId: number;
  senderId: string;
  content: string;
  messageType?: string;
  attachments?: string[];
  createdAt: string;
}

interface AttachmentInfo {
  url: string;
  filename: string;
  size: number;
  type: string;
}

interface Conversation {
  id: number;
  title: string;
  participants: string[];
  lastMessageAt: string;
  projectId?: number;
}

export default function MessagesV2() {
  const { user } = useFirebaseAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [attachments, setAttachments] = useState<AttachmentInfo[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Fetch conversations
  const fetchConversations = async () => {
    if (!user) return;
    
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/conversations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
        
        // Auto-select first conversation
        if (data.length > 0 && !selectedConversation) {
          setSelectedConversation(data[0].id);
        }
      }
    } catch (error) {
      // Silent error handling - conversations will remain empty
    }
  };

  // Fetch messages for selected conversation
  const fetchMessages = async (conversationId: number) => {
    if (!user) return;
    
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      // Silent error handling - messages will remain empty
      setMessages([]);
    }
  };

  // Handle file selection
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user) return;

    setUploadingFile(true);
    try {
      const token = await user.getIdToken();
      
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("attachment", file);

        const response = await fetch("/api/messages/upload-attachment", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (response.ok) {
          const fileInfo = await response.json();
          setAttachments((prev) => [...prev, fileInfo]);
        }
      }
    } catch (error) {
      // Silent error handling
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Remove attachment
  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Send new message
  const sendMessage = async () => {
    if (!user || !selectedConversation || (!newMessage.trim() && attachments.length === 0)) return;
    
    setSendingMessage(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/conversations/${selectedConversation}/messages`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newMessage.trim(),
          messageType: attachments.length > 0 ? 'document' : 'text',
          attachments: attachments.map(a => a.url)
        })
      });
      
      if (response.ok) {
        setNewMessage("");
        setAttachments([]);
        await fetchMessages(selectedConversation);
      }
    } catch (error) {
      // Silent error handling
    } finally {
      setSendingMessage(false);
    }
  };

  // Send payment
  const sendPayment = async (amount: number, description: string) => {
    if (!user || !selectedConversation) return;
    
    try {
      const token = await user.getIdToken();
      
      // Get conversation details to find the other participant (payee)
      const currentConversation = conversations.find(c => c.id === selectedConversation);
      if (!currentConversation) {
        return;
      }
      
      // Find the other participant (not the current user)
      const payeeId = currentConversation.participants.find(p => p !== user.uid);
      if (!payeeId) {
        return;
      }
      
      // Create payment using the marketplace endpoint
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          project_id: currentConversation.projectId || 1, // Default project ID if not linked
          conversation_id: selectedConversation,
          amount: amount.toString(),
          payee_id: payeeId
        })
      });
      
      if (response.ok) {
        const { client_secret } = await response.json();
        
        // Create a system message about the payment
        await fetch(`/api/conversations/${selectedConversation}/messages`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            content: `💰 Payment Request: $${amount} - ${description}`,
            messageType: 'system'
          })
        });
        
        // Refresh messages to show the new system message
        await fetchMessages(selectedConversation);
        
        // Redirect to payment processing
        window.location.href = `/payment?client_secret=${client_secret}&conversation_id=${selectedConversation}`;
      } else {
        const errorData = await response.json();
        
        // Show error message in conversation
        await fetch(`/api/conversations/${selectedConversation}/messages`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            content: `❌ Payment setup failed: ${errorData.message}`,
            messageType: 'system'
          })
        });
        
        await fetchMessages(selectedConversation);
      }
    } catch (error) {
      // Silent error handling
    }
  };

  // Delete conversation
  const deleteConversation = async (conversationId: number) => {
    if (!user) return;
    
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        await fetchConversations();
        if (selectedConversation === conversationId) {
          setSelectedConversation(null);
          setMessages([]);
        }
      }
    } catch (error) {
      // Silent error handling
    }
  };

  // Initial load
  useEffect(() => {
    if (user) {
      fetchConversations();
    }
    setLoading(false);
  }, [user]);

  // Load messages when conversation changes
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

  // Auto-refresh messages every 10 seconds (reduced frequency for production)
  useEffect(() => {
    if (selectedConversation) {
      const interval = setInterval(() => {
        fetchMessages(selectedConversation);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">Please Sign In</h2>
            <p className="text-gray-600">You need to be signed in to view messages.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              </div>
            </div>
            <Button 
              onClick={fetchConversations}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Conversations</span>
                  <Badge variant="secondary">{conversations.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {conversations.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No conversations yet</p>
                      <p className="text-sm">Start messaging professionals to begin conversations</p>
                    </div>
                  ) : (
                    conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors group ${
                          selectedConversation === conversation.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedConversation(conversation.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{conversation.title}</h3>
                            <p className="text-sm text-gray-500 flex items-center mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteConversation(conversation.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Messages Area */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="flex-shrink-0 pb-4">
                <CardTitle className="flex items-center justify-between">
                  <span>
                    {selectedConversation 
                      ? conversations.find(c => c.id === selectedConversation)?.title || 'Conversation'
                      : 'Select a conversation'
                    }
                  </span>
                  {selectedConversation && (
                    <Badge variant="outline">{messages.length} messages</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-4 min-h-0">
                {!selectedConversation ? (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <p>Select a conversation to start messaging</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Messages */}
                    <div className="flex-1 overflow-hidden">
                      <ScrollArea className="h-full pr-4">
                        <div className="space-y-4 pb-4">
                          {messages.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                              <p>No messages yet</p>
                              <p className="text-sm">Start the conversation below</p>
                            </div>
                          ) : (
                            messages.map((message) => (
                              <div
                                key={message.id}
                                className={`flex ${
                                  message.senderId === user.uid ? 'justify-end' : 'justify-start'
                                }`}
                              >
                                <div
                                  className={`max-w-[70%] sm:max-w-xs lg:max-w-md px-4 py-3 rounded-lg break-words overflow-hidden ${
                                    message.senderId === user.uid
                                      ? 'bg-blue-600 text-white'
                                      : message.senderId === 'system'
                                      ? 'bg-green-100 text-green-800 border border-green-200'
                                      : 'bg-gray-100 text-gray-900'
                                  }`}
                                >
                                  <div className="flex items-center space-x-2 mb-1">
                                    {message.senderId !== user.uid && (
                                      <Avatar className="h-6 w-6">
                                        <AvatarFallback className="text-xs">
                                          <User className="h-3 w-3" />
                                        </AvatarFallback>
                                      </Avatar>
                                    )}
                                  </div>
                                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                  {message.attachments && message.attachments.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                      {message.attachments.map((attachment, idx) => {
                                        const filename = attachment.split('/').pop() || 'attachment';
                                        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
                                        return (
                                          <a
                                            key={idx}
                                            href={attachment}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`flex items-center space-x-2 p-2 rounded ${
                                              message.senderId === user.uid
                                                ? 'bg-blue-500 hover:bg-blue-400'
                                                : 'bg-gray-200 hover:bg-gray-300'
                                            } transition-colors`}
                                          >
                                            {isImage ? (
                                              <Image className="h-4 w-4" />
                                            ) : (
                                              <File className="h-4 w-4" />
                                            )}
                                            <span className="text-xs truncate">{filename}</span>
                                          </a>
                                        );
                                      })}
                                    </div>
                                  )}
                                  <div className="flex items-center justify-end mt-2">
                                    <span className="text-xs opacity-70">
                                      {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                          <div ref={messagesEndRef} />
                        </div>
                      </ScrollArea>
                    </div>

                    {/* Payment Options */}
                    {showPaymentOptions && (
                      <div className="flex-shrink-0 mb-4 p-4 bg-gray-50 rounded-lg border">
                        <h4 className="font-medium mb-3 flex items-center">
                          <DollarSign className="h-4 w-4 mr-2" />
                          Send Payment
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => sendPayment(100, "Project Deposit")}
                            className="flex items-center"
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            $100 Deposit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => sendPayment(500, "Milestone Payment")}
                            className="flex items-center"
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            $500 Milestone
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const amount = prompt("Enter payment amount:");
                              const description = prompt("Enter payment description:");
                              if (amount && description) {
                                sendPayment(parseFloat(amount), description);
                              }
                            }}
                            className="flex items-center"
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Custom Amount
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPaymentOptions(false)}
                          className="mt-2 w-full"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}

                    {/* Attachments Preview */}
                    {attachments.length > 0 && (
                      <div className="flex-shrink-0 mb-2 p-2 bg-gray-50 rounded-lg border">
                        <div className="flex flex-wrap gap-2">
                          {attachments.map((attachment, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2 bg-white p-2 rounded border"
                            >
                              {attachment.type.startsWith('image/') ? (
                                <Image className="h-4 w-4 text-blue-600" />
                              ) : (
                                <File className="h-4 w-4 text-gray-600" />
                              )}
                              <span className="text-xs truncate max-w-[100px]">
                                {attachment.filename}
                              </span>
                              <button
                                onClick={() => removeAttachment(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Message Input - Fixed at bottom */}
                    <div className="flex-shrink-0 mt-4 pt-4 border-t bg-white">
                      <div className="flex space-x-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          multiple
                          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                          className="hidden"
                        />
                        <Textarea
                          placeholder="Type your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              sendMessage();
                            }
                          }}
                          className="flex-1 min-h-[60px] max-h-[120px] resize-none"
                          disabled={uploadingFile}
                        />
                        <div className="flex flex-col space-y-2">
                          <Button
                            onClick={() => fileInputRef.current?.click()}
                            variant="outline"
                            size="icon"
                            disabled={uploadingFile}
                            title="Attach files"
                          >
                            {uploadingFile ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Paperclip className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            onClick={() => setShowPaymentOptions(!showPaymentOptions)}
                            variant="outline"
                            size="sm"
                            className="flex items-center"
                          >
                            <DollarSign className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={sendMessage}
                            disabled={!newMessage.trim() || sendingMessage}
                            size="sm"
                          >
                            {sendingMessage ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
