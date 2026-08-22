import { UserRoles } from "../../../shared/application.constants.js";

export default {
  RegisterUserSchema: {
    $id: "https://example.com/schemas/register-user.json",
    type: "object",
    properties: {
      name: {
        type: "string",
        minLength: 2,
        maxLength: 100,
        errorMessage: {
          minLength: "Name must be at least 2 characters long",
        },
      },
      email: {
        type: "string",
        format: "email",
        errorMessage: {
          format: "Email must be a valid email address",
        },
      },
      phoneNumber: {
        type: "string",
        minLength: 2,
        errorMessage: {
          minLength: "phoneNumber is required",
        },
      },
      role: {
        type: "string",
        enum: Object.values(UserRoles),
        errorMessage: {
          enum: "Role must be one of the allowed roles",
        },
      },
      businessId: {
        type: "integer",
        minimum: 1,
      },
      branchId: {
        type: "integer",
        minimum: 1,
      },
      profileMedia: {
        type: "string",
      },
      backUpEmailAddress: {
        type: "string",
        format: "email",
      },
    },
    required: ["name", "email", "role", "businessId", "branchId"],
    additionalProperties: false,
  },
  UpdateUserSchema: {
    $id: "https://example.com/schemas/update-user.json",
    type: "object",
    properties: {
      name: {
        type: "string",
        minLength: 2,
        maxLength: 100,
        errorMessage: {
          minLength: "Name must be at least 2 characters long",
        },
      },
      email: {
        type: "string",
        format: "email",
        errorMessage: {
          format: "Email must be a valid email address",
        },
      },
      phoneNumber: {
        type: "string",
        minLength: 2,
        errorMessage: {
          minLength: "phoneNumber is required",
        },
      },
      role: {
        type: "string",
        enum: Object.values(UserRoles),
        errorMessage: {
          enum: "Role must be one of the allowed roles",
        },
      },
      businessId: {
        type: "integer",
        minimum: 1,
        errorMessage: {
          minimum: "userId must be a positive integer",
        },
      },
    },
    minProperties: 1,
    errorMessage: {
      minProperties: "At least one field must be provided to update",
    },
    additionalProperties: false,
  },
  DeleteUserSchema: {
    $id: "https://example.com/schemas/delete-user.json",
    type: "object",
    properties: {
      userId: {
        type: "integer",
        minimum: 1,
        errorMessage: {
          minimum: "userId must be a positive integer",
        },
      },
    },
    required: ["userId"],
    additionalProperties: false,
  },
};
