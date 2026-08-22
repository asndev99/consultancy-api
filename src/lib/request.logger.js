import morgan from "morgan";

const REDACTED_FIELDS = ["password", "accessToken", "refreshToken"];

morgan.token("body", (req) => {
  const body = req.body ?? {};
  const redacted = { ...body };

  for (const field of REDACTED_FIELDS) {
    if (field in redacted) {
      redacted[field] = "[REDACTED]";
    }
  }

  return JSON.stringify(redacted);
});

const logFormat =
  ":remote-addr :method :url :status :res[content-length] - :response-time ms Body: :body";

const skip = (req) => {
  return req.url === "/health" || req.url === "/favicon.ico";
};

const httpLogger = morgan(logFormat, {
  skip,
});

export default httpLogger;
