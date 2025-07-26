import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Customer, CreateCustomerRequest, CreateCustomerResponse } from '../models/Customer';

const customers: Customer[] = [];

export const createCustomer = (req: Request, res: Response): void => {
  try {
    const { firstName, lastName, amount }: CreateCustomerRequest = req.body;

    if (!firstName || !lastName || amount === undefined) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: firstName, lastName, and amount are required'
      } as CreateCustomerResponse);
      return;
    }

    if (typeof amount !== 'number' || amount <= 0) {
      res.status(400).json({
        success: false,
        error: 'Amount must be greater than or equal to 1 and must be a number'
      } as CreateCustomerResponse);
      return;
    }

    const newCustomer: Customer = {
      id: uuidv4(),
      firstName,
      lastName,
      amount,
      createdAt: new Date()
    };

    customers.push(newCustomer);

    res.status(201).json({
      success: true,
      customer: newCustomer
    } as CreateCustomerResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as CreateCustomerResponse);
  }
};