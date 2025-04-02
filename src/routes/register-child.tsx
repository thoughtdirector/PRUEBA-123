import { createFileRoute } from "@tanstack/react-router";
import RegisterChildForm from "../components/RegisterChildForm";
import { useState } from "react";

export const Route = createFileRoute("/register-child")({
  component: RouteComponent,
});

function RouteComponent() {
  const [qrCode, setQrCode] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    // console.log(data);
    const qrkey = JSON.stringify(data);
    const qrCode = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
      qrkey
    )}&size=200x200`;
    // Register the child in the database
    setQrCode(qrCode);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      {!qrCode && <RegisterChildForm handleSubmit={handleSubmit} />}
      {qrCode && (
        <>
          <h1 className="text-xl font-bold text-center">Niño Registrado</h1>
          <p>Bienvenido al parque!! 🥳</p>
          <img src={qrCode} alt="No fue pósible cargar el codigo qr" />
          <div className="p-4 bg-red-300/50 rounded-md text-red-700 text-center w-11/12 md:w-auto">
            <span className="font-bold">IMPORTANTE!!</span> Toma screenshot de
            tu código QR
          </div>
          <button
            className="px-4 py-2 cursor-pointer rounded-md font-bold flex items-center justify-center bg-white shadow-md hover:bg-gray-300 active:bg-gray-300 duration-300"
            onClick={() => setQrCode("")}
          >
            Registrar otro niño
          </button>
        </>
      )}
    </div>
  );
}
