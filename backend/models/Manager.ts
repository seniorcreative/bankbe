import { Transaction } from "./Transaction";

export interface TotalBalanceResponse {
  success: boolean;
  totalBalance?: number;
  error?: string;
}

export interface AllTransactionsRequest {
  cursor?: string;
  limit?: number;
  sortBy?: 'date' | 'amount' | 'customerId' | 'type'; // Lazy union here, could be done better
  sortOrder?: 'asc' | 'desc';
}

export interface AllTransactionsResponse {
  success: boolean;
  transactions?: Transaction[];
  nextCursor?: string;
  hasMore?: boolean;
  error?: string;
}