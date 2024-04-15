import {
  pgTable,
  text,
  varchar,
  timestamp,
  index,
  numeric,
  serial,
  integer,
} from "drizzle-orm/pg-core";
import { shoppingCart } from "./shoppingCarts";
export const items = pgTable(
  "Items",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    title: varchar("title", { length: 100 }).notNull(),
    price: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    description: text("description").notNull(),
    imageUrl: text("image_url").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => {
    return {
      nameIdx: index("userId_item_idx").on(table.userId),
    };
  }
);

export const itemsToCarts = pgTable("itemsToCarts", {
  itemId: integer("item_id")
    .notNull()
    .references(() => items.id),
  cartId: integer("cart_id")
    .notNull()
    .references(() => shoppingCart.id),
});
