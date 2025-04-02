import React, { useState } from "react";
import Button from "../Button";

interface Props {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const LoginForm = ({ onSubmit }: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    setIsSubmitting(true);
    onSubmit(e);
    setTimeout(() => {
      setIsSubmitting(false);
    }, 300);
  };

  return (
    <form
      className="flex flex-col items-center gap-4 bg-white rounded-xl shadow-md p-8 max-w-md w-full"
      onSubmit={handleSubmit}
    >
      <h1 className="font-bold text-2xl mb-4">Inicio de Sesión Administrador</h1>
      
      <div className="w-full">
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
          Usuario
        </label>
        <input
          id="username"
          className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          name="username"
          placeholder="Usuario"
          defaultValue="admin" 
          required
        />
      </div>
      
      <div className="w-full">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Contraseña
        </label>
        <input
          id="password"
          className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          name="password"
          type="password"
          placeholder="Contraseña"
          defaultValue="admin123"
          required
        />
      </div>
      
      <Button 
        type="submit" 
        label={isSubmitting ? "Iniciando sesión..." : "Iniciar Sesión"} 
        onClick={() => {}} 
        disabled={isSubmitting}
        className="mt-4 w-full"
      />
      
      <p className="text-sm text-gray-500 mt-4">
        Accede como administrador para gestionar el parque.
      </p>
      
      {}
      <p className="text-xs text-gray-400 mt-2">
        Usuario: admin | Contraseña: admin123
      </p>
    </form>
  );
};

export default LoginForm;