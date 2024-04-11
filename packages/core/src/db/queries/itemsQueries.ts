import { items as itemsTable } from "../schema/items";
import { db } from "../index";
import { desc } from "drizzle-orm";

export const allItemsQuery = db
  .select()
  .from(itemsTable)
  .orderBy(desc(itemsTable.createdAt))
  .prepare("allItemsQuery");

export type Item = Awaited<ReturnType<typeof allItemsQuery.execute>>[0];
