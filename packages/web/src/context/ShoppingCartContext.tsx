import { Item } from "@shopping-app/core/src/db/queries/itemsQueries";
import { CartType } from "../components/ui/Cart";
import { useEffect, useState } from "react";
import { createContext, useContext } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

export type ShoppingCartContextType = {
  items: Item[];
  cart: CartType | null;
  addCart: (cart: CartType) => void;
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
  const [items, setItems] = useState([] as Item[]);
  const [cart, setCart] = useState<CartType | null>(null);
  const { user, getToken } = useKindeAuth();
  const queryClient = useQueryClient();

  const addCart = (cart: CartType) => {
    setCart(cart);
  };

  const addItemToCart = (item: Item) => {
    setItems((prevItems) => [...prevItems, item]);
  };

  const removeItemFromCart = (id: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  // Temporary. Item can be added to cart only once for now, no quantity
  const itemIsInCart = (id: number) => {
    return items.some((item) => item.id === id);
  };

  // Prefetch the cart and items when the user logs in
  useEffect(() => {
    // Create a cart if the user doesn't have one
    const createCart = async () => {
      const token = await getToken();
      if (!token || !user?.id) {
        throw new Error("No token found");
      }
      const response = await fetch(import.meta.env.VITE_APP_API_URL + "/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          user_id: user?.id,
          created_at: new Date().toISOString(),
        }),
      });
      if (!response.ok) {
        throw new Error("An error occurred while creating the cart");
      }
      const data = await response.json();
      addCart(data.cart);
      return data.cart;
    };

    // Fetch the cart and items
    const fetchCart = async () => {
      const token = await getToken();
      if (!token || !user?.id) {
        throw new Error("No token found");
      }
      const response = await fetch(
        import.meta.env.VITE_APP_API_URL + "/cart/" + user?.id,
        {
          headers: {
            Authorization: token,
          },
        }
      );
      let cart = null;
      const data = (await response.json()) as { cart: CartType };
      if (!data.cart) {
        cart = await createCart();
      } else {
        cart = data.cart;
      }
      const itemsData = await fetch(
        import.meta.env.VITE_APP_API_URL + "/cart-items/" + cart.id,
        {
          headers: { Authorization: token },
        }
      );
      const items = (await itemsData.json()) as { items: Item[] };
      setItems(items.items);

      addCart(cart);
      return data;
    };

    // Prefetch the cart
    const prefetchCart = async () => {
      await queryClient.fetchQuery({
        queryKey: ["fetchCart"],
        queryFn: fetchCart,
      });
    };
    prefetchCart();
  }, [getToken, user, queryClient]);

  return (
    <ShoppingCartContext.Provider
      value={{
        items,
        cart,
        addCart,
        addItemToCart,
        removeItemFromCart,
        itemIsInCart,
      }}
    >
      {children}
    </ShoppingCartContext.Provider>
  );
}
