import { LeadStage } from "../../../shared/application.constants.js";

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
  UpdateTargetUniversitiesSchema: {
    $id: "https://example.com/schemas/update-target-universities.json",
    type: "object",
    properties: {
      targetUniversities: {
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
      removedUniversities: {
        type: "array",
        items: {
          type: "integer",
          minimum: 1,
        },
        description: "targetUniversityId values to delete before applying targetUniversities",
      },
      removedCourses: {
        type: "array",
        items: {
          type: "integer",
          minimum: 1,
        },
        description: "targetCourseId values to delete before applying targetUniversities",
      },
    },
    required: ["targetUniversities"],
    additionalProperties: false,
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
  EditStudentSchema: {
    $id: "https://example.com/schemas/edit-student.json",
    type: "object",
    properties: {
      fullName: {
        type: "string",
        minLength: 2,
        maxLength: 150,
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
      leadStage: {
        type: "string",
        enum: Object.values(LeadStage),
      },
    },
    minProperties: 1,
    errorMessage: {
      minProperties: "At least one field must be provided to update",
    },
    additionalProperties: false,
  },
  AssignStudentCounselorSchema: {
    $id: "https://example.com/schemas/assign-student-counselor.json",
    type: "object",
    properties: {
      studentIds: {
        type: "array",
        minItems: 1,
        items: {
          type: "integer",
          minimum: 1,
        },
      },
      counselorId: {
        type: ["integer", "null"],
        minimum: 1,
      },
    },
    required: ["studentIds", "counselorId"],
    additionalProperties: false,
  },
};
