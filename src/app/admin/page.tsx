"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, GraduationCap, Briefcase, Shield, TrendingUp, AlertCircle, Bell, Settings, ChevronDown, Search } from "lucide-react"
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

// UserCard Component
const UserCard = ({ user }: { user: User }) => {
  const roleMapping: Record<string, { name: string; color: string }> = {
    ETUDIANT: { name: "Student", color: "bg-green-500/20" },
    MANAGER: { name: "Manager", color: "bg-yellow-500/20" },
    ADMINISTRATEUR: { name: "ADMINISTRATEUR", color: "bg-purple-500/20"},
    PROFESSEUR: { name: "Professor", color: "bg-blue-500/20" },
  };

  const role = roleMapping[user.identity] || { name: "Unknown", color: "bg-gray-500/20 text-gray-300" };
  const status = "Active";

  return (
    <div className="bg-[#E7E8D1] rounded-lg p-4 transition-all duration-200 hover:shadow-lg hover:shadow-[#00D4FF]/10 hover:border-[#00D4FF]/30 border border-transparent">
      <div className="flex items-center gap-3">
        <img
          src="/user.png"
          alt={`${user.firstname || "Unknown"} ${user.lastname || "User"}`}
          className="rounded-full w-10 h-10"
        />
        <div>
          <h3 className="font-medium text-black">{user.firstname || "Unknown"} {user.lastname || "User"}</h3>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full text-gray-900 ${role.color}`}>
              {role.name}
            </span>
            <span className="text-xs text-blue-800">{status}</span>
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-3 gap-2">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-[#3A4757] hover:text-[#00D4FF] transition-colors">
          <Settings className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-[#3A4757] hover:text-[#FF6B6B] transition-colors">
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// DashboardStats Component
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

  if (loading) return <p className="text-gray-400">Loading stats...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const studentCount = stats?.identityCounts.find((i) => i.identity === "ETUDIANT")?.count || 0;
  const professorCount = stats?.identityCounts.find((i) => i.identity === "PROFESSEUR")?.count || 0;
  const managerCount = stats?.identityCounts.find((i) => i.identity === "MANAGER")?.count || 0;

  const statsConfig = [
    { title: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "bg-blue-500" },
    { title: "Active Students", value: studentCount, icon: GraduationCap, color: "bg-green-500" },
    { title: "Professors", value: professorCount, icon: Briefcase, color: "bg-purple-500" },
    { title: "Managers", value: managerCount, icon: Shield, color: "bg-yellow-500" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsConfig.map((stat, index) => (
        <Card key={index} className="bg-[#FFFFFF] border-[#9D1F15] shadow-lg hover:shadow-[#9D1F15]/10 transition-shadow duration-300">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-medium text-black">{stat.title}</CardTitle>
              <div className={`p-2 rounded-md ${stat.color}`}>
                <stat.icon className="h-4 w-4 text-gray-900" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
            <p className="text-xs text-gray-900">Last updated now</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// UserManagementCard Component
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
        let url = `http://localhost:8080/api/users?page=${page - 1}&size=10`;
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
        setError("Impossible de charger les utilisateurs. Veuillez réessayer plus tard.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page, filter, debouncedSearchTerm, token]);

  const displayRoleName = (role: RoleType) => {
    switch (role) {
      case "manager":
        return "Managers";
      case "student":
        return "Étudiants";
      case "professor":
        return "Professeurs";
      case "admin":
        return "Administrateur";
      case "all":
        return "Tous les Utilisateurs";
      default:
        return role;
    }
  };

  return (
    <Card className="bg-[#FFFFFF] border-[#9D1F15] shadow-lg">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-xl font-semibold text-black">
              Gestion des Utilisateurs
            </CardTitle>
            <CardDescription className="text-gray-800">
              Gérer les utilisateurs du système
            </CardDescription>
          </div>
          <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400"/>
              <Input
                type="text"
                placeholder="Rechercher des utilisateurs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-4 py-2 rounded-lg bg-white border border-blue-950 text-black focus:border-blue-950"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-[#2A3747] hover:shadow-[#9D1F15]/10 hover:text-[#00246B]">
                  Filtre <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#1E2D3D] border-[#2A3747] text-white">
                <DropdownMenuLabel>Filtrer par Rôle</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#2A3747]" />
                {(Object.keys(roleMapping) as RoleType[]).map((key) => (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => setFilter(key)}
                    className="hover:bg-[#2A3747] cursor-pointer"
                  >
                    {displayRoleName(key)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="bg-red-500/20 text-red-300 p-4 rounded-md mb-4">
            <p>{error}</p>
            <Button
              onClick={() => {
                setError(null);
                setPage(page);
              }}
              variant="outline"
              className="mt-2 border-red-400 text-red-300 hover:bg-red-500/20"
            >
              Réessayer
            </Button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00D4FF]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.length > 0 ? (
              users.map((user) => <UserCard key={user.id} user={user} />)
            ) : (
              <div className="col-span-full text-center py-8 text-gray-400">
                Aucun utilisateur trouvé
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between pt-4">
        <Button
          variant="outline"
          className="border-[#2A3747] hover:bg-[#2A3747] hover:text-[#00D4FF]"
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1 || loading}
        >
          Précédent
        </Button>
        <span className="text-gray-600">Page {page} sur {totalPages}</span>
        <Button
          variant="outline"
          className="border-[#2A3747] hover:bg-[#2A3747] hover:text-[#00D4FF]"
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages || loading}
        >
          Suivant
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord administrateur</h1>
        <p className="text-gray-600">Vue d'ensemble du système de gestion scolaire</p>
      </div>

      {/* Stats Cards */}
      <DashboardStats />

      {/* User Management */}
      <UserManagementCard />
    </div>
  )
}