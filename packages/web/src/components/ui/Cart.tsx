import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ShoppingCart from "@mui/icons-material/ShoppingCart";
import { useShoppingCart } from "../../context/ShoppingCartContext";

export interface CartType {
  id: number;
  user_id: number;
  created_at: string;
}

export default function Cart() {
  const [open, setOpen] = React.useState(false);
  const { items, cart } = useShoppingCart();

  React.useEffect(() => {
    if (cart) console.log(cart);
    if (items) console.log(items);
  }, [cart, items]);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const DrawerList = (
    <Box sx={{ width: 450 }} role="presentation" onClick={toggleDrawer(false)}>
      <List>
        <div className="flex justify-between items-center px-4 py-2">
          <h1 className="text-xl">Shopping Cart</h1>
          <Button>Clear</Button>
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
              <Button>Remove</Button>
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
          0
        </div>
      </Button>
      <Drawer open={open} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>
    </div>
  );
}
