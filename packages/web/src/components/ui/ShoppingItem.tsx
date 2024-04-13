import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { Item } from "@shopping-app/core/src/db/queries/itemsQueries";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const ShoppingItem = ({ item }: { item: Item }) => {
  const { user } = useKindeAuth();
  const { getToken } = useKindeAuth();
  const queryClient = useQueryClient();

  const addToCart = async () => {
    console.log("Add to cart");
  };

  const mutation = useMutation({
    mutationFn: async (id: number) => {
      const token = await getToken();
      if (!token) {
        throw new Error("No token found");
      }
      const response = await fetch(
        import.meta.env.VITE_APP_API_URL + "/item/" + id,
        {
          method: "DELETE",
          headers: {
            Authorization: token,
          },
        }
      );
      return response.json();
    },
  });

  const handleDelete = async () => {
    const id = item.id;
    await mutation.mutateAsync(id);
    await queryClient.refetchQueries({
      queryKey: ["fetchItems"],
    });
  };

  return (
    <div className="flex flex-col h-full w-full col-span-1 rounded-lg border shadow-lg">
      <div className="flex-1">
        <img
          alt="Image"
          className="aspect-video object-cover w-full rounded-t-lg brightness-75"
          src={
            item.imageUrl ? item.imageUrl : "https://via.placeholder.com/300"
          }
        />
        <div className="flex justify-between flex-col md:flex-row gap-4 w-full p-4">
          <div className="grid gap-0.5 leading-none text-sm font-medium">
            <h3 className="line-clamp-2 text-base mb-1">{item.title}</h3>
            <p className="text-base font-bold">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(+item.price)}
            </p>
          </div>
        </div>
        <div className="border-t border-gray-100 flex flex-col justify-start px-4 pb-6 pt-4">
          <p className="mb-1 text-base font-medium">Item description:</p>
          <p className="text-sm line-clamp-3 text-gray-600">
            {item.description}
          </p>
        </div>
      </div>
      <div className="border-t">
        {user?.id !== item.userId ? (
          <button
            onClick={addToCart}
            className="w-full p-4 bg-gray-100 hover:bg-gray-300 rounded-b-lg"
          >
            Add to Cart
          </button>
        ) : (
          <div className="flex">
            <button
              disabled
              className="w-full p-4 text-sm text-gray-500 bg-gray-100"
            >
              My Item
            </button>
            <button
              onClick={handleDelete}
              className="w-full p-4 hover:bg-gray-600 hover:text-white"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingItem;
