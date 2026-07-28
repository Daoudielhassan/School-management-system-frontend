'use client';

import React from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  ClipboardCheck,
  Building2,
  BookOpen,
  Calendar,
  Layers,
  Gavel,
  FileBarChart2,
  MessageSquare,
  Bell,
  UserCircle,
  LogOut,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useMyManagerProfile, useMyUnreadMessageCount, useMyUnreadNotificationCount } from '@/features/manager';

const sidebarSections = [
  {
    title: 'GÉNÉRAL',
    items: [{ id: 'dashboard', label: 'Tableau de bord', href: '/manager', icon: LayoutDashboard }],
  },
  {
    title: 'GESTION',
    items: [
      { id: 'validations', label: 'Validations', href: '/manager/validations', icon: ClipboardCheck },
      { id: 'department', label: 'Département', href: '/manager/department', icon: Building2 },
      { id: 'teaching-assignments', label: 'Affectations', href: '/manager/teaching-assignments', icon: BookOpen },
      { id: 'sessions', label: 'Sessions', href: '/manager/sessions', icon: Calendar },
      { id: 'curriculum', label: 'Structure académique', href: '/manager/curriculum', icon: Layers },
      { id: 'discipline', label: 'Discipline', href: '/manager/discipline', icon: Gavel },
      { id: 'reports', label: 'Rapports', href: '/manager/reports', icon: FileBarChart2 },
    ],
  },
  {
    title: 'COMMUNICATION',
    items: [
      { id: 'messages', label: 'Messages', href: '/manager/messages', icon: MessageSquare },
      { id: 'notifications', label: 'Notifications', href: '/manager/notifications', icon: Bell },
    ],
  },
  {
    title: 'COMPTE',
    items: [{ id: 'profile', label: 'Profil', href: '/manager/profile', icon: UserCircle }],
  },
];

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const { data: profile } = useMyManagerProfile();
  const { data: unreadMessages = 0 } = useMyUnreadMessageCount();
  const { data: unreadNotifications = 0 } = useMyUnreadNotificationCount();

  const firstName = profile?.firstName || 'Manager';
  const lastName = profile?.lastName || '';
  const initials = `${firstName.charAt(0)}${lastName ? lastName.charAt(0) : ''}`;
  const currentUser = { name: `${firstName} ${lastName}`.trim(), role: 'Manager' };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#f8fafc] to-[#f2f5fa]">
      <Sidebar sections={sidebarSections} user={currentUser} onLogout={logout} defaultCollapsed />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="z-40 px-[40px] pt-[32px] pb-4">
          <div className="flex items-center justify-between gap-8">
            <div className="flex flex-col flex-shrink-0">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Bonjour {firstName} 👋</h2>
              <p className="text-sm font-medium text-slate-500 mt-1">Bienvenue dans votre espace manager</p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0 ml-auto">
              <Link href="/manager/messages">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-11 w-11 rounded-2xl bg-white/60 border border-slate-200/60 shadow-sm hover:bg-white text-slate-500 hover:text-blue-600 transition-all duration-200"
                >
                  <MessageSquare className="h-5 w-5" />
                  {unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-semibold text-white bg-red-500 rounded-full border-2 border-white">
                      {unreadMessages > 9 ? '9+' : unreadMessages}
                    </span>
                  )}
                </Button>
              </Link>

              <Link href="/manager/notifications">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-11 w-11 rounded-2xl bg-white/60 border border-slate-200/60 shadow-sm hover:bg-white text-slate-500 hover:text-blue-600 transition-all duration-200"
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-semibold text-white bg-red-500 rounded-full border-2 border-white">
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </span>
                  )}
                </Button>
              </Link>

              <div className="w-px h-8 bg-slate-200/80 mx-1"></div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-11 w-11 rounded-2xl p-0 hover:scale-105 transition-transform duration-200">
                    <Avatar className="h-11 w-11 border border-white shadow-md">
                      <AvatarFallback className="bg-blue-600 text-white font-semibold text-sm">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 rounded-2xl bg-white/95 backdrop-blur-xl border-slate-100 shadow-xl shadow-slate-900/10 p-2" align="end" sideOffset={10}>
                  <DropdownMenuLabel className="font-normal px-3 py-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold text-slate-900">{currentUser.name}</p>
                      <p className="text-xs text-slate-500">{profile?.email || ''}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <DropdownMenuItem asChild className="rounded-xl hover:bg-slate-50 focus:bg-slate-50 cursor-pointer mb-1">
                    <Link href="/manager/profile" className="flex items-center px-3 py-2.5">
                      <Settings className="mr-3 h-4 w-4 text-slate-500" />
                      <span className="text-slate-700 font-medium">Profil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-100 my-1" />
                  <DropdownMenuItem
                    onClick={logout}
                    className="rounded-xl hover:bg-red-50 focus:bg-red-50 cursor-pointer text-red-600 focus:text-red-700 mt-1"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    <span className="font-medium">Déconnexion</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex-1 px-[40px] pt-4 pb-12 overflow-x-hidden overflow-y-auto w-full">
          <div className="w-full h-full flex flex-col space-y-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
