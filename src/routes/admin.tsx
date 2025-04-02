import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import LoginForm from "../components/Admin/LoginForm";
import { ChildrenPlaying, ChildrenPlayingList, convertToChildrenPlaying } from "../types";
import ChildrenPlayingTable from "../components/Admin/ChildrenPlayingTable";
import Button from "../components/Button";
import QRScanner from "../components/QRScanner";
import Modal from "../components/Modal";
import { getUserByPrimaryKey, startPlayTime, stopPlayTime, subscribeToActiveSessions } from "../firebase/services";

export const Route = createFileRoute("/admin")({
  component: RouteComponent,
});

// Credenciales hardcodeadas para demostración
// En producción, esto debería ser reemplazado por una autenticación real
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "admin123"
};

function RouteComponent() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [childrenPlaying, setChildrenPlaying] = useState<ChildrenPlayingList>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmStopModal, setConfirmStopModal] = useState<{ show: boolean; child: ChildrenPlaying | null }>({
    show: false,
    child: null
  });
  const [notification, setNotification] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('admin_logged_in') === 'true';
    if (isLoggedIn) {
      setLoggedIn(true);
    }
  }, []);

  const bypassLogin = () => {
    setLoggedIn(true);
    localStorage.setItem('admin_logged_in', 'true');
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleCodeScanned = async (code: string) => {
    setIsLoading(true);
    try {
      const primaryKey = code.trim();
      
      const userResult = await getUserByPrimaryKey(primaryKey);
      
      if (!userResult.success) {
        showNotification(`Error: ${userResult.error}`, 'error');
        setIsLoading(false);
        setQrScannerOpen(false);
        return;
      }
      
      const userData = userResult.userData;
      
      const playTimeResult = await startPlayTime(primaryKey);
      
      if (playTimeResult.success) {
        showNotification(`¡Tiempo de juego iniciado para ${userData.childName}!`);
      } else {
        if (playTimeResult.error === "Child already has an active play session") {
          showNotification(`${userData.childName} ya tiene una sesión de juego activa.`, 'error');
        } else {
          showNotification(`Error: ${playTimeResult.error}`, 'error');
        }
      }
    } catch (error) {
      console.error("Error al procesar código QR:", error);
      showNotification("Error al procesar el código QR.", 'error');
    } finally {
      setIsLoading(false);
      setQrScannerOpen(false);
    }
  };

  const handleStopTime = (child: ChildrenPlaying) => {
    setConfirmStopModal({
      show: true,
      child
    });
  };

  const confirmStopTime = async () => {
    if (!confirmStopModal.child || !confirmStopModal.child.id) {
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await stopPlayTime(confirmStopModal.child.id);
      
      if (result.success) {
        showNotification(`Tiempo finalizado para ${confirmStopModal.child.child_name}. Tiempo jugado: ${result.playedMinutes} minutos.`);
      } else {
        showNotification(`Error: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error("Error al finalizar tiempo:", error);
      showNotification("Error al finalizar el tiempo de juego.", 'error');
    } finally {
      setIsLoading(false);
      setConfirmStopModal({ show: false, child: null });
    }
  };

  useEffect(() => {
    if (!loggedIn) return;
    
    const unsubscribe = subscribeToActiveSessions((sessions) => {
      const formattedSessions = sessions.map(session => convertToChildrenPlaying(session));
      setChildrenPlaying(formattedSessions);
    });
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [loggedIn]);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    
    console.log("Credenciales ingresadas:", { username, password });
    console.log("Credenciales esperadas:", ADMIN_CREDENTIALS);
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      console.log("Inicio de sesión exitoso");
      setLoggedIn(true);
      localStorage.setItem('admin_logged_in', 'true');
      showNotification("Sesión iniciada correctamente");
    } else {
      console.log("Credenciales incorrectas");
      showNotification("Credenciales incorrectas. Usa admin/admin123", 'error');
    }
  };

  return (
    <div className="h-full w-full flex flex-col justify-center items-center gap-2 p-4">
      {/* Notificación */}
      {notification.show && (
        <div 
          className={`fixed top-4 right-4 p-4 rounded-md shadow-md z-50 ${
            notification.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {notification.message}
        </div>
      )}
      
      {!loggedIn ? (
        <>
          <LoginForm onSubmit={handleLogin} />
          {/* Botón de bypass (solo para desarrollo) */}
          <button 
            onClick={bypassLogin}
            className="mt-4 text-xs text-gray-400 underline"
          >
            Bypass Login (solo desarrollo)
          </button>
        </>
      ) : (
        <>
          <div className="w-full max-w-6xl">
            <div className="flex justify-between items-center mb-6">
              <h1 className="font-bold text-2xl">Panel de Administración</h1>
              <Button
                label="Cerrar sesión"
                onClick={() => {
                  setLoggedIn(false);
                  localStorage.removeItem('admin_logged_in');
                }}
                className="bg-red-200 text-red-700 hover:bg-red-300"
              />
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Niños Jugando Actualmente</h2>
              {childrenPlaying.length === 0 ? (
                <div className="p-6 bg-gray-100 rounded-lg text-center">
                  <p>No hay niños jugando actualmente</p>
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <ChildrenPlayingTable
                    childrenPlaying={childrenPlaying}
                    onStopTime={handleStopTime}
                  />
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Acciones</h2>
              <div className="flex flex-wrap gap-4">
                <Button
                  label={isLoading ? "Procesando..." : "Escanear código QR"}
                  onClick={() => setQrScannerOpen(true)}
                  disabled={isLoading}
                  className="bg-blue-500 text-white hover:bg-blue-600"
                />
                <Button
                  label="Ver estadísticas"
                  onClick={() => alert("Función no implementada")}
                  className="bg-purple-500 text-white hover:bg-purple-600"
                />
              </div>
            </div>
          </div>
          
          {/* Modal para escanear QR */}
          {qrScannerOpen && (
            <Modal 
              onClose={() => setQrScannerOpen(false)}
              title="Escanear Código QR"
            >
              <div className="md:w-120">
                <QRScanner onCodeScanned={handleCodeScanned} />
                <p className="mt-4 text-sm text-gray-600">
                  Apunta la cámara al código QR del ticket para registrar la entrada/salida
                </p>
              </div>
            </Modal>
          )}
          
          {/* Modal de confirmación para detener tiempo */}
          {confirmStopModal.show && (
            <Modal 
              onClose={() => setConfirmStopModal({ show: false, child: null })}
              title="Confirmar Finalización de Tiempo"
            >
              <div className="w-full max-w-md p-6">
                <p>
                  ¿Estás seguro que ya le cobraste al usuario por el tiempo de {" "}
                  <span className="font-bold">{confirmStopModal.child?.child_name}</span>?
                </p>
                <div className="flex justify-end gap-4 mt-6">
                  <Button
                    label="No"
                    onClick={() => setConfirmStopModal({ show: false, child: null })}
                    className="bg-gray-200 text-gray-800 hover:bg-gray-300"
                  />
                  <Button
                    label={isLoading ? "Procesando..." : "Sí, finalizar play time"}
                    onClick={confirmStopTime}
                    disabled={isLoading}
                    className="bg-red-500 text-white hover:bg-red-600"
                  />
                </div>
              </div>
            </Modal>
          )}
        </>
      )}
    </div>
  );
}