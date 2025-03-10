"use client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";

interface Notification {
  id: number;
  message: string;
  createdAt: string;
  seen: boolean;
  user: {
    firstName: string;
    lastName: string;
  };
}

export const MessagesCard = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications from the backend
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/notifications");
        if (!response.ok) {
          throw new Error("Failed to fetch notifications");
        }
        const data = await response.json();
        setNotifications(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Transform notifications into message format
  const messagesData = notifications.map((notification) => ({
    name: `${notification.user.firstName} ${notification.user.lastName}`,
    message: notification.message,
    time: new Date(notification.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    unread: !notification.seen,
  }));

  // Count unread messages
  const unreadCount = messagesData.filter((message) => message.unread).length;

  if (loading) {
    return <div>Loading messages...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Card className="bg-white border-gray-200 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="font-heading">Recent Messages</CardTitle>
          <CardDescription className="text-gray-600 font-body">
            {unreadCount} unread {unreadCount === 1 ? "message" : "messages"}
          </CardDescription>
        </div>
        <Button variant="ghost" className="text-cyan-400 hover:text-cyan-300 hover:bg-white/5">
          View All <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {messagesData.map((message, index) => (
          <div
            key={index}
            className={`flex items-center p-3 rounded-lg ${
              message.unread ? "bg-white/10" : "bg-transparent"
            } hover:bg-white/15 transition-colors`}
          >
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={`/placeholder.svg?height=40&width=40&text=${message.name.charAt(0)}`} />
              <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-700">
                {message.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <p className="font-medium truncate">{message.name}</p>
                <p className="text-xs text-gray-400 ml-2">{message.time}</p>
              </div>
              <p className="text-sm text-gray-600 truncate">{message.message}</p>
            </div>
            {message.unread && <div className="w-2 h-2 bg-pink-500 rounded-full ml-2"></div>}
          </div>
        ))}
      </CardContent>
      <CardFooter className="pt-0">
        <Button className="w-full bg-gradient-to-r from-pink-600 to-cyan-600 hover:from-pink-700 hover:to-cyan-700 text-white border-0">
          <Mail className="mr-2 h-4 w-4" /> Compose Message
        </Button>
      </CardFooter>
    </Card>
  );
};