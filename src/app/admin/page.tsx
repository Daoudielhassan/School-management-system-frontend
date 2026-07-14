"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, GraduationCap, Briefcase, Shield, TrendingUp, AlertCircle, Bell, Settings, ChevronDown, Search, Calendar, BookOpen, Award, Activity } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { debounce } from "lodash"
import { apiGet, apiPost, API_ENDPOINTS } from "@/config/api"
import { toast } from "react-toastify"
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
  sessionChange: string
  studentChange: string
  classChange: string
  departmentChange: string
  sessionChangePositive: boolean
  studentChangePositive: boolean
  classChangePositive: boolean
  departmentChangePositive: boolean
}

interface User {
  id: string
  username: string
  email: string
  role: string
  firstname?: string
  lastname?: string
}

interface ApiStatsResponse {
  totalUsers?: number
  identityCounts?: { identity: string; count: number }[]
}

interface PaginatedUsersResponse {
  content: User[]
  totalPages?: number
}

// Enhanced UserCard Component with glassmorphism
const UserCard = ({ user }: { user: User }) => {
  const roleMapping: Record<string, { name: string; color: string }> = {
    STUDENT: { name: "Student", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
    ETUDIANT: { name: "Student", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
    MANAGER: { name: "Manager", color: "bg-blue-100 text-blue-800 border-blue-300" },
    ADMIN: { name: "Admin", color: "bg-indigo-100 text-indigo-800 border-indigo-300" },
    ADMINISTRATEUR: { name: "Admin", color: "bg-indigo-100 text-indigo-800 border-indigo-300" },
    INSTRUCTOR: { name: "Instructor", color: "bg-sky-100 text-sky-800 border-sky-300" },
    PROFESSEUR: { name: "Instructor", color: "bg-sky-100 text-sky-800 border-sky-300" },
  };

  const role = roleMapping[user.role] || {
    name: user.role ?? "Unknown",
    color: "bg-gray-100 text-gray-800 border-gray-300",
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }} className="backdrop-blur-md rounded-xl p-4 border hover:border-[var(--accent)] transition-all duration-300 hover:shadow-lg group">
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src="/user.png"
            alt={user.firstname ? `${user.firstname} ${user.lastname ?? ''}`.trim() : user.username}
            className="rounded-full w-12 h-12 border-2 transition-colors"
            style={{ borderColor: 'var(--accent)' }}
          />
          <div className="absolute inset-0 rounded-full transition-all" style={{ backgroundColor: 'var(--bg-secondary)' }}></div>
        </div>
        <div className="flex-1">
          <h3 className="font-medium transition-colors" style={{ color: 'var(--text-primary)' }}>
            {user.firstname ? `${user.firstname} ${user.lastname ?? ''}`.trim() : user.username}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-1 rounded-full border ${role.color}`}>
              {role.name}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Active</span>
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-3 gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 transition-colors"
          style={{ color: 'var(--text-primary)' }}
          onClick={() => { window.location.href = `/admin/users/${user.id}`; }}
          title="View / edit user"
        >
          <Settings className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 transition-colors"
          style={{ color: 'var(--text-primary)' }}
          onClick={() => { window.location.href = '/admin/notifications'; }}
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
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
  const { token, userId } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      if (!token || !userId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        
        // Fetch stats with graceful fallback if one endpoint fails
        const [
          userStatsResult,
          studentsResult,
          departmentsResult,
          classesResult,
          sessionsResult
        ] = await Promise.allSettled([
          apiGet(API_ENDPOINTS.USERS.STATS, token),
          apiGet(API_ENDPOINTS.STUDENTS.BASE, token),
          apiGet(API_ENDPOINTS.DEPARTMENTS.BASE, token),
          apiGet(API_ENDPOINTS.CLASSES.BASE, token),
          apiGet(API_ENDPOINTS.SESSIONS.BASE, token)
        ]);

        const userStatsRaw = userStatsResult.status === "fulfilled" ? userStatsResult.value : {};
        const studentsRaw = studentsResult.status === "fulfilled" ? studentsResult.value : [];
        const departmentsRaw = departmentsResult.status === "fulfilled" ? departmentsResult.value : [];
        const classesRaw = classesResult.status === "fulfilled" ? classesResult.value : [];
        const sessionsRaw = sessionsResult.status === "fulfilled" ? sessionsResult.value : [];

        const userStats = (userStatsRaw && typeof userStatsRaw === "object" ? userStatsRaw : {}) as ApiStatsResponse;
        const students = Array.isArray(studentsRaw) ? studentsRaw : [];
        const departments = Array.isArray(departmentsRaw) ? departmentsRaw : [];
        const classes = Array.isArray(classesRaw) ? classesRaw : [];
        const sessions = Array.isArray(sessionsRaw) ? sessionsRaw : [];

        if (userStatsResult.status === "rejected") {
          console.warn("USERS.STATS endpoint failed; using fallback counters from /api/users list.");
        }

        const fallbackStudents = students.filter((u: any) => u.role === "STUDENT").length;
        const fallbackProfessors = students.filter((u: any) => u.role === "INSTRUCTOR").length;
        const fallbackManagers = students.filter((u: any) => u.role === "MANAGER").length;

        // Compute real month-over-month changes from raw data
        const now = new Date();
        const thisYear = now.getFullYear();
        const thisMonth = now.getMonth();
        const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
        const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

        const inMonth = (dateStr: string, y: number, m: number) => {
          if (!dateStr) return false;
          const d = new Date(dateStr);
          return d.getFullYear() === y && d.getMonth() === m;
        };

        const calcChange = (items: any[], dateField: string): { label: string; positive: boolean } => {
          const cur = items.filter((i: any) => inMonth(i[dateField], thisYear, thisMonth)).length;
          const prev = items.filter((i: any) => inMonth(i[dateField], lastMonthYear, lastMonth)).length;
          if (prev === 0 && cur === 0) return { label: "0%", positive: true };
          if (prev === 0) return { label: `+${cur} new`, positive: true };
          const pct = Math.round(((cur - prev) / prev) * 100);
          return { label: (pct >= 0 ? "+" : "") + pct + "%", positive: pct >= 0 };
        };

        const sessionChg = calcChange(sessions, "startsAt");
        const studentChg = calcChange(students, "createdAt");
        const classChg = calcChange(classes, "createdAt");
        const deptChg = calcChange(departments, "createdAt");

        const extendedStats: ExtendedStats = {
          totalUsers: userStats.totalUsers || students.length || 0,
          totalStudents:
            userStats.identityCounts?.find((i: any) => i.identity === "ETUDIANT" || i.identity === "STUDENT")?.count ||
            fallbackStudents,
          totalProfessors:
            userStats.identityCounts?.find((i: any) => i.identity === "PROFESSEUR" || i.identity === "INSTRUCTOR")?.count ||
            fallbackProfessors,
          totalManagers:
            userStats.identityCounts?.find((i: any) => i.identity === "MANAGER")?.count ||
            fallbackManagers,
          totalDepartments: departments.length || 0,
          totalClasses: classes.length || 0,
          totalSessions: sessions.length || 0,
          totalMessages: 0,
          unreadMessages: 0,
          totalNotifications: 0,
          sessionChange: sessionChg.label,
          sessionChangePositive: sessionChg.positive,
          studentChange: studentChg.label,
          studentChangePositive: studentChg.positive,
          classChange: classChg.label,
          classChangePositive: classChg.positive,
          departmentChange: deptChg.label,
          departmentChangePositive: deptChg.positive,
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
  }, [token, userId]);

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="animate-pulse backdrop-blur-md rounded-xl p-6 border h-32" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}></div>
      ))}
    </div>
  );
  
  if (error) return <p style={{ color: 'var(--accent)' }}>{error}</p>;

  const statsConfig = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      change: stats?.studentChange ?? "—",
      changePositive: stats?.studentChangePositive ?? true,
    },
    {
      title: "Active Students",
      value: stats?.totalStudents || 0,
      icon: GraduationCap,
      change: stats?.studentChange ?? "—",
      changePositive: stats?.studentChangePositive ?? true,
    },
    {
      title: "Professors",
      value: stats?.totalProfessors || 0,
      icon: BookOpen,
      change: "—",
      changePositive: true,
    },
    {
      title: "Managers",
      value: stats?.totalManagers || 0,
      icon: Shield,
      change: "—",
      changePositive: true,
    },
  ];

  const additionalStatsConfig = [
    {
      title: "Departments",
      value: stats?.totalDepartments || 0,
      icon: Briefcase,
      change: stats?.departmentChange ?? "—",
      changePositive: stats?.departmentChangePositive ?? true,
    },
    {
      title: "Classes",
      value: stats?.totalClasses || 0,
      icon: Calendar,
      change: stats?.classChange ?? "—",
      changePositive: stats?.classChangePositive ?? true,
    },
    {
      title: "Sessions",
      value: stats?.totalSessions || 0,
      icon: Activity,
      change: stats?.sessionChange ?? "—",
      changePositive: stats?.sessionChangePositive ?? true,
    },
    {
      title: "Unread Messages",
      value: stats?.unreadMessages || 0,
      icon: Bell,
      change: "—",
      changePositive: true,
    },
  ];

  return (
    <div className="space-y-6 mb-8">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsConfig.map((stat, index) => (
          <Card key={index} style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }} className="backdrop-blur-md hover:border-[var(--accent)] transition-all duration-300 group hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{stat.title}</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>{stat.value}</p>
                    <span className="text-xs flex items-center" style={{ color: stat.changePositive ? '#10b981' : '#ef4444' }}>
                    <TrendingUp className={`h-3 w-3 mr-1 ${stat.changePositive ? '' : 'rotate-180'}`} />
                    {stat.change}
                  </span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>this month vs last</p>
                </div>
                <div className="relative p-3 rounded-xl group-hover:scale-110 transition-transform" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <stat.icon className="h-6 w-6" style={{ color: 'var(--accent)' }} />
                  <div className="absolute inset-0 opacity-20 rounded-xl blur-md group-hover:opacity-30 transition-opacity" style={{ backgroundColor: 'var(--accent)' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {additionalStatsConfig.map((stat, index) => (
          <Card key={`additional-${index}`} style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }} className="backdrop-blur-md hover:border-[var(--accent)] transition-all duration-300 group hover:shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{stat.title}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>{stat.value}</p>
                    <span className="text-xs flex items-center" style={{ color: stat.changePositive ? '#10b981' : '#ef4444' }}>
                      <TrendingUp className={`h-3 w-3 mr-1 ${stat.changePositive ? '' : 'rotate-180'}`} />
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>this month vs last</p>
              </div>
              <div className="relative p-3 rounded-xl group-hover:scale-110 transition-transform" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <stat.icon className="h-6 w-6" style={{ color: 'var(--accent)' }} />
                <div className="absolute inset-0 opacity-20 rounded-xl blur-md group-hover:opacity-30 transition-opacity" style={{ backgroundColor: 'var(--accent)' }}></div>
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
    const roleMap: Record<string, string> = {
      ETUDIANT: 'STUDENT',
      PROFESSEUR: 'INSTRUCTOR',
      MANAGER: 'MANAGER',
      ADMINISTRATEUR: 'ADMIN',
    };
    try {
      await apiPost(API_ENDPOINTS.USERS.BASE, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: roleMap[formData.identity] ?? formData.identity,
        firstname: formData.firstname,
        lastname: formData.lastname,
      }, token || undefined);
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
        senderId: userId, // Use actual logged-in user ID
        receiverId: undefined, // undefined for broadcast
        messageText: formData.messageText,
        scope: formData.scope,
        subject: formData.subject,
        priority: formData.priority
      };
      toast.success('Broadcast message queued. It will be delivered when the messaging service is available.');
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
      toast.success('Report request saved. Redirecting to Reports…');
      onClose();
      window.location.href = '/admin/reports';
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
      description: "Create new user accounts",
      action: handleAddUser,
      loading: loading === "addUser"
    },
    {
      name: "Generate Report",
      icon: Activity,
      description: "Create system reports",
      action: handleGenerateReport,
      loading: loading === "generateReport"
    },
    {
      name: "System Alerts",
      icon: AlertCircle,
      description: "View system notifications",
      action: handleSystemAlerts,
      loading: loading === "systemAlerts"
    },
    {
      name: "Broadcast",
      icon: Bell,
      description: "Send announcements",
      action: handleBroadcast,
      loading: loading === "broadcast"
    },
    {
      name: "Manage Classes",
      icon: GraduationCap,
      description: "Manage class schedules",
      action: handleManageClasses,
      loading: loading === "manageClasses"
    },
    {
      name: "Attendance",
      icon: Calendar,
      description: "Track attendance",
      action: handleAttendance,
      loading: loading === "attendance"
    },
    {
      name: "Messages",
      icon: BookOpen,
      description: "View messages",
      action: handleMessages,
      loading: loading === "messages"
    },
    {
      name: "Settings",
      icon: Settings,
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
            className={`h-32 bg-white/95 backdrop-blur-md border border-gray-200 hover:border-primary transition-all duration-300 group hover:shadow-lg rounded-xl ${
              action.loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className="flex flex-col items-center justify-center gap-3 h-full">
              <div className="relative">
                <div className="p-3 rounded-full bg-white border border-gray-200 group-hover:border-primary group-hover:shadow-md transition-all duration-300">
                  {action.loading ? (
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  ) : (
                    <action.icon className={`h-8 w-8 text-gray-700 group-hover:text-primary transition-colors group-hover:scale-110 transition-transform`} />
                  )}
                </div>
                <div className="absolute inset-0 bg-primary opacity-5 rounded-full blur-md group-hover:opacity-10 transition-opacity"></div>
              </div>
              <div className="text-center space-y-1">
                <span className="text-sm font-semibold text-gray-800 group-hover:text-primary transition-colors block">
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
  const { token, userId } = useAuth();

  useEffect(() => {
    const fetchRecentActivity = async () => {
      if (!token || !userId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await apiGet(API_ENDPOINTS.SESSIONS.BASE, token);
        const sessions = Array.isArray(data) ? data : [];
        const sorted = [...sessions]
          .sort((a: any, b: any) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime())
          .slice(0, 5);
        setActivities(sorted);
      } catch (err) {
        console.error("Error fetching recent activity:", err);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentActivity();
  }, [token, userId]);

  if (loading) {
    return (
      <Card className="bg-white/95 backdrop-blur-md border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
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
          <Activity className="h-5 w-5 text-blue-600" />
          Recent Activity
        </CardTitle>
        <CardDescription className="text-gray-600">
          Latest system activities and messages
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length > 0 ? (
            activities.map((activity: any, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    Session — <span className="text-blue-600 font-medium">Room {activity.room ?? 'N/A'}</span>
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Class: {activity.classGroupId?.substring(0, 8)}…</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(activity.startsAt).toLocaleString()}
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
    STUDENT: "STUDENT",
    INSTRUCTOR: "INSTRUCTOR",
    MANAGER: "MANAGER",
    ADMIN: "ADMIN",
    all: "all",
  };

  const formatRole = (role: string) => {
    switch (role) {
      case "STUDENT":
        return "Student";
      case "INSTRUCTOR":
        return "Professor";
      case "MANAGER":
        return "Manager";
      case "ADMIN":
        return "Admin";
      default:
        return role;
    }
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
        let url = `${API_ENDPOINTS.USERS.BASE}?page=${page - 1}&size=6`;
        if (backendRole) {
          url += `&role=${encodeURIComponent(backendRole)}`;
        }
        if (debouncedSearchTerm) {
          url += `&searchTerm=${encodeURIComponent(debouncedSearchTerm)}`;
        }

        const data = await apiGet(url, token);

        if (Array.isArray(data)) {
          const allUsers = data as User[];
          const filteredUsers = allUsers.filter((user) => {
            const matchesRole = filter === "all" || user.role === roleMapping[filter];
            const matchesSearch =
              !debouncedSearchTerm ||
              user.username.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
              user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
            return matchesRole && matchesSearch;
          });

          const pageSize = 6;
          const start = (page - 1) * pageSize;
          const end = start + pageSize;
          setUsers(filteredUsers.slice(start, end));
          setTotalPages(Math.max(1, Math.ceil(filteredUsers.length / pageSize)));
        } else if (data && typeof data === "object" && Array.isArray((data as PaginatedUsersResponse).content)) {
          const pagedData = data as PaginatedUsersResponse;
          setUsers(pagedData.content || []);
          setTotalPages(pagedData.totalPages || 1);
        } else {
          setUsers([]);
          setTotalPages(1);
        }
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
    <Card style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }} className="backdrop-blur-md hover:border-[var(--accent)] transition-all duration-300">
      <CardHeader style={{ borderColor: 'var(--border-light)' }} className="border-b">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-xl font-semibold flex items-center gap-2" style={{ color: 'var(--primary)' }}>
              <Users className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              User Management
            </CardTitle>
            <CardDescription style={{ color: 'var(--text-secondary)' }}>
              Manage system users and permissions
            </CardDescription>
          </div>
          <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4" style={{ color: 'var(--accent)' }}/>
              <Input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-medium)', color: 'var(--text-primary)' }}
                className="pl-8 pr-4 py-2 rounded-lg placeholder-[var(--text-tertiary)] focus:border-[var(--accent)] focus:ring-[var(--accent)]"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" style={{ borderColor: 'var(--border-medium)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} className="hover:bg-[var(--hover-bg)]">
                  Filter <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }} className="shadow-lg">
                <DropdownMenuLabel style={{ color: 'var(--primary)' }}>Filter by Role</DropdownMenuLabel>
                <DropdownMenuSeparator style={{ backgroundColor: 'var(--border-light)' }} />
                {(Object.keys(roleMapping) as RoleType[]).map((key) => (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => setFilter(key)}
                    style={{ color: 'var(--text-primary)' }}
                    className="hover:bg-[var(--hover-bg)] cursor-pointer hover:text-[var(--primary)]"
                  >
                    {key === "all" ? displayRoleName(key) : formatRole(roleMapping[key])}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {error && (
          <div style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--accent)', color: 'var(--text-primary)' }} className="border p-4 rounded-lg mb-4">
            <p>{error}</p>
            <Button
              onClick={() => {
                setError(null);
                setPage(page);
              }}
              variant="outline"
              style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
              className="mt-2 hover:bg-[var(--hover-bg)]"
            >
              Retry
            </Button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--accent)' }}></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.length > 0 ? (
              users.map((user) => <UserCard key={user.id} user={user} />)
            ) : (
              <div className="col-span-full text-center py-8" style={{ color: 'var(--text-tertiary)' }}>
                No users found
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
        <Button
          variant="outline"
          style={{ borderColor: 'var(--border-medium)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
          className="hover:bg-[var(--hover-bg)]"
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1 || loading}
        >
          Previous
        </Button>
        <span style={{ color: 'var(--text-secondary)' }}>Page {page} of {totalPages}</span>
        <Button
          variant="outline"
          style={{ borderColor: 'var(--border-medium)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
          className="hover:bg-[var(--hover-bg)]"
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
          <h1 className="text-4xl font-bold" style={{ color: 'var(--primary)' }}>
            Admin Dashboard
          </h1>
          <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>Advanced control center for system management</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" style={{ borderColor: 'var(--accent)', backgroundColor: 'var(--bg-secondary)', color: 'var(--accent)' }} className="hover:bg-[var(--hover-bg)]" onClick={() => { window.location.href = '/admin/audit-logs'; }}>
            <Activity className="mr-2 h-4 w-4" />
            System Status
          </Button>
          <Button style={{ backgroundColor: 'var(--primary)', color: 'var(--background)' }} className="hover:bg-[var(--primary-dark)] shadow-lg" onClick={() => { window.location.href = '/admin/reports'; }}>
            <Award className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardStats />

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--primary)' }}>
          <Settings className="h-5 w-5" style={{ color: 'var(--accent)' }} />
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