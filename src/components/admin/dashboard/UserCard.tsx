import { Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface User {
  id: number;
  firstname?: string;
  lastname?: string;
  identity: string;
}

const UserCard = ({ user }: { user: User }) => {
  // Map identity to role
  const roleMapping: Record<string, { name: string; color: string }> = {
    ETUDIANT: { name: "Student", color: "bg-green-500/20" },
    MANAGER: { name: "Manager", color: "bg-yellow-500/20" },
    ADMINISTRATEUR: { name: "ADMINISTRATEUR", color: "bg-purple-500/20"},
    PROFESSEUR: { name: "Professor", color: "bg-blue-500/20" },
  };

  const role = roleMapping[user.identity] || { name: "Unknown", color: "bg-gray-500/20 text-gray-300" };
  const status = "Active"; // Assuming all users are active

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

export default UserCard;
