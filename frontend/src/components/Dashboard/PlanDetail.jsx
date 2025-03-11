import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Edit, Trash2, Users, CreditCard, Clock, Calendar } from 'lucide-react';
import { DashboardService } from '../../client/services';

// Import ShadCN UI components
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const PlanDetail = () => {
  const { planId } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Fetch plan details
  const { 
    data: plan, 
    isLoading: planLoading,
    isError: planError,
    error: planErrorData
  } = useQuery({
    queryKey: ['plan', planId],
    queryFn: () => DashboardService.getPlan({ id: planId }),
  });
  
  // Fetch subscriptions for this plan
  const { 
    data: subscriptions, 
    isLoading: subscriptionsLoading,
    isError: subscriptionsError,
    error: subscriptionsErrorData
  } = useQuery({
    queryKey: ['planSubscriptions', planId],
    queryFn: () => DashboardService.getPlanSubscriptions({ plan_id: planId }),
  });
  
  // Update plan status mutation
  const updatePlanStatusMutation = useMutation({
    mutationFn: (data) => DashboardService.updatePlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['plan', planId]);
    },
  });
  
  // Delete plan mutation
  const deletePlanMutation = useMutation({
    mutationFn: () => DashboardService.deletePlan({ id: planId }),
    onSuccess: () => {
      navigate({ to: '/dashboard/plans' });
    },
  });
  
  const handleToggleStatus = () => {
    if (plan) {
      updatePlanStatusMutation.mutate({
        id: plan.id,
        is_active: !plan.is_active
      });
    }
  };
  
  const handleDeletePlan = () => {
    deletePlanMutation.mutate();
    setIsDeleteDialogOpen(false);
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  if (planLoading) {
    return (
      <div className="container mx-auto py-6 max-w-5xl">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="icon" asChild className="mr-4">
            <Link to="/dashboard/plans">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Loading Plan Details...</h1>
        </div>
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  if (planError || !plan) {
    return (
      <div className="container mx-auto py-6 max-w-5xl">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="icon" asChild className="mr-4">
            <Link to="/dashboard/plans">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Plan Details</h1>
        </div>
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {planErrorData?.message || "Failed to load plan details"}
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={() => navigate({ to: '/dashboard/plans' })}
            >
              Return to Plans
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <div className="flex items-center mb-6">
        <Button variant="outline" size="icon" asChild className="mr-4">
          <Link to="/dashboard/plans">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Plan Details</h1>
      </div>
      
      <div className="bg-white border rounded-lg shadow-sm mb-6">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold">{plan.name}</h2>
              <p className="text-gray-500 mt-1">{plan.description}</p>
            </div>
            <Badge variant={plan.is_active ? "default" : "secondary"}>
              {plan.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <CreditCard className="h-8 w-8 text-primary mb-2" />
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="text-2xl font-bold">{formatCurrency(plan.price)}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <Calendar className="h-8 w-8 text-green-500 mb-2" />
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="text-2xl font-bold">
                    {plan.duration_days ? `${plan.duration_days} days` : 'N/A'}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <Clock className="h-8 w-8 text-blue-500 mb-2" />
                  <p className="text-sm text-gray-500">Hours per Visit</p>
                  <p className="text-2xl font-bold">
                    {plan.duration_hours ? `${plan.duration_hours} hours` : 'Unlimited'}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <Users className="h-8 w-8 text-purple-500 mb-2" />
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="text-2xl font-bold">
                    {plan.is_class_plan ? `Class Plan (${plan.max_classes} classes)` : 'Time-based Plan'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Add the addons section */}
          {plan.addons && Object.keys(plan.addons).length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Available Add-ons</h3>
              <Card>
                <CardContent className="pt-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Add-on Name</TableHead>
                        <TableHead>Price per Unit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(plan.addons).map(([name, price]) => (
                        <TableRow key={name}>
                          <TableCell>{name}</TableCell>
                          <TableCell>{formatCurrency(price)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
          
          <div className="flex justify-between">
            <div className="space-x-2">
              <Button 
                variant={plan.is_active ? "outline" : "default"}
                onClick={handleToggleStatus}
                disabled={updatePlanStatusMutation.isPending}
              >
                {plan.is_active ? "Deactivate Plan" : "Activate Plan"}
              </Button>
              <Button 
                variant="outline" 
                asChild
              >
                <Link to={`/dashboard/plans/${plan.id}/edit`} className="flex items-center">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Plan
                </Link>
              </Button>
            </div>
            
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="flex items-center">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Plan
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Plan</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this plan? This action cannot be undone.
                    {subscriptions && subscriptions.length > 0 && (
                      <Alert variant="warning" className="mt-4">
                        <AlertTitle>Warning</AlertTitle>
                        <AlertDescription>
                          This plan has {subscriptions.length} active subscriptions. 
                          Deleting it may affect existing clients.
                        </AlertDescription>
                      </Alert>
                    )}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDeleteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeletePlan}
                    disabled={deletePlanMutation.isPending}
                  >
                    {deletePlanMutation.isPending ? "Deleting..." : "Delete Plan"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Plan Overview</CardTitle>
              <CardDescription>
                Detailed information about the plan and its usage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Plan Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{plan.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="font-medium">{formatCurrency(plan.price)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-medium">
                      <Badge variant={plan.is_active ? "success" : "secondary"}>
                        {plan.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="font-medium">
                      {plan.is_class_plan ? "Class-based Plan" : "Time-based Plan"}
                    </p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <p className="text-gray-700">{plan.description}</p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-2">Plan Terms</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plan.duration_days && (
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="font-medium">{plan.duration_days} days</p>
                    </div>
                  )}
                  
                  {plan.duration_hours && (
                    <div>
                      <p className="text-sm text-gray-500">Hours per Visit</p>
                      <p className="font-medium">{plan.duration_hours} hours</p>
                    </div>
                  )}
                  
                  {plan.is_class_plan && plan.max_classes && (
                    <div>
                      <p className="text-sm text-gray-500">Maximum Classes</p>
                      <p className="font-medium">{plan.max_classes} classes</p>
                    </div>
                  )}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-2">Usage Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-blue-700">Active Subscriptions</p>
                    <p className="text-2xl font-semibold text-blue-900">
                      {subscriptionsLoading ? '...' : 
                       subscriptionsError ? 'Error' : 
                       subscriptions.filter(s => s.is_active).length}
                    </p>
                  </div>
                  
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-yellow-700">Expiring Soon</p>
                    <p className="text-2xl font-semibold text-yellow-900">
                      {subscriptionsLoading ? '...' : 
                       subscriptionsError ? 'Error' : 
                       subscriptions.filter(s => {
                         const now = new Date();
                         const expiryDate = new Date(s.end_date);
                         const sevenDaysFromNow = new Date();
                         sevenDaysFromNow.setDate(now.getDate() + 7);
                         return s.is_active && expiryDate <= sevenDaysFromNow && expiryDate > now;
                       }).length}
                    </p>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-green-700">Total Revenue</p>
                    <p className="text-2xl font-semibold text-green-900">
                      {subscriptionsLoading ? '...' : 
                       subscriptionsError ? 'Error' : 
                       formatCurrency(subscriptions.reduce((sum, sub) => sum + sub.total_cost, 0))}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="subscriptions">
          <Card>
            <CardHeader>
              <CardTitle>Active Subscriptions</CardTitle>
              <CardDescription>
                Clients currently subscribed to this plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subscriptionsError ? (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    {subscriptionsErrorData?.message || "Failed to load subscriptions"}
                  </AlertDescription>
                </Alert>
              ) : subscriptionsLoading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : subscriptions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No active subscriptions for this plan.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client Group</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((subscription) => (
                      <TableRow key={subscription.id}>
                        <TableCell className="font-medium">
                          {subscription.client_group_name || `Group #${subscription.client_group_id}`}
                        </TableCell>
                        <TableCell>{formatDate(subscription.start_date)}</TableCell>
                        <TableCell>{formatDate(subscription.end_date)}</TableCell>
                        <TableCell>
                          <Badge variant={subscription.is_active ? "success" : "destructive"}>
                            {subscription.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(subscription.total_cost)}</TableCell>
                        <TableCell className="text-right">
                          <Button asChild size="sm" variant="outline">
                            <Link to={`/dashboard/subscriptions/${subscription.id}`}>
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild>
                <Link to="/dashboard/subscriptions/create" className="flex items-center">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Create New Subscription
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlanDetail;