import { userModel } from "../models/user.js"; // Import user model for user-related operations
import { Vonage } from "@vonage/server-sdk"; // Import Vonage SDK for SMS sending

import dotenv from "dotenv"; // Import dotenv to load environment variables
import otpGenerator from "otp-generator"; // Import otp-generator for generating OTPs

dotenv.config(); // Load environment variables from .env file

// Retrieve Vonage API credentials from environment variables
const API_KEY = process.env.VONAGE_API_KEY;
const API_SECRET = process.env.VONAGE_API_SECRET;
const API_PRIVATE_KEY = process.env.VONAGE_PRIVATE_KEY;

// Initialize Vonage with API credentials
const vonage = new Vonage({ apiKey: API_KEY, apiSecret: API_SECRET });

// Function to generate a 6-digit OTP
const generateOTP = () => {
  const length = 6; // Length of OTP
  let otp = "";

  // Generate OTP by concatenating random digits
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }

  return otp;
};

// Function to send an SMS containing the OTP
const sendSMS = async function sendSMS(phoneNumber) {
    try {
        const to = phoneNumber; // Recipient's phone number
        const otp = generateOTP(); // Generate OTP
        const from = 'ECOM'; // Sender ID
        const text = `Hello, Your OTP to verify your phone number is: ${otp}`; // SMS content

        // Send SMS using Vonage API
        const resp = await vonage.sms.send({ from, to, text });

        // Check response status and log result
        if (resp.messages[0].status === '0') {
            console.log('Message sent successfully');
            return otp; // Return OTP if sent successfully
        } else {
            console.log('Failed to send OTP');
        }
    } catch (err) {
        // Log any errors that occur during SMS sending
        console.error(err);
        // Handle or rethrow error as needed
        throw new Error(err.message);
    }
}

export default sendSMS; // Export sendSMS function for use in other modules
