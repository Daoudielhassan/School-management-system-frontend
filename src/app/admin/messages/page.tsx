'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  MessageSquare, 
  Send, 
  Bell, 
  Users, 
  Search, 
  Filter,
  Plus,
  Eye,
  Star,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Message {
  id: number;
  from: string;
  fromRole: string;
  to: string;
  subject: string;
  content: string;
  timestamp: string;
  status: 'unread' | 'read' | 'replied';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: 'general' | 'academic' | 'disciplinary' | 'administrative';
}

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: string;
  isRead: boolean;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);

  // Mock data - Replace with actual API calls
  useEffect(() => {
    setTimeout(() => {
      const mockMessages: Message[] = [
        {
          id: 1,
          from: "Dr. Sarah Johnson",
          fromRole: "Professor",
          to: "Admin Team",
          subject: "Urgent: Grade Submission Deadline",
          content: "Please be reminded that the grade submission deadline is approaching. All professors must submit their final grades by end of week.",
          timestamp: "2024-01-16 14:30",
          status: "unread",
          priority: "urgent",
          category: "academic"
        },
        {
          id: 2,
          from: "Mike Wilson",
          fromRole: "Student",
          to: "Academic Office",
          subject: "Appeal Request for Final Grade",
          content: "I would like to formally request an appeal for my final grade in Computer Science 301. I believe there may have been an error in the calculation.",
          timestamp: "2024-01-16 11:15",
          status: "read",
          priority: "high",
          category: "academic"
        },
        {
          id: 3,
          from: "IT Department",
          fromRole: "Staff",
          to: "All Users",
          subject: "System Maintenance Notice",
          content: "The student portal will be undergoing scheduled maintenance this weekend from 2 AM to 6 AM. Please plan accordingly.",
          timestamp: "2024-01-15 16:45",
          status: "read",
          priority: "normal",
          category: "administrative"
        },
        {
          id: 4,
          from: "Lisa Chen",
          fromRole: "Parent",
          to: "Student Affairs",
          subject: "Accommodation Request",
          content: "I am writing to request special accommodations for my daughter due to her medical condition. Please let me know the process.",
          timestamp: "2024-01-15 09:20",
          status: "replied",
          priority: "high",
          category: "administrative"
        }
      ];

      const mockNotifications: Notification[] = [
        {
          id: 1,
          title: "New Grade Submissions",
          message: "12 new grade submissions awaiting approval",
          type: "info",
          timestamp: "5 minutes ago",
          isRead: false
        },
        {
          id: 2,
          title: "System Alert",
          message: "High server load detected - monitoring",
          type: "warning",
          timestamp: "15 minutes ago",
          isRead: false
        },
        {
          id: 3,
          title: "Backup Completed",
          message: "Daily database backup completed successfully",
          type: "success",
          timestamp: "1 hour ago",
          isRead: true
        }
      ];
      
      setMessages(mockMessages);
      setNotifications(mockNotifications);
      setLoading(false);
    }, 1000);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return "from-blue-400 to-cyan-400";
      case 'normal': return "from-green-400 to-blue-400";
      case 'high': return "from-yellow-400 to-orange-400";
      case 'urgent': return "from-red-400 to-pink-400";
      default: return "from-gray-400 to-slate-400";
    }
  };

  const getPriorityBg = (priority: string) => {
    switch (priority) {
      case 'low': return "bg-blue-500/20 border-blue-400/50 text-blue-200";
      case 'normal': return "bg-green-500/20 border-green-400/50 text-green-200";
      case 'high': return "bg-yellow-500/20 border-yellow-400/50 text-yellow-200";
      case 'urgent': return "bg-red-500/20 border-red-400/50 text-red-200";
      default: return "bg-gray-500/20 border-gray-400/50 text-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'unread': return <MessageSquare className="h-4 w-4 text-cyan-400" />;
      case 'read': return <Eye className="h-4 w-4 text-blue-400" />;
      case 'replied': return <CheckCircle className="h-4 w-4 text-green-400" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info': return <Bell className="h-4 w-4 text-cyan-400" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-400" />;
      default: return <Bell className="h-4 w-4 text-gray-400" />;
    }
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || message.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || message.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const MessageCard = ({ message }: { message: Message }) => (
    <Card className="bg-purple-900/20 backdrop-blur-md border-purple-500/30 hover:border-cyan-400/50 transition-all duration-300 group hover:shadow-lg hover:shadow-cyan-500/20">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-cyan-400/50">
              <AvatarImage src="/user.png" />
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white">
                {message.from.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-white group-hover:text-cyan-300 transition-colors">{message.from}</h3>
              <p className="text-xs text-purple-300">{message.fromRole}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(message.status)}
            <Badge className={`border ${getPriorityBg(message.priority)}`}>
              {message.priority}
            </Badge>
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium text-white line-clamp-1">{message.subject}</h4>
          <p className="text-sm text-gray-300 line-clamp-2">{message.content}</p>
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-purple-500/20">
          <div className="flex items-center gap-2 text-xs text-purple-300">
            <Clock className="h-3 w-3" />
            {message.timestamp}
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="border-cyan-400/30 hover:bg-cyan-500/20 text-cyan-300"
              onClick={() => setSelectedMessage(message)}
            >
              <Eye className="h-3 w-3 mr-1" />
              Read
            </Button>
            <Button 
              size="sm" 
              className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30"
            >
              <Send className="h-3 w-3 mr-1" />
              Reply
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const NotificationCard = ({ notification }: { notification: Notification }) => (
    <Card className={`backdrop-blur-md border transition-all duration-300 group hover:shadow-lg ${
      notification.isRead ? 'bg-purple-900/10 border-purple-500/20' : 'bg-purple-900/30 border-purple-500/50'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-cyan-500/20">
            {getNotificationIcon(notification.type)}
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-white mb-1">{notification.title}</h4>
            <p className="text-sm text-gray-300 mb-2">{notification.message}</p>
            <span className="text-xs text-purple-300">{notification.timestamp}</span>
          </div>
          {!notification.isRead && (
            <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full animate-pulse"></div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-black">
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent">
              Communication Center
            </h1>
            <p className="text-gray-300 mt-2">Advanced messaging hub for seamless communication</p>
          </div>
          <div className="flex gap-3">
            <Dialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white shadow-lg shadow-purple-500/20">
                  <Plus className="mr-2 h-4 w-4" />
                  Compose Message
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900/95 backdrop-blur-md border-purple-500/30">
                <DialogHeader>
                  <DialogTitle className="text-purple-300">New Message</DialogTitle>
                  <DialogDescription className="text-gray-300">
                    Send a message to users or broadcast to all
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="recipient" className="text-gray-300">Recipient</Label>
                      <Select>
                        <SelectTrigger className="bg-purple-900/20 border-purple-400/30 text-white">
                          <SelectValue placeholder="Select recipient" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800/95 border-purple-500/30">
                          <SelectItem value="all">All Users</SelectItem>
                          <SelectItem value="students">All Students</SelectItem>
                          <SelectItem value="professors">All Professors</SelectItem>
                          <SelectItem value="staff">All Staff</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="priority" className="text-gray-300">Priority</Label>
                      <Select>
                        <SelectTrigger className="bg-purple-900/20 border-purple-400/30 text-white">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800/95 border-purple-500/30">
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="subject" className="text-gray-300">Subject</Label>
                    <Input 
                      id="subject" 
                      placeholder="Message subject" 
                      className="bg-purple-900/20 border-purple-400/30 text-white placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <Label htmlFor="message" className="text-gray-300">Message</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Type your message here..." 
                      className="bg-purple-900/20 border-purple-400/30 text-white placeholder-gray-400 min-h-32"
                    />
                  </div>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700">
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" className="border-cyan-400/30 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30">
              <Bell className="mr-2 h-4 w-4" />
              Broadcast
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-purple-900/20 backdrop-blur-md border-purple-500/30 hover:border-cyan-400/50 transition-all duration-300 group">
            <CardContent className="p-6 text-center">
              <div className="relative">
                <MessageSquare className="h-8 w-8 text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="text-2xl font-bold text-white">{messages.length}</div>
              <div className="text-sm text-purple-300">Total Messages</div>
            </CardContent>
          </Card>

          <Card className="bg-purple-900/20 backdrop-blur-md border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300 group">
            <CardContent className="p-6 text-center">
              <div className="relative">
                <Bell className="h-8 w-8 text-cyan-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="text-2xl font-bold text-white">{messages.filter(m => m.status === 'unread').length}</div>
              <div className="text-sm text-cyan-300">Unread</div>
            </CardContent>
          </Card>

          <Card className="bg-purple-900/20 backdrop-blur-md border-pink-500/30 hover:border-pink-400/50 transition-all duration-300 group">
            <CardContent className="p-6 text-center">
              <div className="relative">
                <AlertCircle className="h-8 w-8 text-pink-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-pink-400/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="text-2xl font-bold text-white">{messages.filter(m => m.priority === 'urgent').length}</div>
              <div className="text-sm text-pink-300">Urgent</div>
            </CardContent>
          </Card>

          <Card className="bg-purple-900/20 backdrop-blur-md border-green-500/30 hover:border-green-400/50 transition-all duration-300 group">
            <CardContent className="p-6 text-center">
              <div className="relative">
                <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-green-400/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="text-2xl font-bold text-white">{messages.filter(m => m.status === 'replied').length}</div>
              <div className="text-sm text-green-300">Replied</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="bg-purple-900/20 backdrop-blur-md border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-purple-400" />
                <Input
                  placeholder="Search messages by sender, subject, or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-purple-900/20 border-purple-400/30 text-white placeholder-gray-400 focus:border-cyan-400"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 bg-purple-900/20 border-purple-400/30 text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800/95 backdrop-blur-md border-purple-500/30">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="replied">Replied</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-48 bg-purple-900/20 border-purple-400/30 text-white">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800/95 backdrop-blur-md border-purple-500/30">
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Messages and Notifications Tabs */}
        <Tabs defaultValue="messages" className="space-y-4">
          <TabsList className="bg-purple-900/20 backdrop-blur-md border border-purple-500/30">
            <TabsTrigger value="messages" className="data-[state=active]:bg-purple-500/30">Messages</TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-cyan-500/30">Notifications</TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-pink-500/30">System Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="messages" className="space-y-4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-purple-900/20 backdrop-blur-md rounded-xl h-48 border border-purple-500/30"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMessages.map((message) => (
                  <MessageCard key={message.id} message={message} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notifications.map((notification) => (
                <NotificationCard key={notification.id} notification={notification} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <Card className="bg-purple-900/20 backdrop-blur-md border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-5 w-5 text-pink-400" />
                  System Alerts
                </CardTitle>
                <CardDescription className="text-gray-300">Real-time system notifications and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔔</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Alert Center</h3>
                  <p className="text-gray-300">Advanced system monitoring dashboard coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Message Detail Dialog */}
        <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
          <DialogContent className="bg-gray-900/95 backdrop-blur-md border-purple-500/30 max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-purple-300">Message Details</DialogTitle>
              <DialogDescription className="text-gray-300">
                Full message content and actions
              </DialogDescription>
            </DialogHeader>
            {selectedMessage && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-purple-900/20 rounded-lg">
                  <Avatar className="h-12 w-12 border-2 border-cyan-400/50">
                    <AvatarImage src="/user.png" />
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white">
                      {selectedMessage.from.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{selectedMessage.from}</h3>
                    <p className="text-sm text-purple-300">{selectedMessage.fromRole}</p>
                    <p className="text-xs text-gray-400">{selectedMessage.timestamp}</p>
                  </div>
                  <Badge className={`${getPriorityBg(selectedMessage.priority)} border`}>
                    {selectedMessage.priority}
                  </Badge>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium text-white mb-2">{selectedMessage.subject}</h4>
                  <div className="bg-black/20 p-4 rounded-lg">
                    <p className="text-gray-300 leading-relaxed">{selectedMessage.content}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button className="flex-1 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700">
                    <Send className="mr-2 h-4 w-4" />
                    Reply
                  </Button>
                  <Button variant="outline" className="border-purple-400/30 text-purple-300 hover:bg-purple-500/20">
                    <Star className="mr-2 h-4 w-4" />
                    Star
                  </Button>
                  <Button variant="outline" className="border-gray-400/30 text-gray-300 hover:bg-gray-500/20">
                    Forward
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}