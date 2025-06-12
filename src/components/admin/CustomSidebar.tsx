'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    BarChart3,
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

const BASE_URL = "http://localhost:3000/admin"

const menuItems = [
    { name: 'Dashboard', icon: Home, href: `${BASE_URL}/` },
    { name: 'Analytics', icon: BarChart3, href: `${BASE_URL}/analytics` },
    { name: 'Students', icon: Users, href: `${BASE_URL}/students` },
    { name: 'User  Management', icon: Users, href: `${BASE_URL}/users` },
    { name: 'Calendar', icon: Calendar, href: `${BASE_URL}/calendar` },
    { name: 'Messages', icon: MessageSquare, href: `${BASE_URL}/messages` },
]

const settingsItems = [
    { name: 'Profile', icon: User, href: '/dashboard/profile' },
    { name: 'Settings', icon: Settings, href: '/dashboard/settings' },
    { name: 'Help', icon: HelpCircle, href: '/dashboard/help' },
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

export default function CustomSidebar() {
    const pathname = usePathname()
    const isMobile = useIsMobile()
    const [isSidebarOpen, setSidebarOpen] = React.useState(false)

    const toggleSidebar = () => {
        setSidebarOpen((prev) => !prev)
    }

    const closeSidebar = () => {
        setSidebarOpen(false)
    }

    return (
        <SidebarProvider>
            <div style={sidebarStyles}>
                {isMobile ? (
                    // Mobile View Sidebar (Drawer Style)
                    <div>
                        <Button
                            onClick={toggleSidebar}
                            className="fixed top-4 left-4 z-50"
                            variant="outline"
                            size="sm"
                            aria-label="Open Menu"
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                        {isSidebarOpen && (
                            <div className="fixed inset-0 z-40 bg-black/50" onClick={closeSidebar}></div>
                        )}
                        <Sidebar
                            className={`fixed top-0 left-0 z-50 h-full transform bg-sidebar-background shadow-lg transition-transform ${
                                isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                            }`}
                        >
                            <SidebarHeader className="pb-2">
                                <div className="flex items-center gap-2 px-4 py-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src="/path-to-profile-pic.jpg" alt="Admin User" />
                                        <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                                            AU
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">Admin User</span>
                                        <span className="text-xs text-sidebar-foreground/70">
                                            admin@nexusdash.com
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
                                                        <Link href={item.href} onClick={closeSidebar}>
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
                                                        <Link href={item.href} onClick={closeSidebar}>
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
                                <button className="w-full justify-center flex items-center gap-2 p-2 text-red-500 hover:opacity-80">
                                    <LogOut className="h-4 w-4" />
                                    <span>Logout</span>
                                </button>
                            </SidebarFooter>
                        </Sidebar>
                    </div>
                ) : (
                    // Desktop View Sidebar
                    <Sidebar className="border-r border-sidebar-border">
                        <SidebarHeader className="pb-2">
                            <div className="flex items-center gap-2 px-4 py-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src="/path-to-profile-pic.jpg" alt="Admin User" />
                                    <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                                        AU
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">Admin User</span>
                                    <span className="text-xs text-sidebar-foreground/70">
                                        admin@nexusdash.com
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
                                                    <Link href={item.href}>
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
                                                    <Link href={item.href}>
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
                            <button className="w-full justify-center flex items-center gap-2 p-2 text-red-500 hover:opacity-80">
                                <LogOut className="h-4 w-4" />
                                <span>Logout</span>
                            </button>
                        </SidebarFooter>
                    </Sidebar>
                )}
            </div>
        </SidebarProvider>
    )
}