import { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { NotFound } from "../components/not-found";
import LogoutButton from "../components/ui/LogoutButton";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import AddItemDialog from "../components/ui/AddItemDialog";
import ShoppingCart from "../components/ui/Cart";
import { ShoppingCartProvider } from "../context/ShoppingCartContext";

const RootLayout = () => {
  const { isAuthenticated } = useKindeAuth();

  return (
    <>
      {isAuthenticated && (
        <ShoppingCartProvider>
          <div className="px-4 lg:px-16 py-4 flex gap-2 justify-between">
            <AddItemDialog />
            <div className="flex gap-10">
              <ShoppingCart />
              <LogoutButton />
            </div>
          </div>
          <hr />
          <Outlet />
        </ShoppingCartProvider>
      )}
    </>
  );
};

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: RootLayout,
  notFoundComponent: NotFound,
});
