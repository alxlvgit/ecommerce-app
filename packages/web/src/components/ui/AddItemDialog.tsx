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
import React, { useState } from "react";
import zod from "zod";

type Item = {
  title: FormDataEntryValue;
  price: FormDataEntryValue;
  description: FormDataEntryValue;
  imageUrl?: string;
};

const AddItemDialog = () => {
  const { user, getToken } = useKindeAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [imageFile, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  const itemSchema = zod.object({
    title: zod.string(),
    price: zod.string(),
    description: zod.string(),
    imageUrl: zod.string(),
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setFile(null);
    setPreviewUrl(null);
    setStatusMessage("");
    setOpen(false);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setStatusMessage("");
    setPreviewUrl(null);
    setFile(file);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const computeSHA256 = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  };

  const mutation = useMutation({
    mutationFn: async ({
      item,
      imageFile,
    }: {
      item: Item;
      imageFile: File | null;
    }) => {
      const token = await getToken();
      if (!token) {
        throw new Error("No token found");
      }
      if (imageFile) {
        const signedURLResponse = await fetch(
          import.meta.env.VITE_APP_API_URL + "/signed-url",
          {
            method: "POST",
            headers: {
              Authorization: token,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contentType: imageFile.type,
              contentLength: imageFile.size,
              checksum: await computeSHA256(imageFile),
            }),
          }
        );
        if (!signedURLResponse.ok) {
          throw new Error("An error occurred while creating the signed URL");
        }
        const { url } = (await signedURLResponse.json()) as { url: string };

        await fetch(url, {
          method: "PUT",
          body: imageFile,
          headers: {
            "Content-Type": imageFile.type,
          },
        });

        const imageUrl = url.split("?")[0];
        item.imageUrl = imageUrl;
      }

      const validationResult = itemSchema.safeParse(item);
      if (!validationResult.success) {
        throw new Error("Invalid item data");
      }

      const response = await fetch(import.meta.env.VITE_APP_API_URL + "/item", {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ item }),
      });
      if (!response.ok) {
        throw new Error("An error occurred while creating the item");
      }
      return response.json();
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const formData = new FormData(event.target as HTMLFormElement);
      const formJson = Object.fromEntries((formData as FormData).entries());
      const { title, price, description } = formJson;

      if (!user) return;
      const item = {
        title,
        price,
        description,
      };
      setStatusMessage("Adding item...");
      if (!imageFile) {
        setStatusMessage("Please select an image");
        return;
      }
      await mutation.mutateAsync({ item, imageFile });
      await queryClient.refetchQueries({
        queryKey: ["fetchItems"],
      });
      handleClose();
    } catch (error) {
      setStatusMessage("Error adding item");
    }
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
            inputProps={{ min: 0, step: 0.01 }}
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
          <label htmlFor="image" style={{ width: "100%" }}>
            <Button
              component="span"
              variant="outlined"
              style={{ width: "30%", marginTop: "2rem" }}
            >
              Upload Image
            </Button>
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageFileChange}
              id="image"
              name="image"
            />
          </label>
          {previewUrl && (
            <div className="mt-4 relative overflow-hidden">
              {imageFile?.type?.startsWith("image/") ? (
                <img
                  src={previewUrl}
                  alt="Selected file"
                  width={200}
                  height={200}
                />
              ) : null}
            </div>
          )}
          {statusMessage && (
            <p className="bg-blue-500 border border-blue-800 text-center rounded-lg text-sm w-full text-white px-4 py-2 mt-8 relative">
              {statusMessage}
            </p>
          )}
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
