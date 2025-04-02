import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

interface Props {
  onCodeScanned: (code: string) => void;
}

const QRScanner = ({ onCodeScanned }: Props) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Opciones del escáner
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      formatsToSupport: [0], // Solo soporta QR codes (0 es QR_CODE)
    };

    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      config,
      false
    );

    const onScanSuccess = (decodedText: string) => {
      // Detener el escáner después de un escaneo exitoso
      if (scannerRef.current) {
        scannerRef.current.clear().then(() => {
          // Pasar el código escaneado a la función padre
          onCodeScanned(decodedText);
        }).catch(err => {
          console.error("Error al detener el escáner:", err);
        });
      }
    };

    const onScanError = (error: string) => {
      // Solo mostrar errores reales, no los errores comunes de escaneo
      if (!error.includes("No QR code found")) {
        setError(`Error al escanear: ${error}`);
        console.error(error);
      }
    };

    if (scannerRef.current) {
      scannerRef.current.render(onScanSuccess, onScanError);
    }

    // Limpiar al desmontar
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear().catch(err => {
            console.error("Error al limpiar el escáner:", err);
          });
        } catch (err) {
          console.error("Error al desmontar el escáner:", err);
        }
      }
    };
  }, [onCodeScanned]);

  return (
    <div className="qr-scanner-container">
      {error && (
        <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-md">
          {error}
          <button 
            className="ml-2 underline"
            onClick={() => setError(null)}
          >
            Cerrar
          </button>
        </div>
      )}
      <div id="qr-reader" style={{ width: "100%", maxWidth: "500px" }}></div>
      <p className="mt-4 text-sm text-gray-500 text-center">
        Centra el código QR en el cuadro para escanearlo
      </p>
    </div>
  );
};

export default QRScanner;