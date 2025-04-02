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
    if (canvasRef.current) {
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
          if (error) console.error("Error generando QR:", error);
        }
      );
    }
  }, [value, size]);

  return <canvas id={id} ref={canvasRef} className={className} />;
};

export default CustomQRCode;