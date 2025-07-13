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
  Zap,
  Building,
  GraduationCap
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { apiGet, apiPost, apiPut, API_ENDPOINTS } from "@/config/api";
import { cn } from "@/lib/utils";

// Backend DTO interface
interface MessageDTO {
  senderId: number;
  receiverId?: number;
  messageText: string;
  scope: string;
  subject: string;
  priority: string;
  classId?: number;
  departmentId?: number;
}

// Frontend interface for display
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

interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  identity: string;
}

interface Class {
  id: number;
  name: string;
  level: number;
  departmentId: number;
}

interface Department {
  id: number;
  name: string;
  description: string;
}

export default function MessagesPage() {
  const { token, userId } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [userSearchOpen, setUserSearchOpen] = useState(false);
  const [userSearchValue, setUserSearchValue] = useState("");
  
  // Form state for new message
  const [newMessage, setNewMessage] = useState({
    receiverId: '',
    scope: 'PRIVATE',
    subject: '',
    messageText: '',
    priority: 'normal',
    classId: '',
    departmentId: ''
  });

  // Fetch messages, notifications, users, classes, and departments on mount
  useEffect(() => {
    const fetchData = async () => {
      if (!token || !userId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all data in parallel
        const [messagesRes, notificationsRes, usersRes, classesRes, departmentsRes] = await Promise.all([
          apiGet(`${API_ENDPOINTS.MESSAGES.RECEIVED}/${userId}`, token),
          apiGet(API_ENDPOINTS.NOTIFICATIONS, token).catch(() => []),
          apiGet(API_ENDPOINTS.USERS, token),
          apiGet(API_ENDPOINTS.CLASSES, token),
          apiGet(API_ENDPOINTS.DEPARTMENTS, token)
        ]);
        
        // Ensure messagesRes is an array
        const messagesArray = Array.isArray(messagesRes) ? messagesRes : [];
        
        // Transform backend data to frontend format
        const transformedMessages: Message[] = messagesArray.map((msg: any) => ({
          id: msg.id || Math.random(),
          from: msg.senderName || 'Unknown Sender',
          fromRole: msg.senderRole || 'User',
          to: msg.receiverName || 'You',
          subject: msg.subject || 'No Subject',
          content: msg.messageText || '',
          timestamp: msg.timestamp || new Date().toISOString(),
          status: msg.seen ? 'read' : 'unread',
          priority: msg.priority || 'normal',
          category: 'general'
        }));
        
        setMessages(transformedMessages);
        setNotifications(notificationsRes || []);
        setUsers(usersRes || []);
        setClasses(classesRes || []);
        setDepartments(departmentsRes || []);

      } catch (error: any) {
        console.error("Error fetching data:", error);
        if (error.message.includes('403') || error.message.includes('401')) {
          setError("Authentication error. Please log in again.");
        } else if (error.message.includes('Failed to fetch')) {
          setError("Cannot connect to server. Please check your connection.");
        } else {
          setError("Failed to load messages. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [token, userId]);

  const handleSendMessage = async () => {
    if (!token || !userId) return;
    
    try {
      const messageData: MessageDTO = {
        senderId: userId,
        receiverId: newMessage.receiverId ? parseInt(newMessage.receiverId) : undefined,
        messageText: newMessage.messageText,
        scope: newMessage.scope,
        subject: newMessage.subject,
        priority: newMessage.priority,
        classId: newMessage.classId ? parseInt(newMessage.classId) : undefined,
        departmentId: newMessage.departmentId ? parseInt(newMessage.departmentId) : undefined
      };

      await apiPost(API_ENDPOINTS.MESSAGES.BASE, messageData, token);
      
      // Reset form
      setNewMessage({
        receiverId: '',
        scope: 'PRIVATE',
        subject: '',
        messageText: '',
        priority: 'normal',
        classId: '',
        departmentId: ''
      });
      setIsNewMessageOpen(false);
      
      // Refresh messages
      const messagesRes = await apiGet(`${API_ENDPOINTS.MESSAGES.RECEIVED}/${userId}`, token);
      const messagesArray = Array.isArray(messagesRes) ? messagesRes : [];
      const transformedMessages: Message[] = messagesArray.map((msg: any) => ({
        id: msg.id || Math.random(),
        from: msg.senderName || 'Unknown Sender',
        fromRole: msg.senderRole || 'User',
        to: msg.receiverName || 'You',
        subject: msg.subject || 'No Subject',
        content: msg.messageText || '',
        timestamp: msg.timestamp || new Date().toISOString(),
        status: msg.seen ? 'read' : 'unread',
        priority: msg.priority || 'normal',
        category: 'general'
      }));
      setMessages(transformedMessages);
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message. Please try again.");
    }
  };

  const handleMarkAsRead = async (messageId: number) => {
    if (!token || !userId) return;
    
    try {
      await apiPut(`${API_ENDPOINTS.MESSAGES.MARK_READ}/${messageId}/seen/${userId}`, {}, token);
      
      // Update the message status locally
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === messageId 
            ? { ...msg, status: 'read' as const }
            : msg
        )
      );
    } catch (error) {
      console.error("Error marking message as read:", error);
      // Don't show error to user for this action as it's not critical
    }
  };

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

  const filteredUsers = users.filter(user => 
    user.firstname.toLowerCase().includes(userSearchValue.toLowerCase()) ||
    user.lastname.toLowerCase().includes(userSearchValue.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchValue.toLowerCase())
  );

  const getSelectedUserName = () => {
    if (!newMessage.receiverId) return "Select user...";
    const user = users.find(u => u.id.toString() === newMessage.receiverId);
    return user ? `${user.firstname} ${user.lastname} (${user.email})` : "Select user...";
  };

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
            {new Date(message.timestamp).toLocaleDateString()}
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="border-cyan-400/30 hover:bg-cyan-500/20 text-cyan-300"
              onClick={() => {
                setSelectedMessage(message);
                if (message.status === 'unread') {
                  handleMarkAsRead(message.id);
                }
              }}
            >
              <Eye className="h-3 w-3 mr-1" />
              Read
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-black flex items-center justify-center">
        <Card className="bg-red-900/20 backdrop-blur-md border-red-500/30 max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Error Loading Messages</h3>
            <p className="text-gray-300 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="space-y-6 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Communication Center
            </h1>
            <p className="text-slate-600 mt-2">Advanced messaging hub for seamless communication</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Dialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20">
                  <Plus className="mr-2 h-4 w-4" />
                  Compose Message
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white/95 backdrop-blur-md border-blue-500/30 max-w-2xl shadow-xl">
                <DialogHeader>
                  <DialogTitle className="text-blue-700">New Message</DialogTitle>
                  <DialogDescription className="text-slate-600">
                    Send a message to users or broadcast to all
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="scope" className="text-gray-700">Scope</Label>
                      <Select value={newMessage.scope} onValueChange={(value) => {
                        setNewMessage({...newMessage, scope: value, receiverId: '', classId: '', departmentId: ''});
                      }}>
                        <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                          <SelectValue placeholder="Select scope" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-300">
                          <SelectItem value="PRIVATE">Private</SelectItem>
                          <SelectItem value="STUDENTS">All Students</SelectItem>
                          <SelectItem value="PROFESSORS">All Professors</SelectItem>
                          <SelectItem value="MANAGERS">All Managers</SelectItem>
                          <SelectItem value="ALL">All Users</SelectItem>
                          <SelectItem value="CLASS">Specific Class</SelectItem>
                          <SelectItem value="DEPARTMENT">Specific Department</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="priority" className="text-gray-700">Priority</Label>
                      <Select value={newMessage.priority} onValueChange={(value) => setNewMessage({...newMessage, priority: value})}>
                        <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-300">
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* User Selection for Private Messages */}
                  {newMessage.scope === 'PRIVATE' && (
                    <div>
                      <Label htmlFor="receiver" className="text-gray-700">Select User</Label>
                      <Popover open={userSearchOpen} onOpenChange={setUserSearchOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={userSearchOpen}
                            className="w-full justify-between bg-white border-gray-300 text-gray-900"
                          >
                            {getSelectedUserName()}
                            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command>
                            <CommandInput 
                              placeholder="Search users..." 
                              value={userSearchValue}
                              onValueChange={setUserSearchValue}
                            />
                            <CommandList>
                              <CommandEmpty>No user found.</CommandEmpty>
                              <CommandGroup>
                                {filteredUsers.map((user) => (
                                  <CommandItem
                                    key={user.id}
                                    value={user.id.toString()}
                                    onSelect={(value) => {
                                      setNewMessage({...newMessage, receiverId: value});
                                      setUserSearchOpen(false);
                                    }}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Avatar className="h-6 w-6">
                                        <AvatarFallback className="text-xs">
                                          {user.firstname.charAt(0)}{user.lastname.charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <div className="font-medium">{user.firstname} {user.lastname}</div>
                                        <div className="text-xs text-gray-500">{user.email}</div>
                                      </div>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}

                  {/* Class Selection for CLASS scope */}
                  {newMessage.scope === 'CLASS' && (
                    <div>
                      <Label htmlFor="class" className="text-gray-700">Select Class</Label>
                      <Select value={newMessage.classId} onValueChange={(value) => setNewMessage({...newMessage, classId: value})}>
                        <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-300">
                          {classes.map((classe) => (
                            <SelectItem key={classe.id} value={classe.id.toString()}>
                              <div className="flex items-center gap-2">
                                <GraduationCap className="h-4 w-4" />
                                {classe.name} (Level {classe.level})
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Department Selection for DEPARTMENT scope */}
                  {newMessage.scope === 'DEPARTMENT' && (
                    <div>
                      <Label htmlFor="department" className="text-gray-700">Select Department</Label>
                      <Select value={newMessage.departmentId} onValueChange={(value) => setNewMessage({...newMessage, departmentId: value})}>
                        <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-300">
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id.toString()}>
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4" />
                                {dept.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="subject" className="text-gray-700">Subject</Label>
                    <Input 
                      id="subject" 
                      placeholder="Message subject" 
                      value={newMessage.subject}
                      onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                      className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="message" className="text-gray-700">Message</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Type your message here..." 
                      value={newMessage.messageText}
                      onChange={(e) => setNewMessage({...newMessage, messageText: e.target.value})}
                      className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 min-h-32"
                    />
                  </div>
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.subject || !newMessage.messageText || 
                             (newMessage.scope === 'PRIVATE' && !newMessage.receiverId) ||
                             (newMessage.scope === 'CLASS' && !newMessage.classId) ||
                             (newMessage.scope === 'DEPARTMENT' && !newMessage.departmentId)}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" className="border-blue-400 bg-blue-50 text-blue-700 hover:bg-blue-100">
              <Bell className="mr-2 h-4 w-4" />
              Broadcast
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <Card className="bg-white/80 backdrop-blur-md border-blue-200 hover:border-blue-300 transition-all duration-300 group shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="relative">
                <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-blue-100 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="text-2xl font-bold text-slate-800">{messages.length}</div>
              <div className="text-sm text-blue-600">Total Messages</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-indigo-200 hover:border-indigo-300 transition-all duration-300 group shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="relative">
                <Bell className="h-8 w-8 text-indigo-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-indigo-100 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="text-2xl font-bold text-slate-800">{messages.filter(m => m.status === 'unread').length}</div>
              <div className="text-sm text-indigo-600">Unread</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-orange-200 hover:border-orange-300 transition-all duration-300 group shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="relative">
                <AlertCircle className="h-8 w-8 text-orange-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-orange-100 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="text-2xl font-bold text-slate-800">{messages.filter(m => m.priority === 'urgent').length}</div>
              <div className="text-sm text-orange-600">Urgent</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-green-200 hover:border-green-300 transition-all duration-300 group shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="relative">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-green-100 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="text-2xl font-bold text-slate-800">{messages.filter(m => m.status === 'replied').length}</div>
              <div className="text-sm text-green-600">Replied</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="bg-white/80 backdrop-blur-md border-blue-200 shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-blue-500" />
                <Input
                  placeholder="Search messages by sender, subject, or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-blue-200 text-slate-800 placeholder-slate-500 focus:border-blue-400"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48 bg-white border-blue-200 text-slate-800">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                  <SelectContent className="bg-white border-blue-200">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="replied">Replied</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-full sm:w-48 bg-white border-blue-200 text-slate-800">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                  <SelectContent className="bg-white border-blue-200">
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-purple-900/20 backdrop-blur-md rounded-xl h-48 border border-purple-500/30"></div>
                ))}
              </div>
            ) : filteredMessages.length === 0 ? (
              <Card className="bg-purple-900/20 backdrop-blur-md border-purple-500/30">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="h-12 w-12 text-purple-400/50 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No messages found</h3>
                  <p className="text-gray-300 text-center mb-4">
                    {searchTerm ? "Try adjusting your search terms" : "You don't have any messages yet"}
                  </p>
                  <Button 
                    onClick={() => setIsNewMessageOpen(true)}
                    className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Compose Message
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMessages.map((message) => (
                  <MessageCard key={message.id} message={message} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            {notifications.length === 0 ? (
              <Card className="bg-purple-900/20 backdrop-blur-md border-purple-500/30">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bell className="h-12 w-12 text-purple-400/50 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No notifications</h3>
                  <p className="text-gray-300">You're all caught up!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {notifications.map((notification) => (
                <NotificationCard key={notification.id} notification={notification} />
              ))}
            </div>
            )}
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
                    <p className="text-xs text-gray-400">{new Date(selectedMessage.timestamp).toLocaleString()}</p>
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