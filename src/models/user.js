import mongoose from '../models/index.js';

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

const validatePhoneNumber = (phonenumber) => {
  return String(phonenumber)
    .match(
      /^(\()?\d{3}(\))?(-)?\d{3}(-)?\d{4}$/
    );
};

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Name is required"] },
  email: {
    type: String,
    required: [true, "Email is required"],
    validate: { validator: validateEmail, message: 'Invalid email format' },
  },
  password: { type: String, required: [true, "Password is required"] },
  phonenumber: { 
    type: String, 
    required: [true, "Phone number is required"],
    validate: { validator: validatePhoneNumber, message: "Invalid phone number" }
  },
  address:{
    type:String,
    required:[true,"Address is required"],
  },
  cart: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: Number,
      price: Number,
      name: String
    }
  ],
  MyOrders: [
    {
      products: [
        {
          product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
          },
          quantity: { type: Number, required: true },
        },
      ],
      createdAt: { type: Date, default: Date.now },
    }
  ],
  otp: { type: Number },
  status: { type: Boolean, default: true },
  role: { type: String, default: "user" },
  createdAt: { type: Date, default: Date.now },
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  }],
}, {
  collection: "user",
  versionKey: false,
});

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  phoneNumber: { 
    type: String, 
    required: [true, "Phone number is required"],
    validate: { validator: validatePhoneNumber, message: "Invalid phone number" }
  },
  otp: { type: Number },
  role: { type: String, default: 'admin' },
}, {
  collection: "admin",
  versionKey: false,
});

const userModel = mongoose.model("user", userSchema);
const adminModel = mongoose.model("admin", adminSchema);

export {
  userModel,
  adminModel
};
