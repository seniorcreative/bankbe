# Account API Documentation

This Account API provides endpoints for managing customer account balances, including depositing funds, withdrawing funds, and checking account balances. I am keeping this separate to faciliate roles and responsibilities separation (later).

## Base URL
All account endpoints are prefixed with `/api/accounts`.

## Endpoints

### POST /api/accounts/deposit
Deposits funds into a customer's account. Creates a new account if one doesn't exist for the customer.

**Request Body:**
```json
{
  "customerId": "string",
  "amount": number
}
```

**Success Response (200):**
```json
{
  "success": true,
  "account": {
    "id": "uuid-string",
    "customerId": "string",
    "balance": number,
    "createdAt": "ISO-date-string",
    "updatedAt": "ISO-date-string"
  }
}
```

**Error Responses:**
- **400 Bad Request:** Missing required fields or invalid amount
  ```json
  {
    "success": false,
    "error": "Missing required fields: customerId and amount are required"
  }
  ```
  ```json
  {
    "success": false,
    "error": "Amount must be a positive number"
  }
  ```

- **500 Internal Server Error:** Server error
  ```json
  {
    "success": false,
    "error": "Internal server error"
  }
  ```

**Validation Rules:**
- `customerId` is required and must be a non-empty string
- `amount` is required and must be a positive number (> 0)

---

### POST /api/accounts/withdraw
Withdraws funds from a customer's account.

**Request Body:**
```json
{
  "customerId": "string",
  "amount": number
}
```

**Success Response (200):**
```json
{
  "success": true,
  "account": {
    "id": "uuid-string",
    "customerId": "string",
    "balance": number,
    "createdAt": "ISO-date-string",
    "updatedAt": "ISO-date-string"
  }
}
```

**Error Responses:**
- **400 Bad Request:** Missing required fields, invalid amount, or insufficient funds
  ```json
  {
    "success": false,
    "error": "Missing required fields: customerId and amount are required"
  }
  ```
  ```json
  {
    "success": false,
    "error": "Amount must be a positive number"
  }
  ```
  ```json
  {
    "success": false,
    "error": "Insufficient funds"
  }
  ```

- **404 Not Found:** Account doesn't exist
  ```json
  {
    "success": false,
    "error": "Account not found for this customer"
  }
  ```

- **500 Internal Server Error:** Server error
  ```json
  {
    "success": false,
    "error": "Internal server error"
  }
  ```

**Validation Rules:**
- `customerId` is required and must be a non-empty string
- `amount` is required and must be a positive number (> 0)
- Account must exist for the customer
- Account balance must be sufficient to cover the withdrawal amount

---

### POST /api/accounts/balance
Retrieves the current balance for a customer's account.

**Request Body:**
```json
{
  "customerId": "string"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "balance": number
}
```

**Error Responses:**
- **400 Bad Request:** Missing required field
  ```json
  {
    "success": false,
    "error": "Missing required field: customerId is required"
  }
  ```

- **404 Not Found:** Account doesn't exist
  ```json
  {
    "success": false,
    "error": "Account not found for this customer"
  }
  ```

- **500 Internal Server Error:** Server error
  ```json
  {
    "success": false,
    "error": "Internal server error"
  }
  ```

**Validation Rules:**
- `customerId` is required and must be a non-empty string
- Account must exist for the customer

---

### POST /api/accounts/transfer
Transfers funds from one customer's account to another customer's account.

**Request Body:**
```json
{
  "fromCustomerId": "string",
  "toCustomerId": "string",
  "amount": number
}
```

**Success Response (200):**
```json
{
  "success": true,
  "fromAccount": {
    "id": "uuid-string",
    "customerId": "string",
    "balance": number,
    "createdAt": "ISO-date-string",
    "updatedAt": "ISO-date-string"
  },
  "toAccount": {
    "id": "uuid-string",
    "customerId": "string",
    "balance": number,
    "createdAt": "ISO-date-string",
    "updatedAt": "ISO-date-string"
  }
}
```

