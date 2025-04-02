import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface CustomQRCodeProps {
  id?: string;
  value: string;
  size?: number;
  className?: string;
}

const CustomQRCode: React.FC<CustomQRCodeProps> = ({ 
  id, 
  value, 
  size = 200, 
  className = '' 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      console.error("Canvas ref no disponible para generar QR");
      return;
    }

    if (!value) {
      console.error("No se puede generar código QR sin un valor");
      return;
    }

    console.log("Generando código QR para valor:", value);
    
    try {
      QRCode.toCanvas(
        canvasRef.current,
        value,
        {
          width: size,
          margin: 4,
          errorCorrectionLevel: 'H',
          color: {
            dark: '#000000',  
            light: '#FFFFFF' 
          }
        },
        (error) => {
          if (error) {
            console.error("Error generando QR:", error);
          } else {
            console.log("Código QR generado correctamente");
          }
        }
      );
    } catch (error) {
      console.error("Excepción al generar QR:", error);
    }
  }, [value, size]);

  return <canvas id={id} ref={canvasRef} className={className} width={size} height={size} />;
};

export default CustomQRCode;