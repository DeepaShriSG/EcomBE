import express from "express";
import UserRoutes from "../routes/user.js";
import ProductRoute from "../routes/products.js";
import WebhookRoute from "../common/webhook.js"
import Auth from "../common/auth.js";

const route = express.Router();

route.use("/user",UserRoutes);
route.use("/products",ProductRoute);
route.use("/webhook",WebhookRoute);

export default route;
