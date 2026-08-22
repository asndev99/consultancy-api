


INSERT INTO "Business" (
  "businessCode",
  "studentSequence",
  "timeZone",
  "name",
  "isActive",
  "isDeleted",
  "address",
  "businessLogo",
  "googleMapUrl",
  "createdBy",
  "createdAt",
  "updatedAt"
) VALUES (
  'BUS-0001',
  0,
  'Asia/Karachi',
  'Acme Consultancy',
  true,
  false,
  '123 Main Street, Karachi',
  'https://example.com/logo.png',
  '',
  1,
  now(),
  now()
);

INSERT INTO "Branch" (
  "name", "branchCode", "businessId", "city", "country",
  "address", "latitude", "longitude", "isActive", "isDeleted",
  "createdBy", "createdAt", "updatedAt"
) VALUES (
  'Main Branch',
  'BR-0001',
  (SELECT id FROM "Business" WHERE "businessCode" = 'BUS-0001'),
  'Karachi',
  'Pakistan',
  '456 Business Avenue, Karachi',
  24.8607,
  67.0011,
  true,
  false,
  1,
  now(),
  now()
);