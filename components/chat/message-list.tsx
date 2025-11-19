"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { createPusherClient } from "@/lib/pusher";
import { useMessageStore } from "@/store/message-store";
import Pusher from "pusher-js";

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string | null;
  createdAt: string;
  sender: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  };
}

interface MessageListProps {
  selectedUserId: string | null;
  currentUserId: string;
}

export function MessageList({ selectedUserId, currentUserId }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pusherRef = useRef<Pusher | null>(null);
  const { messages, addMessage, setMessages } = useMessageStore();
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  
  const conversationId = selectedUserId && currentUserId 
    ? [currentUserId, selectedUserId].sort().join('-')
    : null;
  
  const conversationMessages = conversationId ? messages[conversationId] || [] : [];
  const loading = conversationId ? conversationMessages.length === 0 : false;
  const isOtherUserTyping = selectedUserId ? typingUsers[selectedUserId] : false;

  useEffect(() => {
    if (selectedUserId && conversationId) {
      fetchMessages();
    }
  }, [selectedUserId, conversationId]);

  useEffect(() => {
    if (!selectedUserId || !currentUserId) return;

    // Initialize Pusher client
    if (!pusherRef.current) {
      const client = createPusherClient();
      if (client) {
        pusherRef.current = client;
        
        // Enable logging for debugging
        Pusher.logToConsole = true;

        client.connection.bind('connected', () => {
          console.log('✅ Pusher connected');
        });

        client.connection.bind('error', (err: any) => {
          console.error('❌ Pusher connection error:', err);
        });
      }
    }

    const pusher = pusherRef.current;
    if (!pusher) {
      console.error('❌ Pusher client not initialized');
      return;
    }

    const channelName = `private-chat-${[currentUserId, selectedUserId].sort().join('-')}`;
    
    console.log('🔔 Subscribing to channel:', channelName);
    const channel = pusher.subscribe(channelName);

    channel.bind('pusher:subscription_succeeded', () => {
      console.log('✅ Successfully subscribed to', channelName);
    });

    channel.bind('pusher:subscription_error', (error: any) => {
      console.error('❌ Subscription error:', error);
    });

    channel.bind('new-message', (message: Message) => {
      console.log('📨 Received new message via Pusher:', message);
      if (conversationId) {
        addMessage(conversationId, message);
      }
      setTimeout(() => scrollToBottom(), 100);
    });

    channel.bind('typing', (data: { userId: string; isTyping: boolean }) => {
      console.log('⌨️ Typing event:', data);
      setTypingUsers(prev => ({
        ...prev,
        [data.userId]: data.isTyping
      }));
      
      // Clear typing after 3 seconds
      if (data.isTyping) {
        setTimeout(() => {
          setTypingUsers(prev => ({
            ...prev,
            [data.userId]: false
          }));
        }, 3000);
      }
    });

    return () => {
      console.log('🔕 Unsubscribing from', channelName);
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [selectedUserId, currentUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    if (!selectedUserId || !conversationId) return;
    
    try {
      const res = await fetch(`/api/messages?userId=${selectedUserId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(conversationId, data);
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getSenderName = (message: Message) => {
    if (message.sender.firstName && message.sender.lastName) {
      return `${message.sender.firstName} ${message.sender.lastName}`;
    }
    return message.sender.firstName || "User";
  };

  const getSenderInitials = (message: Message) => {
    if (message.sender.firstName && message.sender.lastName) {
      return `${message.sender.firstName[0]}${message.sender.lastName[0]}`.toUpperCase();
    }
    if (message.sender.firstName) {
      return message.sender.firstName[0].toUpperCase();
    }
    return "U";
  };

  if (!selectedUserId) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        Select a user to start chatting
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 h-full overflow-y-auto">
      <div className="space-y-6 p-6">
        {loading ? (
          <div className="text-center text-sm text-muted-foreground">
            Loading messages...
          </div>
        ) : conversationMessages.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground">
            No messages yet. Start the conversation!
          </div>
        ) : (
          conversationMessages.map((message) => {
            const isCurrentUser = message.senderId === currentUserId;
            return (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  isCurrentUser && "flex-row-reverse"
                )}
              >
                {!isCurrentUser && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={message.sender.imageUrl || undefined} />
                    <AvatarFallback className="text-xs">
                      {getSenderInitials(message)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "flex flex-col gap-1",
                    isCurrentUser && "items-end"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-md rounded-2xl px-4 py-2.5 shadow-sm",
                      isCurrentUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(message.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        {isOtherUserTyping && (
          <div className="flex gap-3">
            <div className="flex items-center gap-1 rounded-2xl bg-muted px-4 py-2.5">
              <span className="h-2 w-2 rounded-full bg-foreground/40 animate-pulse" style={{ animationDelay: '0ms' }} />
              <span className="h-2 w-2 rounded-full bg-foreground/40 animate-pulse" style={{ animationDelay: '150ms' }} />
              <span className="h-2 w-2 rounded-full bg-foreground/40 animate-pulse" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>
    </ScrollArea>
  );
}
