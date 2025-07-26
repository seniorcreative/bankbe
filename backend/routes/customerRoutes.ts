import { Router } from 'express';
import { createCustomer } from '../controllers/customerController';

const router = Router();

router.post('/create', createCustomer);

export default router;