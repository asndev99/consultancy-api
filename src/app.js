import "dotenv/config";
import express from "express";
import httpLogger from "./lib/request.logger.js";
import universityRouter from "./presentation/routes/university.route.js";
import userRouter from "./presentation/routes/user.route.js";
import businessRouter from "./presentation/routes/business.route.js";
import branchRouter from "./presentation/routes/branch.route.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

const app = express();

app.use(express.json());

app.use(httpLogger);

app.use("/university", universityRouter);
app.use("/user", userRouter);
app.use("/business", businessRouter);
app.use("/branch", branchRouter);

app.use(errorMiddleware);

app.listen(process.env.PORT || 4001, () => {
  console.debug("Server is listening on PORT:", process.env.PORT || 4001);
});
