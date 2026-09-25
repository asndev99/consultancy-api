import {
  UserRoles,
  ApplicationStatus,
} from "../../../shared/application.constants.js";

export default {
  CreateStudentApplicationSchema: {
    $id: "https://example.com/schemas/create-student-application.json",
    type: "object",
    properties: {
      businessId: {
        type: "integer",
        minimum: 1,
      },
      branchId: {
        type: "integer",
        minimum: 1,
      },
      studentId: {
        type: "integer",
        minimum: 1,
      },
      applicationStatus: {
        type: "string",
        enum: Object.values(ApplicationStatus),
      },
      applicationIntake: {
        type: "string",
        minLength: 2,
        maxLength: 60,
      },
      applicationTargetUniversity: {
        type: "string",
        minLength: 2,
        maxLength: 150,
      },
      applicationTutionFee: {
        type: "number",
        minimum: 0,
      },
      applicationTutionFeePeriod: {
        type: "string",
        minLength: 1,
        maxLength: 60,
      },
      tutionFeeCurrency: {
        type: "string",
        minLength: 1,
        maxLength: 10,
      },
      applicationTargetCourses: {
        type: "array",
        items: {
          type: "string",
          minLength: 1,
          maxLength: 150,
        },
      },
    },
    required: [
      "businessId",
      "branchId",
      "studentId",
      "applicationStatus",
      "applicationIntake",
      "applicationTargetUniversity",
      "applicationTutionFee",
      "applicationTutionFeePeriod",
    ],
    additionalProperties: false,
  },
  AssignStudentApplicationSchema: {
    $id: "https://example.com/schemas/assign-student-application.json",
    type: "array",
    minItems: 1,
    maxItems: 2,
    items: {
      type: "object",
      properties: {
        role: {
          type: "string",
          enum: [UserRoles.Manager, UserRoles["Admission Team"]],
        },
        userId: {
          type: "integer",
          minimum: 1,
        },
      },
      required: ["role", "userId"],
      additionalProperties: false,
    },
    errorMessage: {
      minItems: "At least one assignment must be provided",
      maxItems: "At most two assignments can be provided",
    },
  },
  UpdateStudentApplicationStatusSchema: {
    $id: "https://example.com/schemas/update-student-application-status.json",
    type: "object",
    properties: {
      applicationStatus: {
        type: "string",
        enum: Object.values(ApplicationStatus),
      },
    },
    required: ["applicationStatus"],
    additionalProperties: false,
  },
};
