import request from 'supertest';
import app from '../app';
import { clearAccounts } from '../controllers/accountController';
import { transactions, addTransaction } from '../controllers/transactionController';
import { TransactionType } from '../models/Transaction';

describe('Manager API', () => {
  beforeEach(() => {
    clearAccounts();
    transactions.length = 0;
  });

  describe('GET /api/manager/total-balance', () => {
    it('should return zero balance when no accounts exist', async () => {
      const response = await request(app)
        .get('/api/manager/total-balance')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.totalBalance).toBe(0);
    });

    it('should return total balance across all accounts', async () => {
      await request(app)
        .post('/api/accounts/deposit')
        .send({ customerId: 'customer1', amount: 100 });

      await request(app)
        .post('/api/accounts/deposit')
        .send({ customerId: 'customer2', amount: 250 });

      await request(app)
        .post('/api/accounts/deposit')
        .send({ customerId: 'customer3', amount: 75.50 });

      const response = await request(app)
        .get('/api/manager/total-balance')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.totalBalance).toBe(425.50);
    });

    it('should update total balance after withdrawals', async () => {
      await request(app)
        .post('/api/accounts/deposit')
        .send({ customerId: 'customer1', amount: 1000 });

      await request(app)
        .post('/api/accounts/deposit')
        .send({ customerId: 'customer2', amount: 500 });

      await request(app)
        .post('/api/accounts/withdraw')
        .send({ customerId: 'customer1', amount: 300 });

      const response = await request(app)
        .get('/api/manager/total-balance')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.totalBalance).toBe(1200);
    });

    it('should handle account with zero balance', async () => {
      await request(app)
        .post('/api/accounts/deposit')
        .send({ customerId: 'customer1', amount: 100 });

      await request(app)
        .post('/api/accounts/withdraw')
        .send({ customerId: 'customer1', amount: 100 });

      const response = await request(app)
        .get('/api/manager/total-balance')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.totalBalance).toBe(0);
    });
  });

  describe('GET /api/manager/all-transactions', () => {
    it('should return empty array when no transactions exist', async () => {
      const response = await request(app)
        .get('/api/manager/all-transactions')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.transactions).toEqual([]);
      expect(response.body.hasMore).toBe(false);
      expect(response.body.nextCursor).toBeUndefined();
    });

    it('should return all transactions across all customers', async () => {
      addTransaction({
        customerId: 'customer1',
        type: TransactionType.DEPOSIT,
        amount: 100,
        description: 'Customer 1 deposit',
        balanceAfter: 100
      });

      addTransaction({
        customerId: 'customer2',
        type: TransactionType.DEPOSIT,
        amount: 200,
        description: 'Customer 2 deposit',
        balanceAfter: 200
      });

      addTransaction({
        customerId: 'customer1',
        type: TransactionType.WITHDRAWAL,
        amount: 50,
        description: 'Customer 1 withdrawal',
        balanceAfter: 50
      });

      const response = await request(app)
        .get('/api/manager/all-transactions')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.transactions).toHaveLength(3);
      expect(response.body.hasMore).toBe(false);

      const customerIds = response.body.transactions.map((t: any) => t.customerId);
      expect(customerIds).toContain('customer1');
      expect(customerIds).toContain('customer2');
    });

    it('should sort transactions by date in descending order by default', async () => {
      const transaction1 = addTransaction({
        customerId: 'customer1',
        type: TransactionType.DEPOSIT,
        amount: 100,
        description: 'First transaction',
        balanceAfter: 100
      });

      await new Promise(resolve => setTimeout(resolve, 10));

      const transaction2 = addTransaction({
        customerId: 'customer2',
        type: TransactionType.DEPOSIT,
        amount: 200,
        description: 'Second transaction',
        balanceAfter: 200
      });

      const response = await request(app)
        .get('/api/manager/all-transactions')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.transactions).toHaveLength(2);
      expect(response.body.transactions[0].id).toBe(transaction2.id);
      expect(response.body.transactions[1].id).toBe(transaction1.id);
    });

    it('should sort transactions by date in ascending order', async () => {
      const transaction1 = addTransaction({
        customerId: 'customer1',
        type: TransactionType.DEPOSIT,
        amount: 100,
        description: 'First transaction',
        balanceAfter: 100
      });

      await new Promise(resolve => setTimeout(resolve, 10));

      const transaction2 = addTransaction({
        customerId: 'customer2',
        type: TransactionType.DEPOSIT,
        amount: 200,
        description: 'Second transaction',
        balanceAfter: 200
      });

      const response = await request(app)
        .get('/api/manager/all-transactions?sortBy=date&sortOrder=asc')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.transactions).toHaveLength(2);
      expect(response.body.transactions[0].id).toBe(transaction1.id);
      expect(response.body.transactions[1].id).toBe(transaction2.id);
    });

    it('should sort transactions by amount in descending order', async () => {
      addTransaction({
        customerId: 'customer1',
        type: TransactionType.DEPOSIT,
        amount: 100,
        description: 'Smaller amount',
        balanceAfter: 100
      });

      addTransaction({
        customerId: 'customer2',
        type: TransactionType.DEPOSIT,
        amount: 300,
        description: 'Larger amount',
        balanceAfter: 300
      });

      addTransaction({
        customerId: 'customer3',
        type: TransactionType.DEPOSIT,
        amount: 200,
        description: 'Medium amount',
        balanceAfter: 200
      });

      const response = await request(app)
        .get('/api/manager/all-transactions?sortBy=amount&sortOrder=desc')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.transactions).toHaveLength(3);
      expect(response.body.transactions[0].amount).toBe(300);
      expect(response.body.transactions[1].amount).toBe(200);
      expect(response.body.transactions[2].amount).toBe(100);
    });

    it('should sort transactions by amount in ascending order', async () => {
      addTransaction({
        customerId: 'customer1',
        type: TransactionType.DEPOSIT,
        amount: 300,
        description: 'Larger amount',
        balanceAfter: 300
      });

      addTransaction({
        customerId: 'customer2',
        type: TransactionType.DEPOSIT,
        amount: 100,
        description: 'Smaller amount',
        balanceAfter: 100
      });

      addTransaction({
        customerId: 'customer3',
        type: TransactionType.DEPOSIT,
        amount: 200,
        description: 'Medium amount',
        balanceAfter: 200
      });

      const response = await request(app)
        .get('/api/manager/all-transactions?sortBy=amount&sortOrder=asc')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.transactions).toHaveLength(3);
      expect(response.body.transactions[0].amount).toBe(100);
      expect(response.body.transactions[1].amount).toBe(200);
      expect(response.body.transactions[2].amount).toBe(300);
    });

    it('should sort transactions by customerId in ascending order', async () => {
      addTransaction({
        customerId: 'customer-z',
        type: TransactionType.DEPOSIT,
        amount: 100,
        description: 'Customer Z',
        balanceAfter: 100
      });

      addTransaction({
        customerId: 'customer-a',
        type: TransactionType.DEPOSIT,
        amount: 200,
        description: 'Customer A',
        balanceAfter: 200
      });

      addTransaction({
        customerId: 'customer-m',
        type: TransactionType.DEPOSIT,
        amount: 300,
        description: 'Customer M',
        balanceAfter: 300
      });

      const response = await request(app)
        .get('/api/manager/all-transactions?sortBy=customerId&sortOrder=asc')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.transactions).toHaveLength(3);
      expect(response.body.transactions[0].customerId).toBe('customer-a');
      expect(response.body.transactions[1].customerId).toBe('customer-m');
      expect(response.body.transactions[2].customerId).toBe('customer-z');
    });

    it('should sort transactions by type in ascending order', async () => {
      addTransaction({
        customerId: 'customer1',
        type: TransactionType.WITHDRAWAL,
        amount: 100,
        description: 'Withdrawal',
        balanceAfter: 100
      });

      addTransaction({
        customerId: 'customer2',
        type: TransactionType.DEPOSIT,
        amount: 200,
        description: 'Deposit',
        balanceAfter: 200
      });

      addTransaction({
        customerId: 'customer3',
        type: TransactionType.TRANSFER_IN,
        amount: 300,
        description: 'Transfer in',
        balanceAfter: 300
      });

      const response = await request(app)
        .get('/api/manager/all-transactions?sortBy=type&sortOrder=asc')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.transactions).toHaveLength(3);
      expect(response.body.transactions[0].type).toBe(TransactionType.DEPOSIT);
      expect(response.body.transactions[1].type).toBe(TransactionType.TRANSFER_IN);
      expect(response.body.transactions[2].type).toBe(TransactionType.WITHDRAWAL);
    });

    it('should paginate transactions with limit', async () => {
      for (let i = 1; i <= 5; i++) {
        addTransaction({
          customerId: `customer${i}`,
          type: TransactionType.DEPOSIT,
          amount: i * 100,
          description: `Transaction ${i}`,
          balanceAfter: i * 100
        });
      }

      const response = await request(app)
        .get('/api/manager/all-transactions?limit=3')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.transactions).toHaveLength(3);
      expect(response.body.hasMore).toBe(true);
      expect(response.body.nextCursor).toBeDefined();
    });

    it('should paginate transactions with cursor', async () => {
      for (let i = 1; i <= 5; i++) {
        addTransaction({
          customerId: `customer${i}`,
          type: TransactionType.DEPOSIT,
          amount: i * 100,
          description: `Transaction ${i}`,
          balanceAfter: i * 100
        });
      }

      const firstResponse = await request(app)
        .get('/api/manager/all-transactions?limit=2')
        .expect(200);

      expect(firstResponse.body.transactions).toHaveLength(2);
      expect(firstResponse.body.hasMore).toBe(true);

      const cursor = firstResponse.body.nextCursor;
      const secondResponse = await request(app)
        .get(`/api/manager/all-transactions?limit=2&cursor=${cursor}`)
        .expect(200);

      expect(secondResponse.body.transactions).toHaveLength(2);
      expect(secondResponse.body.hasMore).toBe(true);
    });

    it('should validate limit parameter', async () => {
      const response = await request(app)
        .get('/api/manager/all-transactions?limit=101')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Limit must be between 1 and 100');
    });

    it('should validate sortBy parameter', async () => {
      const response = await request(app)
        .get('/api/manager/all-transactions?sortBy=invalid')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('sortBy must be one of: date, amount, customerId, type');
    });

    it('should validate sortOrder parameter', async () => {
      const response = await request(app)
        .get('/api/manager/all-transactions?sortOrder=invalid')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('sortOrder must be either "asc" or "desc"');
    });

    it('should handle different transaction types', async () => {
      addTransaction({
        customerId: 'customer1',
        type: TransactionType.DEPOSIT,
        amount: 100,
        description: 'Deposit',
        balanceAfter: 100
      });

      addTransaction({
        customerId: 'customer2',
        type: TransactionType.WITHDRAWAL,
        amount: 50,
        description: 'Withdrawal',
        balanceAfter: 50
      });

      addTransaction({
        customerId: 'customer3',
        type: TransactionType.TRANSFER_IN,
        amount: 75,
        description: 'Transfer in',
        balanceAfter: 75
      });

      addTransaction({
        customerId: 'customer4',
        type: TransactionType.TRANSFER_OUT,
        amount: 25,
        description: 'Transfer out',
        balanceAfter: 25
      });

      const response = await request(app)
        .get('/api/manager/all-transactions')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.transactions).toHaveLength(4);

      const types = response.body.transactions.map((t: any) => t.type);
      expect(types).toContain(TransactionType.DEPOSIT);
      expect(types).toContain(TransactionType.WITHDRAWAL);
      expect(types).toContain(TransactionType.TRANSFER_IN);
      expect(types).toContain(TransactionType.TRANSFER_OUT);
    });
  });

  describe('Manager API Integration Tests', () => {
    it('should handle complex scenario with multiple customers and transactions', async () => {
      await request(app)
        .post('/api/accounts/deposit')
        .send({ customerId: 'customer1', amount: 1000 });

      await request(app)
        .post('/api/accounts/deposit')
        .send({ customerId: 'customer2', amount: 500 });

      await request(app)
        .post('/api/accounts/withdraw')
        .send({ customerId: 'customer1', amount: 200 });

      addTransaction({
        customerId: 'customer1',
        type: TransactionType.TRANSFER_IN,
        amount: 100,
        description: 'Transfer from external',
        balanceAfter: 900
      });

      const balanceResponse = await request(app)
        .get('/api/manager/total-balance')
        .expect(200);

      expect(balanceResponse.body.totalBalance).toBe(1300);

      const transactionsResponse = await request(app)
        .get('/api/manager/all-transactions')
        .expect(200);

      expect(transactionsResponse.body.transactions).toHaveLength(1);
      expect(transactionsResponse.body.transactions[0].type).toBe(TransactionType.TRANSFER_IN);
    });
  });
});