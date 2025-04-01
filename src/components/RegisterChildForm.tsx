import Button from "./Button";

interface Props {
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const RegisterChildForm = ({ handleSubmit }: Props) => {
  return (
    <form
      className="flex flex-col gap-4 w-[80%] md:w-md max-w-md p-8 items-center rounded-xl bg-white shadow-md"
      onSubmit={handleSubmit}
    >
      <h1 className="text-xl font-bold text-center">
        Formulario de Registro de Ingreso al Parque
      </h1>
      <input
        className="flex items-center px-4 py-2 rounded bg-gray-100 hover:bg-gray-300 active:bg-gray-300 duration-300"
        name="nombre_padre"
        placeholder="Nombre del Padre"
      />
      <input
        className="flex items-center px-4 py-2 rounded bg-gray-100 hover:bg-gray-300 active:bg-gray-300 duration-300"
        name="cc_padre"
        placeholder="CC del Padre"
      />
      <input
        className="flex items-center px-4 py-2 rounded bg-gray-100 hover:bg-gray-300 active:bg-gray-300 duration-300"
        name="contacto"
        placeholder="Número de Contacto"
      />
      <input
        className="flex items-center px-4 py-2 rounded bg-gray-100 hover:bg-gray-300 active:bg-gray-300 duration-300"
        name="nombre_hijo"
        placeholder="Nombre del Hijo"
      />
      <input
        className="flex items-center px-4 py-2 rounded bg-gray-100 hover:bg-gray-300 active:bg-gray-300 duration-300"
        name="id_hijo"
        placeholder="Identificación del Hijo"
      />
      <Button
        label="Registrar y Generar Ticket de Entrada al Parque"
        onClick={() => {}}
      />
    </form>
  );
};

export default RegisterChildForm;
