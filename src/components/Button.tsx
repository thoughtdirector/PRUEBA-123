import React from "react";

interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  disabled = false,
  className = "",
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`cursor-pointer flex items-center justify-center bg-blue-300 font-bold px-4 py-2 hover:bg-blue-400 hover:shadow-md rounded-md duration-300 ${className} ${disabled ? "btn-disabled" : ""}`}
    >
      {label}
    </button>
  );
};

export default Button;
