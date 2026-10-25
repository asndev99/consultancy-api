export const UserRoles = {
  "Business Admin": "Business Admin",
  "Super Admin": "Super Admin",
  Manager: "Manager",
  Counselor: "Counselor",
  "Admission Team": "Admission Team",
  "Sub Agent": "Sub Agent",
};

export const UserStatus = {
  Active: "Active",
  "Invitation Pending": "Invitation Pending",
  Freeze: "Freeze",
  InActive: "InActive",
};

export const UniversityType = {
  Public: "Public",
  Private: "Private",
};

export const ApplicationStatus = {
  Draft: "Draft",
  "Under Review": "Under Review",
  "Pending Documents": "Pending Documents",
  "Offer Letter Issued": "Offer Letter Issued",
  "Visa Processing": "Visa Processing",
  Enrolled: "Enrolled",
  Rejected: "Rejected",
};

// Mirrors the Prisma LeadStage enum on Student.
export const LeadStage = {
  NewLead: "NewLead",
  DocumentSubmitted: "DocumentSubmitted",
  ApplicationSubmitted: "ApplicationSubmitted",
  VisaProcessing: "VisaProcessing",
  Enrolled: "Enrolled",
};

// Mirrors the Prisma LeadFormType enum on LeadForms.
export const LeadFormType = {
  ORG_LEVEL: "ORG_LEVEL",
  BRANCH_LEVEL: "BRANCH_LEVEL",
};

// Stored as plain strings on Notification.eventType (no Prisma enum).
export const NotificationEventType = {
  StudentCreated: "StudentCreated",
  StudentCounselorAssigned: "StudentCounselorAssigned",
  ApplicationCreated: "ApplicationCreated",
  ApplicationManagerAssigned: "ApplicationManagerAssigned",
  ApplicationAdmissionOfficerAssigned: "ApplicationAdmissionOfficerAssigned",
  ApplicationStatusChanged: "ApplicationStatusChanged",
  ApplicationRemarkAdded: "ApplicationRemarkAdded",
  DocumentRequested: "DocumentRequested",
  DocumentUploaded: "DocumentUploaded",
};

// Frontend screen a notification deep-links to; stored on Notification.screen.
export const NotificationScreen = {
  StudentProfile: "StudentProfile",
  StudentDocuments: "StudentDocuments",
  ApplicationDetails: "ApplicationDetails",
  ApplicationRemarks: "ApplicationRemarks",
};

// Stored as plain strings on HelpAndFeedback.category (no Prisma enum).
export const HelpAndFeedbackCategory = {
  "General Questions": "General Questions",
  "Feature Request": "Feature Request",
  "Bug Report": "Bug Report",
  "Billing & Account": "Billing & Account",
};

// Stored as plain strings on HelpAndFeedback.priorityLevel (no Prisma enum).
export const HelpAndFeedbackPriorityLevel = {
  Low: "Low",
  Medium: "Medium",
  High: "High",
  Urgent: "Urgent",
};
