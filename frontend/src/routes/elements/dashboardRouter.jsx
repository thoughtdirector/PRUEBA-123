import React from 'react';
import { Navigate } from '@tanstack/react-router';
import useAuth from '../../hooks/useAuth';
import AdminDashboard from './dashboard';
// import UserDashboard from './userDashboard';
import TempDashboard from '../../components/Temp/TempDashboard';

const DashboardRouter = () => {
  const { user, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // If the user is an admin, show the admin dashboard
  if (isAdmin) {
    return <AdminDashboard />;
  }

  // Otherwise, show the temporary dashboard instead of user dashboard
  // return <UserDashboard />;
  return <TempDashboard />;
};

export default DashboardRouter; 