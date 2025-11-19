"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface MessageInputProps {
  selectedUserId: string | null;
}

export function MessageInput({ selectedUserId }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  const sendTypingEvent = async (isTyping: boolean) => {
    if (!selectedUserId) return;
    
    try {
      await fetch('/api/typing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: selectedUserId, isTyping }),
      });
    } catch (error) {
      console.error('Error sending typing event:', error);
    }
  };

  const handleTyping = () => {
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      sendTypingEvent(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing after 2 seconds
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      sendTypingEvent(false);
    }, 2000);
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTypingRef.current) {
        sendTypingEvent(false);
      }
    };
  }, [selectedUserId]);

  const handleSend = async () => {
    if (message.trim() && selectedUserId && !sending) {
      setSending(true);
      try {
        const res = await fetch('/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: message.trim(),
            receiverId: selectedUserId,
          }),
        });

        if (res.ok) {
          setMessage("");
          // Stop typing indicator
          isTypingRef.current = false;
          sendTypingEvent(false);
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
        }
      } catch (error) {
        console.error('Error sending message:', error);
      } finally {
        setSending(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 p-4">
      <div className="flex gap-3">
        <Input
          placeholder={selectedUserId ? "Type a message..." : "Select a user to start chatting"}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
          }}
          onKeyPress={handleKeyPress}
          disabled={!selectedUserId || sending}
          className="flex-1 rounded-xl border-muted-foreground/20 focus-visible:ring-1"
        />
        <Button 
          onClick={handleSend} 
          size="icon" 
          disabled={!selectedUserId || !message.trim() || sending}
          className="rounded-xl shadow-sm hover:shadow transition-all duration-200"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
