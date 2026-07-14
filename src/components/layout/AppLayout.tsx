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
  GraduationCap,
  Clock,
  Building,
  ClipboardList,
  AlertTriangle,
  PieChart,
  Briefcase,
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
        href: '/student/Schedule',
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
        id: 'absence',
        label: 'Absences',
        href: '/student/absence',
        icon: Clock,
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
        icon: Clock,
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
        icon: Briefcase,
      },
      {
        id: 'documents',
        label: 'Documents',
        href: '/professor/documents',
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
        icon: GraduationCap,
      },
      {
        id: 'classes',
        label: 'Classes',
        href: '/admin/class-groups',
        icon: BookOpen,
      },
      {
        id: 'departments',
        label: 'Departments',
        href: '/admin/departments',
        icon: Building,
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
        icon: ClipboardList,
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
        icon: AlertTriangle,
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
        icon: PieChart,
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
    <div className={cn("min-h-screen flex", className)} style={{ backgroundColor: 'var(--bg-secondary)' }}>
      {/* Sidebar */}
      <Sidebar
        sections={[{ title: userRole.toUpperCase(), items: navigationItems }]}
        user={{ name: userRole.charAt(0).toUpperCase() + userRole.slice(1), role: userRole }}
        onLogout={onLogout}
        defaultCollapsed={sidebarCollapsed}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0" id="main-content">
        {/* Header */}
        <header className="border-b px-6 py-4 flex items-center justify-between"
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderColor: 'var(--border-light)',
          boxShadow: 'var(--shadow-sm)'
        }}
        >
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold capitalize"
            style={{ color: 'var(--text-primary)' }}
            >
              {userRole} Portal
            </h1>
            <div className="px-3 py-1 rounded-full text-sm font-medium"
            style={{
              backgroundColor: 'var(--secondary)',
              color: 'var(--text-primary)'
            }}
            >
              AIAC Intranet
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="p-3 rounded-xl transition-all duration-200 relative focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--accent)',
              '--tw-ring-color': 'var(--focus-ring)'
            } as React.CSSProperties}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            >
              <Bell className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
              style={{ backgroundColor: 'var(--secondary)' }}
              ></span>
            </button>
            
            {/* User Avatar */}
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--primary)' }}
            >
              <span className="text-white font-bold text-lg">
                {userRole.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 overflow-auto"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppLayout;