import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import rateLimit from 'express-rate-limit';

// Route file
import orderRoutes from "./routes/orderRoutes.js";

// Load .env first
dotenv.config();

export const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100, // Limit each IP to 100 requests
  message: 'Too many requests, try again later.'
});
app.use(limiter);

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

// Test route
app.get("/", (req, res) => {
  res.send("Order Matching API is running!");
});

app.use("/api", orderRoutes);
