import React from 'react';
import { Link, Outlet } from '@tanstack/react-router';
import { 
  Home, 
  Users, 
  Calendar, 
  Package, 
  CreditCard, 
  Settings, 
  LogOut, 
  Bell, 
  Clock, 
  User,
  BarChart,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  Zap
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { useState } from 'react';

const DashboardLayout = () => {
  const { user, isAdmin, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Admin navigation items
  const adminNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Clients', href: '/dashboard/clients', icon: Users },
    { name: 'Plans', href: '/dashboard/plans', icon: Package },
    { name: 'Reservations', href: '/dashboard/reservations', icon: Calendar },
    { name: 'Check-In', href: '/dashboard/visits/check-in', icon: Clock },
    { name: 'Payments', href: '/dashboard/payments', icon: CreditCard },
    { name: 'Notifications', href: '/dashboard/notifications/create', icon: Bell },
    { name: 'Reports', href: '/dashboard/reports', icon: BarChart },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  // Regular user navigation items
  const userNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'My Plans', href: '/dashboard/client/plans', icon: Package },
    { name: 'Make Reservation', href: '/dashboard/reservations/create', icon: Calendar },
    { name: 'Make Payment', href: '/dashboard/payments/create', icon: CreditCard },
    { name: 'Register Child', href: '/dashboard/client/register-child', icon: Users },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  // Use the appropriate navigation items based on user role
  const navItems = isAdmin ? adminNavItems : userNavItems;

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out md:relative
          ${sidebarOpen ? 'w-64 translate-x-0 shadow-lg' : '-translate-x-full md:translate-x-0 md:w-20'}
          bg-gradient-to-b from-gray-800 to-gray-900 border-r border-gray-700`}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar header */}
          <div className="flex items-center justify-between h-16 px-4 bg-gray-900 border-b border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-emerald-500 p-2 rounded-md">
                <Home className="h-5 w-5 text-white" />
              </div>
              <h1 className={`ml-2 text-xl font-bold text-white transition-opacity duration-200 ${!sidebarOpen && 'md:opacity-0'}`}>
                CasaEnElArbol
              </h1>
            </div>
            <button 
              className="text-gray-400 hover:text-white md:hidden"
              onClick={toggleSidebar}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Sidebar toggle button (visible on desktop) */}
          <button 
            onClick={toggleSidebar}
            className="hidden md:flex absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1 text-gray-600 hover:bg-gray-100 shadow-md focus:outline-none transform transition-transform hover:scale-110"
          >
            {sidebarOpen ? 
              <ChevronLeft className="h-4 w-4" /> : 
              <ChevronRight className="h-4 w-4" />
            }
          </button>

          {/* Section Label */}
          <div className={`px-4 pt-4 pb-2 ${!sidebarOpen && 'md:opacity-0'}`}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Main Menu
            </p>
          </div>

          {/* Sidebar navigation */}
          <div className="flex-1 overflow-y-auto py-2 px-2">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-3 text-sm font-medium rounded-lg whitespace-nowrap transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 text-white border-l-4 border-emerald-500'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`
                  }
                  title={item.name}
                >
                  <div className={`flex-shrink-0 ${isActive => isActive ? 'text-emerald-400' : 'text-gray-400 group-hover:text-white'}`}>
                    <item.icon className={`h-5 w-5 ${sidebarOpen ? 'mr-3' : 'mx-auto transition-transform duration-300'}`} />
                  </div>
                  <span className={`${!sidebarOpen && 'md:hidden'} transition-opacity duration-200`}>
                    {item.name}
                  </span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Divider */}
          <div className="mx-3 my-2 border-t border-gray-700 opacity-30"></div>

          {/* User info */}
          <div className="flex-shrink-0 p-4">
            <div className="flex items-center p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700 transition-colors duration-200">
              <div className="flex-shrink-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full p-1">
                <User className="h-7 w-7 text-white" />
              </div>
              <div className={`ml-3 transition-opacity duration-200 ${!sidebarOpen && 'md:opacity-0'}`}>
                <p className="text-sm font-medium text-white truncate">
                  {user?.full_name || user?.email}
                </p>
                <p className="text-xs font-medium text-emerald-400">
                  {isAdmin ? 'Administrator' : 'User'}
                </p>
              </div>
              <button
                onClick={logout}
                className={`flex-shrink-0 bg-gray-700 p-1 rounded-full text-gray-300 hover:bg-gray-600 hover:text-white transition-all duration-200 hover:scale-105 ${
                  sidebarOpen ? 'ml-auto' : 'md:hidden ml-auto'
                }`}
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="bg-white shadow-sm z-10">
          <div className="h-16 flex items-center justify-between px-4">
            <button
              className="md:hidden text-gray-500 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-md transition-colors"
              onClick={toggleSidebar}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="md:hidden flex items-center">
              <h1 className="text-lg font-medium text-gray-900">
                {isAdmin ? 'Admin Dashboard' : 'Usuario'}
              </h1>
            </div>
            <div className="hidden md:block">
              <h1 className="text-lg font-medium text-gray-900">
                {isAdmin ? 'Administrator Dashboard' : 'Usuario'}
              </h1>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-4 hidden md:block">
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;