import express from "express";
import cors from "cors";
import helmet from "helmet";
import customerRoutes from "./routes/customerRoutes";
import accountRoutes from "./routes/accountRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import managerRoutes from "./routes/managerRoutes";

const app = express();

app.use(helmet()); // Extra Express security middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost", "http://localhost:80"], // Allow frontend to connect
    credentials: true, // If I need to send cookies
  })
);
app.use(express.json());

// Keep APIs separate, so that roles and responsibilities are clear
app.use("/api/customers", customerRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/manager", managerRoutes);

export default app;
