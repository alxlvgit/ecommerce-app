import { Hono } from "hono";
import { handle } from "hono/aws-lambda";

import { items as itemsTable } from "@shopping-app/core/db/schema/items";
import { db } from "@shopping-app/core/db";
import { eq, desc } from "drizzle-orm";

import { authMiddleware } from "@shopping-app/core/auth";

const app = new Hono();

app.get("/items", authMiddleware, async (c) => {
  const userId = c.var.userId;
  const expenses = await db
    .select()
    .from(itemsTable)
    .where(eq(itemsTable.userId, userId))
    .orderBy(desc(itemsTable.createdAt));
  return c.json({ expenses });
});

app.post("/item", authMiddleware, async (c) => {
  const userId = c.var.userId;
  const body = await c.req.json();
  const item = {
    ...body.item,
    userId,
  };
  const newItem = await db.insert(itemsTable).values(item).returning();
  return c.json({ item: newItem });
});

export const handler = handle(app);
