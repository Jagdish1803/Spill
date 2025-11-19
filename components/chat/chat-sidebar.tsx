"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useUser, useClerk } from "@clerk/nextjs";
import { LogOut, Settings, User } from "lucide-react";
import { useEffect, useState } from "react";

interface ChatUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  status: string | null;
  username: string | null;
  email: string;
}

export function ChatSidebar({
  selectedUserId,
  onSelectUser,
}: {
  selectedUserId?: string | null;
  onSelectUser: (userId: string) => void;
}) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
        console.log('Fetched users:', data);
      } else {
        console.error('Failed to fetch users, status:', res.status);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const userName = user?.fullName || user?.firstName || "User";
  const userEmail = user?.primaryEmailAddress?.emailAddress || "";
  const userInitials = user?.fullName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  const getUserName = (chatUser: ChatUser) => {
    if (chatUser.firstName && chatUser.lastName) {
      return `${chatUser.firstName} ${chatUser.lastName}`;
    }
    return chatUser.firstName || chatUser.username || chatUser.email;
  };

  const getUserInitials = (chatUser: ChatUser) => {
    if (chatUser.firstName && chatUser.lastName) {
      return `${chatUser.firstName[0]}${chatUser.lastName[0]}`.toUpperCase();
    }
    if (chatUser.firstName) {
      return chatUser.firstName[0].toUpperCase();
    }
    return chatUser.email[0].toUpperCase();
  };

  return (
    <div className="flex h-full w-80 flex-col border-r bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="p-6">
        <h2 className="text-xl font-bold tracking-tight">Messages</h2>
      </div>
      <Separator />
      <ScrollArea className="flex-1 h-full overflow-y-auto px-3">
        <div className="py-3">
          {loading ? (
            <div className="text-center text-sm text-muted-foreground py-4">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-4">
              No users found
            </div>
          ) : (
            users.map((chatUser) => (
              <button
                key={chatUser.id}
                onClick={() => onSelectUser(chatUser.id)}
                className={cn(
                  "w-full rounded-xl p-3 text-left transition-all duration-200 hover:bg-accent/80 hover:shadow-sm",
                  selectedUserId === chatUser.id && "bg-accent shadow-sm"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={chatUser.imageUrl || undefined} />
                      <AvatarFallback>
                        {getUserInitials(chatUser)}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={cn(
                        "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
                        chatUser.status === "online" ? "bg-green-500" : "bg-gray-400"
                      )}
                    />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{getUserName(chatUser)}</p>
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
      <Separator />
      <div className="p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-2 rounded-xl p-2.5 transition-all duration-200 hover:bg-accent/80 cursor-pointer">
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.imageUrl} />
                  <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-green-500" />
              </div>
              <div className="flex-1 overflow-hidden text-left">
                <p className="truncate text-sm font-medium">{userName}</p>
                <p className="truncate text-xs text-muted-foreground">Online</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {userEmail}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
