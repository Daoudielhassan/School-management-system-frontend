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
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border-light)' }}>
        <div className={cn(
          "flex items-center gap-3 transition-all duration-300",
          isCollapsed && !isMobile && "opacity-0 w-0 overflow-hidden"
        )}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--primary)' }}>
            <span className="text-white font-bold text-lg">AI</span>
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>AIAC Intranet</h1>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Academic Portal</p>
          </div>
        </div>
        
        {/* Desktop collapse button */}
        {!isMobile && (
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2"
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
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        )}

        {/* Mobile close button */}
        {isMobile && (
          <button
            onClick={closeMobileSidebar}
            className="p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2"
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
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
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
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                "focus:outline-none focus:ring-2",
                isCollapsed && !isMobile && "justify-center px-3"
              )}
              style={{
                backgroundColor: isActive ? 'var(--active-bg)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                '--tw-ring-color': 'var(--focus-ring)'
              } as React.CSSProperties}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className={cn(
                "w-5 h-5 transition-colors duration-200 flex-shrink-0",
                isActive ? "sidebar-icon-active" : "sidebar-icon"
              )} 
              style={{
                color: isActive ? 'var(--primary)' : 'var(--accent)'
              }}
              />
              
              <span className={cn(
                "font-medium transition-all duration-300 text-truncate",
                isCollapsed && !isMobile && "opacity-0 w-0 overflow-hidden"
              )}>
                {item.label}
              </span>

              {item.badge && (
                <span className={cn(
                  "ml-auto px-2 py-1 text-xs font-medium rounded-full transition-all duration-300",
                  isCollapsed && !isMobile && "opacity-0 w-0 overflow-hidden"
                )}
                style={{
                  backgroundColor: 'var(--secondary)',
                  color: 'var(--text-primary)'
                }}
                >
                  {item.badge}
                </span>
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && !isMobile && (
                <div className="absolute left-full ml-3 px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--text-inverse)',
                  fontSize: '14px'
                }}
                >
                  {item.label}
                  <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 w-2 h-2 rotate-45"
                  style={{ backgroundColor: 'var(--primary)' }}
                  ></div>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
        {onLogout && (
          <button
            onClick={onLogout}
            className={cn(
              "flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 group",
              "focus:outline-none focus:ring-2",
              isCollapsed && !isMobile && "justify-center px-3"
            )}
            style={{
              backgroundColor: 'transparent',
              color: 'var(--text-secondary)',
              '--tw-ring-color': 'var(--focus-ring)'
            } as React.CSSProperties}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fef2f2';
              e.currentTarget.style.color = '#dc2626';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
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
      {/* Skip Link for Accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-3 rounded-xl shadow-lg border transition-all duration-200 focus:outline-none focus:ring-2 md:hidden"
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--border-medium)',
            color: 'var(--text-primary)',
            '--tw-ring-color': 'var(--focus-ring)'
          } as React.CSSProperties}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
          }}
          aria-label="Open menu"
          aria-expanded={isOpen}
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-40 transition-opacity duration-300"
          style={{ backgroundColor: 'rgba(2, 5, 34, 0.5)' }}
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={cn(
          "border-r transition-all duration-300 ease-in-out",
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
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderColor: 'var(--border-light)',
          boxShadow: 'var(--shadow-sm)'
        }}
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
      "p-3 rounded-xl transition-all duration-200",
      "focus:outline-none focus:ring-2 md:hidden",
      className
    )}
    style={{
      backgroundColor: 'var(--hover-bg)',
      color: 'var(--text-primary)',
      '--tw-ring-color': 'var(--focus-ring)'
    } as React.CSSProperties}
    aria-label={isOpen ? "Close menu" : "Open menu"}
    aria-expanded={isOpen}
  >
    {isOpen ? (
      <X className="w-6 h-6" />
    ) : (
      <Menu className="w-6 h-6" />
    )}
  </button>
);

export default Sidebar;