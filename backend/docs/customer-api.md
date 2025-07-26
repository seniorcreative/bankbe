# Customer API Documentation

## POST /customers/create

Creates a new customer with the provided information.

### Request Body
```json
{
  "firstName": "string",
  "lastName": "string", 
  "amount": "number"
}
```

**Required Fields:**
- `firstName` (string): Customer's first name
- `lastName` (string): Customer's last name  
- `amount` (number): Must be >= 1

### Response

**Success (201):**
```json
{
  "success": true,
  "customer": {
    "id": "string",
    "firstName": "string",
    "lastName": "string",
    "amount": "number",
    "createdAt": "string (ISO date)"
  }
}
```

**Error (400) - Missing Fields:**
```json
{
  "success": false,
  "error": "Missing required fields: firstName, lastName, and amount are required"
}
```

**Error (400) - Invalid Amount:**
```json
{
  "success": false,
  "error": "Amount must be greater than or equal to 1 and must be a number"
}
```

**Error (500) - Server Error:**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

### Example Usage (If using POSTMAN post raw JSON as body)
```bash
curl -X POST http://localhost:3000/customers/create \
  -H "Content-Type: application/json" \
  -d '{"firstName": "John", "lastName": "Doe", "amount": 100}'
```