import Button from "../Button";

interface Props {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const LoginForm = ({ onSubmit }: Props) => {
  return (
    <form
      className="flex flex-col items-center gap-4 bg-white rounded-xl shadow-md p-4 py-10"
      onSubmit={onSubmit}
    >
      <h1 className="font-bold text-xl">Inicio de Sesión Administrador</h1>
      <input
        className="flex items-center px-4 py-2 rounded bg-gray-100 hover:bg-gray-300 active:bg-gray-300 duration-300"
        name="username"
        placeholder="Usuario"
      />
      <input
        className="flex items-center px-4 py-2 rounded bg-gray-100 hover:bg-gray-300 active:bg-gray-300 duration-300"
        name="password"
        type="password"
        placeholder="Contraseña"
      />
      <Button label="Iniciar Sesión" onClick={() => {}} />
    </form>
  );
};

export default LoginForm;
