export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  amount: number;
  createdAt: Date;
}

export interface CreateCustomerRequest {
  firstName: string;
  lastName: string;
  amount: number;
}

export interface CreateCustomerResponse {
  success: boolean;
  customer?: Customer;
  error?: string;
}