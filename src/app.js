import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import httpLogger from "./lib/request.logger.js";
import universityRouter from "./presentation/routes/university.route.js";
import userRouter from "./presentation/routes/user.route.js";
import businessRouter from "./presentation/routes/business.route.js";
import branchRouter from "./presentation/routes/branch.route.js";
import studentRouter from "./presentation/routes/student.route.js";
import documentRouter from "./presentation/routes/document.route.js";
import studentApplicationRouter from "./presentation/routes/student-application.route.js";
import leadFormRouter from "./presentation/routes/lead-form.route.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import cors from "cors";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors({ origin: "*" }));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/public", express.static(path.join(__dirname, "..", "public")));

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
app.use("/student", studentRouter);
app.use("/document", documentRouter);
app.use("/student-application", studentApplicationRouter);
app.use("/lead-form", leadFormRouter);

app.use(errorMiddleware);

app.listen(process.env.PORT || 4001, () => {
  console.debug("Server is listening on PORT:", process.env.PORT || 4001);
});
