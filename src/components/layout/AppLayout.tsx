"use client";

import React, { useState } from 'react';
import { Sidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import {
  Home,
  Users,
  Calendar,
  BookOpen,
  MessageSquare,
  Settings,
  BarChart3,
  FileText,
  Bell,
  User,
} from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
  userRole?: 'student' | 'professor' | 'admin' | 'manager';
  onLogout?: () => void;
  className?: string;
}

// Define navigation items based on user role
const getNavigationItems = (role: string = 'student') => {
  const baseItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: `/${role}`,
      icon: Home,
    },
  ];

  const roleSpecificItems = {
    student: [
      {
        id: 'schedule',
        label: 'Schedule',
        href: '/student/schedule',
        icon: Calendar,
      },
      {
        id: 'courses',
        label: 'Courses',
        href: '/student/courses',
        icon: BookOpen,
      },
      {
        id: 'grades',
        label: 'Grades',
        href: '/student/grades',
        icon: BarChart3,
      },
      {
        id: 'messages',
        label: 'Messages',
        href: '/student/messages',
        icon: MessageSquare,
        badge: 3,
      },
      {
        id: 'profile',
        label: 'Profile',
        href: '/student/profile',
        icon: User,
      },
    ],
    professor: [
      {
        id: 'courses',
        label: 'My Courses',
        href: '/professor/courses',
        icon: BookOpen,
      },
      {
        id: 'students',
        label: 'Students',
        href: '/professor/students',
        icon: Users,
      },
      {
        id: 'attendance',
        label: 'Attendance',
        href: '/professor/absences',
        icon: Calendar,
      },
      {
        id: 'grades',
        label: 'Grades',
        href: '/professor/grades',
        icon: BarChart3,
      },
      {
        id: 'messages',
        label: 'Messages',
        href: '/professor/messages',
        icon: MessageSquare,
        badge: 5,
      },
      {
        id: 'opportunities',
        label: 'Opportunities',
        href: '/professor/opportunities',
        icon: FileText,
      },
    ],
    admin: [
      {
        id: 'users',
        label: 'Users',
        href: '/admin/users',
        icon: Users,
      },
      {
        id: 'students',
        label: 'Students',
        href: '/admin/students',
        icon: Users,
      },
      {
        id: 'classes',
        label: 'Classes',
        href: '/admin/classes',
        icon: BookOpen,
      },
      {
        id: 'departments',
        label: 'Departments',
        href: '/admin/departments',
        icon: FileText,
      },
      {
        id: 'sessions',
        label: 'Sessions',
        href: '/admin/sessions',
        icon: Calendar,
      },
      {
        id: 'attendance',
        label: 'Attendance',
        href: '/admin/attendance',
        icon: BarChart3,
      },
      {
        id: 'grades',
        label: 'Grades',
        href: '/admin/grades',
        icon: BarChart3,
      },
      {
        id: 'discipline',
        label: 'Discipline',
        href: '/admin/discipline',
        icon: FileText,
      },
      {
        id: 'messages',
        label: 'Messages',
        href: '/admin/messages',
        icon: MessageSquare,
        badge: 12,
      },
      {
        id: 'reports',
        label: 'Reports',
        href: '/admin/reports',
        icon: FileText,
      },
    ],
    manager: [
      {
        id: 'attendance',
        label: 'Attendance',
        href: '/manager/attendance',
        icon: Calendar,
      },
      {
        id: 'sessions',
        label: 'Sessions',
        href: '/manager/sessions',
        icon: Calendar,
      },
      {
        id: 'reports',
        label: 'Reports',
        href: '/manager/reports',
        icon: FileText,
      },
    ],
  };

  const commonItems = [
    {
      id: 'settings',
      label: 'Settings',
      href: `/${role}/settings`,
      icon: Settings,
    },
  ];

  return [
    ...baseItems,
    ...roleSpecificItems[role as keyof typeof roleSpecificItems] || [],
    ...commonItems,
  ];
};

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  userRole = 'student',
  onLogout,
  className,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigationItems = getNavigationItems(userRole);

  return (
    <div className={cn("min-h-screen bg-gray-50 flex", className)}>
      {/* Sidebar */}
      <Sidebar
        items={navigationItems}
        onLogout={onLogout}
        defaultCollapsed={sidebarCollapsed}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-gray-900 capitalize">
              {userRole} Portal
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 relative focus:outline-none focus:ring-2 focus:ring-blue-500">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
            
            {/* User Avatar */}
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {userRole.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppLayout;