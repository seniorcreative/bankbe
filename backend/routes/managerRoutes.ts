import { Router } from 'express';
import { getTotalBalance, getAllTransactions } from '../controllers/managerController';

const router = Router();

router.get('/total-balance', getTotalBalance);
router.get('/all-transactions', getAllTransactions);

export default router;