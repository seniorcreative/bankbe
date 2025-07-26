import request from "supertest";
import app from "../app";
import { clearAccounts } from "../controllers/accountController";
import { transactions } from "../controllers/transactionController";

describe("Account API", () => {
  const testCustomerId = "test-customer-123";

  beforeEach(() => {
    clearAccounts();
    transactions.length = 0;
  });

  describe("POST /api/accounts/deposit", () => {
    it("should deposit funds to a new account", async () => {
      const depositData = {
        customerId: testCustomerId,
        amount: 100.5,
      };

      const response = await request(app)
        .post("/api/accounts/deposit")
        .send(depositData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.account).toBeDefined();
      expect(response.body.account.customerId).toBe(testCustomerId);
      expect(response.body.account.balance).toBe(100.5);
      expect(response.body.account.id).toBeDefined();
      expect(response.body.account.createdAt).toBeDefined();
      expect(response.body.account.updatedAt).toBeDefined();
    });

    it("should deposit funds to an existing account", async () => {
      const customerId = "existing-account-customer";

      await request(app).post("/api/accounts/deposit").send({
        customerId,
        amount: 100.5,
      });

      const depositData = {
        customerId,
        amount: 50.25,
      };

      const response = await request(app)
        .post("/api/accounts/deposit")
        .send(depositData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.account.balance).toBe(150.75);
    });

    it("should return error for missing customerId", async () => {
      const depositData = {
        amount: 100.5,
      };

      const response = await request(app)
        .post("/api/accounts/deposit")
        .send(depositData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Missing required fields");
    });

    it("should return error for missing amount", async () => {
      const depositData = {
        customerId: testCustomerId,
      };

      const response = await request(app)
        .post("/api/accounts/deposit")
        .send(depositData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Missing required fields");
    });

    it("should return error for negative amount", async () => {
      const depositData = {
        customerId: testCustomerId,
        amount: -10,
      };

      const response = await request(app)
        .post("/api/accounts/deposit")
        .send(depositData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Amount must be a positive number");
    });

    it("should return error for zero amount", async () => {
      const depositData = {
        customerId: testCustomerId,
        amount: 0,
      };

      const response = await request(app)
        .post("/api/accounts/deposit")
        .send(depositData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Amount must be a positive number");
    });

    it("should return error for invalid amount type", async () => {
      const depositData = {
        customerId: testCustomerId,
        amount: "invalid",
      };

      const response = await request(app)
        .post("/api/accounts/deposit")
        .send(depositData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Amount must be a positive number");
    });
  });

  describe("POST /api/accounts/withdraw", () => {
    const withdrawCustomerId = "withdraw-customer-456";

    beforeEach(async () => {
      await request(app).post("/api/accounts/deposit").send({
        customerId: withdrawCustomerId,
        amount: 200,
      });
    });

    it("should withdraw funds from account", async () => {
      const withdrawData = {
        customerId: withdrawCustomerId,
        amount: 50,
      };

      const response = await request(app)
        .post("/api/accounts/withdraw")
        .send(withdrawData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.account).toBeDefined();
      expect(response.body.account.balance).toBe(150);
    });

    it("should return error for insufficient funds", async () => {
      const withdrawData = {
        customerId: withdrawCustomerId,
        amount: 300,
      };

      const response = await request(app)
        .post("/api/accounts/withdraw")
        .send(withdrawData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Insufficient funds");
    });

    it("should return error for non-existent account", async () => {
      const withdrawData = {
        customerId: "non-existent-customer",
        amount: 50,
      };

      const response = await request(app)
        .post("/api/accounts/withdraw")
        .send(withdrawData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Account not found for this customer");
    });

    it("should return error for missing customerId", async () => {
      const withdrawData = {
        amount: 50,
      };

      const response = await request(app)
        .post("/api/accounts/withdraw")
        .send(withdrawData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Missing required fields");
    });

    it("should return error for missing amount", async () => {
      const withdrawData = {
        customerId: withdrawCustomerId,
      };

      const response = await request(app)
        .post("/api/accounts/withdraw")
        .send(withdrawData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Missing required fields");
    });

    it("should return error for negative amount", async () => {
      const withdrawData = {
        customerId: withdrawCustomerId,
        amount: -10,
      };

      const response = await request(app)
        .post("/api/accounts/withdraw")
        .send(withdrawData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Amount must be a positive number");
    });

    it("should return error for zero amount", async () => {
      const withdrawData = {
        customerId: withdrawCustomerId,
        amount: 0,
      };

      const response = await request(app)
        .post("/api/accounts/withdraw")
        .send(withdrawData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Amount must be a positive number");
    });

    it("should prevent withdrawing more than available balance", async () => {
      const withdrawData = {
        customerId: withdrawCustomerId,
        amount: 200.01,
      };

      const response = await request(app)
        .post("/api/accounts/withdraw")
        .send(withdrawData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Insufficient funds");
    });

    it("should allow withdrawing exact balance", async () => {
      const withdrawData = {
        customerId: withdrawCustomerId,
        amount: 200,
      };

      const response = await request(app)
        .post("/api/accounts/withdraw")
        .send(withdrawData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.account.balance).toBe(0);
    });
  });

  describe("POST /api/accounts/balance", () => {
    const balanceCustomerId = "balance-customer-789";

    beforeEach(async () => {
      await request(app).post("/api/accounts/deposit").send({
        customerId: balanceCustomerId,
        amount: 150.75,
      });
    });

    it("should return account balance", async () => {
      const balanceData = {
        customerId: balanceCustomerId,
      };

      const response = await request(app)
        .post("/api/accounts/balance")
        .send(balanceData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.balance).toBe(150.75);
    });

    it("should return error for non-existent account", async () => {
      const balanceData = {
        customerId: "non-existent-customer",
      };

      const response = await request(app)
        .post("/api/accounts/balance")
        .send(balanceData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Account not found for this customer");
    });

    it("should return error for missing customerId", async () => {
      const balanceData = {};

      const response = await request(app)
        .post("/api/accounts/balance")
        .send(balanceData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Missing required field");
    });

    it("should return zero balance for newly created account with no deposits", async () => {
      const newCustomerId = "new-balance-customer";

      await request(app).post("/api/accounts/deposit").send({
        customerId: newCustomerId,
        amount: 0.01,
      });

      await request(app).post("/api/accounts/withdraw").send({
        customerId: newCustomerId,
        amount: 0.01,
      });

      const response = await request(app)
        .post("/api/accounts/balance")
        .send({ customerId: newCustomerId })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.balance).toBe(0);
    });
  });

  describe("Account Integration Tests", () => {
    const integrationCustomerId = "integration-customer-999";

    it("should handle sequential operations correctly", async () => {
      await request(app)
        .post("/api/accounts/deposit")
        .send({
          customerId: integrationCustomerId,
          amount: 1000,
        })
        .expect(200);

      await request(app)
        .post("/api/accounts/withdraw")
        .send({
          customerId: integrationCustomerId,
          amount: 250,
        })
        .expect(200);

      await request(app)
        .post("/api/accounts/deposit")
        .send({
          customerId: integrationCustomerId,
          amount: 100,
        })
        .expect(200);

      const balanceResponse = await request(app)
        .post("/api/accounts/balance")
        .send({ customerId: integrationCustomerId })
        .expect(200);

      expect(balanceResponse.body.balance).toBe(850);
    });
  });

  describe("POST /api/accounts/transfer", () => {
    const fromCustomerId = "transfer-sender";
    const toCustomerId = "transfer-recipient";

    beforeEach(async () => {
      await request(app).post("/api/accounts/deposit").send({
        customerId: fromCustomerId,
        amount: 500,
      });
    });

    it("should transfer funds between accounts", async () => {
      const transferData = {
        fromCustomerId,
        toCustomerId,
        amount: 200,
      };

      const response = await request(app)
        .post("/api/accounts/transfer")
        .send(transferData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.fromAccount.balance).toBe(300);
      expect(response.body.toAccount.balance).toBe(200);
      expect(response.body.fromAccount.customerId).toBe(fromCustomerId);
      expect(response.body.toAccount.customerId).toBe(toCustomerId);
    });

    it("should create transaction records for both accounts", async () => {
      const transferData = {
        fromCustomerId,
        toCustomerId,
        amount: 150,
      };

      await request(app)
        .post("/api/accounts/transfer")
        .send(transferData)
        .expect(200);

      const transferTransactions = transactions.filter(t => 
        t.type === 'transfer_out' || t.type === 'transfer_in'
      );
      expect(transferTransactions).toHaveLength(2);
      
      const senderTransaction = transactions.find(t => 
        t.customerId === fromCustomerId && t.type === 'transfer_out'
      );
      const recipientTransaction = transactions.find(t => 
        t.customerId === toCustomerId && t.type === 'transfer_in'
      );

      expect(senderTransaction).toBeDefined();
      expect(senderTransaction?.amount).toBe(150);
      expect(senderTransaction?.balanceAfter).toBe(350);

      expect(recipientTransaction).toBeDefined();
      expect(recipientTransaction?.amount).toBe(150);
      expect(recipientTransaction?.balanceAfter).toBe(150);
    });

    it("should reject transfer with insufficient funds", async () => {
      const transferData = {
        fromCustomerId,
        toCustomerId,
        amount: 600,
      };

      const response = await request(app)
        .post("/api/accounts/transfer")
        .send(transferData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Insufficient funds");
    });

    it("should reject transfer to same account", async () => {
      const transferData = {
        fromCustomerId,
        toCustomerId: fromCustomerId,
        amount: 100,
      };

      const response = await request(app)
        .post("/api/accounts/transfer")
        .send(transferData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Cannot transfer to the same account");
    });

    it("should reject transfer from non-existent account", async () => {
      const transferData = {
        fromCustomerId: "non-existent",
        toCustomerId,
        amount: 100,
      };

      const response = await request(app)
        .post("/api/accounts/transfer")
        .send(transferData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Sender account not found");
    });

    it("should reject transfer with invalid amount", async () => {
      const transferData = {
        fromCustomerId,
        toCustomerId,
        amount: -50,
      };

      const response = await request(app)
        .post("/api/accounts/transfer")
        .send(transferData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Amount must be a positive number");
    });

    it("should reject transfer with missing fields", async () => {
      const transferData = {
        fromCustomerId,
        amount: 100,
      };

      const response = await request(app)
        .post("/api/accounts/transfer")
        .send(transferData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Missing required fields");
    });
  });
});
