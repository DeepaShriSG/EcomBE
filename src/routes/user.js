import express from "express";
import UsersController from "../controllers/user.js";
import checkout from "../common/Payment.js"
import Auth from "../common/auth.js";

const router = express.Router();

router.get("/", Auth.validate,UsersController.getUsers);
router.get("/userId",Auth.validate,UsersController.getUserById);
router.post("/cart",Auth.validate,UsersController.addTocart);
router.post("/checkout",Auth.validate,checkout);
router.post("/signup",UsersController.createUsers);
router.post("/login",UsersController.login);
router.post("/sendotp",Auth.validate,UsersController.sendOtp);
router.post("/verify",Auth.validate,UsersController.verifyOtp);
router.post("/resetpassword",Auth.validate,UsersController.resetPassword)


export default router;
