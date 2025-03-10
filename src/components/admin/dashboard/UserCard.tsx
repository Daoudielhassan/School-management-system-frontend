import { Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface User {
  id: number;
  username: string;
  email: string;
  identity: string;
}

const UserCard = ({ user }: { user: User }) => {
  // Map identity to role
  const roleMapping: Record<string, string> = {
    ETUDIANT: "student",
    MANAGER: "manager",
    ADMINISTRATEUR: "admin",
    PROFESSEUR: "professor",
  };

  const role = roleMapping[user.identity] || "unknown";
  const status = "Active";

  return (
      <div className="bg-[#2A3747] rounded-lg p-4 transition-all duration-200 hover:shadow-lg hover:shadow-[#00D4FF]/10 hover:border-[#00D4FF]/30 border border-transparent">
        <div className="flex items-center gap-3">
          <img src="/public/user.png" alt={user.username} className="rounded-full w-10 h-10" />
          <div>
            <h3 className="font-medium text-white">{user.username}</h3>
            <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full ${role === "student" ? "bg-green-500/20 text-green-300" : "bg-gray-500/20 text-gray-300"}`}>
              {role}
            </span>
              <span className={`text-xs ${status === "Active" ? "text-green-400" : "text-[#FF6B6B]"}`}>
              {status}
            </span>
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
