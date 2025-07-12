"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, GraduationCap, Briefcase, Shield, TrendingUp, AlertCircle, Bell, Settings, ChevronDown, Search, Calendar, BookOpen, Award, Activity } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { debounce } from "lodash"
import { apiGet, apiPost, API_ENDPOINTS } from "@/config/api"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface DashboardStats {
  totalUsers: number
  newUsersThisMonth: number
  activeUsers: number
  identityCounts: { identity: string; count: number }[]
}

interface ExtendedStats {
  totalUsers: number
  totalStudents: number
  totalProfessors: number
  totalManagers: number
  totalDepartments: number
  totalClasses: number
  totalSessions: number
  totalMessages: number
  unreadMessages: number
  totalNotifications: number
}

interface User {
  id: number
  username: string
  email: string
  identity: string
  firstname?: string
  lastname?: string
}

// Enhanced UserCard Component with glassmorphism
const UserCard = ({ user }: { user: User }) => {
  const roleMapping: Record<string, { name: string; color: string; gradient: string }> = {
    ETUDIANT: { 
      name: "Student", 
      color: "bg-emerald-100 text-emerald-800 border-emerald-300",
      gradient: "from-emerald-400 to-green-400"
    },
    MANAGER: { 
      name: "Manager", 
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      gradient: "from-yellow-400 to-orange-400"
    },
    ADMINISTRATEUR: { 
      name: "Admin", 
      color: "bg-purple-100 text-purple-800 border-purple-300",
      gradient: "from-purple-400 to-pink-400"
    },
    PROFESSEUR: { 
      name: "Professor", 
      color: "bg-blue-100 text-blue-800 border-blue-300",
      gradient: "from-blue-400 to-cyan-400"
    },
  };

  const role = roleMapping[user.identity] || { 
    name: "Unknown", 
    color: "bg-gray-100 text-gray-800 border-gray-300",
    gradient: "from-gray-400 to-slate-400"
  };

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 border border-gray-200 hover:border-cyan-400 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 group">
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src="/user.png"
            alt={`${user.firstname || "Unknown"} ${user.lastname || "User"}`}
            className="rounded-full w-12 h-12 border-2 border-cyan-400/50 group-hover:border-cyan-500 transition-colors"
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/20 to-blue-400/20 group-hover:from-cyan-400/30 group-hover:to-blue-400/30 transition-all"></div>
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 group-hover:text-cyan-600 transition-colors">
            {user.firstname || "Unknown"} {user.lastname || "User"}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-1 rounded-full border ${role.color}`}>
              {role.name}
            </span>
            <span className="text-xs text-gray-600">Active</span>
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-3 gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 hover:bg-cyan-100 hover:text-cyan-600 transition-colors"
        >
          <Settings className="h-4 w-4 text-gray-600" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 hover:bg-orange-100 hover:text-orange-600 transition-colors"
        >
          <Bell className="h-4 w-4 text-gray-600" />
        </Button>
      </div>
    </div>
  );
};

// Enhanced DashboardStats Component
const DashboardStats = () => {
  const [stats, setStats] = useState<ExtendedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        
        // Fetch all stats in parallel
        const [
          userStats,
          students,
          departments,
          classes,
          sessions,
          messageStats
        ] = await Promise.all([
          apiGet(API_ENDPOINTS.USERS + "/admin/stats", token),
          apiGet(API_ENDPOINTS.STUDENTS, token),
          apiGet(API_ENDPOINTS.DEPARTMENTS, token),
          apiGet(API_ENDPOINTS.CLASSES, token),
          apiGet(API_ENDPOINTS.SESSIONS.BASE, token),
          apiGet(API_ENDPOINTS.MESSAGES.STATS + "/1", token) // Using admin user ID 1 for stats
        ]);

        const extendedStats: ExtendedStats = {
          totalUsers: userStats.totalUsers || 0,
          totalStudents: userStats.identityCounts?.find((i: any) => i.identity === "ETUDIANT")?.count || 0,
          totalProfessors: userStats.identityCounts?.find((i: any) => i.identity === "PROFESSEUR")?.count || 0,
          totalManagers: userStats.identityCounts?.find((i: any) => i.identity === "MANAGER")?.count || 0,
          totalDepartments: departments.length || 0,
          totalClasses: classes.length || 0,
          totalSessions: sessions.length || 0,
          totalMessages: messageStats.totalReceived || 0,
          unreadMessages: messageStats.unreadCount || 0,
          totalNotifications: 0 // Will be updated when notifications endpoint is available
        };

        setStats(extendedStats);
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError("Error loading stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="animate-pulse bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 h-32"></div>
      ))}
    </div>
  );
  
  if (error) return <p className="text-red-400">{error}</p>;

  const statsConfig = [
    { 
      title: "Total Users", 
      value: stats?.totalUsers || 0, 
      icon: Users, 
      gradient: "from-blue-500 to-purple-600",
      bgGradient: "from-blue-500/20 to-purple-600/20",
      change: "+12%"
    },
    { 
      title: "Active Students", 
      value: stats?.totalStudents || 0, 
      icon: GraduationCap, 
      gradient: "from-emerald-500 to-green-600",
      bgGradient: "from-emerald-500/20 to-green-600/20",
      change: "+8%"
    },
    { 
      title: "Professors", 
      value: stats?.totalProfessors || 0, 
      icon: BookOpen, 
      gradient: "from-cyan-500 to-blue-600",
      bgGradient: "from-cyan-500/20 to-blue-600/20",
      change: "+3%"
    },
    { 
      title: "Managers", 
      value: stats?.totalManagers || 0, 
      icon: Shield, 
      gradient: "from-orange-500 to-red-600",
      bgGradient: "from-orange-500/20 to-red-600/20",
      change: "+1%"
    },
  ];

  const additionalStatsConfig = [
    { 
      title: "Departments", 
      value: stats?.totalDepartments || 0, 
      icon: Briefcase, 
      gradient: "from-indigo-500 to-purple-600",
      bgGradient: "from-indigo-500/20 to-purple-600/20",
      change: "+2%"
    },
    { 
      title: "Classes", 
      value: stats?.totalClasses || 0, 
      icon: Calendar, 
      gradient: "from-pink-500 to-rose-600",
      bgGradient: "from-pink-500/20 to-rose-600/20",
      change: "+5%"
    },
    { 
      title: "Sessions", 
      value: stats?.totalSessions || 0, 
      icon: Activity, 
      gradient: "from-teal-500 to-cyan-600",
      bgGradient: "from-teal-500/20 to-cyan-600/20",
      change: "+15%"
    },
    { 
      title: "Unread Messages", 
      value: stats?.unreadMessages || 0, 
      icon: Bell, 
      gradient: "from-amber-500 to-orange-600",
      bgGradient: "from-amber-500/20 to-orange-600/20",
      change: "+0%"
    },
  ];

  return (
    <div className="space-y-6 mb-8">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsConfig.map((stat, index) => (
          <Card key={index} className="bg-white/95 backdrop-blur-md border-gray-200 hover:border-cyan-400 transition-all duration-300 group hover:shadow-lg hover:shadow-cyan-500/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">{stat.title}</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <span className="text-xs text-emerald-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {stat.change}
                  </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">vs last month</p>
                </div>
                <div className={`relative p-3 rounded-xl bg-gradient-to-r ${stat.bgGradient} group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`h-6 w-6 text-white`} />
                  <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-20 rounded-xl blur-md group-hover:opacity-30 transition-opacity`}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {additionalStatsConfig.map((stat, index) => (
          <Card key={`additional-${index}`} className="bg-white/95 backdrop-blur-md border-gray-200 hover:border-cyan-400 transition-all duration-300 group hover:shadow-lg hover:shadow-cyan-500/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">{stat.title}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <span className="text-xs text-emerald-600 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">vs last month</p>
              </div>
              <div className={`relative p-3 rounded-xl bg-gradient-to-r ${stat.bgGradient} group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`h-6 w-6 text-white`} />
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-20 rounded-xl blur-md group-hover:opacity-30 transition-opacity`}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
    </div>
  );
};

// Add User Form Component
const AddUserForm = ({ onClose }: { onClose: () => void }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    identity: 'ETUDIANT',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiPost(API_ENDPOINTS.USERS, formData, token || undefined);
      onClose();
      // Optionally refresh the page or show success message
      window.location.reload();
    } catch (error) {
      console.error('Error creating user:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">First Name</label>
          <Input
            type="text"
            value={formData.firstname}
            onChange={(e) => setFormData({...formData, firstname: e.target.value})}
            required
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Last Name</label>
          <Input
            type="text"
            value={formData.lastname}
            onChange={(e) => setFormData({...formData, lastname: e.target.value})}
            required
            className="mt-1"
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Username</label>
        <Input
          type="text"
          value={formData.username}
          onChange={(e) => setFormData({...formData, username: e.target.value})}
          required
          className="mt-1"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Email</label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
          className="mt-1"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Role</label>
        <select
          value={formData.identity}
          onChange={(e) => setFormData({...formData, identity: e.target.value})}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
        >
          <option value="ETUDIANT">Student</option>
          <option value="PROFESSEUR">Professor</option>
          <option value="MANAGER">Manager</option>
          <option value="ADMINISTRATEUR">Administrator</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Password</label>
        <Input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
          className="mt-1"
        />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create User'}
        </Button>
      </div>
    </form>
  );
};

// Broadcast Form Component
const BroadcastForm = ({ onClose }: { onClose: () => void }) => {
  const { token, userId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    messageText: '',
    scope: 'ALL',
    priority: 'NORMAL'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const messageData = {
        senderId: userId, // Admin user ID
        receiverId: null, // null for broadcast
        messageText: formData.messageText,
        scope: formData.scope,
        subject: formData.subject,
        priority: formData.priority
      };
      await apiPost(API_ENDPOINTS.MESSAGES.BASE, messageData, token || undefined);
      onClose();
      // Optionally show success message
    } catch (error) {
      console.error('Error sending broadcast:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700">Subject</label>
        <Input
          type="text"
          value={formData.subject}
          onChange={(e) => setFormData({...formData, subject: e.target.value})}
          required
          className="mt-1"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Message</label>
        <textarea
          value={formData.messageText}
          onChange={(e) => setFormData({...formData, messageText: e.target.value})}
          required
          rows={4}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Scope</label>
        <select
          value={formData.scope}
          onChange={(e) => setFormData({...formData, scope: e.target.value})}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
        >
          <option value="ALL">All Users</option>
          <option value="STUDENTS">Students Only</option>
          <option value="PROFESSORS">Professors Only</option>
          <option value="MANAGERS">Managers Only</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Priority</label>
        <select
          value={formData.priority}
          onChange={(e) => setFormData({...formData, priority: e.target.value})}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
        >
          <option value="NORMAL">Normal</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Broadcast'}
        </Button>
      </div>
    </form>
  );
};

// Generate Report Form Component
const GenerateReportForm = ({ onClose }: { onClose: () => void }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'attendance',
    name: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const reportData = {
        name: formData.name,
        type: formData.type,
        description: formData.description
      };
      await apiPost(`${API_ENDPOINTS.REPORTS}/generate`, reportData, token || undefined);
      onClose();
      // Optionally show success message
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700">Report Name</label>
        <Input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
          className="mt-1"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Report Type</label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({...formData, type: e.target.value})}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
        >
          <option value="attendance">Attendance Report</option>
          <option value="grades">Grades Report</option>
          <option value="enrollment">Enrollment Report</option>
          <option value="financial">Financial Report</option>
          <option value="performance">Performance Report</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          rows={3}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
        />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Generating...' : 'Generate Report'}
        </Button>
      </div>
    </form>
  );
};

// Enhanced Quick Actions Component
const QuickActions = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showBroadcastDialog, setShowBroadcastDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);

  const handleAddUser = async () => {
    setLoading("addUser");
    try {
      // Navigate to users page or open dialog
      setShowAddUserDialog(true);
    } catch (error) {
      console.error("Error adding user:", error);
    } finally {
      setLoading(null);
    }
  };

  const handleGenerateReport = async () => {
    setLoading("generateReport");
    try {
      setShowReportDialog(true);
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setLoading(null);
    }
  };

  const handleSystemAlerts = async () => {
    setLoading("systemAlerts");
    try {
      // Navigate to notifications page
      window.location.href = "/admin/notifications";
    } catch (error) {
      console.error("Error accessing system alerts:", error);
    } finally {
      setLoading(null);
    }
  };

  const handleBroadcast = async () => {
    setLoading("broadcast");
    try {
      setShowBroadcastDialog(true);
    } catch (error) {
      console.error("Error broadcasting:", error);
    } finally {
      setLoading(null);
    }
  };

  const handleManageClasses = async () => {
    setLoading("manageClasses");
    try {
      // Navigate to classes page
      window.location.href = "/admin/classes";
    } catch (error) {
      console.error("Error managing classes:", error);
    } finally {
      setLoading(null);
    }
  };

  const handleAttendance = async () => {
    setLoading("attendance");
    try {
      // Navigate to attendance page
      window.location.href = "/admin/attendance";
    } catch (error) {
      console.error("Error accessing attendance:", error);
    } finally {
      setLoading(null);
    }
  };

  const handleMessages = async () => {
    setLoading("messages");
    try {
      // Navigate to messages page
      window.location.href = "/admin/messages";
    } catch (error) {
      console.error("Error accessing messages:", error);
    } finally {
      setLoading(null);
    }
  };

  const handleSettings = async () => {
    setLoading("settings");
    try {
      // Navigate to settings page
      window.location.href = "/admin/settings";
    } catch (error) {
      console.error("Error accessing settings:", error);
    } finally {
      setLoading(null);
    }
  };

  const actions = [
    { 
      name: "Add User", 
      icon: Users, 
      gradient: "from-blue-600 to-cyan-600", 
      description: "Create new user accounts",
      action: handleAddUser,
      loading: loading === "addUser"
    },
    { 
      name: "Generate Report", 
      icon: Activity, 
      gradient: "from-purple-600 to-pink-600", 
      description: "Create system reports",
      action: handleGenerateReport,
      loading: loading === "generateReport"
    },
    { 
      name: "System Alerts", 
      icon: AlertCircle, 
      gradient: "from-orange-600 to-red-600", 
      description: "View system notifications",
      action: handleSystemAlerts,
      loading: loading === "systemAlerts"
    },
    { 
      name: "Broadcast", 
      icon: Bell, 
      gradient: "from-emerald-600 to-green-600", 
      description: "Send announcements",
      action: handleBroadcast,
      loading: loading === "broadcast"
    },
    { 
      name: "Manage Classes", 
      icon: GraduationCap, 
      gradient: "from-indigo-600 to-purple-600", 
      description: "Manage class schedules",
      action: handleManageClasses,
      loading: loading === "manageClasses"
    },
    { 
      name: "Attendance", 
      icon: Calendar, 
      gradient: "from-teal-600 to-cyan-600", 
      description: "Track attendance",
      action: handleAttendance,
      loading: loading === "attendance"
    },
    { 
      name: "Messages", 
      icon: BookOpen, 
      gradient: "from-amber-600 to-orange-600", 
      description: "View messages",
      action: handleMessages,
      loading: loading === "messages"
    },
    { 
      name: "Settings", 
      icon: Settings, 
      gradient: "from-gray-600 to-slate-600", 
      description: "System settings",
      action: handleSettings,
      loading: loading === "settings"
    },
  ];

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6 mb-8">
      {actions.map((action, index) => (
        <Button
          key={index}
          variant="ghost"
            onClick={action.action}
            disabled={action.loading}
            className={`h-32 bg-white/95 backdrop-blur-md border border-gray-200 hover:border-cyan-400 transition-all duration-300 group hover:shadow-lg hover:shadow-cyan-500/20 rounded-xl ${
              action.loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className="flex flex-col items-center justify-center gap-3 h-full">
              <div className="relative">
                <div className="p-3 rounded-full bg-white border border-gray-200 group-hover:border-cyan-400 group-hover:shadow-md transition-all duration-300">
                  {action.loading ? (
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-600 border-t-transparent"></div>
                  ) : (
                    <action.icon className={`h-8 w-8 text-gray-700 group-hover:text-cyan-600 transition-colors group-hover:scale-110 transition-transform`} />
                  )}
                </div>
                <div className={`absolute inset-0 bg-gradient-to-r ${action.gradient} opacity-5 rounded-full blur-md group-hover:opacity-10 transition-opacity`}></div>
              </div>
              <div className="text-center space-y-1">
                <span className="text-sm font-semibold text-gray-800 group-hover:text-cyan-600 transition-colors block">
                  {action.loading ? 'Loading...' : action.name}
                </span>
                <span className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors block leading-tight">
                  {action.description}
                </span>
              </div>
          </div>
        </Button>
      ))}
    </div>

      {/* Add User Dialog */}
      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent className="bg-white/95 backdrop-blur-md border-gray-200 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Add New User</DialogTitle>
            <DialogDescription className="text-gray-600">
              Create a new user account in the system
            </DialogDescription>
          </DialogHeader>
          <AddUserForm onClose={() => setShowAddUserDialog(false)} />
        </DialogContent>
      </Dialog>

      {/* Broadcast Dialog */}
      <Dialog open={showBroadcastDialog} onOpenChange={setShowBroadcastDialog}>
        <DialogContent className="bg-white/95 backdrop-blur-md border-gray-200 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Send Broadcast Message</DialogTitle>
            <DialogDescription className="text-gray-600">
              Send a message to all users or specific groups
            </DialogDescription>
          </DialogHeader>
          <BroadcastForm onClose={() => setShowBroadcastDialog(false)} />
        </DialogContent>
      </Dialog>

      {/* Generate Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="bg-white/95 backdrop-blur-md border-gray-200 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Generate Report</DialogTitle>
            <DialogDescription className="text-gray-600">
              Create a new system report
            </DialogDescription>
          </DialogHeader>
          <GenerateReportForm onClose={() => setShowReportDialog(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};

// Recent Activity Component
const RecentActivity = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchRecentActivity = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Fetch recent messages as activity
        const recentMessages = await apiGet(`${API_ENDPOINTS.MESSAGES.RECEIVED}/1?page=0&size=5`, token);
        setActivities(recentMessages || []);
      } catch (err) {
        console.error("Error fetching recent activity:", err);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentActivity();
  }, [token]);

  if (loading) {
    return (
      <Card className="bg-white/95 backdrop-blur-md border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <Activity className="h-5 w-5 text-cyan-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-16"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/95 backdrop-blur-md border-gray-200">
      <CardHeader>
        <CardTitle className="text-gray-900 flex items-center gap-2">
          <Activity className="h-5 w-5 text-cyan-600" />
          Recent Activity
        </CardTitle>
        <CardDescription className="text-gray-600">
          Latest system activities and messages
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length > 0 ? (
            activities.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
                <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="text-cyan-600 font-medium">{activity.senderName}</span> sent a message
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{activity.subject}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No recent activity
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Enhanced UserManagement Component
const UserManagementCard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  type RoleType = "manager" | "student" | "professor" | "admin" | "all";
  const [filter, setFilter] = useState<RoleType>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const { token } = useAuth();

  const roleMapping: Record<string, string> = {
    ETUDIANT: "student",
    MANAGER: "MANAGER",
    ADMINISTRATEUR: "admin",
    PROFESSEUR: "professor",
    all: "all",
  };

  const debounceSearch = useCallback(
    debounce((term: string) => {
      setDebouncedSearchTerm(term);
    }, 500),
    []
  );

  useEffect(() => {
    debounceSearch(searchTerm);
  }, [searchTerm, debounceSearch]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!token) {
          setLoading(false);
          return;
        }

        let backendRole = filter === "all" ? "" : roleMapping[filter];
        let url = `${API_ENDPOINTS.USERS}?page=${page - 1}&size=6`;
        if (backendRole) {
          url += `&role=${encodeURIComponent(backendRole)}`;
        }
        if (debouncedSearchTerm) {
          url += `&searchTerm=${encodeURIComponent(debouncedSearchTerm)}`;
        }

        const data = await apiGet(url, token);
        setUsers(data.content || []);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Unable to load users. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page, filter, debouncedSearchTerm, token]);

  const displayRoleName = (role: RoleType) => {
    switch (role) {
      case "manager": return "Managers";
      case "student": return "Étudiants";
      case "professor": return "Professeurs";
      case "admin": return "Administrateur";
      case "all": return "Tous les Utilisateurs";
      default: return role;
    }
  };

  return (
    <Card className="bg-white/95 backdrop-blur-md border-gray-200 hover:border-cyan-400 transition-all duration-300">
      <CardHeader className="border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-600" />
              User Management
            </CardTitle>
            <CardDescription className="text-gray-600">
              Manage system users and permissions
            </CardDescription>
          </div>
          <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400"/>
              <Input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-cyan-500 focus:ring-cyan-500"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-gray-300 bg-white hover:bg-gray-50 text-gray-700">
                  Filter <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white border-gray-200 shadow-lg">
                <DropdownMenuLabel className="text-gray-900">Filter by Role</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-200" />
                {(Object.keys(roleMapping) as RoleType[]).map((key) => (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => setFilter(key)}
                    className="hover:bg-gray-100 cursor-pointer text-gray-700 hover:text-gray-900"
                  >
                    {displayRoleName(key)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">
            <p>{error}</p>
            <Button
              onClick={() => {
                setError(null);
                setPage(page);
              }}
              variant="outline"
              className="mt-2 border-red-300 text-red-600 hover:bg-red-50"
            >
              Retry
            </Button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.length > 0 ? (
              users.map((user) => <UserCard key={user.id} user={user} />)
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                No users found
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between pt-4 border-t border-gray-200">
        <Button
          variant="outline"
          className="border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1 || loading}
        >
          Previous
        </Button>
        <span className="text-gray-600">Page {page} of {totalPages}</span>
        <Button
          variant="outline"
          className="border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages || loading}
        >
          Next
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Advanced control center for system management</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-cyan-500 bg-cyan-50 text-cyan-700 hover:bg-cyan-100">
            <Activity className="mr-2 h-4 w-4 text-cyan-700" />
            System Status
          </Button>
          <Button className="bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white shadow-lg shadow-cyan-500/20">
            <Award className="mr-2 h-4 w-4 text-white" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardStats />

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5 text-cyan-600" />
          Quick Actions
        </h2>
        <QuickActions />
      </div>

      {/* Dashboard Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Management - Takes 2 columns */}
        <div className="lg:col-span-2">
      <UserManagementCard />
        </div>
        
        {/* Recent Activity - Takes 1 column */}
        <div className="lg:col-span-1">
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}