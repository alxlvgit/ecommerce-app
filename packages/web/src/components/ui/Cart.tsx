import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ShoppingCart from "@mui/icons-material/ShoppingCart";
import { useShoppingCart } from "../../context/ShoppingCartContext";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useMutation } from "@tanstack/react-query";

export interface CartType {
  id: number;
  user_id: number;
  created_at: string;
}

export default function Cart() {
  const [open, setOpen] = React.useState(false);
  const { items, removeItemFromCart } = useShoppingCart();
  const { getToken } = useKindeAuth();

  const removeItemFromCartMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = await getToken();
      if (!token) {
        throw new Error("No token found");
      }
      const response = await fetch(
        import.meta.env.VITE_APP_API_URL + "/item-in-cart/" + id,
        {
          method: "DELETE",
          headers: {
            Authorization: token,
          },
        }
      );
      return (await response.json()) as { success: boolean };
    },
  });

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const handleRemoveItemFromCart = async (id: number) => {
    try {
      const removedItemFromCart =
        await removeItemFromCartMutation.mutateAsync(id);
      if (removedItemFromCart && removedItemFromCart.success) {
        removeItemFromCart(id);
      } else {
        throw new Error("Failed to remove item from cart");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const DrawerList = (
    <Box sx={{ width: 450 }} role="presentation" onClick={toggleDrawer(false)}>
      <List>
        <div className="flex justify-between items-center px-4 py-2">
          <h1 className="text-xl">Shopping Cart</h1>
        </div>
      </List>
      <Divider />
      <List>
        {items &&
          items.length > 0 &&
          items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center px-4 py-2"
            >
              <h1>{item.title}</h1>
              <Button onClick={() => handleRemoveItemFromCart(item.id)}>
                Remove
              </Button>
            </div>
          ))}
      </List>
    </Box>
  );

  return (
    <div>
      <Button onClick={toggleDrawer(true)}>
        <ShoppingCart fontSize="large" />
        <div className="absolute top-0 left-11 inline-block bg-red-600 text-white rounded-full px-2 py-1 text-xs">
          {items.length}
        </div>
      </Button>
      <Drawer open={open} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>
    </div>
  );
}
