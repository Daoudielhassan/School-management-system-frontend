"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Menu,
  X,
  Home,
  Users,
  Calendar,
  BookOpen,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: SidebarItem[];
}

interface SidebarProps {
  items: SidebarItem[];
  onLogout?: () => void;
  className?: string;
  defaultCollapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  onLogout,
  className,
  defaultCollapsed = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
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

  // Handle click outside to close mobile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobile &&
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobile && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobile, isOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, isOpen]);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsOpen(!isOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const closeMobileSidebar = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const isActiveLink = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className={cn(
          "flex items-center gap-3 transition-all duration-300",
          isCollapsed && !isMobile && "opacity-0 w-0 overflow-hidden"
        )}>
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">AIAC Intranet</h1>
            <p className="text-xs text-gray-500">Academic Portal</p>
          </div>
        </div>
        
        {/* Desktop collapse button */}
        {!isMobile && (
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            )}
          </button>
        )}

        {/* Mobile close button */}
        {isMobile && (
          <button
            onClick={closeMobileSidebar}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {items.map((item) => {
          const isActive = isActiveLink(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={closeMobileSidebar}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500",
                isActive && "bg-blue-50 text-blue-700 border border-blue-200",
                !isActive && "text-gray-700 hover:text-gray-900",
                isCollapsed && !isMobile && "justify-center px-2"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className={cn(
                "w-5 h-5 transition-colors duration-200 flex-shrink-0",
                isActive && "text-blue-600",
                !isActive && "text-gray-500 group-hover:text-gray-700"
              )} />
              
              <span className={cn(
                "font-medium transition-all duration-300 text-truncate",
                isCollapsed && !isMobile && "opacity-0 w-0 overflow-hidden"
              )}>
                {item.label}
              </span>

              {item.badge && (
                <span className={cn(
                  "ml-auto px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full transition-all duration-300",
                  isCollapsed && !isMobile && "opacity-0 w-0 overflow-hidden"
                )}>
                  {item.badge}
                </span>
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && !isMobile && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                  <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        {onLogout && (
          <button
            onClick={onLogout}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all duration-200 group",
              "text-gray-700 hover:text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500",
              isCollapsed && !isMobile && "justify-center px-2"
            )}
          >
            <LogOut className="w-5 h-5 transition-colors duration-200 flex-shrink-0" />
            <span className={cn(
              "font-medium transition-all duration-300",
              isCollapsed && !isMobile && "opacity-0 w-0 overflow-hidden"
            )}>
              Sign Out
            </span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 md:hidden"
          aria-label="Open menu"
          aria-expanded={isOpen}
        >
          <Menu className="w-5 h-5 text-gray-700" />
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          ref={overlayRef}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={cn(
          "bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
          "flex flex-col h-screen overflow-hidden",
          // Mobile styles
          isMobile && [
            "fixed top-0 left-0 z-50 w-80 max-w-[85vw]",
            "transform transition-transform duration-300 ease-in-out",
            isOpen ? "translate-x-0" : "-translate-x-full"
          ],
          // Desktop styles
          !isMobile && [
            "relative",
            isCollapsed ? "w-16" : "w-70",
          ],
          className
        )}
        aria-label="Main navigation"
        role="navigation"
      >
        <SidebarContent />
      </aside>
    </>
  );
};

// Mobile Menu Button Component (for external use)
export const MobileMenuButton: React.FC<{
  onClick: () => void;
  isOpen: boolean;
  className?: string;
}> = ({ onClick, isOpen, className }) => (
  <button
    onClick={onClick}
    className={cn(
      "p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200",
      "focus:outline-none focus:ring-2 focus:ring-blue-500 md:hidden",
      className
    )}
    aria-label={isOpen ? "Close menu" : "Open menu"}
    aria-expanded={isOpen}
  >
    {isOpen ? (
      <X className="w-5 h-5 text-gray-700" />
    ) : (
      <Menu className="w-5 h-5 text-gray-700" />
    )}
  </button>
);

export default Sidebar;