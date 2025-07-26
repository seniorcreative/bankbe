// I don't love union types, these feel cleaner and more explicit and are arguably easier to read and maintain
export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER_IN = 'transfer_in',
  TRANSFER_OUT = 'transfer_out'
}

export interface Transaction {
  id: string;
  customerId: string;
  type: TransactionType;
  amount: number;
  description?: string;
  balanceAfter: number;
  createdAt: Date;
}

export interface GetTransactionsRequest {
  customerId: string;
  cursor?: string;
  limit?: number;
  sortBy?: 'date' | 'amount';
  sortOrder?: 'asc' | 'desc';
}

export interface GetTransactionsResponse {
  success: boolean;
  transactions?: Transaction[];
  nextCursor?: string;
  hasMore?: boolean;
  error?: string;
}