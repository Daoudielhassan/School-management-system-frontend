'use client';

import { useAuth } from '@/context/AuthContext';

export default function ManagerDashboard() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Manager Dashboard</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={logout}
                className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Department Overview Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <h3 className="text-lg font-medium text-gray-900">Department Overview</h3>
                <p className="mt-1 text-sm text-gray-500">
                  View department statistics and performance metrics
                </p>
              </div>
            </div>

            {/* Staff Management Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <h3 className="text-lg font-medium text-gray-900">Staff Management</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Manage faculty and staff assignments
                </p>
              </div>
            </div>

            {/* Resource Allocation Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <h3 className="text-lg font-medium text-gray-900">Resource Allocation</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Manage department resources and budgets
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 