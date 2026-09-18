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
