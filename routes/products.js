import express from 'express';
import { guard } from '../lib/sessionManager.js';
import ProductController from '../controllers/products.js';
import upload from '../lib/uploadConfigure.js';


const router = express.Router();

/* GET products */
router.get('/', ProductController.get);

/* GET / POST new products */
router.get('/new', guard, ProductController.getNew)
router.post('/new', upload.single('image'), ProductController.postNew);

/* DELETE PRODUCT */
router.get('/delete/:productId', guard, ProductController.deleteProduct)

export default router;