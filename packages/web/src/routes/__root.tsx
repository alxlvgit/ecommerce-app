import { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  Link,
  Outlet,
} from "@tanstack/react-router";
import { NotFound } from "../components/not-found";
import LogoutButton from "../components/ui/LogoutButton";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

const RootLayout = () => {
  const { isAuthenticated } = useKindeAuth();

  return (
    <>
      <div className="px-4 py-2 flex gap-2 justify-between">
        <Link
          to="/"
          className="text-blue-800 font-bold flex justify-center items-center"
        >
          Home
        </Link>
        {isAuthenticated && <LogoutButton />}
      </div>
      <hr />
      <Outlet />
    </>
  );
};

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: RootLayout,
  notFoundComponent: NotFound,
});
