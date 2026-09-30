import { LeadFormType } from "../../../shared/application.constants.js";

export default {
  SubmitLeadSchema: {
    $id: "https://example.com/schemas/submit-lead.json",
    type: "object",
    properties: {
      fullName: {
        type: "string",
        minLength: 2,
        maxLength: 150,
        errorMessage: {
          minLength: "Full name must be at least 2 characters long",
        },
      },
      email: {
        type: "string",
        format: "email",
        errorMessage: {
          format: "Email must be a valid email address",
        },
      },
      phoneNo: {
        type: "string",
        minLength: 2,
        maxLength: 30,
        errorMessage: {
          minLength: "phoneNo is required",
        },
      },
      preferredTargetCountries: {
        type: "array",
        maxItems: 20,
        items: {
          type: "string",
          minLength: 1,
          maxLength: 100,
        },
      },
      targetDegreeLevel: {
        type: "string",
        minLength: 1,
        maxLength: 150,
      },
      additionalNotes: {
        type: "string",
        maxLength: 2000,
      },
    },
    required: ["fullName", "email", "phoneNo"],
    additionalProperties: false,
  },
  CreateLeadFormSchema: {
    $id: "https://example.com/schemas/create-lead-form.json",
    type: "object",
    properties: {
      branchId: {
        type: "integer",
        minimum: 1,
      },
      type: {
        type: "string",
        enum: Object.values(LeadFormType),
      },
      name: {
        type: "string",
        minLength: 2,
        maxLength: 150,
      },
      utmSource: {
        type: "string",
        maxLength: 150,
      },
      targetDegreeLevel: {
        type: "string",
        minLength: 1,
        maxLength: 150,
      },
      targetCountries: {
        type: "array",
        items: {
          type: "string",
        },
      },
    },
    required: ["type", "name", "targetDegreeLevel"],
    additionalProperties: false,
    allOf: [
      {
        if: {
          properties: { type: { const: "BRANCH_LEVEL" } },
          required: ["type"],
        },
        then: {
          required: ["branchId"],
        },
      },
    ],
  },
  EditLeadFormSchema: {
    $id: "https://example.com/schemas/edit-lead-form.json",
    type: "object",
    properties: {
      name: {
        type: "string",
        minLength: 2,
        maxLength: 150,
      },
      targetDegreeLevel: {
        type: "string",
        minLength: 1,
        maxLength: 150,
      },
      targetCountries: {
        type: "array",
        items: {
          type: "string",
        },
      },
      utmSource: {
        type: "string",
        maxLength: 150,
      },
    },
    minProperties: 1,
    errorMessage: {
      minProperties: "At least one field must be provided to update",
    },
    additionalProperties: false,
  },
  UpdateLeadFormStatusSchema: {
    $id: "https://example.com/schemas/update-lead-form-status.json",
    type: "object",
    properties: {
      isActive: {
        type: "boolean",
      },
    },
    required: ["isActive"],
    additionalProperties: false,
  },
};
