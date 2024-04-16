import { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { NotFound } from "../components/not-found";
import LogoutButton from "../components/ui/LogoutButton";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import AddItemDialog from "../components/ui/AddItemDialog";
import ShoppingCart from "../components/ui/Cart";

const RootLayout = () => {
  const { isAuthenticated } = useKindeAuth();

  return (
    <>
      <div className="px-4 lg:px-16 py-4 flex gap-2 justify-between">
        {isAuthenticated && <AddItemDialog />}
        <div className="flex gap-10">
          {isAuthenticated && <ShoppingCart />}
          {isAuthenticated && <LogoutButton />}
        </div>
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
