"use client";

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/context/AuthContext';

// Example usage component
export const SidebarExample: React.FC = () => {
  const { logout, role } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <AppLayout
      userRole={role?.toLowerCase() as any || 'student'}
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        <div className="rounded-xl shadow-sm border p-8"
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderColor: 'var(--border-light)',
          boxShadow: 'var(--shadow-sm)'
        }}
        >
          <h2 className="text-3xl font-bold mb-4"
          style={{ color: 'var(--text-primary)' }}
          >
            Welcome to AIAC Intranet
          </h2>
          <p className="mb-6"
          style={{ color: 'var(--text-secondary)' }}
          >
            This is the updated responsive sidebar implementation with your custom color scheme and WCAG 2.1 AA compliance.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border rounded-xl p-6"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              borderColor: 'var(--accent)',
              borderWidth: '1px'
            }}
            >
              <h3 className="font-semibold mb-3"
              style={{ color: 'var(--primary)' }}
              >
                Responsive Design
              </h3>
              <p className="text-sm"
              style={{ color: 'var(--text-secondary)' }}
              >
                Sidebar collapses to hamburger menu on mobile devices (≤768px)
              </p>
            </div>
            
            <div className="border rounded-xl p-6"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              borderColor: 'var(--accent)',
              borderWidth: '1px'
            }}
            >
              <h3 className="font-semibold mb-3"
              style={{ color: 'var(--primary)' }}
              >
                WCAG AA Compliant
              </h3>
              <p className="text-sm"
              style={{ color: 'var(--text-secondary)' }}
              >
                All colors meet 4.5:1 contrast ratio requirements with your custom palette
              </p>
            </div>
            
            <div className="border rounded-xl p-6"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              borderColor: 'var(--accent)',
              borderWidth: '1px'
            }}
            >
              <h3 className="font-semibold mb-3"
              style={{ color: 'var(--primary)' }}
              >
                Custom Colors
              </h3>
              <p className="text-sm"
              style={{ color: 'var(--text-secondary)' }}
              >
                Implemented with your specified color scheme and smooth transitions
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl shadow-sm border p-8"
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderColor: 'var(--border-light)',
          boxShadow: 'var(--shadow-sm)'
        }}
        >
          <h3 className="text-2xl font-semibold mb-6"
          style={{ color: 'var(--text-primary)' }}
          >
            Your Custom Color Palette
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div className="text-center">
              <div className="w-full h-20 rounded-xl mb-3 border"
              style={{ 
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border-medium)'
              }}
              ></div>
              <p className="text-sm font-medium"
              style={{ color: 'var(--text-primary)' }}
              >
                Background
              </p>
              <p className="text-xs"
              style={{ color: 'var(--text-tertiary)' }}
              >
                #ffffff
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-full h-20 rounded-xl mb-3"
              style={{ backgroundColor: 'var(--foreground)' }}
              ></div>
              <p className="text-sm font-medium"
              style={{ color: 'var(--text-primary)' }}
              >
                Foreground
              </p>
              <p className="text-xs"
              style={{ color: 'var(--text-tertiary)' }}
              >
                #000000
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-full h-20 rounded-xl mb-3"
              style={{ backgroundColor: 'var(--text)' }}
              ></div>
              <p className="text-sm font-medium"
              style={{ color: 'var(--text-primary)' }}
              >
                Text
              </p>
              <p className="text-xs"
              style={{ color: 'var(--text-tertiary)' }}
              >
                #020522
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-full h-20 rounded-xl mb-3"
              style={{ backgroundColor: 'var(--primary)' }}
              ></div>
              <p className="text-sm font-medium"
              style={{ color: 'var(--text-primary)' }}
              >
                Primary
              </p>
              <p className="text-xs"
              style={{ color: 'var(--text-tertiary)' }}
              >
                #000d3a
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-full h-20 rounded-xl mb-3"
              style={{ backgroundColor: 'var(--secondary)' }}
              ></div>
              <p className="text-sm font-medium"
              style={{ color: 'var(--text-primary)' }}
              >
                Secondary
              </p>
              <p className="text-xs"
              style={{ color: 'var(--text-tertiary)' }}
              >
                #ffd800
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-full h-20 rounded-xl mb-3"
              style={{ backgroundColor: 'var(--accent)' }}
              ></div>
              <p className="text-sm font-medium"
              style={{ color: 'var(--text-primary)' }}
              >
                Accent
              </p>
              <p className="text-xs"
              style={{ color: 'var(--text-tertiary)' }}
              >
                #576cab
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl shadow-sm border p-8"
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderColor: 'var(--border-light)',
          boxShadow: 'var(--shadow-sm)'
        }}
        >
          <h3 className="text-2xl font-semibold mb-6"
          style={{ color: 'var(--text-primary)' }}
          >
            Design Specifications
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold mb-4"
              style={{ color: 'var(--primary)' }}
              >
                Responsive Breakpoints
              </h4>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between">
                  <code className="px-3 py-1 rounded-lg"
                  style={{ 
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)'
                  }}
                  >
                    Mobile:
                  </code>
                  <span style={{ color: 'var(--text-secondary)' }}>≤768px</span>
                </li>
                <li className="flex justify-between">
                  <code className="px-3 py-1 rounded-lg"
                  style={{ 
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)'
                  }}
                  >
                    Tablet:
                  </code>
                  <span style={{ color: 'var(--text-secondary)' }}>769px - 1024px</span>
                </li>
                <li className="flex justify-between">
                  <code className="px-3 py-1 rounded-lg"
                  style={{ 
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)'
                  }}
                  >
                    Desktop:
                  </code>
                  <span style={{ color: 'var(--text-secondary)' }}>≥1025px</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4"
              style={{ color: 'var(--primary)' }}
              >
                Sidebar Dimensions
              </h4>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between">
                  <code className="px-3 py-1 rounded-lg"
                  style={{ 
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)'
                  }}
                  >
                    Expanded:
                  </code>
                  <span style={{ color: 'var(--text-secondary)' }}>280px</span>
                </li>
                <li className="flex justify-between">
                  <code className="px-3 py-1 rounded-lg"
                  style={{ 
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)'
                  }}
                  >
                    Collapsed:
                  </code>
                  <span style={{ color: 'var(--text-secondary)' }}>64px</span>
                </li>
                <li className="flex justify-between">
                  <code className="px-3 py-1 rounded-lg"
                  style={{ 
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)'
                  }}
                  >
                    Mobile:
                  </code>
                  <span style={{ color: 'var(--text-secondary)' }}>320px (85% max)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-xl shadow-sm border p-8"
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderColor: 'var(--border-light)',
          boxShadow: 'var(--shadow-sm)'
        }}
        >
          <h3 className="text-2xl font-semibold mb-6"
          style={{ color: 'var(--text-primary)' }}
          >
            Accessibility Features
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold"
              style={{ color: 'var(--primary)' }}
              >
                WCAG 2.1 AA Compliance
              </h4>
              <ul className="space-y-2 text-sm"
              style={{ color: 'var(--text-secondary)' }}
              >
                <li>• Minimum 4.5:1 contrast ratio</li>
                <li>• Focus indicators on all interactive elements</li>
                <li>• Screen reader compatible</li>
                <li>• Keyboard navigation support</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold"
              style={{ color: 'var(--primary)' }}
              >
                Responsive Features
              </h4>
              <ul className="space-y-2 text-sm"
              style={{ color: 'var(--text-secondary)' }}
              >
                <li>• Touch-friendly mobile interface</li>
                <li>• Smooth transitions and animations</li>
                <li>• Reduced motion support</li>
                <li>• Cross-browser compatibility</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default SidebarExample;