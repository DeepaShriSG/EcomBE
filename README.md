

---

# E-Commerce Backend API

Welcome to the E-Commerce Backend API project. This is a RESTful API designed for an e-commerce platform, providing functionality for user management, product management, and cart operations.

## Table of Contents

1. [Features](#features)
2. [Technologies Used](#technologies-used)
3. [Setup Instructions](#setup-instructions)
4. [API Endpoints](#api-endpoints)
5. [Contributing](#contributing)
6. [License](#license)

## Features

- **User Management**: Create, read, update, and delete users, including authentication and role management.
- **Product Management**: Add, update, retrieve, and delete products.
- **Cart Operations**: Add products to the cart, view cart details, and manage cart items.
- **Authentication**: JWT-based authentication for secure API access.
- **Password Reset**: OTP-based password reset functionality.

## Technologies Used

- **Node.js**: Server-side runtime environment.
- **Express.js**: Web application framework for Node.js.
- **MongoDB**: NoSQL database for storing data.
- **Mongoose**: ODM library for MongoDB and Node.js.
- **JWT (JSON Web Tokens)**: Authentication and authorization.
- **bcrypt.js**: Password hashing.
- **Stripe**: Payment gateway integration (if applicable).
- **Twilio**: SMS service for OTP verification (if applicable).

## Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [MongoDB](https://www.mongodb.com/try/download/community) (for local development)
- [Stripe](https://stripe.com/) (if using Stripe for payments)
- [Twilio](https://www.twilio.com/) (if using Twilio for SMS)

### Installation

1. **Clone the repository**

    ```bash
    git clone https://github.com/your-username/ecommerce-backend.git
    cd ecommerce-backend
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Set up environment variables**

    Create a `.env` file in the root directory and add the following variables:

    ```bash
    PORT=3000
    MONGO_URI=mongodb://localhost:27017/ecommerce
    JWT_SECRET=your_jwt_secret
    STRIPE_SECRET_KEY=your_stripe_secret_key (if using Stripe)
    TWILIO_ACCOUNT_SID=your_twilio_account_sid (if using Twilio)
    TWILIO_AUTH_TOKEN=your_twilio_auth_token (if using Twilio)
    ```

4. **Start the server**

    ```bash
    npm start
    ```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

## API Endpoints

### User Management

- **Create User**: `POST /users`
- **Get User by ID**: `GET /users/:id`
- **Get All Users**: `GET /users`
- **Update User**: `PUT /users/:id`
- **Delete User**: `DELETE /users/:id`
- **Login**: `POST /login`
- **Send OTP**: `POST /send-otp`
- **Verify OTP**: `POST /verify-otp`
- **Reset Password**: `POST /reset-password`

### Product Management

- **Create Product**: `POST /products`
- **Get Product by ID**: `GET /products/:id`
- **Get All Products**: `GET /products`
- **Update Product**: `PUT /products/:id`
- **Delete Product**: `DELETE /products/:id`

### Cart Operations

- **Add to Cart**: `POST /cart`
- **View Cart**: `GET /cart`
- **Update Cart Item**: `PUT /cart/:itemId`
- **Remove from Cart**: `DELETE /cart/:itemId`

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. **Fork the repository**
2. **Create a new branch**: `git checkout -b feature/your-feature`
3. **Make your changes**
4. **Commit your changes**: `git commit -am 'Add new feature'`
5. **Push to the branch**: `git push origin feature/your-feature`
6. **Create a new Pull Request**

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

