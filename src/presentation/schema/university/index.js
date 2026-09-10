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
      type: {
        type: "string",
        enum: ["Public", "Private"],
        errorMessage: {
          enum: "type must be either 'Public' or 'Private'",
        },
      },
    },
    required: ["universityName", "country", "businessId", "link", "type"],
    additionalProperties: false,
  },

  EditUniversitySchema: {
    $id: "https://example.com/schemas/edit-university.json",
    type: "object",
    properties: {
      universityName: {
        type: "string",
        minLength: 2,
        maxLength: 150,
      },
      country: {
        type: "string",
        minLength: 2,
        maxLength: 90,
      },
      link: {
        type: "string",
        format: "uri",
      },
      type: {
        type: "string",
        enum: ["Public", "Private"],
        errorMessage: {
          enum: "type must be either 'Public' or 'Private'",
        },
      },
      isActive: {
        type: "boolean",
      },
    },
    additionalProperties: false,
  },

  AddUniversityCourseSchema: {
    $id: "https://example.com/schemas/add-university-course.json",
    type: "object",
    properties: {
      businessId: {
        type: "integer",
        minimum: 1,
      },
      universityId: {
        type: "integer",
        minimum: 1,
      },
      courseTitle: {
        type: "string",
        minLength: 1,
      },
      degreeLevel: {
        type: "string",
        minLength: 1,
      },
      tutionFee: {
        type: "number",
        minimum: 0,
      },
      tutionFeeCurrency: {
        type: "string",
        minLength: 1,
      },
      tutionPeriod: {
        type: "string",
        minLength: 1,
      },
      courseRequirements: {
        type: "string",
      },
      isActive: {
        type: "boolean",
      },
      intakeDates: {
        type: "array",
        items: {
          type: "string",
          format: "date",
        },
      },
    },
    required: [
      "businessId",
      "universityId",
      "courseTitle",
      "degreeLevel",
      "tutionFee",
    ],
    additionalProperties: false,
  },

  EditUniversityCourseSchema: {
    $id: "https://example.com/schemas/edit-university-course.json",
    type: "object",
    properties: {
      courseTitle: {
        type: "string",
        minLength: 1,
      },
      degreeLevel: {
        type: "string",
        minLength: 1,
      },
      tutionFee: {
        type: "number",
        minimum: 0,
      },
      tutionFeeCurrency: {
        type: "string",
        minLength: 1,
      },
      tutionPeriod: {
        type: "string",
        minLength: 1,
      },
      courseRequirements: {
        type: "string",
      },
      isActive: {
        type: "boolean",
      },
    },
    additionalProperties: false,
  },
};
