import { useState } from "react";
import Sidebar from "react-mui-sidebar";
import { usePathname } from "next/navigation";
import { Home, BarChart3, Users, CreditCard, Calendar, MessageSquare, FileText, HelpCircle, Settings, User } from "lucide-react";
import Link from "next/link";
import { Avatar, Typography } from "@mui/material";

const menuItems = [
  { name: "Dashboard", icon: <Home />, href: "/dashboard" },
  { name: "Analytics", icon: <BarChart3 />, href: "/dashboard/analytics" },
  { name: "Students", icon: <Users />, href: "/dashboard/students" },
  { name: "User Management", icon: <Users />, href: "/dashboard/users" },
  { name: "Finance", icon: <CreditCard />, href: "/dashboard/finance" },
  { name: "Calendar", icon: <Calendar />, href: "/dashboard/calendar" },
  { name: "Messages", icon: <MessageSquare />, href: "/dashboard/messages" },
  { name: "Documents", icon: <FileText />, href: "/dashboard/documents" },
];

const settingsItems = [
  { name: "Profile", icon: <User />, href: "/dashboard/profile" },
  { name: "Settings", icon: <Settings />, href: "/dashboard/settings" },
  { name: "Help", icon: <HelpCircle />, href: "/dashboard/help" },
];

const CustomSidebar = ({ isOpen, toggleSidebar }: { isOpen: boolean; toggleSidebar: () => void }) => {
  const pathname = usePathname();

  return (
      <Sidebar
          open={isOpen}
          onClose={toggleSidebar}
          width={250}
          variant="permanent"
          backgroundColor="#0A192F"
          color="#FFFFFF"
      >
        {/* Logo Section */}
        <div style={{ padding: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
          <Avatar sx={{ bgcolor: "#00D4FF" }}>N</Avatar>
          <Typography variant="h6">NexusDash</Typography>
        </div>

        {/* Navigation Menu */}
        {menuItems.map((item) => (
            <Link key={item.name} href={item.href} passHref>
              <Sidebar.Item active={pathname === item.href} icon={item.icon}>
                {item.name}
              </Sidebar.Item>
            </Link>
        ))}

        {/* Divider */}
        <Sidebar.Divider />

        {/* Settings Menu */}
        {settingsItems.map((item) => (
            <Link key={item.name} href={item.href} passHref>
              <Sidebar.Item active={pathname === item.href} icon={item.icon}>
                {item.name}
              </Sidebar.Item>
            </Link>
        ))}

        {/* User Profile Section */}
        <Sidebar.Footer>
          <Link href="/dashboard/profile" passHref>
            <Sidebar.Item icon={<User />}>
              <Typography variant="subtitle2">Admin User</Typography>
              <Typography variant="caption">admin@nexusdash.com</Typography>
            </Sidebar.Item>
          </Link>
        </Sidebar.Footer>
      </Sidebar>
  );
};

export default CustomSidebar;
