export default {
  UpdateBusinessPreferencesSchema: {
    $id: "https://example.com/schemas/update-business-preferences.json",
    type: "object",
    properties: {
      name: {
        type: "string",
        minLength: 2,
        maxLength: 150,
        errorMessage: {
          minLength: "Company name must be at least 2 characters long",
        },
      },
      website: {
        type: "string",
        maxLength: 255,
      },
      phoneNumber: {
        type: "string",
        maxLength: 50,
      },
      email: {
        type: "string",
        format: "email",
        errorMessage: {
          format: "Business email must be a valid email address",
        },
      },
      address: {
        type: "string",
        minLength: 2,
        maxLength: 500,
        errorMessage: {
          minLength: "Address must be at least 2 characters long",
        },
      },
    },
    additionalProperties: false,
  },
};
