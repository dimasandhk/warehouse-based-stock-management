import { env } from "@warehouse-based-stock-management-oppo-technical-test/env/server";
import cors from "cors";
import express from "express";

// Routes
import sparepartsRoute from "./spareparts/spareparts.route"

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST", "OPTIONS"],
  }),
);

app.use(express.json());

app.use("/api/sparepart", sparepartsRoute);

app.get("/", (_req, res) => {
  res.status(200).send("OK");
});

app.get("/health", (_req, res) => {
  res.status(200).send("OK");
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
