import {
  HelpAndFeedbackCategory,
  HelpAndFeedbackPriorityLevel,
} from "../../../shared/application.constants.js";

export default {
  CreateHelpAndFeedbackSchema: {
    $id: "https://example.com/schemas/create-help-and-feedback.json",
    type: "object",
    properties: {
      subject: {
        type: "string",
        minLength: 1,
        maxLength: 200,
        errorMessage: {
          minLength: "Subject is required",
          maxLength: "Subject must be at most 200 characters long",
        },
      },
      description: {
        type: "string",
        minLength: 1,
        maxLength: 5000,
        errorMessage: {
          minLength: "Description is required",
          maxLength: "Description must be at most 5000 characters long",
        },
      },
      category: {
        type: "string",
        enum: Object.values(HelpAndFeedbackCategory),
        errorMessage: {
          enum: `category must be one of: ${Object.values(HelpAndFeedbackCategory).join(", ")}`,
        },
      },
      priorityLevel: {
        type: "string",
        enum: Object.values(HelpAndFeedbackPriorityLevel),
        errorMessage: {
          enum: `priorityLevel must be one of: ${Object.values(HelpAndFeedbackPriorityLevel).join(", ")}`,
        },
      },
    },
    required: ["subject", "description", "category", "priorityLevel"],
    additionalProperties: false,
  },
};
