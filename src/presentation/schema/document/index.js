export default {
  CreateDocumentTitleSchema: {
    $id: "https://example.com/schemas/create-document-title.json",
    type: "object",
    properties: {
      studentId: {
        type: "integer",
        minimum: 1,
      },
      documentTitle: {
        type: "string",
        minLength: 2,
        maxLength: 150,
      },
      isMandatory: {
        type: "boolean",
      },
      quantity: {
        type: "integer",
        minimum: 1,
      },
    },
    required: ["studentId", "documentTitle", "isMandatory"],
    additionalProperties: false,
  },
  EditDocumentTitleSchema: {
    $id: "https://example.com/schemas/edit-document-title.json",
    type: "object",
    properties: {
      documentTitle: {
        type: "string",
        minLength: 2,
        maxLength: 150,
      },
      isMandatory: {
        type: "boolean",
      },
      quantity: {
        type: "integer",
        minimum: 1,
      },
    },
    minProperties: 1,
    errorMessage: {
      minProperties: "At least one field must be provided to update",
    },
    additionalProperties: false,
  },
};
