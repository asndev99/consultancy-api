import { UserRoles } from "../../../shared/application.constants.js";

export default {
  EditSubAgentSchema: {
    $id: "https://example.com/schemas/edit-sub-agent.json",
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
        maxLength: 30,
        errorMessage: {
          minLength: "phoneNumber is required",
        },
      },
      companyName: {
        type: "string",
        minLength: 2,
        maxLength: 150,
        errorMessage: {
          minLength: "Company name must be at least 2 characters long",
        },
      },
      commissionRate: {
        type: "number",
        minimum: 0,
        maximum: 100,
        errorMessage: {
          minimum: "commissionRate must be between 0 and 100",
          maximum: "commissionRate must be between 0 and 100",
        },
      },
      targetCountries: {
        type: "array",
        maxItems: 50,
        items: {
          type: "string",
          minLength: 1,
          maxLength: 100,
        },
      },
    },
    minProperties: 1,
    errorMessage: {
      minProperties: "At least one field must be provided to update",
    },
    additionalProperties: false,
  },
  UpdateSubAgentStatusSchema: {
    $id: "https://example.com/schemas/update-sub-agent-status.json",
    type: "object",
    properties: {
      status: {
        type: "boolean",
        errorMessage: {
          type: "status must be a boolean",
        },
      },
    },
    required: ["status"],
    additionalProperties: false,
  },
  AssignSubAgentBranchSchema: {
    $id: "https://example.com/schemas/assign-sub-agent-branch.json",
    type: "object",
    properties: {
      userId: {
        type: "integer",
        minimum: 1,
        errorMessage: {
          minimum: "userId must be a positive integer",
        },
      },
      branchId: {
        type: "integer",
        minimum: 1,
        errorMessage: {
          minimum: "branchId must be a positive integer",
        },
      },
      companyName: {
        type: "string",
        minLength: 2,
        maxLength: 150,
        errorMessage: {
          minLength: "Company name must be at least 2 characters long",
        },
      },
      commissionRate: {
        type: "number",
        minimum: 0,
        maximum: 100,
        errorMessage: {
          minimum: "commissionRate must be between 0 and 100",
          maximum: "commissionRate must be between 0 and 100",
        },
      },
      targetCountries: {
        type: "array",
        maxItems: 50,
        items: {
          type: "string",
          minLength: 1,
          maxLength: 100,
        },
      },
    },
    required: ["userId", "branchId"],
    additionalProperties: false,
  },
  RegisterSubAgentSchema: {
    $id: "https://example.com/schemas/register-sub-agent.json",
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
        maxLength: 30,
        errorMessage: {
          minLength: "phoneNumber is required",
        },
      },
      role: {
        type: "string",
        enum: [UserRoles["Sub Agent"]],
        errorMessage: {
          enum: "Role must be Sub Agent",
        },
      },
      companyName: {
        type: "string",
        minLength: 2,
        maxLength: 150,
        errorMessage: {
          minLength: "Company name must be at least 2 characters long",
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
      commissionRate: {
        type: "number",
        minimum: 0,
        maximum: 100,
        errorMessage: {
          minimum: "commissionRate must be between 0 and 100",
          maximum: "commissionRate must be between 0 and 100",
        },
      },
      targetCountries: {
        type: "array",
        maxItems: 50,
        items: {
          type: "string",
          minLength: 1,
          maxLength: 100,
        },
      },
    },
    required: [
      "name",
      "email",
      "phoneNumber",
      "role",
      "companyName",
      "businessId",
      "branchId",
      "commissionRate",
    ],
    additionalProperties: false,
  },
};
