import { pgTable, text, timestamp, index, serial } from "drizzle-orm/pg-core";
export const shoppingCart = pgTable(
  "ShoppingCarts",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => {
    return {
      nameIdx: index("userId_cart_idx").on(table.userId),
    };
  }
);
