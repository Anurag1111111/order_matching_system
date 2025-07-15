import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

// Route file
import orderRoutes from "./routes/orderRoutes.js";

// Load .env first
dotenv.config();

export const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS
app.use(
  cors({
    origin: "*", // only for testing
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  })
);

// Test route
app.get("/", (req, res) => {
  res.send("Order Matching API is running!");
});

// Use single route file
app.use("/api", orderRoutes);
