import Stripe from "stripe";
import { Vonage } from "@vonage/server-sdk";
import { userModel } from "../models/user.js";
import productModel from "../models/products.js";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

const stripe = new Stripe(process.env.STRIPE_SECRET); // Initialize Stripe with secret key
const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET,
}); // Initialize Vonage SMS service

// Checkout Endpoint
const checkout = async (req, res) => {
  try {
    // Destructure request body to get user and cart information
    const { email, phonenumber, name, address, cart } = req.body;

    // Validate that all required fields are present
    if (!email || !phonenumber || !name || !address || !cart || !cart.length) {
      return res.status(400).send({ message: "Email, phonenumber, name, address, and cart are required" });
    }

    // Find the user by email and populate cart with product details
    let user = await userModel.findOne({ email }).populate("cart.product");
  
    if (!user) return res.status(404).send({ message: `User with ${email} doesn't exist` });

    let totalAmount = 0;

    // Prepare line items for Stripe checkout
    const lineItems = await Promise.all(
      cart.map(async (cartItem) => {
        const product = cartItem;
        const quantity = cartItem.quantity;
        const price = cartItem.price;

        // Validate product details
        if (!product || !price || !product.ProductTitle || !product.imgurl || product.imgurl.length === 0) {
          console.error(`Incomplete product details for cart item: ${JSON.stringify(cartItem)}`);
          throw new Error(`Product details are incomplete for cart item: ${JSON.stringify(cartItem)}`);
        }

        // Calculate total amount for the cart
        totalAmount += Math.round(price * quantity * 100) / 100;

        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.ProductTitle,
              images: [product.imgurl[0]],
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: quantity,
        };
      })
    );

    // Create a Stripe checkout session
    let session;
    try {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        customer_email: email,
        success_url: `${process.env.YOUR_DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.YOUR_DOMAIN}/cancel`,
      });
    } catch (stripeError) {
      console.error("Stripe Checkout Error:", stripeError);
      return res.status(500).send({ message: "Error creating Stripe Checkout session", error: stripeError.message });
    }

    // Respond with the session ID and URL for the client
    res.status(200).send({ id: session.id, url: session.url });

    // Proceed with updating the stock and saving the order details
    let orderedProducts = [];
    for (let cartItem of user.cart) {
      let product = await productModel.findById(cartItem.product._id);
     
      let quantity = cartItem.quantity;

      if (!product) {
        console.error(`Product not found for ID ${cartItem.product._id}`);
        continue;
      }

      // Check stock availability and update stock
      if (product.stock < quantity) {
        console.error(`Insufficient stock for product ${product.ProductTitle}`);
        continue;
      }

      product.stock -= quantity;
      product.orders.push({ user: user._id, quantity });
      await product.save();

      orderedProducts.push({ product: product._id, quantity: quantity });
    }

    console.log('Clearing cart and updating MyOrders');
    // Clear the cart and add the order details to user's MyOrders
    user.cart = [];
    user.MyOrders.push({
      products: orderedProducts,
      createdAt: new Date().toISOString(),
    });

    await user.save();

    // Send SMS notification to user
    const from = "SHALLOW";
    const to = phonenumber;
    const orderedProductDetails = orderedProducts.map((order) => `Product ID: ${order.product}, Quantity: ${order.quantity}`).join(", ");

    const text = `Hi ${name}, your order for ${orderedProductDetails} has been successfully placed! Thank you for shopping with us.`;

    try {
      await vonage.sms.send({ to, from, text });
      console.log("SMS sent successfully.");
    } catch (smsError) {
      console.error("SMS Error:", smsError);
    }
  } catch (error) {
    console.error("Checkout Error:", error);
    // Handle any unexpected errors
    if (!res.headersSent) {
      res.status(500).send({ message: "Internal Server Error", error: error.message });
    }
  }
};

export default checkout;
