import { Request, Response } from 'express';
import { Transaction, GetTransactionsRequest, GetTransactionsResponse } from '../models/Transaction';

export const transactions: Transaction[] = [];

export const getTransactions = (req: Request, res: Response): void => {
  try {
    const { 
      customerId, 
      cursor, 
      limit: limitParam = '10', 
      sortBy = 'date', 
      sortOrder = 'desc' 
    } = req.query;
    
    const limit = parseInt(limitParam as string, 10) || 10;

    if (!customerId) {
      res.status(400).json({
        success: false,
        error: 'Customer ID is required'
      } as GetTransactionsResponse);
      return;
    }

    if (isNaN(limit) || limit < 1 || limit > 100) {
      res.status(400).json({
        success: false,
        error: 'Limit must be between 1 and 100'
      } as GetTransactionsResponse);
      return;
    }

    if (sortBy && !['date', 'amount'].includes(sortBy as string)) {
      res.status(400).json({
        success: false,
        error: 'sortBy must be either "date" or "amount"'
      } as GetTransactionsResponse);
      return;
    }

    if (sortOrder && !['asc', 'desc'].includes(sortOrder as string)) {
      res.status(400).json({
        success: false,
        error: 'sortOrder must be either "asc" or "desc"'
      } as GetTransactionsResponse);
      return;
    }

    let customerTransactions = transactions.filter(t => t.customerId === customerId);

    switch (sortBy) {
      case 'date':
        customerTransactions.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });
        break;
      case 'amount':
        customerTransactions.sort((a, b) => {
          return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
        });
        break;
    }

    let startIndex = 0;
    if (cursor) {
      const cursorIndex = customerTransactions.findIndex(t => t.id === cursor);
      if (cursorIndex !== -1) {
        startIndex = cursorIndex + 1;
      }
    }

    const endIndex = startIndex + limit;
    const paginatedTransactions = customerTransactions.slice(startIndex, endIndex);
    const hasMore = endIndex < customerTransactions.length;
    const nextCursor = hasMore && paginatedTransactions.length > 0 
      ? paginatedTransactions[paginatedTransactions.length - 1].id 
      : undefined;

    res.status(200).json({
      success: true,
      transactions: paginatedTransactions,
      nextCursor,
      hasMore
    } as GetTransactionsResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as GetTransactionsResponse);
  }
};

export const addTransaction = (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
  const newTransaction: Transaction = {
    ...transaction,
    id: require('uuid').v4(),
    createdAt: new Date()
  };
  transactions.push(newTransaction);
  return newTransaction;
};