export default {
  CreateBranchSchema: {
    $id: "https://example.com/schemas/create-branch.json",
    type: "object",
    properties: {
      name: {
        type: "string",
        minLength: 2,
        maxLength: 150,
      },
      branchCode: {
        type: "string",
        minLength: 2,
        maxLength: 50,
      },
      businessId: {
        type: "integer",
        minimum: 1,
      },
      city: {
        type: "string",
        minLength: 2,
        maxLength: 90,
      },
      country: {
        type: "string",
        minLength: 2,
        maxLength: 90,
      },
      address: {
        type: "string",
        minLength: 2,
        maxLength: 250,
      },
      latitude: {
        type: "number",
      },
      longitude: {
        type: "number",
      },
      userId: {
        type: "integer",
        minimum: 1,
        errorMessage: {
          minimum: "userId must be a positive integer",
        },
      },
    },
    required: [
      "name",
      "branchCode",
      "businessId",
      "city",
      "country",
      "address",
      "userId",
    ],
    additionalProperties: false,
  },
  UpdateBranchSchema: {
    $id: "https://example.com/schemas/update-branch.json",
    type: "object",
    properties: {
      name: {
        type: "string",
        minLength: 2,
        maxLength: 150,
      },
      city: {
        type: "string",
        minLength: 2,
        maxLength: 90,
      },
      country: {
        type: "string",
        minLength: 2,
        maxLength: 90,
      },
      address: {
        type: "string",
        minLength: 2,
        maxLength: 250,
      },
      latitude: {
        type: "number",
      },
      longitude: {
        type: "number",
      },
      isActive: {
        type: "boolean",
      },
    },
    minProperties: 1,
    errorMessage: {
      minProperties: "At least one field must be provided to update",
    },
    additionalProperties: false,
  },
};
