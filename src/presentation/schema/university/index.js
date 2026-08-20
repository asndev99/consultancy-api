export default {
  AddUniversitySchema: {
    $id: "https://example.com/schemas/add-university.json",
    type: "object",
    properties: {
      name: {
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
      type: {
        type: "string",
        enum: ["Public University", "Private University", "Other"],
      },
      officialWebsite: {
        type: "string",
        format: "uri",
      },
    },
    required: ["name", "country", "type", "officialWebsite"],
    additionalProperties: false,
  },
};
