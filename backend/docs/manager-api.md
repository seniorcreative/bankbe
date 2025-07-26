# Manager API Documentation

This Manager API provides endpoints for bank managers to view aggregate data across all accounts and transactions in the bank. This API offers a higher-level view of the bank's operations and supports various management oversight functions.

## Base URL
All manager endpoints are prefixed with `/api/manager`.

## Endpoints

### GET /api/manager/total-balance
Retrieves the total balance of funds across all accounts in the bank.

**Request:**
- Method: GET
- No request body required
- No query parameters required

**Success Response (200):**
```json
{
  "success": true,
  "totalBalance": number
}
```

**Error Responses:**
- **500 Internal Server Error:** Server error
  ```json
  {
    "success": false,
    "error": "Internal server error"
  }
  ```

**Business Logic:**
- Calculates the sum of all account balances in the bank
- Returns 0 if no accounts exist
- Includes all customer accounts regardless of status

---

### GET /api/manager/all-transactions
Retrieves all transactions across all customer accounts with support for sorting and pagination.

**Query Parameters:**

**Optional:**
- `cursor` (string): Pagination cursor for retrieving the next page of results
- `limit` (string/number): Number of transactions to return (1-100, default: 10)
- `sortBy` (string): Field to sort by - "date", "amount", "customerId", or "type" (default: "date")
- `sortOrder` (string): Sort order - "asc" or "desc" (default: "desc")

**Success Response (200):**
```json
{
  "success": true,
  "transactions": [
    {
      "id": "string",
      "customerId": "string",
      "type": "deposit|withdrawal|transfer_in|transfer_out",
      "amount": number,
      "description": "string (optional)",
      "balanceAfter": number,
      "createdAt": "string (ISO date)"
    }
  ],
  "nextCursor": "string (optional)",
  "hasMore": boolean
}
```

**Error Responses:**
- **400 Bad Request:** Invalid query parameters
  ```json
  {
    "success": false,
    "error": "Limit must be between 1 and 100"
  }
  ```
  ```json
  {
    "success": false,
    "error": "sortBy must be one of: date, amount, customerId, type"
  }
  ```
  ```json
  {
    "success": false,
    "error": "sortOrder must be either \"asc\" or \"desc\""
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
- `limit` must be between 1 and 100 (inclusive)
- `sortBy` must be one of: "date", "amount", "customerId", "type"
- `sortOrder` must be either "asc" or "desc"

## Usage Examples

### Get Total Balance
```bash
curl -X GET http://localhost:3000/api/manager/total-balance
```

**Example Response:**
```json
{
  "success": true,
  "totalBalance": 15750.25
}
```

### Get All Transactions (Default Sorting)
```bash
curl -X GET http://localhost:3000/api/manager/all-transactions
```

### Get Transactions Sorted by Amount (Highest First)
```bash
curl -X GET "http://localhost:3000/api/manager/all-transactions?sortBy=amount&sortOrder=desc&limit=20"
```

### Get Transactions Sorted by Customer ID
```bash
curl -X GET "http://localhost:3000/api/manager/all-transactions?sortBy=customerId&sortOrder=asc&limit=50"
```

### Get Transactions Sorted by Transaction Type
```bash
curl -X GET "http://localhost:3000/api/manager/all-transactions?sortBy=type&sortOrder=asc"
```

### Paginated Request Using Cursor
```bash
curl -X GET "http://localhost:3000/api/manager/all-transactions?limit=10&cursor=txn-abc123"
```

## Sorting Options

### By Date (default)
- **Ascending**: Oldest transactions first
- **Descending**: Newest transactions first (default)

### By Amount
- **Ascending**: Smallest amounts first
- **Descending**: Largest amounts first

### By Customer ID
- **Ascending**: Alphabetical order (A-Z)
- **Descending**: Reverse alphabetical order (Z-A)

### By Transaction Type
- **Ascending**: Alphabetical order of transaction types
- **Descending**: Reverse alphabetical order of transaction types

Transaction types in alphabetical order:
1. `deposit`
2. `transfer_in`
3. `transfer_out`
4. `withdrawal`

## Pagination

The API uses cursor-based pagination similar to the transaction API:
1. The initial request returns up to `limit` transactions and a `nextCursor` if more results exist
2. To get the next page, include the `cursor` parameter with the value from `nextCursor`
3. Continue until `hasMore` is `false`
4. Pagination works with all sorting options

## Business Logic

### Total Balance Calculation
- Sums all positive and negative balances across all customer accounts
- Includes accounts with zero balances in the calculation
- Real-time calculation - reflects the current state of all accounts
- No historical balance tracking - always current balances

### Transaction Access
- Provides access to all transactions across all customer accounts
- No customer isolation - managers can see all customer activities
- Supports comprehensive sorting to identify patterns and trends
- Includes all transaction types (deposits, withdrawals, transfers)

### Manager Privileges
- Full read access to all account balances and transactions
- No write operations available through this API
- Designed for oversight, reporting, and management functions
- Supports audit and compliance activities

## Security Considerations

This API provides sensitive financial data and should be:
- Protected with appropriate authentication and authorization
- Limited to users with manager-level permissions
- Logged for audit purposes
- Protected against unauthorized access

## Data Storage

Currently, data is stored in memory using in-memory arrays. This means:
- Data is not persisted between server restarts
- All account and transaction data is lost when the application stops
- This implementation is suitable for development and testing purposes only
- In production, this should be backed by a persistent database

## Performance Notes

- Total balance calculation is performed in real-time for each request
- Transaction sorting is performed in memory for each request
- Large transaction volumes may impact response times
- Consider implementing caching strategies for production deployments