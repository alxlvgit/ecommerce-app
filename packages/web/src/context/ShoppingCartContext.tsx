import { Item } from "@shopping-app/core/src/db/queries/itemsQueries";
import { CartType } from "../components/ui/Cart";
import { useState } from "react";
import { createContext, useContext } from "react";

export type ShoppingCartContextType = {
  items: Item[];
  cart: CartType;
  addCart: (cart: CartType) => void;
  addItem: (item: Item) => void;
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
  const [cart, setCart] = useState({} as CartType);

  const addCart = (cart: CartType) => {
    setCart(cart);
  };

  const addItem = (item: Item) => {
    setItems((prevItems) => [...prevItems, item]);
  };

  return (
    <ShoppingCartContext.Provider
      value={{
        items,
        cart,
        addCart,
        addItem,
      }}
    >
      {children}
    </ShoppingCartContext.Provider>
  );
}
