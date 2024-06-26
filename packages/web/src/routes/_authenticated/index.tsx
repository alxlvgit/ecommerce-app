import { createFileRoute } from "@tanstack/react-router";
import { Item } from "@shopping-app/core/src/db/queries/itemsQueries";
import ShoppingItem from "../../components/ui/ShoppingItem";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useQuery } from "@tanstack/react-query";
import { ShoppingCartContext } from "../../context/ShoppingCartContext";
import AddItemDialog from "../../components/ui/AddItemDialog";
import LogoutButton from "../../components/ui/LogoutButton";
import ShoppingCart from "../../components/ui/Cart";
import { useContext } from "react";

export const Route = createFileRoute("/_authenticated/")({
  component: HomePage,
});

function HomePage() {
  const { getToken } = useKindeAuth();
  const { cart } = useContext(ShoppingCartContext);

  async function fetchItems() {
    const token = await getToken();
    if (!token) {
      throw new Error("No token found");
    }
    const response = await fetch(import.meta.env.VITE_APP_API_URL + "/items", {
      headers: {
        Authorization: token,
      },
    });
    const data = await response.json();
    return data as { items: Item[] };
  }

  const { isPending, data } = useQuery({
    queryKey: ["fetchItems"],
    queryFn: fetchItems,
  });

  return (
    <>
      <div className="px-4 lg:px-16 py-4 flex gap-2 justify-between">
        <AddItemDialog />
        <div className="flex gap-10">
          <ShoppingCart />
          <LogoutButton />
        </div>
      </div>
      <hr />
      <div className="flex min-h-full w-full flex-col justify-center py-12 px-4 lg:px-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 my-6 w-full">
          {isPending ? (
            <div className="animate-spin col-span-full rounded-full h-16 w-16 mx-auto border-t-2 border-b-2 border-gray-900"></div>
          ) : (
            data &&
            cart &&
            data.items.length > 0 &&
            data.items.map((item) => <ShoppingItem key={item.id} item={item} />)
          )}
        </div>
      </div>
    </>
  );
}
