import { createFileRoute, Link } from "@tanstack/react-router";
import Button from "../components/Button";
import HomeIcon from "../components/HomeIcon";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center gap-4">
      <div className="absolute top-0 right-0 h-14 flex items-center justify-end p-4">
        <Link to="/admin">
          <HomeIcon />
        </Link>
      </div>
      <h1 className="text-xl font-bold">Bienvenido a la Casa del Arbol!</h1>
      <Link to="/register-child">
        <Button
          label="Registra a tu niño para entrar al parque!"
          onClick={() => {}}
        />
      </Link>
    </div>
  );
}
