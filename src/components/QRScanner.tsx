import { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

interface Props {
  onCodeScanned: (code: string) => void;
}

const QRScanner = ({ onCodeScanned }: Props) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: 250 },
      false
    );

    const onScanSuccess = (decodedText: string) => {
      onCodeScanned(decodedText);
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };

    const onScanError = (error: string) => {
      console.error(`Error al escanear: ${error}`);
    };

    if (scannerRef.current) {
      scannerRef.current.render(onScanSuccess, onScanError);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  return (
    <div className="qr-scanner-container">
      <div id="qr-reader" style={{ width: "100%", maxWidth: "500px" }}></div>
    </div>
  );
};

export default QRScanner;
