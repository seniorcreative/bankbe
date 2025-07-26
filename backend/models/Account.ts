export interface Account {
  id: string;
  customerId: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DepositRequest {
  customerId: string;
  amount: number;
}

export interface WithdrawRequest {
  customerId: string;
  amount: number;
}

export interface BalanceRequest {
  customerId: string;
}

export interface AccountResponse {
  success: boolean;
  account?: Account;
  error?: string;
}

export interface BalanceResponse {
  success: boolean;
  balance?: number;
  error?: string;
}

export interface TransferRequest {
  fromCustomerId: string;
  toCustomerId: string;
  amount: number;
}

export interface TransferResponse {
  success: boolean;
  fromAccount?: Account;
  toAccount?: Account;
  error?: string;
}