**Error Responses:**
- **400 Bad Request:** Missing required fields, invalid amount, insufficient funds, or same account transfer
  ```json
  {
    "success": false,
    "error": "Missing required fields: fromCustomerId, toCustomerId and amount are required"
  }
  ```
  ```json
  {
    "success": false,
    "error": "Amount must be a positive number"
  }
  ```
  ```json
  {
    "success": false,
    "error": "Insufficient funds"
  }
  ```
  ```json
  {
    "success": false,
    "error": "Cannot transfer to the same account"
  }
  ```

- **404 Not Found:** Sender account doesn't exist
  ```json
  {
    "success": false,
    "error": "Sender account not found"
  }
  ```

- **500 Internal Server Error:** Server error
  ```json
  {
    "success": false,
    "error": "Internal server error"
  }
  ```

**Validation Rules:**
- `fromCustomerId` is required and must be a non-empty string
- `toCustomerId` is required and must be a non-empty string
- `fromCustomerId` and `toCustomerId` must be different
- `amount` is required and must be a positive number (> 0)
- Sender account must exist and have sufficient funds
- Recipient account is created automatically if it doesn't exist

**Transaction Recording:**
- Creates a `TRANSFER_OUT` transaction for the sender with negative impact on balance
- Creates a `TRANSFER_IN` transaction for the recipient with positive impact on balance
- Both transactions include descriptions identifying the other party
- Transaction amounts are recorded as positive values with type indicating direction

## Usage Examples

### Deposit Example
```bash
curl -X POST http://localhost:3000/api/accounts/deposit \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer-123",
    "amount": 100.50
  }'
```

### Withdraw Example
```bash
curl -X POST http://localhost:3000/api/accounts/withdraw \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer-123",
    "amount": 25.00
  }'
```

### Balance Check Example
```bash
curl -X POST http://localhost:3000/api/accounts/balance \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer-123"
  }'
```

### Transfer Example
```bash
curl -X POST http://localhost:3000/api/accounts/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "fromCustomerId": "customer-123",
    "toCustomerId": "customer-456",
    "amount": 50.00
  }'
```

## Business Logic

### Account Creation
- Accounts are automatically created when a customer makes their first deposit
- New accounts start with a balance of 0, which is then increased by the deposit amount
- Each account gets a unique UUID identifier

### Balance Management
- All monetary amounts are handled as numbers (supporting decimal values)
- Withdrawals are only allowed if sufficient funds are available
- Account balances are updated in real-time with each transaction
- The `updatedAt` timestamp is refreshed on every balance change

### Transaction Recording
- **Transfer operations** automatically create transaction records for both accounts
- Each transfer creates two transactions:
  - `TRANSFER_OUT` transaction for the sender (debit)
  - `TRANSFER_IN` transaction for the recipient (credit)
- Transaction records include:
  - Unique transaction ID (UUID)
  - Customer ID
  - Transaction type (deposit, withdrawal, transfer_in, transfer_out)
  - Amount (always positive, type indicates direction)
  - Description (auto-generated for transfers, identifying the other party)
  - Balance after the transaction
  - Timestamp (createdAt)
- **Note**: Currently, deposit and withdrawal operations do not create transaction records (this may be enhanced in future versions)
- For retrieving transaction history, see the [Transaction API Documentation](./transaction-api.md)

### Transfer Logic
- Transfers are atomic operations - both accounts are updated or neither
- Sender account balance is decreased by the transfer amount
- Recipient account balance is increased by the transfer amount
- If recipient account doesn't exist, it's created automatically with the transferred amount as the initial balance
- All validation occurs before any account modifications

### Error Handling
- All endpoints return structured JSON responses with `success` boolean flag
- Error messages are descriptive and help identify the specific validation failure
- HTTP status codes follow REST conventions (200, 400, 404, 500)

## Data Storage
Currently, accounts are stored in memory using an in-memory array. This means:
- Data is not persisted between server restarts
- All account data is lost when the application stops
- This implementation is suitable for development and testing purposes only