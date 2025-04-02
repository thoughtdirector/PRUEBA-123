import React, { useState } from "react";
import Button from "./Button";
import { ParentChildData } from "../types";

interface Props {
  handleSubmit: (e: React.FormEvent<HTMLFormElement>, data: ParentChildData) => void;
  isLoading?: boolean;
}

const RegisterChildForm: React.FC<Props> = ({ handleSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState<ParentChildData>({
    parentName: '',
    parentId: '',
    contactNumber: '',
    childName: '',
    childId: ''
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setAcceptTerms(checked);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (validationError) setValidationError(null);
  };

  const validateForm = (): boolean => {
    for (const [key, value] of Object.entries(formData)) {
      if (!value.trim()) {
        setValidationError(`Por favor completa el campo ${key}`);
        return false;
      }
    }

    if (!acceptTerms) {
      setValidationError('Debes aceptar los términos y condiciones');
      return false;
    }

    return true;
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    handleSubmit(e, formData);
  };

  return (
    <form
      className="flex flex-col gap-4 w-full md:w-md max-w-md p-8 items-center rounded-xl bg-white shadow-md"
      onSubmit={onSubmit}
    >
      <h1 className="text-xl font-bold text-center">
        Formulario de Registro de Ingreso al Parque
      </h1>
      
      {validationError && (
        <div className="w-full p-3 bg-red-100 text-red-700 rounded-md">
          {validationError}
        </div>
      )}
      
      <div className="w-full">
        <label htmlFor="parentName" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre del Padre/Madre/Tutor
        </label>
        <input
          id="parentName"
          className="w-full px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 focus:bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          name="parentName"
          value={formData.parentName}
          onChange={handleChange}
          placeholder="Nombre completo"
          required
        />
      </div>
      
      <div className="w-full">
        <label htmlFor="parentId" className="block text-sm font-medium text-gray-700 mb-1">
          Cédula del Padre/Madre/Tutor
        </label>
        <input
          id="parentId"
          className="w-full px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 focus:bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          name="parentId"
          value={formData.parentId}
          onChange={handleChange}
          placeholder="Número de identificación"
          required
        />
      </div>
      
      <div className="w-full">
        <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-1">
          Número de Contacto
        </label>
        <input
          id="contactNumber"
          className="w-full px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 focus:bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          name="contactNumber"
          value={formData.contactNumber}
          onChange={handleChange}
          placeholder="Número de teléfono"
          type="tel"
          required
        />
      </div>
      
      <div className="w-full">
        <label htmlFor="childName" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre del Niño/a
        </label>
        <input
          id="childName"
          className="w-full px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 focus:bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          name="childName"
          value={formData.childName}
          onChange={handleChange}
          placeholder="Nombre completo"
          required
        />
      </div>
      
      <div className="w-full">
        <label htmlFor="childId" className="block text-sm font-medium text-gray-700 mb-1">
          Identificación del Niño/a
        </label>
        <input
          id="childId"
          className="w-full px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 focus:bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          name="childId"
          value={formData.childId}
          onChange={handleChange}
          placeholder="Número de identificación"
          required
        />
      </div>
      
      <div className="flex items-center w-full my-2">
        <input
          type="checkbox"
          id="terms"
          name="terms"
          checked={acceptTerms}
          onChange={handleChange}
          required
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
          Acepto los términos y condiciones
        </label>
      </div>
      
      <Button
        label={isLoading ? "Procesando..." : "Registrar y Generar Ticket de Entrada al Parque"}
        onClick={() => {}}
        disabled={isLoading}
        className="w-full mt-2"
      />
    </form>
  );
};

export default RegisterChildForm;