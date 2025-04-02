import { createFileRoute } from "@tanstack/react-router";
import RegisterChildForm from "../components/RegisterChildForm";
import { useState } from "react";
import { registerUser } from "../firebase/services";
import { ParentChildData } from "../types";
import QRTicket from "../components/QRTicket";

export const Route = createFileRoute("/register-child")({
  component: RouteComponent,
});

function RouteComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const [registrationData, setRegistrationData] = useState<{
    isRegistered: boolean;
    childName: string;
    parentName: string;
    primaryKey: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, data: ParentChildData) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await registerUser(data);
      
      if (result.success) {
        setRegistrationData({
          isRegistered: true,
          childName: data.childName,
          parentName: data.parentName,
          primaryKey: result.primaryKey
        });
      } else {
        setError(result.error || 'Error al registrar el niño');
      }
    } catch (error) {
      console.error("Error al registrar:", error);
      setError('Ha ocurrido un error al registrar. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setRegistrationData(null);
    setError(null);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      {error && (
        <div className="bg-red-100 text-red-700 p-4 mb-4 rounded-md w-full max-w-md">
          {error}
          <button 
            className="ml-2 text-red-500 underline"
            onClick={() => setError(null)}
          >
            Cerrar
          </button>
        </div>
      )}
      
      {!registrationData ? (
        <RegisterChildForm 
          handleSubmit={handleSubmit} 
          isLoading={isLoading} 
        />
      ) : (
        <QRTicket
          primaryKey={registrationData.primaryKey}
          childName={registrationData.childName}
          parentName={registrationData.parentName}
          onReset={handleReset}
        />
      )}
    </div>
  );
}