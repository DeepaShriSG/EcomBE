import express from 'express'
import productController from '../controllers/products.js'
import Auth from "../common/auth.js";

const router = express.Router();

router.post('/create', Auth.validate, Auth.adminGuard, productController.createProduct);
router.get('/allproducts', productController.allProducts); 
router.get('/:id', Auth.validate, Auth.adminGuard, productController.productbyId);
router.put('/:id', Auth.validate, Auth.adminGuard, productController.editProduct);
router.post('/filter', Auth.validate, Auth.adminGuard, productController.productFilter);
router.delete('/:id', Auth.validate, Auth.adminGuard, productController.deleteProduct);

export default router;