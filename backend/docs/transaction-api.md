# Transaction API Documentation

## GET /api/transactions

Retrieves transactions for a specific customer with support for pagination, sorting, and filtering.

### Query Parameters

**Required:**
- `customerId` (string): The ID of the customer whose transactions to retrieve

**Optional:**
- `cursor` (string): Pagination cursor for retrieving the next page of results
- `limit` (string/number): Number of transactions to return (1-100, default: 10)
- `sortBy` (string): Field to sort by - "date" or "amount" (default: "date")
- `sortOrder` (string): Sort order - "asc" or "desc" (default: "desc")

### Response

**Success (200):**
```json
{
  "success": true,
  "transactions": [
    {
      "id": "string",
      "customerId": "string",
      "type": "deposit|withdrawal|transfer_in|transfer_out",
      "amount": "number",
      "description": "string (optional)",
      "balanceAfter": "number",
      "createdAt": "string (ISO date)"
    }
  ],
  "nextCursor": "string (optional)",
  "hasMore": "boolean"
}
```

**Error (400) - Missing Customer ID:**
```json
{
  "success": false,
  "error": "Customer ID is required"
}
```

**Error (400) - Invalid Limit:**
```json
{
  "success": false,
  "error": "Limit must be between 1 and 100"
}
```

**Error (400) - Invalid Sort By:**
```json
{
  "success": false,
  "error": "sortBy must be either \"date\" or \"amount\""
}
```

**Error (400) - Invalid Sort Order:**
```json
{
  "success": false,
  "error": "sortOrder must be either \"asc\" or \"desc\""
}
```

**Error (500) - Server Error:**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

### Transaction Types

- `deposit`: Money added to the account
- `withdrawal`: Money removed from the account
- `transfer_in`: Money transferred into the account from another account
- `transfer_out`: Money transferred out of the account to another account

### Pagination

The API uses cursor-based pagination:
1. The initial request returns up to `limit` transactions and a `nextCursor` if more results exist
2. To get the next page, include the `cursor` parameter with the value from `nextCursor`
3. Continue until `hasMore` is `false`

### Sorting

- **Default**: Transactions are sorted by date in descending order (newest first)
- **By Date**: Use `sortBy=date` with `sortOrder=asc` or `sortOrder=desc`
- **By Amount**: Use `sortBy=amount` with `sortOrder=asc` or `sortOrder=desc`

### Example Usage

**Basic request:**
```bash
curl "http://localhost:3000/api/transactions?customerId=customer-123"
```

**With pagination and sorting:**
```bash
curl "http://localhost:3000/api/transactions?customerId=customer-123&limit=5&sortBy=amount&sortOrder=desc"
```

**Next page using cursor:**
```bash
curl "http://localhost:3000/api/transactions?customerId=customer-123&cursor=txn-456&limit=5"
```

### Notes

- All monetary amounts are represented as numbers
- Dates are returned in ISO 8601 format
- The `balanceAfter` field shows the account balance after the transaction was processed
- Empty results return an empty array with `hasMore: false`
- Customer isolation is enforced - transactions are filtered by `customerId`