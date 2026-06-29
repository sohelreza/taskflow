import { Nav } from "@/components/Nav";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div>
      <Nav />
      <Outlet />
      <TanStackRouterDevtools />
    </div>
  );
}
