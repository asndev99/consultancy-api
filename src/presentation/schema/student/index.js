export default {
  CreateStudentSchema: {
    $id: "https://example.com/schemas/create-student.json",
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
        errorMessage: {
          minLength: "phoneNo is required",
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
      preferredTargetCountries: {
        type: "array",
        items: {
          type: "string",
        },
      },
      targetDegree: {
        type: "string",
      },
      counselorId: {
        type: "integer",
        minimum: 1,
        errorMessage: {
          minimum: "counselorId must be a positive integer",
        },
      },
    },
    required: ["fullName", "email", "phoneNo", "businessId", "branchId"],
    additionalProperties: false,
  },
  AddTargetUniversitiesSchema: {
    $id: "https://example.com/schemas/add-target-universities.json",
    type: "array",
    minItems: 1,
    items: {
      type: "object",
      properties: {
        universityId: {
          type: "integer",
          minimum: 1,
        },
        courseIds: {
          type: "array",
          items: {
            type: "integer",
            minimum: 1,
          },
        },
      },
      required: ["universityId"],
      additionalProperties: false,
    },
  },
  AddTargetUniversityCoursesSchema: {
    $id: "https://example.com/schemas/add-target-university-courses.json",
    type: "object",
    properties: {
      courseIds: {
        type: "array",
        minItems: 1,
        items: {
          type: "integer",
          minimum: 1,
        },
      },
    },
    required: ["courseIds"],
    additionalProperties: false,
  },
};
