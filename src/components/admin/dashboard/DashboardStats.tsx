import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, Briefcase, Shield } from "lucide-react";

interface StatsResponse {
  totalUsers: number;
  newUsersThisMonth: number;
  activeUsers: number;
  identityCounts: { identity: string; count: number }[];
}

const DashboardStats = () => {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/users/admin/stats");
        if (!response.ok) throw new Error("Failed to fetch stats");
        const data: StatsResponse = await response.json();
        setStats(data);
      } catch (err) {
        setError("Error loading stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <p className="text-gray-400">Loading stats...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  // Extract counts dynamically
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
        <Card key={index} className="bg-[#1E2D3D] border-[#2A3747] shadow-lg hover:shadow-[#00D4FF]/10 transition-shadow duration-300">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-medium text-gray-300">{stat.title}</CardTitle>
              <div className={`p-2 rounded-md ${stat.color}`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <p className="text-xs text-gray-400">Last updated now</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
