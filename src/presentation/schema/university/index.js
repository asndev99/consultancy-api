export default {
  AddUniversitySchema: {
    $id: "https://example.com/schemas/add-university.json",
    type: "object",
    properties: {
      universityName: {
        type: "string",
        minLength: 2,
        maxLength: 150,
        errorMessage: {
          minLength: "University name must be at least 2 characters long",
        },
      },
      country: {
        type: "string",
        minLength: 2,
        maxLength: 90,
      },
      businessId: {
        type: "integer",
        minimum: 1,
        errorMessage: {
          minimum: "businessId must be a positive integer",
        },
      },
      link: {
        type: "string",
        format: "uri",
      },
    },
    required: ["universityName", "country", "businessId", "link"],
    additionalProperties: false,
  },
};
