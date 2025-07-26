import request from 'supertest';
import app from '../app';
import { addTransaction, transactions } from '../controllers/transactionController';
import { Transaction, TransactionType } from '../models/Transaction';

describe('Transaction API', () => {
  beforeEach(() => {
    // Clear transactions before each test
    transactions.length = 0;
  });

  describe('GET /api/transactions', () => {
    it('should return error for missing customerId', async () => {
      const response = await request(app)
        .get('/api/transactions')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Customer ID is required');
    });

    it('should return empty transactions for customer with no transactions', async () => {
      const response = await request(app)
        .get('/api/transactions?customerId=test-customer-id')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.transactions).toEqual([]);
      expect(response.body.hasMore).toBe(false);
      expect(response.body.nextCursor).toBeUndefined();
    });

    it('should return transactions for a customer', async () => {
      const customerId = 'test-customer-id';
      
      // Add test transactions
      addTransaction({
        customerId,
        type: TransactionType.DEPOSIT,
        amount: 100,
        description: 'Initial deposit',
        balanceAfter: 100
      });
      
      addTransaction({
        customerId,
        type: TransactionType.WITHDRAWAL,
        amount: 50,
        description: 'Withdrawal',
        balanceAfter: 50
      });

      const response = await request(app)
        .get(`/api/transactions?customerId=${customerId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.transactions).toHaveLength(2);
      expect(response.body.transactions[0].customerId).toBe(customerId);
      expect(response.body.transactions[1].customerId).toBe(customerId);
    });

    it('should sort transactions by date in descending order by default', async () => {
      const customerId = 'test-customer-id';
      
      // Add transactions with different dates
      const transaction1 = addTransaction({
        customerId,
        type: TransactionType.DEPOSIT,
        amount: 100,
        description: 'First deposit',
        balanceAfter: 100
      });
      
      // Wait to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const transaction2 = addTransaction({
        customerId,
        type: TransactionType.DEPOSIT,
        amount: 200,
        description: 'Second deposit',
        balanceAfter: 300
      });

      const response = await request(app)
        .get(`/api/transactions?customerId=${customerId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.transactions).toHaveLength(2);
      expect(response.body.transactions[0].id).toBe(transaction2.id);
      expect(response.body.transactions[1].id).toBe(transaction1.id);
    });

    it('should sort transactions by date in ascending order', async () => {
      const customerId = 'test-customer-id';
      
      const transaction1 = addTransaction({
        customerId,
        type: TransactionType.DEPOSIT,
        amount: 100,
        description: 'First deposit',
        balanceAfter: 100
      });
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const transaction2 = addTransaction({
        customerId,
        type: TransactionType.DEPOSIT,
        amount: 200,
        description: 'Second deposit',
        balanceAfter: 300
      });

      const response = await request(app)
        .get(`/api/transactions?customerId=${customerId}&sortBy=date&sortOrder=asc`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.transactions).toHaveLength(2);
      expect(response.body.transactions[0].id).toBe(transaction1.id);
      expect(response.body.transactions[1].id).toBe(transaction2.id);
    });

    it('should sort transactions by amount in descending order', async () => {
      const customerId = 'test-customer-id';
      
      addTransaction({
        customerId,
        type: TransactionType.DEPOSIT,
        amount: 100,
        description: 'Smaller deposit',
        balanceAfter: 100
      });
      
      addTransaction({
        customerId,
        type: TransactionType.DEPOSIT,
        amount: 200,
        description: 'Larger deposit',
        balanceAfter: 300
      });

      const response = await request(app)
        .get(`/api/transactions?customerId=${customerId}&sortBy=amount&sortOrder=desc`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.transactions).toHaveLength(2);
      expect(response.body.transactions[0].amount).toBe(200);
      expect(response.body.transactions[1].amount).toBe(100);
    });

    it('should sort transactions by amount in ascending order', async () => {
      const customerId = 'test-customer-id';
      
      addTransaction({
        customerId,
        type: TransactionType.DEPOSIT,
        amount: 200,
        description: 'Larger deposit',
        balanceAfter: 200
      });
      
      addTransaction({
        customerId,
        type: TransactionType.DEPOSIT,
        amount: 100,
        description: 'Smaller deposit',
        balanceAfter: 300
      });

      const response = await request(app)
        .get(`/api/transactions?customerId=${customerId}&sortBy=amount&sortOrder=asc`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.transactions).toHaveLength(2);
      expect(response.body.transactions[0].amount).toBe(100);
      expect(response.body.transactions[1].amount).toBe(200);
    });

    it('should paginate transactions with limit', async () => {
      const customerId = 'test-customer-id';
      
      // Add 5 transactions
      for (let i = 1; i <= 5; i++) {
        addTransaction({
          customerId,
          type: TransactionType.DEPOSIT,
          amount: i * 10,
          description: `Deposit ${i}`,
          balanceAfter: i * 10
        });
      }

      const response = await request(app)
        .get(`/api/transactions?customerId=${customerId}&limit=3`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.transactions).toHaveLength(3);
      expect(response.body.hasMore).toBe(true);
      expect(response.body.nextCursor).toBeDefined();
    });

    it('should paginate transactions with cursor', async () => {
      const customerId = 'test-customer-id';
      
      const transactions : Transaction[] = [];
      for (let i = 1; i <= 5; i++) {
        transactions.push(addTransaction({
          customerId,
          type: TransactionType.DEPOSIT,
          amount: i * 10,
          description: `Deposit ${i}`,
          balanceAfter: i * 10
        }));
      }

      // Get first page
      const firstResponse = await request(app)
        .get(`/api/transactions?customerId=${customerId}&limit=2`)
        .expect(200);

      expect(firstResponse.body.transactions).toHaveLength(2);
      expect(firstResponse.body.hasMore).toBe(true);

      // Get second page using cursor
      const cursor = firstResponse.body.nextCursor;
      const secondResponse = await request(app)
        .get(`/api/transactions?customerId=${customerId}&limit=2&cursor=${cursor}`)
        .expect(200);

      expect(secondResponse.body.transactions).toHaveLength(2);
      expect(secondResponse.body.hasMore).toBe(true);
    });

    it('should validate limit parameter', async () => {
      const response = await request(app)
        .get('/api/transactions?customerId=test&limit=101')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Limit must be between 1 and 100');
    });

    it('should validate sortBy parameter', async () => {
      const response = await request(app)
        .get('/api/transactions?customerId=test&sortBy=invalid')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('sortBy must be either "date" or "amount"');
    });

    it('should validate sortOrder parameter', async () => {
      const response = await request(app)
        .get('/api/transactions?customerId=test&sortOrder=invalid')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('sortOrder must be either "asc" or "desc"');
    });

    it('should only return transactions for the specified customer', async () => {
      const customer1Id = 'customer-1';
      const customer2Id = 'customer-2';
      
      addTransaction({
        customerId: customer1Id,
        type: TransactionType.DEPOSIT,
        amount: 100,
        description: 'Customer 1 deposit',
        balanceAfter: 100
      });
      
      addTransaction({
        customerId: customer2Id,
        type: TransactionType.DEPOSIT,
        amount: 200,
        description: 'Customer 2 deposit',
        balanceAfter: 200
      });

      const response = await request(app)
        .get(`/api/transactions?customerId=${customer1Id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.transactions).toHaveLength(1);
      expect(response.body.transactions[0].customerId).toBe(customer1Id);
    });

    it('should handle different transaction types', async () => {
      const customerId = 'test-customer-id';
      
      addTransaction({
        customerId,
        type: TransactionType.DEPOSIT,
        amount: 100,
        description: 'Deposit',
        balanceAfter: 100
      });
      
      addTransaction({
        customerId,
        type: TransactionType.WITHDRAWAL,
        amount: 50,
        description: 'Withdrawal',
        balanceAfter: 50
      });
      
      addTransaction({
        customerId,
        type: TransactionType.TRANSFER_IN,
        amount: 25,
        description: 'Transfer in',
        balanceAfter: 75
      });
      
      addTransaction({
        customerId,
        type: TransactionType.TRANSFER_OUT,
        amount: 25,
        description: 'Transfer out',
        balanceAfter: 50
      });

      const response = await request(app)
        .get(`/api/transactions?customerId=${customerId}`)
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
});