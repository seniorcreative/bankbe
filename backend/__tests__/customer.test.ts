import request from 'supertest';
import app from '../app';

describe('Customer API', () => {
  describe('POST /api/customers/create', () => {
    it('should create a customer with valid data', async () => {
      const customerData = {
        firstName: 'John',
        lastName: 'Doe',
        amount: 100.50
      };

      const response = await request(app)
        .post('/api/customers/create')
        .send(customerData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.customer).toBeDefined();
      expect(response.body.customer.firstName).toBe(customerData.firstName);
      expect(response.body.customer.lastName).toBe(customerData.lastName);
      expect(response.body.customer.amount).toBe(customerData.amount);
      expect(response.body.customer.id).toBeDefined();
      expect(response.body.customer.createdAt).toBeDefined();
    });

    it('should return error for missing firstName', async () => {
      const customerData = {
        lastName: 'Doe',
        amount: 100.50
      };

      const response = await request(app)
        .post('/api/customers/create')
        .send(customerData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Missing required fields');
    });

    it('should return error for missing lastName', async () => {
      const customerData = {
        firstName: 'John',
        amount: 100.50
      };

      const response = await request(app)
        .post('/api/customers/create')
        .send(customerData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Missing required fields');
    });

    it('should return error for missing amount', async () => {
      const customerData = {
        firstName: 'John',
        lastName: 'Doe'
      };

      const response = await request(app)
        .post('/api/customers/create')
        .send(customerData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Missing required fields');
    });

    it('should return error for negative amount', async () => {
      const customerData = {
        firstName: 'John',
        lastName: 'Doe',
        amount: -10
      };

      const response = await request(app)
        .post('/api/customers/create')
        .send(customerData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Amount must be greater than or equal to 1 and must be a number');
    });

    it('should return error for invalid amount type', async () => {
      const customerData = {
        firstName: 'John',
        lastName: 'Doe',
        amount: 'invalid'
      };

      const response = await request(app)
        .post('/api/customers/create')
        .send(customerData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Amount must be greater than or equal to 1 and must be a number');
    });

    it('should not accept amount less than 1', async () => {
      const customerData = {
        firstName: 'Jane',
        lastName: 'Smith',
        amount: 0
      };

      const response = await request(app)
        .post('/api/customers/create')
        .send(customerData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Amount must be greater than or equal to 1 and must be a number');
    });
  });
});