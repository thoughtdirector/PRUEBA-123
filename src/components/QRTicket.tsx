import React, { useEffect } from 'react';
import CustomQRCode from './CustomQRCode';
import Button from './Button';

interface QRTicketProps {
  primaryKey: string;
  childName: string;
  parentName: string;
  onReset: () => void;
}

const QRTicket: React.FC<QRTicketProps> = ({
  primaryKey,
  childName,
  parentName,
  onReset
}) => {
  // Log para asegurar que recibimos correctamente los datos
  useEffect(() => {
    console.log("Rendering QR Ticket con datos:", { primaryKey, childName, parentName });
  }, [primaryKey, childName, parentName]);

  const handleDownloadQR = () => {
    console.log("Iniciando descarga del código QR");
    const canvas = document.getElementById('qr-code-canvas') as HTMLCanvasElement;
    
    if (!canvas) {
      console.error("Canvas no encontrado para descargar QR");
      return;
    }
    
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      
      link.href = dataUrl;
      link.download = `ticket-${childName.replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log("QR descargado exitosamente");
    } catch (error) {
      console.error("Error al descargar QR:", error);
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md max-w-md w-full">
      <h2 className="text-xl font-bold text-center mb-2">¡Niño Registrado!</h2>
      <p className="mb-4 text-center">Bienvenido al parque, <span className="font-semibold">{childName}</span>! 🥳</p>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-4 w-full">
        <div className="flex justify-center mb-2">
          <CustomQRCode
            id="qr-code-canvas"
            value={primaryKey}
            size={200}
            className="rounded-md"
          />
        </div>
        <p className="text-center mt-2 font-mono text-sm text-gray-600">
          Código: {primaryKey}
        </p>
      </div>
      
      <div className="w-full mb-4">
        <div className="bg-gray-100 p-4 rounded-md">
          <h3 className="font-bold mb-2">Información del Ticket</h3>
          <p><span className="font-medium">Niño:</span> {childName}</p>
          <p><span className="font-medium">Acompañante:</span> {parentName}</p>
          <p><span className="font-medium">Fecha:</span> {new Date().toLocaleDateString()}</p>
        </div>
      </div>
      
      <div className="p-4 bg-red-100 rounded-md text-red-700 text-center w-full mb-4">
        <span className="font-bold">¡IMPORTANTE!</span> Conserva este código QR para la entrada y salida del parque.
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2 w-full">
        <Button
          label="Descargar QR"
          onClick={handleDownloadQR}
          className="flex-1 bg-green-500 text-white hover:bg-green-600"
        />
        <Button
          label="Registrar otro niño"
          onClick={onReset}
          className="flex-1 bg-blue-100 text-blue-700 hover:bg-blue-200"
        />
      </div>
    </div>
  );
};

export default QRTicket;