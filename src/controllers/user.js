import { userModel, adminModel } from "../models/user.js";
import productModel from "../models/products.js";
import Auth from "../common/auth.js";
import sendSMS from "../common/verifyService.js";
import jwt from "jsonwebtoken";
import Stripe from 'stripe';


const createUsers = async (req, res) => {
  try {
    // Prepare login information from request body
    const loginInfo = {
      email: req.body.email,
      password: req.body.password,
      phoneNumber: req.body.phonenumber,
      address: req.body.address,
      role: req.body.role,
    };

    let model;

    // Determine which model to use based on the user role
    switch (loginInfo.role) {
      case "user":
        model = userModel;
        break;
      case "admin":
        model = adminModel;
        break;
      default:
        return res.status(400).send({
          message: `Invalid role: ${loginInfo.role}`,
        });
    }

    // Check if a user with the given email already exists
    const existingUser = await model.findOne({ email: loginInfo.email });

    if (!existingUser) {
      // Hash the password before saving it to the database
      req.body.password = await Auth.hashPassword(loginInfo.password);

      // Create a new user in the database
      await model.create(req.body);

      // Respond with a success message
      res.status(201).send({
        message: `${loginInfo.role} created successfully`,
      });
    } else {
      // Respond with an error if the user already exists
      res.status(400).send({
        message: `${loginInfo.role} with ${loginInfo.email} already exists`,
      });
    }
  } catch (error) {
    // Handle errors and respond with an internal server error message
    console.error("Error creating user:", error);
    res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const addTocart = async (req, res) => {
  try {
    // Extract token from the authorization header
    const token = req.headers.authorization?.split(" ")[1];
    let user = null;

    if (token) {
      // Decode the token to get user data
      const payload = await jwt.decode(token);

      // Find the user in the database
      user = await userModel.findOne({ email: payload.email });
    } else {
      return res.status(404).send({
        message: "Please Login or Signup",
      });
    }

    const { ProductId, quantity, price } = req.body;

    // Validate product details
    if (!ProductId || !quantity || quantity <= 0 || !price) {
      return res.status(400).send({
        message: "Invalid ProductId or quantity",
      });
    }

    // Check if the product exists
    const existingProduct = await productModel.findById(ProductId);

    if (!existingProduct) {
      return res.status(404).send({
        message: `Product with ProductId ${ProductId} doesn't exist`,
      });
    }

    // Check if the user exists
    if (!user) {
      return res.status(404).send({
        message: `User with ID ${user._id} doesn't exist`,
      });
    }

    // Find if the product is already in the user's cart
    const cartIndex = user.cart.findIndex((item) => item.product.equals(existingProduct._id));

    if (cartIndex > -1) {
      // Update quantity and price if the product is already in the cart
      user.cart[cartIndex].quantity += quantity;
      user.cart[cartIndex].price = price;
    } else {
      // Add the product to the cart if it's not already there
      user.cart.push({
        product: existingProduct._id,
        quantity,
        price,
      });
    }

    // Save the updated user data
    await user.save();

    // Respond with a success message
    res.status(201).send({
      message: "Product added to cart successfully",
    });
  } catch (error) {
    // Handle errors and respond with an internal server error message
    console.error(error);
    res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getUserById = async (req, res) => {
  try {
    // Decode the token from the request headers
    let token = req.headers.authorization?.split(" ")[1];
    let data = await Auth.decodeToken(token);

    // Find the user based on the decoded email
    let user = await userModel.findOne({ email: data.email });

    // Respond with user data if found
    if (user) {
      res.send({
        message: "Data is fetched successfully",
        user: user,
      });
    } else {
      // Respond with an error if the user is not found
      res.status(404).send({
        message: "User not found. Invalid ID.",
      });
    }
  } catch (error) {
    // Handle errors and respond with an internal server error message
    console.error("Error:", error);
    res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getUsers = async (req, res) => {
  try {
    // Retrieve all users from the database
    let users = await userModel.find({});
    res.status(200).send({
      message: "All users",
      users,
    });
  } catch (error) {
    // Handle errors and respond with an internal server error message
    res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    // Prepare login information from request body
    const loginInfo = {
      email: req.body.email,
      password: req.body.password,
      phonenumber: req.body.phonenumber,
      role: req.body.role,
    };

    let model;

    // Determine which model to use based on the user role
    switch (loginInfo.role) {
      case "user":
        model = userModel;
        break;
      case "admin":
        model = adminModel;
        break;
      default:
        return res.status(400).send({
          message: `Invalid role: ${loginInfo.role}`,
        });
    }

    // Find the user based on email
    let userData = await model.findOne({ email: loginInfo.email });

    if (!userData) {
      // Respond if the user is not found
      return res.status(404).send({
        message: `${loginInfo.role} not found`,
      });
    }

    // Compare hashed password with the provided password
    const hashCompare = await Auth.hashCompare(loginInfo.password, userData.password);

    if (!hashCompare) {
      // Respond if the password is incorrect
      return res.status(400).send({
        message: "Incorrect password",
      });
    }

    // Create a token for the user and respond with success
    const token = await Auth.createToken({
      name: userData.name,
      email: userData.email,
      phonenumber: userData.phonenumber,
      role: userData.role,
    });

    let user = await model.findOne({ email: loginInfo.email }, { password: 0, code: 0 });

    // Respond with the token and user data
    res.status(200).send({
      message: `${userData.role} Logged in successfully`,
      token,
      user,
    });
  } catch (error) {
    // Handle errors and respond with an internal server error message
    res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const sendOtp = async (req, res) => {
  try {
    // Find user by phone number
    const user = await userModel.findOne({ phoneNumber: req.body.phoneNumber });

    if (user) {
      // Send OTP via SMS
      const countryCode = "+91";
      const phone = user.phoneNumber;
      const phoneNumber = countryCode + phone;
      const code = await sendSMS(phoneNumber);

      // Store OTP in the user document
      user.otp = code;
      await user.save();

      // Respond with the OTP
      res.status(200).send({
        message: `OTP is sent to ${user.phoneNumber}`,
        code,
      });

      // Automatically clear OTP after a certain time
      setTimeout(async () => {
        user.otp = null;
        await user.save();
        console.log(`OTP for ${user.phoneNumber} expired and cleared.`);
      }, 100 * 10 * 60);
    } else {
      // Respond if user is not found
      res.status(404).send({
        message: "Invalid user",
      });
    }
  } catch (error) {
    // Handle errors and respond with an internal server error message
    res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    // Get OTP and phone number from the request body
    const { phoneNumber, otp } = req.body;
    const user = await userModel.findOne({ phoneNumber: req.body.phoneNumber });

    if (user) {
      if (user.otp === otp) {
        // Respond if OTP is valid
        res.status(200).send({ message: "OTP verified successfully" });
      } else {
        // Respond if OTP is invalid
        res.status(400).send({ message: "Invalid OTP" });
      }
    } else {
      // Respond if user is not found
      res.status(404).send({ message: "User not found" });
    }
  } catch (error) {
    // Handle errors and respond with an internal server error message
    res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    // Decode the token from the request headers
    let token = req.headers.authorization?.split(" ")[1];
    let data = await Auth.decodeToken(token);

    // Check if the new password and confirm password match
    if (req.body.newpassword === req.body.confirmpassword) {
      // Find user by email and update the password
      let user = await userModel.findOne({ email: data.email });
      user.password = await Auth.hashPassword(req.body.newpassword);
      await user.save();

      // Respond with success message
      res.status(200).send({
        message: "Password Updated Successfully",
      });
    } else {
      // Respond if passwords do not match
      res.status(400).send({
        message: "Password Does Not match",
      });
    }
  } catch (error) {
    // Handle errors and respond with an internal server error message
    console.log(error);
    res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


// Export all functions
export default {
  getUsers,
  createUsers,
  getUserById,
  addTocart,
  sendOtp,
  verifyOtp,
  login,
  resetPassword,
};
