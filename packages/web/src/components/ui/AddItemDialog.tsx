import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  DialogActions,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";

type Item = {
  userId: string;
  title: FormDataEntryValue;
  price: FormDataEntryValue;
  description: FormDataEntryValue;
  CreatedAt: string;
};

const AddItemDialog = () => {
  const { user, getToken } = useKindeAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const mutation = useMutation({
    mutationFn: async (item: Item) => {
      const token = await getToken();
      if (!token) {
        throw new Error("No token found");
      }
      const response = await fetch(import.meta.env.VITE_APP_API_URL + "/item", {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ item }),
      });
      return response.json();
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const formJson = Object.fromEntries((formData as FormData).entries());
    const { title, price, description } = formJson;
    if (!user) return;
    const item = {
      userId: user.id as string,
      title,
      price,
      description,
      CreatedAt: new Date().toISOString(),
    };
    await mutation.mutateAsync(item);
    await queryClient.refetchQueries({
      queryKey: ["fetchItems"],
    });
    handleClose();
  };

  return (
    <React.Fragment>
      <Button variant="outlined" onClick={handleClickOpen}>
        Add New Item
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: "form",
          onSubmit: handleSubmit,
        }}
      >
        <DialogTitle>Add New Item To Sell</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the details of the item you want to sell.
          </DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            id="title"
            name="title"
            label="Item Title"
            type="text"
            fullWidth
            variant="standard"
          />
          <TextField
            required
            margin="dense"
            id="price"
            name="price"
            label="Price"
            type="number"
            fullWidth
            variant="standard"
          />
          <TextField
            required
            margin="dense"
            id="description"
            name="description"
            label="Description"
            type="text"
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit">Add</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default AddItemDialog;
