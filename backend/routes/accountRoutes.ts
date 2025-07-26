import { Router } from 'express';
import { deposit, withdraw, getBalance, transfer } from '../controllers/accountController';

const router = Router();

router.post('/deposit', deposit);
router.post('/withdraw', withdraw);
router.post('/balance', getBalance);
router.post('/transfer', transfer);

export default router;