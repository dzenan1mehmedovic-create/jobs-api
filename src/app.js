import express from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUI from "swagger-ui-express";
import YAML from "yamljs";

import authRoutes from "./routes/authRoutes.js";
import jobsRoutes from "./routes/jobsRoutes.js";
import { authenticateUser } from "./middleware/authMiddleware.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import notFoundMiddleware from "./middleware/notFound.js";
import errorHandlerMiddleware from "./middleware/errorHandler.js";

const swaggerDocument = YAML.load("./swagger/swagger.yaml");

const app = express();

app.use(apiLimiter);
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Jobs API is running...",
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/jobs", authenticateUser, jobsRoutes);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

export default app;
