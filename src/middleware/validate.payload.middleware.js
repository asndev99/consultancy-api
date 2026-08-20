import Ajv from "ajv";
import addFormats from "ajv-formats";
import ajvErrors from "ajv-errors";

const ajv = new Ajv({
  allErrors: true,
  coerceTypes: true,
});

addFormats(ajv);
ajvErrors(ajv);

export const validateBody = (schema) => {
  const validate = ajv.compile(schema);

  return (req, res, next) => {
    const valid = validate(req.body);

    if (!valid) {
      const errors = validate.errors.map((err) => ({
        field:
          err.instancePath.replace("/", "") ||
          err.params.missingProperty ||
          "body",
        message: err.message,
      }));

      return res.status(400).json({
        status: "fail",
        message: "Validation failed",
        errors,
      });
    }

    next();
  };
};
