import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  BookOpen,
  GraduationCap,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function ProfessorSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const routes = [
    {
      label: 'Tableau de bord',
      icon: Calendar,
      href: '/professor',
      color: "text-sky-500"
    },
    {
      label: 'Présences',
      icon: Users,
      href: '/professor/attendance',
      color: "text-violet-500",
    },
    {
      label: 'Cours',
      icon: BookOpen,
      href: '/professor/courses',
      color: "text-pink-700",
    },
    {
      label: 'Étudiants',
      icon: GraduationCap,
      href: '/professor/students',
      color: "text-orange-700",
    },
  ];

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-[#00246B] text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/professor" className="flex items-center pl-3 mb-14">
          <h1 className="text-2xl font-bold">
            Professeur
          </h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400",
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-3 py-2">
        <Button
          onClick={logout}
          variant="ghost"
          className="w-full justify-start text-zinc-400 hover:text-white hover:bg-white/10"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Déconnexion
        </Button>
      </div>
    </div>
  );
} 