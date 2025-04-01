import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

const QRScanner = () => {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Inicializar el escáner QR
    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: 250 },
      false
    );

    // Función para manejar el éxito del escaneo
    const onScanSuccess = (decodedText: string) => {
      setScanResult(decodedText);
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };

    // Función para manejar errores
    const onScanError = (error: string) => {
      console.error(`Error al escanear: ${error}`);
    };

    // Iniciar el escáner
    if (scannerRef.current) {
      scannerRef.current.render(onScanSuccess, onScanError);
    }

    // Limpiar al desmontar
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  return (
    <div className="qr-scanner-container">
      {scanResult ? (
        <div className="scan-result">
          <h2>Resultado del escaneo:</h2>
          <p>{scanResult}</p>
          <button
            onClick={() => {
              setScanResult(null);
              if (scannerRef.current) {
                scannerRef.current.render(
                  (decodedText) => setScanResult(decodedText),
                  (error) => console.error(`Error al escanear: ${error}`)
                );
              }
            }}
          >
            Escanear de nuevo
          </button>
        </div>
      ) : (
        <div id="qr-reader" style={{ width: "100%", maxWidth: "500px" }}></div>
      )}
    </div>
  );
};

export default QRScanner;
