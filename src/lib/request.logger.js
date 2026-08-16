import morgan from "morgan";

const logFormat =
  ":remote-addr :method :url :status :res[content-length] - :response-time ms Body: :body";

const skip = (req) => {
  return req.url === "/health" || req.url === "/favicon.ico";
};

const httpLogger = morgan(logFormat, {
  skip,
});

export default httpLogger;
