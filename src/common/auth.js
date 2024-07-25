import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Hash a password with a salt
const hashPassword = async (password) => {
  try {
    // Generate salt with specified number of rounds from environment variables
    let salt = await bcrypt.genSalt(Number(process.env.SALT_ROUNDS));
   
    // Hash the password using the generated salt
    const hash = await bcrypt.hash(password, salt);

    return hash;
  } catch (error) {
    // Log any error that occurs during hashing
    console.error("Error hashing password:", error);
    throw error;
  }
};

// Compare a plain text password with a hashed password
const hashCompare = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Create a JWT token with payload and expiration settings
const createToken = async (payload) => {
  const token = await jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
  return token;
};

// Decode a JWT token to extract payload
const decodeToken = async (token) => {
  const payload = await jwt.decode(token);
  
  return payload;
};

// Middleware to validate JWT token and ensure it is not expired
const validate = async (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];

  if (token) {
    try {
      let payload = await decodeToken(token);
    
      // Attach userId to request headers for further use
      req.headers.userId = payload.id;

      // Check if the token is still valid based on expiration time
      let currentTime = Math.floor(Date.now() / 1000);

      if (currentTime < payload.exp) {
        next();
      } else {
        res.status(401).send({
          message: "Token has expired",
        });
      }
    } catch (error) {
      // Log any error that occurs during token decoding
      console.error("Error decoding token:", error);
      res.status(401).send({
        message: "Invalid token",
      });
    }
  } else {
    res.status(400).send({
      message: "Token not found",
    });
  }
};

// Middleware to ensure the user is an admin based on the token's role
const adminGuard = async (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];
  if (token) {
    let payload = await decodeToken(token);
    // Check if the role in token payload is 'admin'
    if (payload.role === "admin") next();
  } else {
    res.status(400).send({
      message: "Only Admins are allowed",
    });
  }
};

export default {
  hashPassword,
  hashCompare,
  createToken,
  decodeToken,
  validate,
  adminGuard,
};
