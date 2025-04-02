import { useEffect } from "react";

interface Props {
  children: React.ReactNode;
  onClose?: () => void;
  title?: string;
}

const Modal = ({ children, onClose = () => {}, title }: Props) => {
  // Manejar el cierre con Escape
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Añadir el event listener
    document.addEventListener('keydown', handleEscapeKey);

    // Deshabilitar el scroll en el body
    document.body.style.overflow = 'hidden';

    // Limpieza al desmontar
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  // Prevenir que los clics dentro del modal se propaguen al overlay
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white p-6 rounded-lg shadow-lg flex flex-col relative max-w-3xl max-h-[90vh] overflow-auto"
        onClick={handleModalClick}
      >
        <button 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700" 
          onClick={onClose}
          aria-label="Cerrar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        
        {title && (
          <h2 className="text-xl font-bold mb-4">{title}</h2>
        )}
        
        <div className="flex flex-col items-center justify-center gap-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;