const comment = {
  type: "string",
  minLength: 1,
  maxLength: 2000,
  errorMessage: {
    minLength: "Comment is required",
    maxLength: "Comment must be at most 2000 characters long",
  },
};

export default {
  CreateStudentApplicationRemarkSchema: {
    $id: "https://example.com/schemas/create-student-application-remark.json",
    type: "object",
    properties: {
      applicationId: {
        type: "integer",
        minimum: 1,
        errorMessage: {
          minimum: "applicationId must be a positive integer",
        },
      },
      comment,
    },
    required: ["applicationId", "comment"],
    additionalProperties: false,
  },
  UpdateStudentApplicationRemarkSchema: {
    $id: "https://example.com/schemas/update-student-application-remark.json",
    type: "object",
    properties: {
      comment,
    },
    required: ["comment"],
    additionalProperties: false,
  },
};
