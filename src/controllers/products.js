import productModel from "../models/products.js"; 
import { userModel } from "../models/user.js";

const createProduct = async (req, res) => {
    try {
        // Check if a product with the given ProductCode already exists
        let existingProduct = await productModel.findOne({ ProductCode: req.body.ProductCode });

        if (!existingProduct) {
            // Create a new product if it does not exist
            await productModel.create(req.body);
            res.status(201).send({
                message: "Product created successfully"
            });
        } else {
            // Respond with an error if the product already exists
            res.status(404).send({
                message: `Product with ${req.body.ProductCode} already exists`,
            });
        }
    } catch (error) {
        // Handle and respond to internal server errors
        res.status(500).send({
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

const productbyId = async (req, res) => {
    try {
        // Find a product by ID
        let item = await productModel.findById(req.params.id);

        if (item) {
            // Respond with product details if found
            res.status(200).send({
                message: "Product found successfully",
                product: item,
            });
        } else {
            // Respond with an error if the product is not found
            res.status(404).send({
                message: "Product not found",
            });
        }
    } catch (error) {
        // Log error and respond to internal server errors
        console.error('Error fetching product:', error);
        res.status(500).send({
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

const productFilter = async (req, res) => {
    try {
        // Find a product based on various filters
        let item = await productModel.findOne({
            $or: [
                { id: req.body.id },
                { name: req.body.name },
                { price: req.body.price },
                { category: req.body.category }
            ]
        });

        if (item) {
            // Respond with product details if found
            res.status(200).send({
                message: "Product found successfully",
            });
        } else {
            // Respond with an error if no matching product is found
            res.status(404).send({
                message: "Try again, Invalid product details",
            });
        }
    } catch (error) {
        // Handle and respond to internal server errors
        res.status(500).send({
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

const allProducts = async (req, res) => {
    try {
        // Retrieve all products from the database
        let items = await productModel.find({});
        console.log(items); // Log the retrieved items for debugging
        res.status(200).send({
            message: "All Products are displayed",
            items,
        });
    } catch (error) {
        // Handle and respond to internal server errors
        res.status(500).send({
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

const editProduct = async (req, res) => {
    try {
        // Find a product by ID to edit
        let item = await productModel.findById(req.params.id);
        console.log(item); // Log the retrieved item for debugging
        if (!item) {
            // Respond with an error if the product is not found
            return res.status(404).send({ message: "Product not found" });
        }

        // Update product properties if provided in the request
        const {
            ProductTitle,
            ProductCode,
            imgurl,
            brand,
            description,
            price,
            stock,
            category,
            offer,
            Availability
        } = req.body;

        if (ProductTitle) item.ProductTitle = ProductTitle;
        if (ProductCode) item.ProductCode = ProductCode;
        if (brand) item.brand = brand;
        if (description) item.description = description;
        if (stock) item.stock = stock;
        if (category) item.category = category;
        if (price) item.price = price;
        if (imgurl) item.imgurl = imgurl;
        if (offer) item.offer = offer;
        if (Availability) item.Availability = Availability;

        // Save the updated product details
        await item.save();

        // Respond with a success message and updated product data
        res.status(200).send({
            message: "Product Data Saved",
            item,
        });
    } catch (error) {
        // Handle and respond to internal server errors
        res.status(500).send({
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

const deleteProduct = async (req, res) => {
    try {
        // Find a product by ID to delete
        const item = await productModel.findById(req.params.id);
        if (!item) {
            // Respond with an error if the product is not found
            return res.status(404).send({ message: "Product not found" });
        }
        // Remove the product from the database
        await item.remove();
        res.status(200).send({ message: "Product deleted successfully" });
    } catch (error) {
        // Handle and respond to internal server errors
        res.status(500).send({
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

export default {
    createProduct,
    productbyId,
    productFilter,
    allProducts,
    editProduct,
    deleteProduct,
};
