import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
  component: () => (
    <div className="w-full h-dvh flex flex-col items-center bg-blue-100">
      <Link
        to="/"
        className="fixed top-0 left-0 h-14 flex items-center justify-start p-4"
      >
        <h1 className="font-bold">Inicio</h1>
      </Link>

      <Outlet />
      <TanStackRouterDevtools />
    </div>
  ),
});
