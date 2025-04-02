import React from "react";

interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}

const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  disabled = false,
  className = "",
  type = "button" 
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`cursor-pointer flex items-center justify-center bg-blue-300 font-bold px-4 py-2 hover:bg-blue-400 hover:shadow-md rounded-md transition-colors duration-300 ${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {label}
    </button>
  );
};

export default Button;