import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import QRCode from 'react-qr-code';
import { ClientService } from '@/client/services';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Dialog } from '@/components/ui/dialog';
import { ArrowLeft, UserPlus, QrCode, Info, Check, UserCheck, Loader2, Clock } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

const TempDashboard = () => {
  const [activeTab, setActiveTab] = useState('clients');
  const [selectedClient, setSelectedClient] = useState('');
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [qrCodeId, setQrCodeId] = useState(null);
  
  // Form state for child registration
  const [childForm, setChildForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    identification_number: '',
    is_child: true,
    terms_accepted: false
  });
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registrationError, setRegistrationError] = useState('');

  // Fetch client groups (these contain the clients that belong to groups user is admin of)
  const {
    data: clientGroups,
    isLoading: clientGroupsLoading,
    isError: clientGroupsError,
    refetch: refetchClientGroups
  } = useQuery({
    queryKey: ['clientGroups'],
    queryFn: () => ClientService.getClientGroups(),
  });

  // Fetch client visits
  const {
    data: visits,
    isLoading: visitsLoading,
    isError: visitsError,
    refetch: refetchVisits
  } = useQuery({
    queryKey: ['clientVisits'],
    queryFn: () => ClientService.getVisits({ limit: 5 }), // Get recent 5 visits
  });

  // Extract all clients from all groups
  const allClients = clientGroups?.flatMap(group => group.clients) || [];

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

  // Format duration in hours and minutes
  const formatDuration = (hours) => {
    if (hours === undefined || hours === null) return 'N/A';
    const hrs = Math.floor(hours);
    const mins = Math.round((hours - hrs) * 60);
    return `${hrs}h ${mins}m`;
  };

  // Generate QR code mutation
  const generateQrMutation = useMutation({
    mutationFn: ({ clientId }) => 
      ClientService.generateQrCode(clientId),
    onSuccess: (data) => {
      setQrCodeId(data.id);
      setQrCodeData(`${window.location.origin}/dashboard/check-in/${data.id}`);
      setQrDialogOpen(true);
    },
    onError: (error) => {
      console.error("Error generating QR code:", error);
      setRegistrationError(error.message || "Failed to generate QR code");
    }
  });

  // Check for active QR codes
  const checkActiveQrMutation = useMutation({
    mutationFn: ({ clientId }) => 
      ClientService.getActiveQrCode(clientId),
    onSuccess: (data) => {
      if (data && data.id) {
        // Use existing QR code
        setQrCodeId(data.id);
        setQrCodeData(`${window.location.origin}/dashboard/check-in/${data.id}`);
        setQrDialogOpen(true);
      } else {
        // No active QR code found, generate a new one
        generateQrMutation.mutate({ clientId: selectedClient });
      }
    },
    onError: (error) => {
      // If error checking (like 404 not found), proceed with generating a new one
      generateQrMutation.mutate({ clientId: selectedClient });
    }
  });

  // Handle selecting a client and generating QR
  const handleSelectClient = (clientId) => {
    setSelectedClient(clientId);
  };

  const handleGenerateQR = () => {
    console.log("handleGenerateQR called with selectedClient:", selectedClient);
    setRegistrationError('');
    
    if (!selectedClient) {
      console.log("No client selected");
      setRegistrationError("Please select a client first");
      return;
    }

    // Find the client
    const client = allClients.find(c => c.id === selectedClient);
    console.log("Found client:", client);
    
    if (!client) {
      console.log("Client not found in allClients");
      setRegistrationError("Selected client not found");
      return;
    }
    
    try {
      // First check if client already has an active QR code
      checkActiveQrMutation.mutate({
        clientId: selectedClient
      });
    } catch (error) {
      console.error("Error in handleGenerateQR:", error);
      fallbackGenerateQR(selectedClient);
    }
  };
  
  // Fallback method to try direct API call
  const fallbackGenerateQR = async (clientId) => {
    try {
      console.log("Trying fallback QR generation method");
      const data = await ClientService.debugGenerateQrCode(clientId);
      console.log("Fallback QR success:", data);
      
      if (data && data.id) {
        setQrCodeId(data.id);
        setQrCodeData(`${window.location.origin}/dashboard/check-in/${data.id}`);
        setQrDialogOpen(true);
      } else {
        setRegistrationError("Failed to generate QR code: Invalid response");
      }
    } catch (error) {
      console.error("Fallback QR generation failed:", error);
      setRegistrationError(error.message || "Failed to generate QR code");
    }
  };

  // Handle child form changes
  const handleChildFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setChildForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle child registration submission
  const handleRegisterChild = async (e) => {
    e.preventDefault();
    setRegistrationError('');
    setRegistrationSuccess(false);

    if (!childForm.terms_accepted) {
      setRegistrationError('You must accept the terms of service');
      return;
    }

    try {
      // Map identification_number to identification as expected by backend
      // Store date_of_birth in details field
      const childData = {
        ...childForm,
        identification: childForm.identification_number,
        terms_accepted: childForm.terms_accepted,
        details: {
          date_of_birth: childForm.date_of_birth
        }
      };
      await ClientService.registerChildClient(childData);
      setRegistrationSuccess(true);
      setChildForm({
        full_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        identification_number: '',
        is_child: true,
        terms_accepted: false
      });
      
      // Refetch client groups to update the list
      refetchClientGroups();
    } catch (error) {
      console.error("Error registering child:", error);
      setRegistrationError(error.message || 'Failed to register child');
    }
  };

  // Demo data for when real visits data is loading
  const demoVisits = [
    {
      id: "123e4567-e89b-12d3-a456-426614174001",
      check_in: "2025-03-01T10:00:00Z",
      check_out: "2025-03-01T12:00:00Z",
      duration: 2.0
    },
    {
      id: "123e4567-e89b-12d3-a456-426614174002",
      check_in: "2025-02-28T15:30:00Z",
      check_out: "2025-02-28T17:45:00Z",
      duration: 2.25
    }
  ];

  // Use demo data if the real data is loading
  const displayVisits = visitsLoading ? demoVisits : visits || [];

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button variant="outline" size="icon" asChild className="mr-4">
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Bienvenid@!</h1>
        </div>
      </div>

      <Tabs defaultValue="clients" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="clients">QR</TabsTrigger>
          <TabsTrigger value="register">Registrar</TabsTrigger>
        </TabsList>
        
        {/* Client List Tab */}
        <TabsContent value="clients">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Lista de personas</CardTitle>
              <CardDescription>
                Selecciona a una persona para hacer check-in
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {clientGroupsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : clientGroupsError ? (
                <Alert variant="destructive">
                  <AlertDescription>Fallo al cargar las personas</AlertDescription>
                </Alert>
              ) : allClients.length === 0 ? (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>No hay personas</AlertTitle>
                  <AlertDescription>
                    No tienes personas en tu grupo. Ve a la pestaña de registro para agregar una persona.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <Select 
                    value={selectedClient} 
                    onValueChange={handleSelectClient}
                  >
                    <SelectTrigger id="client">
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {allClients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {registrationError && (
                    <Alert className="mb-4" variant="destructive">
                      <AlertDescription>{registrationError}</AlertDescription>
                    </Alert>
                  )}
                  
                  <Button 
                    onClick={handleGenerateQR} 
                    disabled={!selectedClient || generateQrMutation.isPending}
                    className="w-full"
                  >
                    {generateQrMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating QR Code...
                      </>
                    ) : (
                      <>
                        <QrCode className="mr-2 h-4 w-4" /> Generar código QR para check-in
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Visits Section */}
          <Card>
            <CardHeader>
              <CardTitle>Visitas recientes</CardTitle>
              <CardDescription>
                Tus visitas recientes al parque
              </CardDescription>
            </CardHeader>
            <CardContent>
              {visitsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : visitsError ? (
                <Alert variant="destructive">
                  <AlertDescription>Failed to load recent visits</AlertDescription>
                </Alert>
              ) : displayVisits.length === 0 ? (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>No visits found</AlertTitle>
                  <AlertDescription>
                    You don't have any recent visits. Generate a QR code to check in at our facility.
                  </AlertDescription>
                </Alert>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayVisits.map((visit) => (
                      <TableRow key={visit.id}>
                        <TableCell>{formatDate(visit.check_in)}</TableCell>
                        <TableCell>{formatTime(visit.check_in)}</TableCell>
                        <TableCell>{visit.check_out ? formatTime(visit.check_out) : 'Active'}</TableCell>
                        <TableCell>{visit.check_out ? formatDuration(visit.duration) : 'In Progress'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <div className="mt-4 flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => refetchVisits()}
                  className="flex items-center"
                >
                  <Clock className="mr-2 h-4 w-4" /> Refrescar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Register Child Tab */}
        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle>Registrar persona</CardTitle>
              <CardDescription>
                Registra a una persona en tu grupo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {registrationSuccess && (
                <Alert className="mb-4" variant="success">
                  <Check className="h-4 w-4" />
                  <AlertTitle>Éxito</AlertTitle>
                  <AlertDescription>
                    Persona registrada exitosamente!
                  </AlertDescription>
                </Alert>
              )}
              
              {registrationError && (
                <Alert className="mb-4" variant="destructive">
                  <AlertDescription>{registrationError}</AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleRegisterChild} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nombre completo</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={childForm.full_name}
                    onChange={handleChildFormChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="identification_number">Número de identificación</Label>
                  <Input
                    id="identification_number"
                    name="identification_number"
                    value={childForm.identification_number}
                    onChange={handleChildFormChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico (opcional)</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={childForm.email}
                    onChange={handleChildFormChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono (opcional)</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={childForm.phone}
                    onChange={handleChildFormChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Fecha de nacimiento</Label>
                  <Input
                    id="date_of_birth"
                    name="date_of_birth"
                    type="date"
                    value={childForm.date_of_birth}
                    onChange={handleChildFormChange}
                    required
                  />
                </div>
                
                <div className="flex items-center space-x-2 mt-4">
                  <input
                    type="checkbox"
                    id="terms_accepted"
                    name="terms_accepted"
                    checked={childForm.terms_accepted}
                    onChange={handleChildFormChange}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <Label htmlFor="terms_accepted" className="text-sm text-gray-700">
                    He leído y acepto los términos de servicio
                  </Label>
                </div>
                
                <Button type="submit" className="w-full">
                  <UserPlus className="mr-2 h-4 w-4" /> Registrar persona
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Código QR para check-in</DialogTitle>
            <DialogDescription>
              Muestra este código QR al administrador para hacer check-in
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center p-4">
            {qrCodeData && (
              <>
                {/* QR code */}
                <div className="bg-white p-6 rounded-lg mb-4">
                  <QRCode 
                    value={qrCodeData}
                    size={180}
                    level="M"
                    className="mx-auto"
                  />
                  <div className="mt-4 text-xs text-center text-muted-foreground break-all">
                    QR Code ID: {qrCodeId}
                  </div>
                  
                </div>
                
                <Alert className="mt-4">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Importante</AlertTitle>
                  <AlertDescription>
                    Guarda este código QR o toma una captura de pantalla. Puede ser usado para hacer check-in rápido en el parque.
                  </AlertDescription>
                </Alert>
              </>
            )}
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setQrDialogOpen(false)}
            >
              Cerrar
            </Button>
            {/* <Button
              type="button"
              onClick={() => {
                // In a real app, you would implement a way to 
                // download or share the QR code
                alert("QR code saved!");
              }}
            >
              Download QR Code
            </Button> */}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TempDashboard; 