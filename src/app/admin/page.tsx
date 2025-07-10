"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, GraduationCap, Briefcase, Shield, TrendingUp, AlertCircle, Bell, Settings, ChevronDown, Search, Calendar, BookOpen, Award, Activity } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { debounce } from "lodash"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

interface DashboardStats {
  totalUsers: number
  newUsersThisMonth: number
  activeUsers: number
  identityCounts: { identity: string; count: number }[]
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
      color: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
      gradient: "from-emerald-400 to-green-400"
    },
    MANAGER: { 
      name: "Manager", 
      color: "bg-yellow-500/20 text-yellow-300 border-yellow-400/30",
      gradient: "from-yellow-400 to-orange-400"
    },
    ADMINISTRATEUR: { 
      name: "Admin", 
      color: "bg-purple-500/20 text-purple-300 border-purple-400/30",
      gradient: "from-purple-400 to-pink-400"
    },
    PROFESSEUR: { 
      name: "Professor", 
      color: "bg-blue-500/20 text-blue-300 border-blue-400/30",
      gradient: "from-blue-400 to-cyan-400"
    },
  };

  const role = roleMapping[user.identity] || { 
    name: "Unknown", 
    color: "bg-gray-500/20 text-gray-300 border-gray-400/30",
    gradient: "from-gray-400 to-slate-400"
  };

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 hover:border-cyan-400/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 group">
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src="/user.png"
            alt={`${user.firstname || "Unknown"} ${user.lastname || "User"}`}
            className="rounded-full w-12 h-12 border-2 border-cyan-400/30 group-hover:border-cyan-400/60 transition-colors"
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/20 to-blue-400/20 group-hover:from-cyan-400/30 group-hover:to-blue-400/30 transition-all"></div>
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-white group-hover:text-cyan-300 transition-colors">
            {user.firstname || "Unknown"} {user.lastname || "User"}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-1 rounded-full border ${role.color}`}>
              {role.name}
            </span>
            <span className="text-xs text-blue-300">Active</span>
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-3 gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 hover:bg-cyan-500/20 hover:text-cyan-300 transition-colors"
        >
          <Settings className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 hover:bg-orange-500/20 hover:text-orange-300 transition-colors"
        >
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// Enhanced DashboardStats Component
const DashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
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
        const response = await fetch("http://localhost:8080/api/users/admin/stats", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) throw new Error("Failed to fetch stats");
        const data: DashboardStats = await response.json();
        setStats(data);
      } catch (err) {
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

  const studentCount = stats?.identityCounts.find((i) => i.identity === "ETUDIANT")?.count || 0;
  const professorCount = stats?.identityCounts.find((i) => i.identity === "PROFESSEUR")?.count || 0;
  const managerCount = stats?.identityCounts.find((i) => i.identity === "MANAGER")?.count || 0;

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
      value: studentCount, 
      icon: GraduationCap, 
      gradient: "from-emerald-500 to-green-600",
      bgGradient: "from-emerald-500/20 to-green-600/20",
      change: "+8%"
    },
    { 
      title: "Professors", 
      value: professorCount, 
      icon: BookOpen, 
      gradient: "from-cyan-500 to-blue-600",
      bgGradient: "from-cyan-500/20 to-blue-600/20",
      change: "+3%"
    },
    { 
      title: "Managers", 
      value: managerCount, 
      icon: Shield, 
      gradient: "from-orange-500 to-red-600",
      bgGradient: "from-orange-500/20 to-red-600/20",
      change: "+1%"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsConfig.map((stat, index) => (
        <Card key={index} className="bg-white/5 backdrop-blur-md border-white/10 hover:border-cyan-400/30 transition-all duration-300 group hover:shadow-lg hover:shadow-cyan-500/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-200 mb-1">{stat.title}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <span className="text-xs text-emerald-400 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {stat.change}
                  </span>
                </div>
                <p className="text-xs text-blue-300/60 mt-1">vs last month</p>
              </div>
              <div className={`relative p-3 rounded-xl bg-gradient-to-r ${stat.bgGradient} group-hover:scale-110 transition-transform`}>
                <stat.icon className={`h-6 w-6 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`} />
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-20 rounded-xl blur-md group-hover:opacity-30 transition-opacity`}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Enhanced Quick Actions Component
const QuickActions = () => {
  const actions = [
    { name: "Add User", icon: Users, gradient: "from-blue-500 to-cyan-500", bgGradient: "from-blue-500/20 to-cyan-500/20" },
    { name: "Generate Report", icon: Activity, gradient: "from-purple-500 to-pink-500", bgGradient: "from-purple-500/20 to-pink-500/20" },
    { name: "System Alerts", icon: AlertCircle, gradient: "from-orange-500 to-red-500", bgGradient: "from-orange-500/20 to-red-500/20" },
    { name: "Broadcast", icon: Bell, gradient: "from-emerald-500 to-green-500", bgGradient: "from-emerald-500/20 to-green-500/20" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {actions.map((action, index) => (
        <Button
          key={index}
          variant="ghost"
          className={`h-20 bg-gradient-to-r ${action.bgGradient} backdrop-blur-md border border-white/10 hover:border-cyan-400/30 transition-all duration-300 group hover:shadow-lg hover:shadow-cyan-500/20`}
        >
          <div className="flex flex-col items-center gap-2">
            <action.icon className={`h-6 w-6 bg-gradient-to-r ${action.gradient} bg-clip-text text-transparent group-hover:scale-110 transition-transform`} />
            <span className="text-sm text-white group-hover:text-cyan-300 transition-colors">{action.name}</span>
          </div>
        </Button>
      ))}
    </div>
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
        let url = `http://localhost:8080/api/users?page=${page - 1}&size=6`;
        if (backendRole) {
          url += `&role=${encodeURIComponent(backendRole)}`;
        }
        if (debouncedSearchTerm) {
          url += `&searchTerm=${encodeURIComponent(debouncedSearchTerm)}`;
        }

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Server responded with ${response.status}: ${errorText}`);
          throw new Error(`Failed to fetch users (Status: ${response.status})`);
        }

        const data = await response.json();
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
    <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:border-cyan-400/30 transition-all duration-300">
      <CardHeader className="border-b border-white/10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-400" />
              User Management
            </CardTitle>
            <CardDescription className="text-blue-200">
              Manage system users and permissions
            </CardDescription>
          </div>
          <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-cyan-400"/>
              <Input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-4 py-2 rounded-lg bg-white/10 backdrop-blur border border-white/20 text-white placeholder-blue-300 focus:border-cyan-400"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-white/20 bg-white/10 backdrop-blur hover:bg-white/20 text-white">
                  Filter <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-800/95 backdrop-blur-md border-blue-500/30">
                <DropdownMenuLabel className="text-cyan-300">Filter by Role</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-blue-500/30" />
                {(Object.keys(roleMapping) as RoleType[]).map((key) => (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => setFilter(key)}
                    className="hover:bg-blue-500/20 cursor-pointer text-blue-200 hover:text-white"
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
          <div className="bg-red-500/20 border border-red-400/30 text-red-300 p-4 rounded-lg mb-4 backdrop-blur">
            <p>{error}</p>
            <Button
              onClick={() => {
                setError(null);
                setPage(page);
              }}
              variant="outline"
              className="mt-2 border-red-400/50 text-red-300 hover:bg-red-500/20"
            >
              Retry
            </Button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.length > 0 ? (
              users.map((user) => <UserCard key={user.id} user={user} />)
            ) : (
              <div className="col-span-full text-center py-8 text-blue-300">
                No users found
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between pt-4 border-t border-white/10">
        <Button
          variant="outline"
          className="border-white/20 bg-white/10 backdrop-blur hover:bg-white/20 text-white"
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1 || loading}
        >
          Previous
        </Button>
        <span className="text-blue-200">Page {page} of {totalPages}</span>
        <Button
          variant="outline"
          className="border-white/20 bg-white/10 backdrop-blur hover:bg-white/20 text-white"
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-blue-200 mt-2">Advanced control center for system management</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-cyan-400/30 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30">
            <Activity className="mr-2 h-4 w-4" />
            System Status
          </Button>
          <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/20">
            <Award className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardStats />

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5 text-cyan-400" />
          Quick Actions
        </h2>
        <QuickActions />
      </div>

      {/* User Management */}
      <UserManagementCard />
    </div>
  )
}