import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { Item } from "@shopping-app/core/src/db/queries/itemsQueries";

const ShoppingItem = ({ item }: { item: Item }) => {
  const { user } = useKindeAuth();
  const addToCart = async () => {
    console.log("Add to cart");
  };

  const handleDelete = async () => {
    console.log("Delete item");
  };

  return (
    <div className="flex flex-col h-full w-full col-span-1 rounded-lg border shadow-lg">
      <div className="flex-1">
        <img
          alt="Image"
          className="aspect-video object-cover w-full rounded-t-lg brightness-75"
          src="/placeholder.jpg"
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
