import { createFileRoute } from "@tanstack/react-router";
import RegisterChildForm from "../components/RegisterChildForm";
import { useState } from "react";
import Modal from "../components/Modal";
import Button from "../components/Button";

export const Route = createFileRoute("/register-child")({
  component: RouteComponent,
});

function RouteComponent() {
  const [qrCode, setQrCode] = useState("");

  const [showModal, setShowModal] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    console.log(data);
    const qrkey = JSON.stringify(data);
    const qrCode = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
      qrkey
    )}&size=200x200`;
    // Register the child in the database
    setQrCode(qrCode);
    setShowModal(true);
    console.log(qrCode);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      {!qrCode && <RegisterChildForm handleSubmit={handleSubmit} />}
      {qrCode && !showModal && (
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-xl font-bold text-center">Niño Registrado</h1>
          <p>Bienvenido al parque!! 🥳</p>
          <Button
            label="Ver Código QR"
            onClick={() => {
              setShowModal(true);
            }}
          />
          <button
            className="px-4 py-2 rounded-md font-bold flex items-center justify-center bg-white shadow-md hover:bg-gray-100 active:bg-gray-300 duration-300"
            onClick={() => setQrCode("")}
          >
            Registrar otro niño
          </button>
        </div>
      )}
      {qrCode && showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h1 className="text-xl font-bold text-center">Niño Registrado</h1>
          <p>Bienvenido al parque!! 🥳</p>
          <img src={qrCode} alt="No fue pósible cargar el codigo qr" />
          <div>
            <span className="font-bold">IMPORTANTE!!</span> Toma screenshot de
            tu código QR
          </div>
        </Modal>
      )}
    </div>
  );
}
