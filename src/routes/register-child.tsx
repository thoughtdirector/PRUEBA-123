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
    
    console.log("Iniciando registro con datos:", data);
    
    try {
      // Validación básica de datos
      for (const [key, value] of Object.entries(data)) {
        if (!value || value.trim() === '') {
          throw new Error(`El campo ${key} no puede estar vacío`);
        }
      }
      
      console.log("Validación de datos completada, llamando a registerUser");
      const result = await registerUser(data);
      console.log("Resultado de registerUser:", result);
      
      if (result.success) {
        console.log("Registro exitoso, actualizando estado con primaryKey:", result.primaryKey);
        setRegistrationData({
          isRegistered: true,
          childName: data.childName,
          parentName: data.parentName,
          primaryKey: result.primaryKey
        });
      } else {
        console.error("Error en el registro:", result.error);
        setError(result.error || 'Error al registrar el niño');
      }
    } catch (error) {
      console.error("Excepción al registrar:", error);
      setError(error instanceof Error ? error.message : 'Ha ocurrido un error al registrar. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    console.log("Reseteando formulario para un nuevo registro");
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