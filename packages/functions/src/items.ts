import { Hono } from "hono";
import { handle } from "hono/aws-lambda";

import { items as itemsTable } from "@shopping-app/core/db/schema/items";
import { itemsToCarts } from "@shopping-app/core/db/schema/items";
import { db } from "@shopping-app/core/db";
import { allItemsQuery } from "@shopping-app/core/db/queries/itemsQueries";
import { authMiddleware } from "@shopping-app/core/auth";
import { and, eq } from "drizzle-orm";
import { cartItemsQuery } from "@shopping-app/core/db/queries/cartQueries";

const app = new Hono();

app.get("/items", authMiddleware, async (c) => {
  const items = await allItemsQuery.execute();
  return c.json({ items });
});

app.post("/item", authMiddleware, async (c) => {
  const userId = c.var.userId;
  const body = await c.req.json();
  const item = {
    ...body.item,
    userId,
  };
  const newItem = await db.insert(itemsTable).values(item).returning();
  return c.json({ newItem });
});

app.delete("/item/:id", authMiddleware, async (c) => {
  const itemId = c.req.param("id");
  const userId = c.var.userId;
  await db.delete(itemsToCarts).where(eq(itemsToCarts.itemId, +itemId));
  await db
    .delete(itemsTable)
    .where(and(eq(itemsTable.id, +itemId), eq(itemsTable.userId, userId)));
  return c.json({ success: true });
});

app.post("/item-to-cart", authMiddleware, async (c) => {
  const body = await c.req.json();
  const { itemId, cartId } = body;
  await db.insert(itemsToCarts).values({ itemId, cartId }).returning();
  return c.json({ success: true });
});

app.get("/cart-items/:cartId", authMiddleware, async (c) => {
  const cartId = c.req.param("cartId");
  const items = await cartItemsQuery.execute({ cartId });
  return c.json({ items });
});

app.delete("/item-in-cart/:id", authMiddleware, async (c) => {
  const itemId = c.req.param("id");
  await db.delete(itemsToCarts).where(eq(itemsToCarts.itemId, +itemId));
  return c.json({ success: true });
});

export const handler = handle(app);
