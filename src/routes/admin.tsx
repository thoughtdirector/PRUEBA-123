import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import LoginForm from "../components/Admin/LoginForm";
import { ChildrenPlaying, ChildrenPlayingList } from "../types/childrenPlaying";
import ChildrenPlayingTable from "../components/Admin/ChildrenPlayingTable";
import Button from "../components/Button";
import QRScanner from "../components/QRScanner";
import Modal from "../components/Modal";

export const Route = createFileRoute("/admin")({
  component: RouteComponent,
});

function RouteComponent() {
  const [loggedIn, setLoggedIn] = useState(false);

  const [qrScannerOpen, setQrScannerOpen] = useState(false);

  const [childrenPlaying, setChildrenPlaying] = useState<ChildrenPlayingList>(
    []
  );

  // Mock data for testing
  const childrenTest: ChildrenPlayingList = [
    {
      child_name: "Juanito",
      parent_name: "Pedro",
      active_time: "10",
      start_time: "2023-10-01T10:00:00",
    },
    {
      child_name: "Juanito",
      parent_name: "Pedro",
      active_time: "10",
      start_time: "2023-10-01T10:00:00",
    },
    {
      child_name: "Juanito",
      parent_name: "Pedro",
      active_time: "10",
      start_time: "2023-10-01T10:00:00",
    },
  ];

  const handleCodeScanned = (code: string) => {
    const { nombre_padre, cc_padre, contacto, nombre_hijo, id_hijo } =
      JSON.parse(code);

    console.log("Parsed data:", {
      nombre_padre,
      cc_padre,
      contacto,
      nombre_hijo,
      id_hijo,
    });
    // Aquí puedes manejar el código escaneado, por ejemplo, enviarlo a una API
    // para registrar la entrada/salida del niño.

    setQrScannerOpen(false);
  };

  const onStopTime = (child: ChildrenPlaying) => {
    console.log("Time ended for child:", child);
  };

  const getChildrenPlaying = () => {
    // Simulate an API call
    console.log("Fetching children playing...");
    setChildrenPlaying(childrenTest);
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    console.log(data);
    setLoggedIn(true);
  };

  useEffect(() => {
    if (loggedIn) {
      getChildrenPlaying();
    }
  }, [loggedIn]);

  return (
    <div className="h-full w-full flex flex-col justify-center items-center gap-2">
      {!loggedIn ? (
        <LoginForm onSubmit={handleLogin} />
      ) : (
        <>
          <h1 className="font-bold text-xl">Dashboard</h1>
          <div className="overflow-x-auto w-full flex items-center md:justify-center">
            <ChildrenPlayingTable
              childrenPlaying={childrenPlaying}
              onStopTime={onStopTime}
            />
          </div>
          <Button
            label="Escanear código QR"
            onClick={() => {
              setQrScannerOpen(true);
            }}
          />
          {qrScannerOpen && (
            <Modal onClose={() => setQrScannerOpen(false)}>
              <div className="md:w-120">
                <QRScanner onCodeScanned={handleCodeScanned} />
              </div>
            </Modal>
          )}
        </>
      )}
    </div>
  );
}
