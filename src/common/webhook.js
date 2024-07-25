import express from 'express'; 
import Stripe from 'stripe'; 
import { Vonage } from "@vonage/server-sdk"; 
import { userModel } from "../models/user.js";
import productModel from "../models/products.js"; 
import dotenv from 'dotenv'; 

dotenv.config(); // Load environment variables from .env file

const router = express.Router(); // Create a new router instance for handling routes
const stripe = new Stripe(process.env.STRIPE_SECRET); // Initialize Stripe with secret key
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET; // Retrieve Stripe webhook secret from environment
const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY, // Retrieve Vonage API key from environment
  apiSecret: process.env.VONAGE_API_SECRET, // Retrieve Vonage API secret from environment
});

// Route to handle Stripe webhook events
router.post('/webhook', express.raw({ type: 'application/json' }), async (request, response) => {
  const sig = request.headers['stripe-signature']; // Get Stripe signature from request headers
  let event;

  // Verify the webhook event from Stripe
  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    // Log and respond with error if verification fails
    console.error(`Webhook Error: ${err.message}`);
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle different event types from Stripe
  switch (event.type) {
    case 'checkout.session.completed':
      // Handle successful checkout session
      const session = event.data.object; // Extract session data
      const userEmail = session.customer_email; // Get user email from session
      const user = await userModel.findOne({ email: userEmail }).populate("cart.product"); // Find user and populate cart with product details

      if (!user) {
        // Log and respond if user is not found
        console.error(`User with email ${userEmail} not found`);
        return response.status(404).send({ message: `User with email ${userEmail} not found` });
      }

      let orderedProducts = [];
      // Process each item in the user's cart
      for (let cartItem of user.cart) {
        let product = await productModel.findById(cartItem.product); // Find product by ID
        let quantity = cartItem.quantity; // Get quantity from cart item

        // Check stock availability
        if (product.stock < quantity) {
          console.error(`Insufficient stock for product ${product.ProductTitle}`);
          continue; // Skip this item if stock is insufficient
        }

        // Update product stock and record the order
        product.stock -= quantity;
        product.orders.push({ user: user._id, quantity });
        await product.save();

        orderedProducts.push({ product: product._id, quantity: quantity });
      }

      // Clear the cart and save order details to the user
      user.cart = [];
      user.MyOrders.push({
        products: orderedProducts,
        timestamp: new Date().toISOString(),
      });

      await user.save();

      // Send SMS notification to the user
      const from = "YourAppName"; // Sender ID
      const to = user.phoneNumber; // Recipient phone number
      const orderedProductDetails = orderedProducts.map(order => 
        `Product ID: ${order.product}, Quantity: ${order.quantity}`
      ).join(', '); // Format ordered product details

      const text = `Hi ${user.name}, your order for ${orderedProductDetails} has been successfully placed! Thank you for shopping with us.`; // SMS content

      // Send SMS using Vonage API
      vonage.sms.send({ to, from, text }, (err, responseData) => {
        if (err) {
          console.error("SMS Error:", err); // Log error if SMS sending fails
        } else {
          if (responseData.messages[0].status === "0") {
            console.log("Message sent successfully."); // Log success if SMS sent
          } else {
            console.error(`Message failed with error: ${responseData.messages[0]['error-text']}`); // Log failure if SMS sending fails
          }
        }
      });

      break;

    default:
      // Log unhandled event types
      console.log(`Unhandled event type ${event.type}`);
  }

  // Respond to Stripe that the event was received
  response.status(200).send('Event received');
});

export default router; // Export router for use in other modules
