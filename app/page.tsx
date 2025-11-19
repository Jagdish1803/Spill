"use client";

import { useState, useEffect } from "react";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatHeader } from "@/components/chat/chat-header";
import { MessageList } from "@/components/chat/message-list";
import { MessageInput } from "@/components/chat/message-input";
import { UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

export default function Home() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>("");
  const [currentDbUserId, setCurrentDbUserId] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Sync current user to database
    const syncUser = async () => {
      try {
        await fetch('/api/users/sync', { method: 'POST' });
        // Set user as online
        await fetch('/api/users/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'online' }),
        });
      } catch (error) {
        console.error('Error syncing user:', error);
      }
    };

    if (user) {
      syncUser();
    }

    // Set user offline on page unload
    const handleBeforeUnload = async () => {
      if (user) {
        await fetch('/api/users/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'offline' }),
          keepalive: true,
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user]);

  useEffect(() => {
    // Fetch current user's database ID
    const fetchCurrentUser = async () => {
      try {
        if (user?.id) {
          const userRes = await fetch(`/api/users/me`);
          if (userRes.ok) {
            const userData = await userRes.json();
            setCurrentDbUserId(userData.id);
          }
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    if (user) {
      fetchCurrentUser();
    }
  }, [user]);

  useEffect(() => {
    // Fetch selected user details
    const fetchUserDetails = async () => {
      if (selectedUserId) {
        try {
          const res = await fetch('/api/users');
          if (res.ok) {
            const users = await res.json();
            const selectedUser = users.find((u: any) => u.id === selectedUserId);
            if (selectedUser) {
              const name = selectedUser.firstName && selectedUser.lastName
                ? `${selectedUser.firstName} ${selectedUser.lastName}`
                : selectedUser.firstName || selectedUser.username || selectedUser.email;
              setSelectedUserName(name);
            }
          }
        } catch (error) {
          console.error('Error fetching user details:', error);
        }
      }
    };

    fetchUserDetails();
  }, [selectedUserId]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80">
              <SheetTitle className="sr-only">Messages</SheetTitle>
              <ChatSidebar
                selectedUserId={selectedUserId}
                onSelectUser={(userId) => {
                  setSelectedUserId(userId);
                  setOpen(false);
                }}
              />
            </SheetContent>
          </Sheet>
          <h1 className="text-2xl font-bold tracking-tighter">
            <span className="bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Spill</span>
          </h1>
        </div>
        <UserButton afterSignOutUrl="/" />
      </header>
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:block">
          <ChatSidebar
            selectedUserId={selectedUserId}
            onSelectUser={setSelectedUserId}
          />
        </div>
        <div className="flex flex-1 flex-col overflow-hidden">
          {selectedUserId && <ChatHeader userName={selectedUserName} />}
          <MessageList 
            selectedUserId={selectedUserId} 
            currentUserId={currentDbUserId}
          />
          <MessageInput selectedUserId={selectedUserId} />
        </div>
      </div>
    </div>
  );
}

