import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import httpLogger from "./lib/request.logger.js";
import universityRouter from "./presentation/routes/university.route.js";
import userRouter from "./presentation/routes/user.route.js";
import businessRouter from "./presentation/routes/business.route.js";
import branchRouter from "./presentation/routes/branch.route.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const openApiDocument = YAML.load(
  path.join(__dirname, "..", "docs", "openapi.yml"),
);

// Correct usage:
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.use(httpLogger);

app.use("/university", universityRouter);
app.use("/user", userRouter);
app.use("/business", businessRouter);
app.use("/branch", branchRouter);

app.use(errorMiddleware);

app.listen(process.env.PORT || 4001, () => {
  console.debug("Server is listening on PORT:", process.env.PORT || 4001);
});
