import express from "express";
import { placeOrder, getPendingOrders, getCompletedOrders } from "../controllers/orderController.js";

const router = express.Router();

router.post("/order", placeOrder);

router.get("/pending", getPendingOrders);
router.get("/completed", getCompletedOrders);

export default router;
