export default {
  MarkNotificationsReadSchema: {
    $id: "https://example.com/schemas/mark-notifications-read.json",
    type: "object",
    properties: {
      notificationIds: {
        type: "array",
        minItems: 1,
        maxItems: 100,
        items: {
          type: "integer",
          minimum: 1,
        },
        errorMessage: {
          minItems: "At least one notificationId must be provided",
          maxItems: "At most 100 notificationIds can be provided",
        },
      },
    },
    required: ["notificationIds"],
    additionalProperties: false,
  },
};
