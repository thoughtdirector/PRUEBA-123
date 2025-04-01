interface Props {
  children: React.ReactNode;
  onClose?: () => void;
}

const Modal = ({ children, onClose = () => {} }: Props) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 ">
      <button className="absolute top-4 right-4 text-white" onClick={onClose}>
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
            d="M3.75 3.75l16.5 16.5m0-16.5L3.75 20.25"
          />
        </svg>
      </button>
      <main className="bg-white p-6 rounded shadow-lg flex flex-col items-center justify-center gap-4">
        {children}
      </main>
    </div>
  );
};

export default Modal;
