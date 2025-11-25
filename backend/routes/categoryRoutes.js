import express from 'express';
import { getCategories } from '../controllers/categoryController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getCategories);

export default router;
