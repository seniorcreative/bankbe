# Bank Back End - (CODING TEST)


Node ExpressJS server (/backend) for managing customers, accounts, and transactions in a payment system.

• System Design Overview: Explanation of overall approach

    I have chosen ExpressJS as have experience with this node setup.
    I separated the APIs based on role centric operations that would need different authorization settings (roles & permissions).
    This avoids one giant API and also provides boundaries around certain operations. 
    
    Only the *customer* API allows customer create,
    Only the **manager* API allows list all transactions, for example.

    As there is no state, caching, DB or UI and this is needed to be validated via running tests, there is some run-time storage, array clearing and cross communication between the APIs
    which is unusual as a pattern and wouldn't scale with the app.

• Data Models/Entity Relationships: Documentation of data model design with rationale

- See [RELATIONSHIPS](backend/models/RELATIONSHIPS.md)

• Assumptions and Constraints: List of assumptions made during development

    One customer can only create one account.
    There's only one manager role type.
    All payments are in AUD, from and to AUD - no currency conversions.
    
    We will have a controller checking the user and their permissions.
    One day this will be supported by AWS infra (or GCP/AZURE).

• Production Considerations: What would change if this system were to be deployed to production

    There are some glaring omissions in this system but the API structure is there.
    Management of state, users and authentication have to be added. Routes would need to have guards added to check users.
    There would need to be controls to manage issues like when a submission happens multiple times with the same payload - to avoid payments that have the same signature being made more than once.
    Put various levels of security on the APP, like a web application firewall. I would recommend putting MFA (multi factor auth).


# How to run

### Prerequisites

- Node.js >=18
- npm (If using nvm to install node, keeping the default npm that comes with the node version is fine)


### Installation

### Option 1. Quick start (shell script)

```shell
sh ./run.sh
```

### Option 2. Node start
```bash
npm install
npm run dev
```


## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Documentation

### API Documentation
- [Customer API](backend/docs/customer-api.md) - Customer creation and management
- [Account API](backend/docs/account-api.md) - Account balance and operations
- [Transaction API](backend/docs/transaction-api.md) - Transaction history and filtering
- [Project Assumptions](backend/docs/assumptions.md) - Development assumptions and decisions


### Architecture & Security
I added a security analysis and threat model diagram of things as they stand. 
- [Threat Model Diagram](backend/diagram/threat-model.puml)

## Security Considerations

This is a development/prototype implementation with several security limitations:

- **No Authentication**: All endpoints are publicly accessible
- **No Authorization**: No role-based access control
- **In-Memory Storage**: Data is not persisted and is lost on restart
- **No Encryption**: Sensitive data is 'stored' in plain text
- **No Rate limiting**: Vulnerable to DoS attacks
- **Dev CORS Policy**: Allows localhost:3000 only

