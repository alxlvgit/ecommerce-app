import { createFileRoute } from "@tanstack/react-router";
import { Item } from "@shopping-app/core/src/db/queries/itemsQueries";
import ShoppingItem from "../../components/ui/ShoppingItem";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/")({
  component: HomePage,
});

function HomePage() {
  const { getToken } = useKindeAuth();

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
    <div className="flex min-h-full w-full flex-col justify-center py-12 px-4 lg:px-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 my-6 w-full">
        {isPending ? (
          <div className="animate-spin col-span-full rounded-full h-16 w-16 mx-auto border-t-2 border-b-2 border-gray-900"></div>
        ) : (
          data &&
          data.items.length > 0 &&
          data.items.map((item) => <ShoppingItem key={item.id} item={item} />)
        )}
      </div>
    </div>
  );
}
