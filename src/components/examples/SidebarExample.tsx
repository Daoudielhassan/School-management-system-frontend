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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome to AIAC Intranet
          </h2>
          <p className="text-gray-600 mb-6">
            This is an example of the responsive sidebar implementation with WCAG 2.1 AA compliance.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Responsive Design</h3>
              <p className="text-blue-700 text-sm">
                Sidebar collapses to hamburger menu on mobile devices (≤768px)
              </p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">WCAG AA Compliant</h3>
              <p className="text-green-700 text-sm">
                All colors meet 4.5:1 contrast ratio requirements
              </p>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-2">Smooth Transitions</h3>
              <p className="text-purple-700 text-sm">
                Cubic-bezier animations with reduced motion support
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Design Specifications
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Breakpoints</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><code className="bg-gray-100 px-2 py-1 rounded">Mobile:</code> ≤768px</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">Tablet:</code> 769px - 1024px</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">Desktop:</code> ≥1025px</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Sidebar Dimensions</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><code className="bg-gray-100 px-2 py-1 rounded">Expanded:</code> 280px</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">Collapsed:</code> 64px</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">Mobile:</code> 320px (85% max-width)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Color Palette (WCAG AA Compliant)
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="w-full h-16 bg-blue-600 rounded-lg mb-2"></div>
              <p className="text-xs font-medium text-gray-900">Primary</p>
              <p className="text-xs text-gray-500">#2563eb</p>
            </div>
            
            <div className="text-center">
              <div className="w-full h-16 bg-gray-600 rounded-lg mb-2"></div>
              <p className="text-xs font-medium text-gray-900">Secondary</p>
              <p className="text-xs text-gray-500">#4b5563</p>
            </div>
            
            <div className="text-center">
              <div className="w-full h-16 bg-green-600 rounded-lg mb-2"></div>
              <p className="text-xs font-medium text-gray-900">Accent</p>
              <p className="text-xs text-gray-500">#059669</p>
            </div>
            
            <div className="text-center">
              <div className="w-full h-16 bg-white border border-gray-300 rounded-lg mb-2"></div>
              <p className="text-xs font-medium text-gray-900">Background</p>
              <p className="text-xs text-gray-500">#ffffff</p>
            </div>
            
            <div className="text-center">
              <div className="w-full h-16 bg-gray-900 rounded-lg mb-2"></div>
              <p className="text-xs font-medium text-gray-900">Text Primary</p>
              <p className="text-xs text-gray-500">#0f172a</p>
            </div>
            
            <div className="text-center">
              <div className="w-full h-16 bg-gray-600 rounded-lg mb-2"></div>
              <p className="text-xs font-medium text-gray-900">Text Secondary</p>
              <p className="text-xs text-gray-500">#334155</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default SidebarExample;