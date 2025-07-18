import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Menu,
  X,
  Home,
  Calendar,
  MessageSquare,
  Users,
  Mic,
  UserCog,
  LogOut,
  Shield
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, hasPermission } = useAuth();
  const location = useLocation();

  const baseNavigation = [
    ...(user?.role === 'admin' ? [{ name: 'Dashboard', href: '/', icon: Home }] : []),
    { name: 'My Requests', href: '/requests', icon: MessageSquare, permission: 'view_assigned_requests' },
  ];

  const adminNavigation = [
    { name: 'Bookings', href: '/bookings', icon: Calendar, permission: 'manage_bookings' },
    { name: 'All Requests', href: '/requests', icon: MessageSquare, permission: 'manage_requests' },
    { name: 'Users', href: '/users', icon: Users, permission: 'manage_users' },
    { name: 'Staff Management', href: '/staff', icon: UserCog, permission: 'manage_staff' },
  ];

  const navigation = [
    ...baseNavigation,
    ...(user?.role === 'admin' ? adminNavigation : [])
  ].filter(item => !item.permission || hasPermission(item.permission));

  const getRoleColor = (role: string) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800',
      electrician: 'bg-yellow-100 text-yellow-800',
      plumber: 'bg-blue-100 text-blue-800',
      waiter: 'bg-green-100 text-green-800',
      housekeeping: 'bg-pink-100 text-pink-800',
      maintenance: 'bg-orange-100 text-orange-800',
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">ConciAI</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user?.role || '')}`}>
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        <nav className="mt-6 px-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex items-center space-x-3 px-4 py-3 mb-2 rounded-lg text-sm font-medium transition-colors duration-150
                  ${isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-4 right-4 space-y-4">
          {/* Voice Assistant Status */}
          {hasPermission('view_all') && (
            <div className="bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg p-4 text-white">
              <div className="flex items-center space-x-2 mb-2">
                <Mic className="w-5 h-5" />
                <span className="font-semibold">Voice Assistant</span>
              </div>
              <p className="text-sm text-blue-100">
                AI is active and monitoring voice commands
              </p>
              <div className="flex items-center space-x-1 mt-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs">Online</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-900">{user?.name}</span>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user?.role || '')}`}>
                {user?.role}
              </span>
              {/* Sign Out button in navbar */}
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors ml-4"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}