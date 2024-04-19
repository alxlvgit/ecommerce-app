import { eq, sql } from "drizzle-orm";
import { db } from "../index";
import { items as itemsTable, itemsToCarts } from "../schema/items";
import { shoppingCart } from "../schema/shoppingCarts";

export const cartItemsQuery = db
  .select({
    id: itemsTable.id,
    userId: itemsTable.userId,
    title: itemsTable.title,
    price: itemsTable.price,
    description: itemsTable.description,
    imageUrl: itemsTable.imageUrl,
    createdAt: itemsTable.createdAt,
  })
  .from(itemsToCarts)
  .leftJoin(itemsTable, eq(itemsTable.id, itemsToCarts.itemId))
  .leftJoin(shoppingCart, eq(shoppingCart.id, itemsToCarts.cartId))
  .where(eq(shoppingCart.id, sql.placeholder("cartId")))
  .prepare("cartItemsQuery");
