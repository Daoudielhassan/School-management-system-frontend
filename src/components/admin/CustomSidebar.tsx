'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    BarChart3,
    BookCopy,
    Calendar,
    HelpCircle,
    Home,
    LogOut,
    Menu,
    MessageSquare,
    Settings,
    User,
    Users
} from 'lucide-react'

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarSeparator,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAuth } from '@/context/AuthContext'

const BASE_URL = "/admin"

const menuItems = [
    { name: 'Dashboard', icon: Home, href: `${BASE_URL}` },
    { name: 'Analytics', icon: BarChart3, href: `${BASE_URL}/analytics` },
    { name: 'Students', icon: Users, href: `${BASE_URL}/students` },
    { name: 'User Management', icon: Users, href: `${BASE_URL}/users` },
    { name: 'Sessions', icon: BookCopy, href: `${BASE_URL}/sessions` },
    { name: 'Calendar', icon: Calendar, href: `${BASE_URL}/calendar` },
    { name: 'Messages', icon: MessageSquare, href: `${BASE_URL}/messages` },
]

const settingsItems = [
    { name: 'Profile', icon: User, href: `${BASE_URL}/profile` },
    { name: 'Settings', icon: Settings, href: `${BASE_URL}/settings` },
    { name: 'Help', icon: HelpCircle, href: `${BASE_URL}/help` },
]

// Custom theme styles for the sidebar
const sidebarStyles = {
    '--sidebar-background': '#0A192F', // #0A192F
    '--sidebar-foreground': '#FFFFFF', // #FFFFFF
    '--sidebar-accent': '#1E2D3D', // #1E2D3D
    '--sidebar-accent-foreground': '#00D4FF', // #00D4FF
    '--sidebar-primary': '#00D4FF', // #00D4FF
    '--sidebar-primary-foreground': '#0A192F', // #0A192F
    '--sidebar-border': '#1E2D3D', // #1E2D3D
} as React.CSSProperties

interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
}

interface CustomSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CustomSidebar({ isOpen, onClose }: CustomSidebarProps) {
    const pathname = usePathname()
    const isMobile = useIsMobile()
    const { logout, userId, token } = useAuth()
    const [user, setUser] = React.useState<User | null>(null)

    React.useEffect(() => {
        if (userId && token) {
            fetch(`http://localhost:8080/api/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then(res => {
                    if (!res.ok) {
                        return Promise.reject(new Error('Response not OK'));
                    }
                    return res.json()
                })
                .then(data => setUser(data))
                .catch(err => console.error("Failed to fetch user", err))
        }
    }, [userId, token])

    const commonSidebarContent = (
        <>
            <SidebarHeader className="pb-2">
                <div className="flex items-center gap-2 px-4 py-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src="/user.png" alt="Admin User" />
                        <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                            {user ? `${user.firstname.charAt(0)}${user.lastname.charAt(0)}` : 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{user ? `${user.firstname} ${user.lastname}`: 'Loading...'}</span>
                            <span className="px-2 py-0.5 text-xs rounded-full bg-sidebar-primary text-sidebar-primary-foreground font-semibold">Admin</span>
                        </div>
                        <span className="text-xs text-sidebar-foreground/70">
                            {user ? user.email : '...'}
                        </span>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.name}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname === item.href}
                                        tooltip={item.name}
                                    >
                                        <Link href={item.href} onClick={isMobile ? onClose : undefined}>
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.name}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator />

                <SidebarGroup>
                    <SidebarGroupLabel>Settings</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {settingsItems.map((item) => (
                                <SidebarMenuItem key={item.name}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname === item.href}
                                        tooltip={item.name}
                                    >
                                        <Link href={item.href} onClick={isMobile ? onClose : undefined}>
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.name}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="mt-auto">
                <button onClick={() => logout()} className="w-full justify-center flex items-center gap-2 p-2 text-red-500 hover:opacity-80">
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                </button>
            </SidebarFooter>
        </>
    );

    return (
        <SidebarProvider>
            <div style={sidebarStyles}>
                {isMobile ? (
                    // Mobile View Sidebar (Drawer Style)
                    <>
                        {isOpen && (
                            <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose}></div>
                        )}
                        <Sidebar
                            className={`fixed top-0 left-0 z-50 h-full transform bg-sidebar-background shadow-lg transition-transform ${
                                isOpen ? 'translate-x-0' : '-translate-x-full'
                            }`}
                        >
                            {commonSidebarContent}
                        </Sidebar>
                    </>
                ) : (
                    // Desktop View Sidebar
                    <Sidebar className="border-r border-sidebar-border h-full">
                        {commonSidebarContent}
                    </Sidebar>
                )}
            </div>
        </SidebarProvider>
    )
}