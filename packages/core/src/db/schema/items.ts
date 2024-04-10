import {
  pgTable,
  text,
  varchar,
  timestamp,
  index,
  numeric,
  serial,
} from "drizzle-orm/pg-core";
export const items = pgTable(
  "items",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    title: varchar("title", { length: 100 }).notNull(),
    price: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => {
    return {
      nameIdx: index("userId_idx").on(table.userId),
    };
  }
);
