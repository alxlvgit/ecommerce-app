import { Hono } from "hono";
import { handle } from "hono/aws-lambda";

const app = new Hono();

app.get("/", (c) => c.json({ message: "Hello, from Lambda!" }));

export const handler = handle(app);
