import { useState } from "react";
import {
  BarChart3,
  Home,
  Users,
  CreditCard,
  Calendar,
  MessageSquare,
  FileText,
  HelpCircle,
  Settings,
  User,
  Layers,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out bg-[#0A192F] border-r border-[#1E2D3D] ${isOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0`}>
      <div className="flex items-center justify-between h-16 px-4 border-b border-[#1E2D3D]">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-md bg-[#00D4FF] flex items-center justify-center mr-2">
            <Layers className="w-5 h-5 text-[#0A192F]" />
          </div>
          <span className="text-xl font-bold">NexusDash</span>
        </div>
      </div>
      <nav className="mt-5 px-2">
        <div className="space-y-1">
          {[
            { name: "Dashboard", icon: Home, current: true },
            { name: "Analytics", icon: BarChart3, current: false },
            { name: "Students", icon: Users, current: false },
            { name: "User  Management", icon: Users, current: false },
            { name: "Finance", icon: CreditCard, current: false },
            { name: "Calendar", icon: Calendar, current: false },
            { name: "Messages", icon: MessageSquare, current: false },
            { name: "Documents", icon: FileText, current: false },
          ].map((item) => (
            <a key={item.name} href="#" className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${item.current ? "bg-[#1E2D3D] text-[#00D4FF]" : "text-gray-300 hover:bg-[#1E2D3D] hover:text-[#00D4FF]"}`}>
              <item.icon className={`mr-3 h-5 w-5 ${item.current ? "text-[#00D4FF]" : "text-gray-400 group-hover:text-[#00D4FF]"}`} />
              {item.name}
            </a>
          ))}
        </div>
        {/* Settings Section */}
        <div className="mt-10">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Settings</p>
          <div className="mt-2 space-y-1">
            {[
              { name: "Profile", icon: User },
              { name: "Settings", icon: Settings },
              { name: "Help", icon: HelpCircle },
            ].map((item) => (
              <a key={item.name} href="#" className="group flex items-center px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-[#1E2D3D] hover:text-[#00D4FF] transition-all duration-200">
                <item.icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-[#00D4FF]" />
                {item.name}
              </a>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;