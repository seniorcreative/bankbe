import { Request, Response } from 'express';
import { TotalBalanceResponse, AllTransactionsRequest, AllTransactionsResponse } from '../models/Manager';
import { accounts } from './accountController';
import { transactions } from './transactionController';

export const getTotalBalance = (req: Request, res: Response): void => {
  try {
    // Reduce over all accounts that this manager is allowed to access
    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
    
    res.status(200).json({
      success: true,
      totalBalance
    } as TotalBalanceResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as TotalBalanceResponse);
  }
};

export const getAllTransactions = (req: Request, res: Response): void => {
  try {
    const { 
      cursor, 
      limit: limitParam = '10', 
      sortBy = 'date', 
      sortOrder = 'desc' 
    } = req.query;
    
    const limit = parseInt(limitParam as string, 10) || 10;

    if (isNaN(limit) || limit < 1 || limit > 100) {
      res.status(400).json({
        success: false,
        error: 'Limit must be between 1 and 100'
      } as AllTransactionsResponse);
      return;
    }

    if (sortBy && !['date', 'amount', 'customerId', 'type'].includes(sortBy as string)) {
      res.status(400).json({
        success: false,
        error: 'sortBy must be one of: date, amount, customerId, type'
      } as AllTransactionsResponse);
      return;
    }

    if (sortOrder && !['asc', 'desc'].includes(sortOrder as string)) {
      res.status(400).json({
        success: false,
        error: 'sortOrder must be either "asc" or "desc"'
      } as AllTransactionsResponse);
      return;
    }

    let sortedTransactions = [...transactions];

    if (sortBy === 'date') {
      sortedTransactions.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
    } else if (sortBy === 'amount') {
      sortedTransactions.sort((a, b) => {
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      });
    } else if (sortBy === 'customerId') {
      sortedTransactions.sort((a, b) => {
        return sortOrder === 'asc' 
          ? a.customerId.localeCompare(b.customerId)
          : b.customerId.localeCompare(a.customerId);
      });
    } else if (sortBy === 'type') {
      sortedTransactions.sort((a, b) => {
        return sortOrder === 'asc' 
          ? a.type.localeCompare(b.type)
          : b.type.localeCompare(a.type);
      });
    }

    let startIndex = 0;
    if (cursor) {
      const cursorIndex = sortedTransactions.findIndex(t => t.id === cursor);
      if (cursorIndex !== -1) {
        startIndex = cursorIndex + 1;
      }
    }

    const endIndex = startIndex + limit;
    const paginatedTransactions = sortedTransactions.slice(startIndex, endIndex);
    const hasMore = endIndex < sortedTransactions.length;
    const nextCursor = hasMore && paginatedTransactions.length > 0 
      ? paginatedTransactions[paginatedTransactions.length - 1].id 
      : undefined;

    res.status(200).json({
      success: true,
      transactions: paginatedTransactions,
      nextCursor,
      hasMore
    } as AllTransactionsResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as AllTransactionsResponse);
  }
};