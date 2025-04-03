import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from "@tanstack/react-router";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, CheckCircle, DollarSign, Users, Clock, PlusCircle, List, AlertCircle, CreditCard, User, BookOpen, Home } from 'lucide-react';
// Simulating the DashboardService for the component
// This would be imported from your actual service in a real application
import { DashboardService } from '../../client/services';

// Import ShadCN UI components
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Fetch dashboard metrics with auto-refresh
  const { 
    data: metrics, 
    isLoading: metricsLoading,
    isError: metricsError,
    error: metricsErrorData
  } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: () => DashboardService.getDashboardMetrics(),
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    retry: 3,
    staleTime: 20000,
  });
  
  // Fetch active visits
  const { 
    data: activeVisits, 
    isLoading: visitsLoading,
    isError: visitsError,
    error: visitsErrorData
  } = useQuery({
    queryKey: ['activeVisits'],
    queryFn: () => DashboardService.getAllActiveVisits({ limit: 100 }),
    refetchInterval: 15000, // Refresh every 15 seconds
    retry: 3,
    staleTime: 10000,
  });
  
  // Checkout client mutation
  const checkOutMutation = useMutation({
    mutationFn: DashboardService.checkOutClient,
    onSuccess: () => {
      queryClient.invalidateQueries(['activeVisits']);
      queryClient.invalidateQueries(['dashboardMetrics']);
      // Show success toast/notification
    },
    onError: (error) => {
      console.error('Error checking out client:', error);
      // Show error toast/notification
    }
  });
  
  // Handle client checkout
  const handleCheckOut = (visitId) => {
    checkOutMutation.mutate({ visit_id: visitId });
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    // Explicitly handle UTC date string
    // If the string has a 'Z' at the end, it's already in UTC format
    // Otherwise, we'll assume it's a UTC date without the Z indicator
    const ensuredUTCString = dateString.endsWith('Z') 
      ? dateString 
      : `${dateString}Z`;
    
    // Create a date object from the UTC string
    const date = new Date(ensuredUTCString);
    
    // Format in local timezone
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Format time for display
  const formatTime = (dateString) => {
    if (!dateString) return '';
    
    // Explicitly handle UTC time string
    // If the string has a 'Z' at the end, it's already in UTC format
    // Otherwise, we'll assume it's a UTC time without the Z indicator
    const ensuredUTCString = dateString.endsWith('Z') 
      ? dateString 
      : `${dateString}Z`;
    
    // Create a date object from the UTC string
    const date = new Date(ensuredUTCString);
    
    // Format in local timezone
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  // Calculate time elapsed since check-in
  const getTimeElapsed = (checkInTime) => {
    if (!checkInTime) return '';
    
    // Explicitly handle UTC time string
    // If the string has a 'Z' at the end, it's already in UTC format
    // Otherwise, we'll assume it's a UTC time without the Z indicator
    const ensuredUTCString = checkInTime.endsWith('Z') 
      ? checkInTime 
      : `${checkInTime}Z`;
    
    // Create a date object from the UTC string
    const checkIn = new Date(ensuredUTCString);
    const now = new Date();
    const diffMs = now - checkIn;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHrs}h ${diffMins}m`;
  };
  
  // Currency formatter
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Error display component
  const ErrorDisplay = ({ title, error }) => (
    <Alert variant="destructive">
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        {error?.message || "An unexpected error occurred"}
        <Button 
          variant="outline" 
          className="mt-2"
          onClick={() => queryClient.invalidateQueries()}
        >
          Try Again
        </Button>
      </AlertDescription>
    </Alert>
  );

  // Load sample data for demo purposes
  const demoData = {
    active_clients: 254,
    current_visits: 18,
    today_revenue: 1250.75,
    visits_by_day: [
      {day: "2025-02-23", visit_count: 42},
      {day: "2025-02-24", visit_count: 38},
      {day: "2025-02-25", visit_count: 45},
      {day: "2025-02-26", visit_count: 39},
      {day: "2025-02-27", visit_count: 52},
      {day: "2025-02-28", visit_count: 68},
      {day: "2025-03-01", visit_count: 57}
    ],
    revenue_by_day: [
      {day: "2025-02-23", amount: 980.50},
      {day: "2025-02-24", amount: 875.25},
      {day: "2025-02-25", amount: 1120.00},
      {day: "2025-02-26", amount: 940.75},
      {day: "2025-02-27", amount: 1340.50},
      {day: "2025-02-28", amount: 1680.25},
      {day: "2025-03-01", amount: 1250.75}
    ],
    subscription_stats: {
      active: 156,
      expired: 43,
      expiring_soon: 12
    },
    top_plans: [
      {id: "123e4567-e89b-12d3-a456-426614174001", name: "Monthly Unlimited", subscriptions: 87},
      {id: "123e4567-e89b-12d3-a456-426614174002", name: "Family Package", subscriptions: 45},
      {id: "123e4567-e89b-12d3-a456-426614174003", name: "Weekend Pass", subscriptions: 24},
      {id: "123e4567-e89b-12d3-a456-426614174004", name: "Student Plan", subscriptions: 18}
    ]
  };

  const demoVisits = [
    {id: "123e4567-e89b-12d3-a456-426614174001", client_id: "223e4567-e89b-12d3-a456-426614174001", check_in: "2025-03-01T08:30:00Z", client_name: "Emma Johnson"},
    {id: "123e4567-e89b-12d3-a456-426614174002", client_id: "223e4567-e89b-12d3-a456-426614174002", check_in: "2025-03-01T09:15:00Z", client_name: "Michael Smith"},
    {id: "123e4567-e89b-12d3-a456-426614174003", client_id: "223e4567-e89b-12d3-a456-426614174003", check_in: "2025-03-01T10:00:00Z", client_name: "Sophia Williams"},
    {id: "123e4567-e89b-12d3-a456-426614174004", client_id: "223e4567-e89b-12d3-a456-426614174004", check_in: "2025-03-01T10:45:00Z", client_name: "James Brown"},
    {id: "123e4567-e89b-12d3-a456-426614174005", client_id: "223e4567-e89b-12d3-a456-426614174005", check_in: "2025-03-01T11:30:00Z", client_name: "Olivia Davis"}
  ];

  // Use demo data if the real data is loading (for preview purposes)
  const displayMetrics = metricsLoading ? demoData : metrics || demoData;
  const displayVisits = visitsLoading ? demoVisits : activeVisits || demoVisits;

  return (
    
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Administrator Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Today: {new Date().toLocaleDateString()}</span>
              <Badge variant="secondary">Admin</Badge>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-grow p-6">
        {/* Navigation tabs */}
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="mb-6"
        >
          <TabsList className="bg-white shadow rounded-lg">
            <TabsTrigger value="overview" className="flex items-center">
              <BookOpen className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="visits" className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              Active Visits
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            {metricsError ? (
              <ErrorDisplay title="Error Loading Dashboard Data" error={metricsErrorData} />
            ) : (
              <>
                {/* Key metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <Card>
                    <CardContent className="p-6 flex items-center">
                      <div className="rounded-full bg-blue-100 p-3 mr-4">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Active Clients</p>
                        <p className="text-2xl font-semibold text-gray-900">{displayMetrics.active_clients}</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6 flex items-center">
                      <div className="rounded-full bg-green-100 p-3 mr-4">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Current Visits</p>
                        <p className="text-2xl font-semibold text-gray-900">{displayMetrics.current_visits}</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6 flex items-center">
                      <div className="rounded-full bg-purple-100 p-3 mr-4">
                        <DollarSign className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {formatCurrency(displayMetrics.today_revenue)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Subscription stats */}
                <Card className="mb-6">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle>Subscription Stats</CardTitle>
                    <Link
                      to="/dashboard/subscriptions"
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      View All <span className="ml-1">→</span>
                    </Link>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-green-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-green-700">Active Subscriptions</p>
                        <p className="text-2xl font-semibold text-green-900">
                          {displayMetrics.subscription_stats.active}
                        </p>
                      </div>
                      
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-yellow-700">Expiring Soon</p>
                        <p className="text-2xl font-semibold text-yellow-900">
                          {displayMetrics.subscription_stats.expiring_soon}
                        </p>
                      </div>
                      
                      <div className="bg-red-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-red-700">Expired</p>
                        <p className="text-2xl font-semibold text-red-900">
                          {displayMetrics.subscription_stats.expired}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Charts section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Visits by day chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Daily Visits (Last 7 Days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-60">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={displayMetrics.visits_by_day}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="day" 
                              tickFormatter={formatDate}
                            />
                            <YAxis />
                            <Tooltip 
                              formatter={(value) => [`${value} visits`, 'Visits']}
                              labelFormatter={formatDate}
                            />
                            <Bar dataKey="visit_count" fill="#3b82f6" name="Visits" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Revenue by day chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Daily Revenue (Last 7 Days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-60">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={displayMetrics.revenue_by_day}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="day" 
                              tickFormatter={formatDate}
                            />
                            <YAxis />
                            <Tooltip 
                              formatter={(value) => [formatCurrency(value), 'Revenue']}
                              labelFormatter={formatDate}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="amount" 
                              stroke="#8b5cf6" 
                              strokeWidth={2}
                              name="Revenue" 
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Top plans */}
                <Card className="mb-6">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle>Popular Plans</CardTitle>
                    <Link
                      to="/dashboard/plans"
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      Manage Plans <span className="ml-1">→</span>
                    </Link>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Plan Name</TableHead>
                          <TableHead>Active Subscriptions</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {displayMetrics.top_plans.map((plan) => (
                          <TableRow key={plan.id}>
                            <TableCell className="font-medium">{plan.name}</TableCell>
                            <TableCell>{plan.subscriptions}</TableCell>
                            <TableCell className="text-right">
                              <Link
                                to="/dashboard/plans/$planId"
                                params={{ planId: plan.id }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                View
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
                
                {/* Action buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <Link
                    to="/dashboard/clients/register"
                    className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center shadow-sm hover:shadow transition"
                  >
                    <User className="h-6 w-6 text-blue-600 mb-2" />
                    <span className="text-sm font-medium">New Client</span>
                  </Link>
                  
                  <Link
                    to="/dashboard/reservations/create"
                    className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center shadow-sm hover:shadow transition"
                  >
                    <Calendar className="h-6 w-6 text-green-600 mb-2" />
                    <span className="text-sm font-medium">New Reservation</span>
                  </Link>
                  
                  <Link
                    to="/dashboard/payments/create"
                    className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center shadow-sm hover:shadow transition"
                  >
                    <CreditCard className="h-6 w-6 text-purple-600 mb-2" />
                    <span className="text-sm font-medium">Process Payment</span>
                  </Link>
                  
                  <Link
                    to="/dashboard/notifications/create"
                    className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center shadow-sm hover:shadow transition"
                  >
                    <AlertCircle className="h-6 w-6 text-red-600 mb-2" />
                    <span className="text-sm font-medium">Send Notification</span>
                  </Link>
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="visits">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Active Visits</CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => queryClient.invalidateQueries(['activeVisits'])}
                    className="flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </Button>
                  <Link to="/dashboard/visits/check-in">
                    <Button size="sm" className="flex items-center">
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Check In Client
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {visitsError ? (
                  <ErrorDisplay title="Error Loading Active Visits" error={visitsErrorData} />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Check In</TableHead>
                        <TableHead>Time Elapsed</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayVisits.map((visit) => (
                        <TableRow key={visit.id}>
                          <TableCell>
                            <div className="font-medium">{visit.client_name}</div>
                            <div className="text-sm text-gray-500">ID: {visit.client_id}</div>
                          </TableCell>
                          <TableCell>
                            <div>{formatTime(visit.check_in)}</div>
                            <div className="text-sm text-gray-500">{formatDate(visit.check_in)}</div>
                          </TableCell>
                          <TableCell>{getTimeElapsed(visit.check_in)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant={checkOutMutation.isPending && checkOutMutation.variables?.visit_id === visit.id ? "secondary" : "default"}
                              size="sm"
                              onClick={() => handleCheckOut(visit.id)}
                              disabled={checkOutMutation.isPending && checkOutMutation.variables?.visit_id === visit.id}
                            >
                              {checkOutMutation.isPending && checkOutMutation.variables?.visit_id === visit.id
                                ? 'Processing...'
                                : 'Check Out'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Navigation footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-5 gap-4">
            <Link
              to="/dashboard"
              className="flex flex-col items-center justify-center text-gray-500 hover:text-blue-600"
            >
              <Home className="h-5 w-5" />
              <span className="text-xs mt-1">Dashboard</span>
            </Link>
            
            <Link
              to="/dashboard/clients"
              className="flex flex-col items-center justify-center text-gray-500 hover:text-blue-600"
            >
              <Users className="h-5 w-5" />
              <span className="text-xs mt-1">Clients</span>
            </Link>
            
            <Link
              to="/dashboard/plans"
              className="flex flex-col items-center justify-center text-gray-500 hover:text-blue-600"
            >
              <List className="h-5 w-5" />
              <span className="text-xs mt-1">Plans</span>
            </Link>
            
            <Link
              to="/dashboard/reservations"
              className="flex flex-col items-center justify-center text-gray-500 hover:text-blue-600"
            >
              <Calendar className="h-5 w-5" />
              <span className="text-xs mt-1">Reservations</span>
            </Link>
            
            <Link
              to="/dashboard/reports"
              className="flex flex-col items-center justify-center text-gray-500 hover:text-blue-600"
            >
              <DollarSign className="h-5 w-5" />
              <span className="text-xs mt-1">Reports</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;