import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ShoppingCart from "@mui/icons-material/ShoppingCart";
import { Close } from "@mui/icons-material";
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
    <Box role="presentation">
      <List>
        <div className="flex justify-between items-center align-middle px-4 py-2">
          <div className="flex items-center">
            <ShoppingCart fontSize="medium" color="primary" />
            <h1 className="ml-5 text-lg font-semibold">Shopping Cart</h1>
          </div>
          <Close
            onClick={toggleDrawer(false)}
            sx={{ cursor: "pointer", ":hover": { color: "red" } }}
          />
        </div>
      </List>
      <List sx={{ overflowY: "auto", marginTop: 2 }}>
        {items &&
          items.length > 0 &&
          items.map((item) => (
            <>
              <div
                key={item.id}
                className="flex items-center justify-between align-middle px-4 py-2"
              >
                <div className="flex items-center align-middle">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-10 h-10 rounded-md mr-4 object-cover"
                  />
                  <h1 className="font-semibold">{item.title}</h1>
                </div>
                <Button onClick={() => handleRemoveItemFromCart(item.id)}>
                  Remove
                </Button>
              </div>
              <Divider variant="middle" />
            </>
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
      <Drawer
        variant="temporary"
        sx={{
          "& .MuiDrawer-paper": {
            width: { xs: "100%", sm: 400 },
          },
        }}
        anchor="right"
        open={open}
        onClose={toggleDrawer(false)}
      >
        {DrawerList}
      </Drawer>
    </div>
  );
}
