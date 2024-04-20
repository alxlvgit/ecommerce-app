import { Item } from "@shopping-app/core/src/db/queries/itemsQueries";
import { CartType } from "../components/ui/Cart";
import { useState } from "react";
import { createContext, useContext } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

export type ShoppingCartContextType = {
  items: Item[];
  cart: CartType | undefined;
  addItemToCart: (item: Item) => void;
  removeItemFromCart: (id: number) => void;
  itemIsInCart: (id: number) => boolean;
};

export const ShoppingCartContext = createContext<ShoppingCartContextType>(
  {} as ShoppingCartContextType
);

export const useShoppingCart = () => {
  return useContext(ShoppingCartContext);
};

export function ShoppingCartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [itemsInCart, setItems] = useState([] as Item[]);
  const { user, getToken } = useKindeAuth();

  const addItemToCart = (item: Item) => {
    setItems((prevItems) => [...prevItems, item]);
  };

  const removeItemFromCart = (id: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  // Temporary. Item can be added to cart only once for now, no quantity
  const itemIsInCart = (id: number) => {
    return itemsInCart.some((item) => item.id === id);
  };

  // The mutation to create a cart for the user if it doesn't exist in the database
  const createCartMutation = useMutation({
    mutationFn: async ({
      user_id,
      created_at,
    }: {
      user_id: string;
      created_at: string;
    }) => {
      const token = await getToken();
      if (!token || !user_id) {
        throw new Error("No token found");
      }
      const response = await fetch(import.meta.env.VITE_APP_API_URL + "/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          user_id,
          created_at,
        }),
      });
      if (!response.ok) {
        throw new Error("An error occurred while creating the cart");
      }
      const data = await response.json();
      return data;
    },
  });

  // Fetch the cart and cart items
  const fetchCart = async () => {
    try {
      const token = await getToken();
      if (!token || !user?.id) {
        throw new Error("No token found");
      }
      let data = null;
      const response = await fetch(
        import.meta.env.VITE_APP_API_URL + "/cart/" + user?.id,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      const fetchedCart = (await response.json()) as { cart: CartType };
      if (!fetchedCart.cart) {
        const newCart = await createCartMutation.mutateAsync({
          user_id: user?.id,
          created_at: new Date().toISOString(),
        });
        data = newCart;
      } else {
        data = fetchedCart;
      }
      const itemsData = await fetch(
        import.meta.env.VITE_APP_API_URL + "/cart-items/" + data.cart.id,
        {
          headers: { Authorization: token },
        }
      );
      const items = (await itemsData.json()) as { items: Item[] };
      setItems(items.items);
      return data as { cart: CartType };
    } catch (error) {
      console.error(error);
      return { cart: undefined };
    }
  };

  const { data } = useQuery({
    queryKey: ["fetchCart"],
    queryFn: fetchCart,
  });

  return (
    <ShoppingCartContext.Provider
      value={{
        items: itemsInCart,
        cart: data?.cart,
        addItemToCart,
        removeItemFromCart,
        itemIsInCart,
      }}
    >
      {children}
    </ShoppingCartContext.Provider>
  );
}
