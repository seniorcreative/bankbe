# Model Relationships

This document explains the relationships between the core models in the payment system: Account, Customer, and Transaction.

## Core Models

### Customer
- **Primary Key**: `id` (string)
- **Properties**: firstName, lastName, amount, createdAt
- **Purpose**: Represents a user of the payment system

### Account
- **Primary Key**: `id` (string)
- **Foreign Key**: `customerId` (references Customer.id)
- **Properties**: balance, createdAt, updatedAt
- **Purpose**: Represents a customer's account balance and metadata

### Transaction
- **Primary Key**: `id` (string)
- **Foreign Key**: `customerId` (references Customer.id)
- **Properties**: type, amount, description, balanceAfter, createdAt
- **Purpose**: Records all financial activities for a customer

### Manager
- **Primary Key**: Not applicable (service layer, not a persisted entity)
- **Purpose**: Provides system-wide management operations and analytics
- **Interfaces**: TotalBalanceResponse, AllTransactionsRequest, AllTransactionsResponse
- **Operations**: Calculate total system balance, retrieve all transactions with pagination


## Relationships

### Customer → Account (1:1)
- Each Customer has exactly one Account
- Account.customerId references Customer.id
- The Account tracks the current balance for the Customer

### Customer → Transaction (1:Many)
- Each Customer can have multiple Transactions
- Transaction.customerId references Customer.id
- Transactions record all deposits, withdrawals, and transfers

### Account ↔ Transaction (Related via Customer)
- Transactions affect the Account balance
- Transaction.balanceAfter records the account balance after each transaction
- No direct foreign key relationship, but linked through customerId

### Manager → All Entities (Service Layer)
- Manager operates on aggregated data from Customer, Account, and Transaction
- Provides system-wide analytics and reporting capabilities
- No direct database relationships (operates at the service/controller level)

### Customer ↔ Customer (Indirect via Transfers)
- Customers can transfer funds to other customers through the transfer API
- No direct relationship in the data model
- Connection established through paired TRANSFER_OUT and TRANSFER_IN transactions
- Each transfer creates a relationship between two customers in the transaction history

## Transaction Types

The system supports four transaction types (added in as an ENUM type):
- `DEPOSIT`: Money added to account
- `WITHDRAWAL`: Money removed from account  
- `TRANSFER_IN`: Money received from another account
- `TRANSFER_OUT`: Money sent to another account

## Data Flow

### Basic Operations
1. Customer is created with initial amount
2. Account is created for the customer with the initial balance
3. Transactions are recorded for all balance changes
4. Each transaction updates the account balance and records balanceAfter

### Transfer Operations
1. Transfer request specifies sender (fromCustomerId) and recipient (toCustomerId)
2. System validates sender has sufficient funds
3. Recipient account is created automatically if it doesn't exist
4. Two transactions are created atomically:
   - TRANSFER_OUT transaction for sender (decreases balance)
   - TRANSFER_IN transaction for recipient (increases balance)
5. Both account balances are updated simultaneously
6. Transaction descriptions include references to the other party

### Transaction Relationships in Transfers
- Each transfer creates a pair of related transactions
- TRANSFER_OUT and TRANSFER_IN transactions are linked by:
  - Same timestamp (createdAt)
  - Same amount
  - Complementary descriptions referencing each other's customer IDs
- This allows reconstruction of transfer history and relationships between customers

## Current Implementation Notes

### Transaction Recording
- **Transfers**: Automatically create transaction records for both parties
- **Deposits/Withdrawals**: Currently do not create transaction records (may be enhanced in future)
- This means transaction history only reflects transfer activities between customers

### Account Creation
- Accounts are created automatically on first deposit or when receiving a transfer
- No separate account creation API endpoint
- Account creation is always triggered by a financial operation