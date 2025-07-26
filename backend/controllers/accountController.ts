import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Account, DepositRequest, WithdrawRequest, BalanceRequest, AccountResponse, BalanceResponse, TransferRequest, TransferResponse } from '../models/Account';
import { TransactionType } from '../models/Transaction';
import { addTransaction } from './transactionController';

export const accounts: Account[] = [];

// Note this is here to facilitate testing and resetting the state of accounts
// But in the real world, any stateful data would be stored in a database
// Any destructive operations like this would be avoided in production code
export const clearAccounts = (): void => {
  accounts.length = 0;
};

const findAccountByCustomerId = (customerId: string): Account | undefined => {
  return accounts.find(account => account.customerId === customerId);
};

const createAccountIfNonExistent = (customerId: string): Account => {
  let account = findAccountByCustomerId(customerId);
  if (!account) {
    account = {
      id: uuidv4(),
      customerId,
      balance: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    // In a real application, you would save this to a database
    // Don't allow duplicate accounts for the same customer - check the id existing before creating.
    accounts.push(account);
  }
  return account;
};

export const deposit = (req: Request, res: Response): void => {
  try {
    const { customerId, amount }: DepositRequest = req.body;

    if (!customerId || amount === undefined) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: customerId and amount are required'
      } as AccountResponse);
      return;
    }

    if (typeof amount !== 'number' || amount <= 0) {
      res.status(400).json({
        success: false,
        error: 'Amount must be a positive number'
      } as AccountResponse);
      return;
    }

    const account = createAccountIfNonExistent(customerId);
    account.balance += amount;
    account.updatedAt = new Date();

    res.status(200).json({
      success: true,
      account
    } as AccountResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as AccountResponse);
  }
};

export const withdraw = (req: Request, res: Response): void => {
  try {
    const { customerId, amount }: WithdrawRequest = req.body;

    if (!customerId || amount === undefined) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: customerId and amount are required'
      } as AccountResponse);
      return;
    }

    if (typeof amount !== 'number' || amount <= 0) {
      res.status(400).json({
        success: false,
        error: 'Amount must be a positive number'
      } as AccountResponse);
      return;
    }

    const account = findAccountByCustomerId(customerId);
    if (!account) {
      res.status(404).json({
        success: false,
        error: 'Account not found for this customer'
      } as AccountResponse);
      return;
    }

    if (account.balance < amount) {
      res.status(400).json({
        success: false,
        error: 'Insufficient funds'
      } as AccountResponse);
      return;
    }

    account.balance -= amount; // Note, if we do not allow negative balances (eg going into overdraft? Something to consider)
    account.updatedAt = new Date();

    res.status(200).json({
      success: true,
      account
    } as AccountResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as AccountResponse);
  }
};

export const getBalance = (req: Request, res: Response): void => {
  try {
    const { customerId }: BalanceRequest = req.body;

    if (!customerId) {
      res.status(400).json({
        success: false,
        error: 'Missing required field: customerId is required'
      } as BalanceResponse);
      return;
    }

    const account = findAccountByCustomerId(customerId);
    if (!account) {
      res.status(404).json({
        success: false,
        error: 'Account not found for this customer'
      } as BalanceResponse);
      return;
    }

    res.status(200).json({
      success: true,
      balance: account.balance
    } as BalanceResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as BalanceResponse);
  }
};

export const transfer = (req: Request, res: Response): void => {
  try {
    const { fromCustomerId, toCustomerId, amount }: TransferRequest = req.body;

    if (!fromCustomerId || !toCustomerId || amount === undefined) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: fromCustomerId, toCustomerId and amount are required'
      } as TransferResponse);
      return;
    }

    if (typeof amount !== 'number' || amount <= 0) {
      res.status(400).json({
        success: false,
        error: 'Amount must be a positive number'
      } as TransferResponse);
      return;
    }

    if (fromCustomerId === toCustomerId) {
      res.status(400).json({
        success: false,
        error: 'Cannot transfer to the same account'
      } as TransferResponse);
      return;
    }

    const fromAccount = findAccountByCustomerId(fromCustomerId);
    if (!fromAccount) {
      res.status(404).json({
        success: false,
        error: 'Sender account not found'
      } as TransferResponse);
      return;
    }

    if (fromAccount.balance < amount) {
      res.status(400).json({
        success: false,
        error: 'Insufficient funds'
      } as TransferResponse);
      return;
    }

    const toAccount = createAccountIfNonExistent(toCustomerId);

    fromAccount.balance -= amount;
    fromAccount.updatedAt = new Date();

    toAccount.balance += amount;
    toAccount.updatedAt = new Date();

    addTransaction({
      customerId: fromCustomerId,
      type: TransactionType.TRANSFER_OUT,
      amount: amount,
      description: `Transfer to customer ${toCustomerId}`,
      balanceAfter: fromAccount.balance
    });

    addTransaction({
      customerId: toCustomerId,
      type: TransactionType.TRANSFER_IN,
      amount: amount,
      description: `Transfer from customer ${fromCustomerId}`,
      balanceAfter: toAccount.balance
    });

    res.status(200).json({
      success: true,
      fromAccount,
      toAccount
    } as TransferResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as TransferResponse);
  }
};