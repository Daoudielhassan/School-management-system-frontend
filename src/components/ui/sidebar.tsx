"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Settings,
  User,
  LifeBuoy
} from 'lucide-react';

// Import des composants Shadcn/UI (assure-toi de les avoir générés via la CLI)
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface SidebarItem {
  id: string;
  label: string;
  href?: string; // Optionnel si l'item a des enfants
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: SidebarItem[];
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

interface SidebarProps {
  sections: SidebarSection[];
  user: { name: string; role: string; avatarUrl?: string };
  onLogout?: () => void;
  className?: string;
  defaultCollapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sections,
  user,
  onLogout,
  className,
  defaultCollapsed = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Responsive logic
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsOpen(false);
        setIsCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Raccourci Clavier: Ctrl+B ou Cmd+B pour basculer la sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        if (isMobile) {
          setIsOpen((prev) => !prev);
        } else {
          setIsCollapsed((prev) => !prev);
        }
      }
      if (e.key === 'Escape' && isMobile && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobile, isOpen]);

  // Click outside (mobile) & body scroll lock
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.body.style.overflow = isMobile && isOpen ? 'hidden' : '';
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isMobile, isOpen]);

  const isActiveLink = (href?: string) => {
    if (!href) return false;
    if (pathname === href) return true;
    const isRoot = href.split('/').filter(Boolean).length <= 1;
    return !isRoot && pathname.startsWith(href + '/');
  };

  // Vérifie si un parent contient un enfant actif
  const hasActiveChild = (item: SidebarItem): boolean => {
    if (item.children) {
      return item.children.some(child => isActiveLink(child.href) || hasActiveChild(child));
    }
    return false;
  };

  // Auto-expansion des menus parents si un enfant est actif au chargement
  useEffect(() => {
    const newExpandedState = { ...expandedMenus };
    let stateChanged = false;
    sections.forEach(sec => {
      sec.items.forEach(item => {
        if (item.children && hasActiveChild(item) && !expandedMenus[item.id]) {
          newExpandedState[item.id] = true;
          stateChanged = true;
        }
      });
    });
    if (stateChanged) setExpandedMenus(newExpandedState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, sections]);

  const toggleMenu = (id: string) => {
    // Si la sidebar est réduite et qu'on clique sur un menu parent, on déploie la sidebar
    if (isCollapsed && !isMobile) {
      setIsCollapsed(false);
      setExpandedMenus(prev => ({ ...prev, [id]: true }));
      return;
    }
    setExpandedMenus(prev => ({ ...prev, [id]: !prev }));
  };

  return (
    <TooltipProvider delayDuration={100}>
      {/* Bouton Mobile */}
      {isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 z-50 p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 text-slate-700 dark:text-slate-200 shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Overlay Mobile */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <motion.aside
        ref={sidebarRef}
        animate={{
          width: isMobile ? (isOpen ? "280px" : "0px") : (isCollapsed ? "82px" : "280px"),
          x: isMobile && !isOpen ? -280 : 0
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "border border-white/40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl flex flex-col  z-40",
          isMobile 
            ? "fixed top-0 left-0 h-screen rounded-none shadow-2xl" 
            : "sticky top-4 ml-4 my-4 rounded-3xl shadow-lg shadow-slate-900/5 h-[calc(100vh-2rem)]",
          className
        )}
      >
        <div className="flex flex-col h-full">
          
          {/* Header */}
          <div className={cn(
            "relative flex items-center h-20 border-b border-slate-100 dark:border-slate-800/50 transition-all duration-300",
            isCollapsed ? "justify-center" : "justify-between px-4"
          )}>
            
            {/* Logo */}
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center bg-blue-600 shadow-md shadow-blue-500/20">
                <span className="text-white font-bold text-base">A</span>
              </div>
              {!isCollapsed && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col whitespace-nowrap">
                  <h1 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-none">AIAC Intranet</h1>
                  <span className="text-[11px] font-medium text-slate-400 mt-0.5">Academic Portal</span>
                </motion.div>
              )}
            </div>

            {/* Bouton Toggle Flottant */}
            {!isMobile && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={cn(
                  "bg-white hover:bg-slate-50 text-slate-500 hover:text-blue-600 transition-all active:scale-95 z-50 flex items-center justify-center",
                  isCollapsed 
                    ? "absolute -right-3.5 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full border border-slate-200 shadow-md" 
                    : "p-1.5 rounded-lg border border-slate-200/40 shadow-sm"
                )}
                title="Ctrl + B pour basculer"
              >
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            )}
          </div>
          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto scrollbar-none">
            {sections.map((section, idx) => (
              <div key={idx} className="space-y-1.5">
                {!isCollapsed && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-3 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                    {section.title}
                  </motion.p>
                )}
                
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isParentActive = hasActiveChild(item);
                    const isDirectlyActive = isActiveLink(item.href);
                    const isActive = isDirectlyActive || isParentActive;
                    const isExpanded = expandedMenus[item.id];
                    const hasChildren = item.children && item.children.length > 0;
                    const Icon = item.icon;

                    const ItemWrapper = ({ children }: { children: React.ReactNode }) => {
                      if (hasChildren) {
                        return <div onClick={() => toggleMenu(item.id)} className="cursor-pointer">{children}</div>;
                      }
                      return <Link href={item.href || '#'} onClick={() => isMobile && setIsOpen(false)}>{children}</Link>;
                    };

                    const LinkContent = (
                      <div className={cn(
                        "flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all duration-200 group relative w-full",
                        isActive ? "bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 font-semibold" : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50",
                        isCollapsed && "justify-center px-0 h-11 w-11 mx-auto"
                      )}>
                        {isActive && !isCollapsed && (
                          <motion.div layoutId="activeIndicator" className="absolute left-0 w-1 h-5 bg-blue-600 rounded-r-full" />
                        )}
                        <Icon className={cn("w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-105", isActive ? "text-blue-600" : "text-slate-400")} />
                        
                        {!isCollapsed && (
                          <>
                            <span className="text-sm truncate flex-1">{item.label}</span>
                            {item.badge && (
                              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-100 text-slate-600">{item.badge}</span>
                            )}
                            {hasChildren && (
                              <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-200", isExpanded && "rotate-180")} />
                            )}
                          </>
                        )}
                      </div>
                    );

                    return (
                      <div key={item.id}>
                        {isCollapsed ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div><ItemWrapper>{LinkContent}</ItemWrapper></div>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="bg-slate-900 text-slate-50 border-none rounded-xl">
                              {item.label}
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <ItemWrapper>{LinkContent}</ItemWrapper>
                        )}

                        {/* Rendu des sous-menus animés */}
                        <AnimatePresence>
                          {hasChildren && isExpanded && !isCollapsed && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="pl-11 pr-3 py-1 space-y-1 relative">
                                {/* Ligne de connexion visuelle pour le sous-menu */}
                                <div className="absolute left-6 top-0 bottom-2 w-[1px] bg-slate-200 dark:bg-slate-800" />
                                
                                {item.children?.map(child => {
                                  const isChildActive = isActiveLink(child.href);
                                  return (
                                    <Link
                                      key={child.id}
                                      href={child.href || '#'}
                                      onClick={() => isMobile && setIsOpen(false)}
                                      className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200 relative",
                                        isChildActive ? "text-blue-600 font-medium bg-blue-50/50 dark:bg-blue-500/10" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                      )}
                                    >
                                      {isChildActive && (
                                        <div className="absolute -left-[21px] w-1.5 h-1.5 rounded-full bg-blue-600" />
                                      )}
                                      <span className="truncate">{child.label}</span>
                                    </Link>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Profile User Footer Complet */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800/50 mt-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={cn(
                  "flex items-center gap-3 w-full rounded-2xl transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 focus:outline-none",
                  isCollapsed ? "justify-center p-1" : "p-2"
                )}>
                  <Avatar className={cn("rounded-xl border border-slate-200 dark:border-slate-700", isCollapsed ? "h-9 w-9" : "h-10 w-10")}>
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 font-medium rounded-xl">
                      {user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  {!isCollapsed && (
                    <>
                      <div className="flex flex-col flex-1 items-start overflow-hidden">
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate w-full text-left">{user.name}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate w-full text-left">{user.role}</span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    </>
                  )}
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent 
                side={isCollapsed ? "right" : "top"} 
                align={isCollapsed ? "end" : "center"}
                sideOffset={16}
                className="w-56 rounded-2xl border-slate-200/60 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl shadow-slate-900/10"
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-slate-500">{user.role}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                <DropdownMenuGroup>
                  <DropdownMenuItem className="cursor-pointer rounded-xl focus:bg-slate-50 dark:focus:bg-slate-800 gap-2">
                    <User className="h-4 w-4 text-slate-500" />
                    <span>Mon Profil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer rounded-xl focus:bg-slate-50 dark:focus:bg-slate-800 gap-2">
                    <Settings className="h-4 w-4 text-slate-500" />
                    <span>Préférences</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                <DropdownMenuItem className="cursor-pointer rounded-xl focus:bg-slate-50 dark:focus:bg-slate-800 gap-2">
                  <LifeBuoy className="h-4 w-4 text-slate-500" />
                  <span>Support technique</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                <DropdownMenuItem 
                  className="cursor-pointer rounded-xl text-red-600 focus:bg-red-50 focus:text-red-700 dark:text-red-400 dark:focus:bg-red-950/30 gap-2"
                  onClick={onLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
};

export default Sidebar;