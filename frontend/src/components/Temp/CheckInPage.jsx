import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClientService, DashboardService } from '@/client/services';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Check, X, Clock, DollarSign, Calendar, ArrowRight, CreditCard } from 'lucide-react';

const CheckInPage = () => {
  const { qrCodeId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [visitDuration, setVisitDuration] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(null);
  const [isPaid, setIsPaid] = useState(false);

  // Helper function to format duration
  const formatDuration = (hours) => {
    if (!hours) return null;
    
    const hrs = Math.floor(hours);
    const mins = Math.round((hours - hrs) * 60);
    
    return {
      hours: hrs,
      minutes: mins,
      formatted: `${hrs}h ${mins}m`,
      totalMinutes: hrs * 60 + mins
    };
  };

  // Calculate payment amount based on minutes
  const calculatePayment = (durationMinutes) => {
    // Handle invalid or zero duration
    if (!durationMinutes || durationMinutes <= 0) {
      return null;
    }
  
    const halfHourPrice = 30000;
    const hourPrice = 50000;
    const gracePeriod = 10; // 10 minutes grace
  
    // --- Pricing Logic ---
  
    // Case 1: Up to 30 minutes + grace period
    // If duration is less than or equal to 30 + 10 = 40 minutes
    if (durationMinutes <= 30 + gracePeriod) {
      return halfHourPrice; // 30,000
    }
  
    // Case 2: Up to 60 minutes + grace period
    // If duration is greater than 40 minutes and less than or equal to 60 + 10 = 70 minutes
    if (durationMinutes <= 60 + gracePeriod) {
      return hourPrice; // 50,000
    }
  
    // Case 3: Over 60 minutes + grace period
    // Start with the base price for the first hour
    let payment = hourPrice; // 50,000
  
    // Calculate how many minutes *past* the first hour's grace period need to be charged
    // Example: 93 minutes -> 93 - (60 + 10) = 93 - 70 = 23 minutes to account for
    const minutesOverHourGrace = durationMinutes - (60 + gracePeriod);
  
    // Calculate how many additional 30-minute blocks (or fractions thereof) are needed
    // Math.ceil rounds up, so any minute over the boundary triggers a full block charge
    // Example: ceil(23 / 30) = ceil(0.76) = 1 additional block
    // Example: ceil(31 / 30) = ceil(1.03) = 2 additional blocks
    const additionalHalfHourBlocks = Math.ceil(minutesOverHourGrace / 30);
  
    // Add the cost for the additional blocks
    payment += additionalHalfHourBlocks * halfHourPrice;
  
    return payment;
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
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
    
    // Format in user's local timezone
    return date.toLocaleDateString('es-CO', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
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
    
    // Format in user's local timezone
    return date.toLocaleTimeString('es-CO', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  // Fetch QR code details
  const { data: qrCode, isLoading: qrCodeLoading, refetch: refetchQrCode } = useQuery({
    queryKey: ['qrCode', qrCodeId],
    queryFn: () => ClientService.getQrCode(qrCodeId),
    enabled: !!qrCodeId,
  });

  // Process duration data when QR code data is available
  useEffect(() => {
    if (qrCode && qrCode.visit) {
      // Check if the visit has payment
      if (qrCode.visit.payment) {
        setIsPaid(true);
      } else {
        setIsPaid(false);
      }
      
      // Set duration and payment amount if available
      if (qrCode.visit.duration) {
        const duration = formatDuration(qrCode.visit.duration);
        setVisitDuration(duration);
        
        if (duration && !isPaid) {
          const amount = calculatePayment(duration.totalMinutes);
          setPaymentAmount(amount);
        }
      }
    }
  }, [qrCode, isPaid]);

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: () => ClientService.checkInWithQr(qrCodeId),
    onSuccess: () => {
      setSuccess("Client checked in successfully");
      setError(null);
      setVisitDuration(null);
      setPaymentAmount(null);
      setIsPaid(false);
      // Refetch QR code data to update the UI
      refetchQrCode();
    },
    onError: (error) => {
      setError(error.message || "Failed to check in client");
      setSuccess(null);
    }
  });

  // Check-out mutation
  const checkOutMutation = useMutation({
    mutationFn: () => ClientService.checkOutWithQr(qrCodeId),
    onSuccess: (data) => {
      // If the response includes duration, format and display it
      if (data && data.duration) {
        const duration = formatDuration(data.duration);
        setVisitDuration(duration);
        
        // Calculate payment amount
        if (duration) {
          const amount = calculatePayment(duration.totalMinutes);
          setPaymentAmount(amount);
          setSuccess(`Client checked out successfully. Total stay time: ${duration.formatted}`);
        } else {
          setSuccess("Client checked out successfully");
        }
      } else {
        setSuccess("Client checked out successfully");
        setVisitDuration(null);
        setPaymentAmount(null);
      }
      setError(null);
      setIsPaid(false);
      // Refetch QR code data to update the UI
      refetchQrCode();
    },
    onError: (error) => {
      setError(error.message || "Failed to check out client");
      setSuccess(null);
      setVisitDuration(null);
      setPaymentAmount(null);
    }
  });

  // Make payment mutation
  const makePaymentMutation = useMutation({
    mutationFn: () => {
      // Create payment data for the visit payment
      const paymentData = {
        client_id: qrCode.client.id,
        amount: paymentAmount,
        payment_method: "cash",
        description: `Payment for visit duration: ${visitDuration.formatted}`,
        visit_id: qrCode.visit.id
      };
      
      // Use the ClientService method for making visit payments
      return ClientService.makeVisitPayment(paymentData);
    },
    onSuccess: () => {
      setSuccess(`Payment of ${formatCurrency(paymentAmount)} was processed successfully`);
      setError(null);
      setIsPaid(true);
      // Refetch QR code data to update the UI with payment info
      refetchQrCode();
    },
    onError: (error) => {
      setError(`Payment error: ${error.message || "Failed to process payment"}`);
      setSuccess(null);
    }
  });

  // Function to determine the status text based on QR code state
  const getStatusText = (state) => {
    switch (state) {
      case 'pending':
        return 'Ready for check-in';
      case 'in_use':
        return 'Checked in (active visit)';
      case 'used':
        return isPaid ? 'Completed and paid' : 'Used (awaiting payment)';
      default:
        return 'Unknown status';
    }
  };

  // Function to render visit information section
  const renderVisitInfo = () => {
    if (!qrCode || !qrCode.visit) return null;
    
    const visit = qrCode.visit;
    
    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
        <h3 className="font-medium text-gray-900">Visit Information</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">Check-in Date:</span>
            <div className="flex items-center mt-1">
              <Calendar className="h-4 w-4 mr-2 text-blue-500" />
              <span>{formatDate(visit.check_in)}</span>
            </div>
          </div>
          
          <div>
            <span className="text-gray-500">Check-in Time:</span>
            <div className="mt-1">{formatTime(visit.check_in)}</div>
          </div>
          
          {visit.check_out && (
            <>
              <div>
                <span className="text-gray-500">Check-out Date:</span>
                <div className="flex items-center mt-1">
                  <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                  <span>{formatDate(visit.check_out)}</span>
                </div>
              </div>
              
              <div>
                <span className="text-gray-500">Check-out Time:</span>
                <div className="mt-1">{formatTime(visit.check_out)}</div>
              </div>
              
              {visit.duration && (
                <div className="col-span-2">
                  <span className="text-gray-500">Duration:</span>
                  <div className="flex items-center mt-1">
                    <Clock className="h-4 w-4 mr-2 text-blue-500" />
                    <span>{formatDuration(visit.duration)?.formatted || 'N/A'}</span>
                  </div>
                </div>
              )}
            </>
          )}
          
          {visit.payment && (
            <div className="col-span-2">
              <span className="text-gray-500">Payment:</span>
              <div className="flex items-center mt-1">
                <CreditCard className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-green-700">Paid {formatCurrency(visit.payment.amount)}</span>
              </div>
            </div>
          )}
          
          {visit.notes && (
            <div className="col-span-2">
              <span className="text-gray-500">Notes:</span>
              <div className="mt-1 bg-white p-2 rounded">{visit.notes}</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (qrCodeLoading) {
    return (
      <div className="container mx-auto py-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!qrCode) {
    return (
      <div className="container mx-auto py-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Invalid QR Code</CardTitle>
            <CardDescription>
              The QR code you scanned is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Client Check-In</CardTitle>
          <CardDescription>
            {qrCode.state === 'in_use' ? 'Check out client' : isPaid ? 'Visit completed and paid' : 'Check in client'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert variant="success" className="bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Success</AlertTitle>
              <AlertDescription className="text-green-700">{success}</AlertDescription>
            </Alert>
          )}

          {visitDuration && (qrCode.state === 'used' || (qrCode.visit && qrCode.visit.check_out)) && !isPaid && (
            <>
              <Alert className="bg-blue-50 border-blue-200">
                <Clock className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">Visit Duration</AlertTitle>
                <AlertDescription className="text-blue-700">
                  The client stayed for {visitDuration.hours} hour{visitDuration.hours !== 1 ? 's' : ''} and {visitDuration.minutes} minute{visitDuration.minutes !== 1 ? 's' : ''}.
                </AlertDescription>
              </Alert>
              
              {paymentAmount && !isPaid && (
                <Alert className="bg-amber-50 border-amber-200">
                  <DollarSign className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-800">Payment Required</AlertTitle>
                  <AlertDescription className="text-amber-700">
                    Total amount: {formatCurrency(paymentAmount)}
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          {isPaid && (
            <Alert className="bg-green-50 border-green-200">
              <CreditCard className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Payment Completed</AlertTitle>
              <AlertDescription className="text-green-700">
                Payment has been processed successfully.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <p className="font-medium">Client: {qrCode.client.full_name}</p>
            <p className="text-sm text-muted-foreground">
              Status: {getStatusText(qrCode.state)}
            </p>
          </div>

          {/* Render the visit information component if there's a visit */}
          {qrCode.visit && renderVisitInfo()}

          {qrCode.state === 'in_use' ? (
            <Button
              onClick={() => checkOutMutation.mutate()}
              disabled={checkOutMutation.isPending}
              className="w-full"
            >
              {checkOutMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking Out...
                </>
              ) : (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Check Out Client
                </>
              )}
            </Button>
          ) : qrCode.state === 'pending' ? (
            <Button
              onClick={() => checkInMutation.mutate()}
              disabled={checkInMutation.isPending}
              className="w-full"
            >
              {checkInMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking In...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Check In Client
                </>
              )}
            </Button>
          ) : paymentAmount && !isPaid ? (
            <Button
              onClick={() => makePaymentMutation.mutate()}
              disabled={makePaymentMutation.isPending}
              className="w-full bg-amber-600 hover:bg-amber-700"
            >
              {makePaymentMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Confirm Payment of {formatCurrency(paymentAmount)}
                </>
              )}
            </Button>
          ) : (
            <Alert>
              <AlertDescription>
                {isPaid 
                  ? "This visit has been completed and payment has been processed."
                  : "This QR code has already been used and cannot be used again."}
              </AlertDescription>
            </Alert>
          )}
          
          <Button 
            variant="outline" 
            className="w-full mt-4"
            onClick={() => navigate('/dashboard/visits/check-in')}
          >
            Return to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckInPage; 