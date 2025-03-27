import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Save, FileText, Clipboard, UserPlus, Camera, Users } from 'lucide-react';
import { ClientService, FormsService } from '../../client/services';
import useAuth from '../../hooks/useAuth';
import useCustomToast from '../../hooks/useCustomToast';

// Import ShadCN UI components
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const ChildRegister = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const showToast = useCustomToast();
  const [activeTab, setActiveTab] = useState('registerMember');
  
  // Family Member state
  const [childClient, setChildClient] = useState({
    id: null,
    full_name: '',
    email: '',
    phone: '',
    identification: '',
    is_active: true,
    is_child: true
    // No need to set guardian_id here as the backend will handle this
  });
  
  // Child/Dependent state
  const [dependentClient, setDependentClient] = useState({
    id: null,
    full_name: '',
    email: '',
    phone: '',
    identification: '',
    is_active: true,
    is_child: true
  });
  
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [dependentAgreedToTerms, setDependentAgreedToTerms] = useState(false);
  
  // Park Entry Form state
  const [entryData, setEntryData] = useState({
    // Child information
    child_name: '',
    child_age: '',
    
    // Adult information
    adult_name: '',
    identification_number: '',
    relationship: '',
    phone_number: '',
    email: '',
    
    // Date and time
    entry_date: new Date().toISOString().split('T')[0],
    entry_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    
    // Location
    city: '',
    
    // Authorizations
    authorize_entry: true,
    authorize_photos: true,
    authorize_marketing: true,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  
  // Register child client mutation
  const registerChildMutation = useMutation({
    mutationFn: ClientService.registerChildClient,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['clientPlans']);
      navigate({ to: '/dashboard/client/plans' });
    },
  });
  
  // Register dependent mutation
  const registerDependentMutation = useMutation({
    mutationFn: ClientService.registerChildClient,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['clientPlans']);
      navigate({ to: '/dashboard/client/plans' });
    },
  });
  
  const handleChildClientChange = (e) => {
    const { name, value, type, checked } = e.target;
    setChildClient({
      ...childClient,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
  
  const handleDependentClientChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDependentClient({
      ...dependentClient,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agreedToTerms) {
      return; // Don't submit if user hasn't agreed to terms
    }
    registerChildMutation.mutate(childClient);
  };
  
  const handleDependentSubmit = (e) => {
    e.preventDefault();
    if (!dependentAgreedToTerms) {
      return; // Don't submit if user hasn't agreed to terms
    }
    registerDependentMutation.mutate(dependentClient);
  };
  
  // Handle form input changes for park entry form
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEntryData({
      ...entryData,
      [name]: type === 'checkbox' ? checked : type === "number" ? Number(value): value,
    });
  };
  
  // Handle radio button changes for park entry form
  const handleRadioChange = (name, value) => {
    setEntryData({
      ...entryData,
      [name]: value,
    });
  };

  const submitFormMutation = useMutation({
    mutationFn: FormsService.submitForm,
    onSuccess: (data) => {
      // Go back to plans
      navigate({to: "/dashboard/client/plans"})
      showToast(
        "Form submited",
        "The form has been submited successfully.",
        "success",
      )
    }
  })
  
  // Handle park entry form submission
  const handleParkEntrySubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      // In a real implementation, we would call an API endpoint here
      // For now, we'll just simulate a successful submission

      console.log(entryData);

      const formSubmitData = {
        "form_type": "park entry forms",
        "form_data": entryData
      }

      submitFormMutation.mutate(formSubmitData)
      
      // Reset form
      setEntryData({
        child_name: '',
        child_age: '',
        adult_name: '',
        identification_number: '',
        relationship: '',
        phone_number: '',
        email: '',
        entry_date: new Date().toISOString().split('T')[0],
        entry_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        city: '',
        authorize_entry: true,
        authorize_photos: true,
        authorize_marketing: true,
      });
      
    } catch (err) {
      setFormError(err.message || 'An error occurred during submission');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto py-6 max-w-3xl">
      <div className="flex items-center mb-6">
        <Button variant="outline" size="icon" asChild className="mr-4">
          <Link to="/dashboard/client/plans">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Register Family Member</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="registerMember" className="flex items-center">
            <UserPlus className="mr-2 h-4 w-4" />
            Register Member
          </TabsTrigger>
          <TabsTrigger value="childDependent" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            Child/Dependent
          </TabsTrigger>
          <TabsTrigger value="parkEntry" className="flex items-center">
            <Clipboard className="mr-2 h-4 w-4" />
            Park Entry Form
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="registerMember">
          <Card>
            <CardHeader>
              <CardTitle>Register Family Member</CardTitle>
              <CardDescription>
                Register a family member under your account
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="child_full_name">Full Name</Label>
                  <Input
                    id="child_full_name"
                    name="full_name"
                    value={childClient.full_name}
                    onChange={handleChildClientChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="child_identification">Identification Number</Label>
                  <Input
                    id="child_identification"
                    name="identification"
                    value={childClient.identification}
                    onChange={handleChildClientChange}
                    placeholder="Government ID, passport, or birth certificate number"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="child_email">Email Address (Optional)</Label>
                  <Input
                    id="child_email"
                    name="email"
                    type="email"
                    value={childClient.email}
                    onChange={handleChildClientChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="child_phone">Phone Number (Optional)</Label>
                  <Input
                    id="child_phone"
                    name="phone"
                    value={childClient.phone}
                    onChange={handleChildClientChange}
                  />
                </div>
                
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="child_is_active"
                    name="is_active"
                    checked={childClient.is_active}
                    onCheckedChange={(checked) => 
                      setChildClient({...childClient, is_active: checked})
                    }
                  />
                  <Label htmlFor="child_is_active">Account is active</Label>
                </div>
                
                <div className="flex items-start space-x-2 pt-4 border-t">
                  <Checkbox
                    id="agreement"
                    checked={agreedToTerms}
                    onCheckedChange={setAgreedToTerms}
                    required
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="agreement" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      I agree to the terms and conditions
                    </Label>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <FileText className="h-3 w-3 mr-1" />
                      By registering this family member, I certify that I have the legal authority to do so
                    </p>
                  </div>
                </div>
                
                {registerChildMutation.isError && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      {registerChildMutation.error?.message || "Error registering family member"}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: '/dashboard/client/plans' })}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={registerChildMutation.isPending || !agreedToTerms}
                  className="flex items-center"
                >
                  {registerChildMutation.isPending ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Register Family Member
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="childDependent">
          <Card>
            <CardHeader>
              <CardTitle>Register Child/Dependent</CardTitle>
              <CardDescription>
                Register a child or dependent under your account
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleDependentSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dependent_full_name">Child's Full Name</Label>
                  <Input
                    id="dependent_full_name"
                    name="full_name"
                    value={dependentClient.full_name}
                    onChange={handleDependentClientChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dependent_identification">Identification Number</Label>
                  <Input
                    id="dependent_identification"
                    name="identification"
                    value={dependentClient.identification}
                    onChange={handleDependentClientChange}
                    placeholder="Birth certificate or passport number"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dependent_email">Email Address (Optional)</Label>
                  <Input
                    id="dependent_email"
                    name="email"
                    type="email"
                    value={dependentClient.email}
                    onChange={handleDependentClientChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dependent_phone">Phone Number (Optional)</Label>
                  <Input
                    id="dependent_phone"
                    name="phone"
                    value={dependentClient.phone}
                    onChange={handleDependentClientChange}
                  />
                </div>
                
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="dependent_is_active"
                    name="is_active"
                    checked={dependentClient.is_active}
                    onCheckedChange={(checked) => 
                      setDependentClient({...dependentClient, is_active: checked})
                    }
                  />
                  <Label htmlFor="dependent_is_active">Account is active</Label>
                </div>
                
                <div className="flex items-start space-x-2 pt-4 border-t">
                  <Checkbox
                    id="dependent_agreement"
                    checked={dependentAgreedToTerms}
                    onCheckedChange={setDependentAgreedToTerms}
                    required
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="dependent_agreement" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      I agree to the terms and conditions
                    </Label>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <FileText className="h-3 w-3 mr-1" />
                      By registering this child/dependent, I certify that I am the legal guardian
                    </p>
                  </div>
                </div>
                
                {registerDependentMutation.isError && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      {registerDependentMutation.error?.message || "Error registering child/dependent"}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: '/dashboard/client/plans' })}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={registerDependentMutation.isPending || !dependentAgreedToTerms}
                  className="flex items-center"
                >
                  {registerDependentMutation.isPending ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Register Child/Dependent
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="parkEntry">
          <Card>
            <CardHeader>
              <CardTitle>Park Entry Form</CardTitle>
              <CardDescription>
                Complete this form for park entry registration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {/* Company logo placeholder */}
                <div className="flex justify-center mb-4">
                  <div className="w-40 h-20 bg-gray-200 flex items-center justify-center rounded">
                    <Camera className="h-6 w-6 text-gray-400" />
                    <span className="ml-2 text-gray-500">Logo</span>
                  </div>
                </div>
                
                <form onSubmit={handleParkEntrySubmit}>
                  {/* Authorization question */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">
                      Por medio de la presente, el (la) firmante, mayor de edad identificado como aparece al pie de su nombre:
                    </Label>
                    <div className="pl-4">
                      <RadioGroup
                        value={entryData.authorize_entry}
                        onValueChange={(value) => handleRadioChange('authorize_entry', value)}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={true} id="authorize-yes" />
                          <Label htmlFor="authorize-yes" className="text-xs">¿Autoriza en calidad de responsable al menor de edad el ingreso al parque?</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={false} id="authorize-no" />
                          <Label htmlFor="authorize-no" className="text-xs">No autorizo</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                  
                  <Separator className="my-3" />
                  
                  {/* Child information */}
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="child_name" className="text-xs">Nombre del menor de edad</Label>
                      <Input
                        id="child_name"
                        name="child_name"
                        value={entryData.child_name}
                        onChange={handleInputChange}
                        required
                        className="h-8 text-sm"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="child_age" className="text-xs">Edad del niño</Label>
                      <Input
                        id="child_age"
                        name="child_age"
                        type="number"
                        min="0"
                        max="17"
                        value={entryData.child_age}
                        onChange={handleInputChange}
                        required
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                  
                  <Separator className="my-3" />
                  
                  {/* Adult information */}
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="adult_name" className="text-xs">Nombre completo del adulto</Label>
                      <Input
                        id="adult_name"
                        name="adult_name"
                        value={entryData.adult_name}
                        onChange={handleInputChange}
                        required
                        className="h-8 text-sm"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="identification_number" className="text-xs">Número de documento de identidad</Label>
                      <Input
                        id="identification_number"
                        name="identification_number"
                        value={entryData.identification_number}
                        onChange={handleInputChange}
                        required
                        className="h-8 text-sm"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="relationship" className="text-xs">Parentesco del menor</Label>
                      <Input
                        id="relationship"
                        name="relationship"
                        value={entryData.relationship}
                        onChange={handleInputChange}
                        required
                        className="h-8 text-sm"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone_number" className="text-xs">Número de celular</Label>
                      <Input
                        id="phone_number"
                        name="phone_number"
                        value={entryData.phone_number}
                        onChange={handleInputChange}
                        required
                        className="h-8 text-sm"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs">Correo electrónico</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={entryData.email}
                        onChange={handleInputChange}
                        required
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                  
                  <Separator className="my-3" />
                  
                  {/* Date and Time */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="entry_date" className="text-xs">Fecha de ingreso</Label>
                      <Input
                        id="entry_date"
                        name="entry_date"
                        type="date"
                        value={entryData.entry_date}
                        onChange={handleInputChange}
                        required
                        className="h-8 text-sm"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="entry_time" className="text-xs">Hora de ingreso</Label>
                      <Input
                        id="entry_time"
                        name="entry_time"
                        type="time"
                        value={entryData.entry_time}
                        onChange={handleInputChange}
                        required
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-3">
                    <Label htmlFor="city" className="text-xs">Ciudad de domicilio</Label>
                    <Input
                      id="city"
                      name="city"
                      value={entryData.city}
                      onChange={handleInputChange}
                      required
                      className="h-8 text-sm"
                    />
                  </div>
                  
                  <Separator className="my-3" />
                  
                  {/* Important Note */}
                  <Alert className="my-3 bg-yellow-50 border-yellow-200 text-xs py-2">
                    <AlertDescription className="font-bold text-center">
                      NOTA: LA CONTABILIZACIÓN DEL TIEMPO CORRE POR SU CUENTA, NO DAMOS AVISO DEL TIEMPO TRANSCURRIDO.
                    </AlertDescription>
                  </Alert>
                  
                  <Separator className="my-3" />
                  
                  {/* Additional Authorizations */}
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-xs">¿Autoriza a la casa en el árbol para el uso de fotografías o videos capturados en el parque?</Label>
                      <RadioGroup
                        value={entryData.authorize_photos}
                        onValueChange={(value) => handleRadioChange('authorize_photos', value)}
                        className="flex flex-row space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={true} id="photos-yes" />
                          <Label htmlFor="photos-yes" className="text-xs">Si</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={false} id="photos-no" />
                          <Label htmlFor="photos-no" className="text-xs">No</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs">¿Autoriza al parque el envío de mails y mensajes de texto?</Label>
                      <RadioGroup
                        value={entryData.authorize_marketing}
                        onValueChange={(value) => handleRadioChange('authorize_marketing', value)}
                        className="flex flex-row space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={true} id="marketing-yes" />
                          <Label htmlFor="marketing-yes" className="text-xs">Si</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={false} id="marketing-no" />
                          <Label htmlFor="marketing-no" className="text-xs">No</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                  
                  {formError && (
                    <Alert variant="destructive" className="mt-3">
                      <AlertDescription>{formError}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="pt-3 text-center">
                    <p className="font-semibold text-sm">BIENVENIDOS Y GRACIAS POR SUS RESPUESTAS</p>
                  </div>
                  
                  <div className="flex justify-between mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate({ to: '/dashboard/client/plans' })}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin border-2 border-current border-t-transparent rounded-full" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          <Clipboard className="mr-2 h-4 w-4" />
                          Registrar Ingreso
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChildRegister; 